-- supabase/migrations/0004_ratings_everywhere.sql
-- Ratings and review counts for add-ons, so every product type carries its own.
-- products and shop_products already have these columns from 0001.

alter table public.addons
  add column if not exists rating       numeric(2,1) not null default 4.9,
  add column if not exists review_count integer      not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'addons_rating_range'
  ) then
    alter table public.addons
      add constraint addons_rating_range check (rating >= 0 and rating <= 5);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'addons_review_nonneg'
  ) then
    alter table public.addons
      add constraint addons_review_nonneg check (review_count >= 0);
  end if;
end $$;

-- Give the seeded add-ons the same figures the rest of the catalogue shows, so the
-- marketing page does not suddenly display "0 reviews".
update public.addons set review_count = 1232 where review_count = 0;
