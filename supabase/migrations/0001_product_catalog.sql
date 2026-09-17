-- supabase/migrations/0001_product_catalog.sql
--
-- Three tables rather than one polymorphic `products(kind, ...)` table, because:
--   1. `single-acrylic-box` is legitimately BOTH a shop product ($12.00) and an add-on
--      ($11.95). A shared table needs `unique (kind, slug)` and slug stops being an id.
--   2. The three shapes share only slug/name/price/images. `description` is required for
--      products and add-ons but absent from shop products; `default_quantity`,
--      `price_unit`, `eyebrow` and `in_stock` are products-only. One table means every
--      column is nullable and nothing stops a teammate saving a product with no price.
--   3. The admin is three different forms regardless; the reuse lives in the shared image
--      uploader, not in the table.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- shared helpers

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- images: ordered JSON array of {url: string, alt?: string, path?: string}
-- `path` is the Storage object path for uploads, null for the /images/... seeds.
create or replace function public.is_image_array(v jsonb) returns boolean
language sql immutable as $$
  select jsonb_typeof(v) = 'array'
     and not exists (
       select 1 from jsonb_array_elements(v) e
       where jsonb_typeof(e) <> 'object'
          or jsonb_typeof(e->'url') <> 'string'
          or length(e->>'url') = 0
     );
$$;

-- size_options: ordered JSON array of {label: string, price: number, badge?: enum}
create or replace function public.is_size_option_array(v jsonb) returns boolean
language sql immutable as $$
  select v is null or (
    jsonb_typeof(v) = 'array'
    and jsonb_array_length(v) between 1 and 6
    and not exists (
      select 1 from jsonb_array_elements(v) e
      where jsonb_typeof(e) <> 'object'
         or jsonb_typeof(e->'label') <> 'string'
         or length(e->>'label') = 0
         or jsonb_typeof(e->'price') <> 'number'
         or coalesce(e->>'badge', 'Popular') not in ('Popular', 'Best Value')
    )
  );
$$;

-- ------------------------------------------- 1. signature curations (type `Product`)

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  eyebrow          text not null default 'Signature Curation',
  description      text not null,
  images           jsonb not null default '[]'::jsonb,
  price_amount     numeric(10,2) not null,
  -- escape hatch for copy like "From $19"; when null the amount is formatted as $x.00
  price_display    text,
  price_unit       text not null default '/ tier base price',
  in_stock         boolean not null default true,
  rating           numeric(2,1) not null default 4.9,
  review_count     integer not null default 0,
  default_quantity integer not null default 50,
  sort_order       integer not null,
  is_published     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint products_slug_format      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint products_images_shape     check (public.is_image_array(images)),
  constraint products_images_nonempty  check (jsonb_array_length(images) >= 1),
  constraint products_price_nonneg     check (price_amount >= 0),
  constraint products_rating_range     check (rating >= 0 and rating <= 5),
  constraint products_review_nonneg    check (review_count >= 0),
  constraint products_qty_positive     check (default_quantity >= 1)
);
create index if not exists products_order_idx
  on public.products (sort_order, created_at) where is_published;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.set_updated_at();

-- ------------------------------------------------- 2. shop grid (type `ShopProduct`)

create table if not exists public.shop_products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  price             numeric(10,2) not null,
  images            jsonb not null default '[]'::jsonb,
  modal_description text,
  size_options      jsonb,
  rating            numeric(2,1) not null default 4.9,
  review_count      integer not null default 1232,
  sort_order        integer not null,
  is_published      boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint shop_products_slug_format     check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint shop_products_images_shape    check (public.is_image_array(images)),
  constraint shop_products_images_nonempty check (jsonb_array_length(images) >= 1),
  constraint shop_products_price_nonneg    check (price >= 0),
  constraint shop_products_sizes_shape     check (public.is_size_option_array(size_options)),
  constraint shop_products_rating_range    check (rating >= 0 and rating <= 5)
);
create index if not exists shop_products_order_idx
  on public.shop_products (sort_order, created_at) where is_published;
drop trigger if exists shop_products_touch on public.shop_products;
create trigger shop_products_touch before update on public.shop_products
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------- 3. add-ons (type `Addon`)
-- Stored as an images ARRAY even though Addon.image is singular: the singular is a view
-- decision (AddonCard renders one <Image>), and an array means one shared uploader
-- component and no migration the day marketing wants an add-on gallery.

create table if not exists public.addons (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  price        numeric(10,2) not null,
  description  text not null,
  images       jsonb not null default '[]'::jsonb,
  sort_order   integer not null,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint addons_slug_format     check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint addons_images_shape    check (public.is_image_array(images)),
  constraint addons_images_nonempty check (jsonb_array_length(images) >= 1),
  constraint addons_price_nonneg    check (price >= 0)
);
create index if not exists addons_order_idx
  on public.addons (sort_order, created_at) where is_published;
drop trigger if exists addons_touch on public.addons;
create trigger addons_touch before update on public.addons
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------- admin allowlist
-- Write access is NOT granted to every authenticated user. Supabase projects allow
-- public email sign-ups by default, so `to authenticated ... using (true)` would let
-- any stranger register and edit the catalogue. Membership of this table is the gate;
-- it can only be changed with the service-role key or from the SQL editor.

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- ------------------------------------------------------------------------------ RLS

alter table public.products      enable row level security;
alter table public.shop_products enable row level security;
alter table public.addons        enable row level security;

-- Public read: the marketing site fetches with the anon key and sees published rows.
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated using (is_published);

drop policy if exists shop_products_public_read on public.shop_products;
create policy shop_products_public_read on public.shop_products
  for select to anon, authenticated using (is_published);

drop policy if exists addons_public_read on public.addons;
create policy addons_public_read on public.addons
  for select to anon, authenticated using (is_published);

-- Admins additionally see drafts (permissive policies are OR-ed).
drop policy if exists products_admin_read on public.products;
create policy products_admin_read on public.products
  for select to authenticated using (public.is_admin());

drop policy if exists shop_products_admin_read on public.shop_products;
create policy shop_products_admin_read on public.shop_products
  for select to authenticated using (public.is_admin());

drop policy if exists addons_admin_read on public.addons;
create policy addons_admin_read on public.addons
  for select to authenticated using (public.is_admin());

-- Writes: admins only.
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists shop_products_admin_write on public.shop_products;
create policy shop_products_admin_write on public.shop_products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists addons_admin_write on public.addons;
create policy addons_admin_write on public.addons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
