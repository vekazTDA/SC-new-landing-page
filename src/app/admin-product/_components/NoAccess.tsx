import { signOutAction } from "../actions";

/**
 * Signed in with a valid Supabase account that is not on the admin allowlist. This is
 * the expected state right after creating a user but before inserting their
 * public.admin_users row.
 */
export default function NoAccess({ email }: { email: string }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#171010] px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl text-[#F1D9C1]" style={{ fontFamily: "var(--font-serif-display)" }}>
          This account cannot edit the catalogue
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          You are signed in as <strong className="text-white">{email}</strong>, but that
          account is not on the admin allowlist. Signing in is deliberately not enough —
          write access is granted by a row in <code className="rounded bg-black/40 px-1.5 py-0.5 text-[#C5A880]">public.admin_users</code>,
          and enforced by the database itself.
        </p>
        <p className="mt-4 text-sm text-white/70">Run this in the Supabase SQL editor:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-4 text-xs leading-relaxed text-[#C5A880]">
{`insert into public.admin_users (user_id, email)
select id, email from auth.users where email = '${email}'
on conflict (user_id) do nothing;`}
        </pre>
        <p className="mt-4 text-xs text-white/40">
          Then reload this page. If it inserts 0 rows, the email does not match the one in
          Authentication → Users.
        </p>
        <form action={signOutAction} className="mt-6">
          <button
            type="submit"
            className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/75 transition-colors hover:border-white/40 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
