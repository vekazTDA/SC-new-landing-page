# Product admin — setup

The admin lives at **`/admin-product`**. Until the two environment variables below are
set, the public site keeps rendering from the catalogue bundled in `src/data/*.ts`, and
`/admin-product` shows a setup notice instead of failing. Nothing breaks in the meantime.

## 1. Create the Supabase project

<https://supabase.com/dashboard> → New project. Then **Project Settings → API** and copy:

- the **Project URL**
- the **publishable** key (`sb_publishable_…`; on older projects it is called `anon`)

Put them in `.env.local` **at the repo root** (not in `src/` — Next does not read env
files from there):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
```

Restart the dev server — `NEXT_PUBLIC_` values are inlined at build time.

## 2. Run the migrations

**SQL Editor → New query**, then paste and run each file in order:

| file | what it does |
| --- | --- |
| `migrations/0001_product_catalog.sql` | the three product tables, the admin allowlist, RLS |
| `migrations/0002_seed_catalog.sql` | the current catalogue, generated from `src/data/*.ts` |
| `migrations/0003_storage.sql` | the `product-images` bucket and its policies |

The seed is idempotent — re-running it updates rows rather than erroring. It points the
image columns at the files already in `public/images`, so nothing needs uploading to
Storage for the site to work.

Regenerate the seed after changing the TypeScript catalogue with:

```bash
node scripts/gen-seed.js > supabase/migrations/0002_seed_catalog.sql
```

## 3. Turn OFF public sign-ups — do this before going live

**Authentication → Sign In / Providers → Email → disable "Allow new users to sign up".**

Supabase allows public sign-ups by default. Without this, anyone on the internet can
register an account against your project. They still could not edit anything (writes
require membership of `admin_users`), but there is no reason to leave the door open.

## 4. Create the admin user

**Authentication → Users → Add user → Create new user.**

- Email: `admin@itsda.com`
- Password: choose a **long, random** one and store it in a password manager.
- Tick *Auto Confirm User*.

No password is stored in this repository, by design — anything committed here ends up in
git history and in the deployed bundle. `/admin-product` is reachable from the open
internet, so a short password will be found by automated scanners. Use something long.

Then grant that user admin rights — **SQL Editor**:

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'admin@itsda.com'
on conflict (user_id) do nothing;
```

Being signed in is deliberately *not* enough to edit the catalogue; only rows in
`admin_users` can write, enforced by RLS at the database level.

Repeat for each teammate who needs access.

## 5. Sign in

Go to `/admin-product`. You should see all three product groups.

---

## How it fits together

- **Reads** — `src/lib/catalog/index.ts` fetches PostgREST with `cache: "force-cache"` and
  a cache tag. If the env vars are missing, the request fails, or a table is empty, it
  returns the static arrays instead. It never throws, so the build cannot fail because of
  Supabase.
- **Writes** — `src/app/admin-product/actions.ts`. Every action re-checks the session
  itself: Server Actions are POSTs to their own route, so the `src/proxy.ts` matcher does
  not cover them. RLS is the real backstop.
- **Cache** — after a save, `updateTag()` expires the marketing page immediately, and
  `revalidatePath("/")` covers the very first publish, when no tagged entry exists yet.
- **Photos** — uploaded browser-direct to Storage, because Server Actions cap request
  bodies at 1MB. Each upload gets a fresh UUID path so a replaced photo is never served
  stale from the image cache.
- **Preview** — `/admin-preview` renders the real section components inside iframes at
  390px and 1440px. An iframe is required, not cosmetic: the cards are laid out with
  Tailwind viewport media queries and `svh` units, so a narrow `<div>` would still show
  the desktop layout.

## Note on caching while testing

In development pages are always rendered on demand and never cached, so edits appear
instantly. To verify the revalidation wiring actually works, test with
`npm run build && npm start`.
