-- supabase/migrations/0002_seed_catalog.sql
-- GENERATED from src/data/{products,shopProducts,addons}.ts — do not hand-edit.
-- Regenerate with: node scripts/gen-seed.js > supabase/migrations/0002_seed_catalog.sql
--
-- Image columns point at the files already in public/images, so the catalogue goes live
-- without uploading anything to Storage first. sort_order preserves the current array
-- order, which is load-bearing on the marketing page.
-- Idempotent: re-running updates the existing rows instead of erroring on the slug.

insert into public.products
  (slug, name, eyebrow, description, images, price_amount, price_unit,
   in_stock, rating, review_count, default_quantity, sort_order)
values
  ('the-brew', 'The Brew', 'Signature Curation', 'A ceramic brewing kit and an elegant mug. Because great meetings begin with a great first sip.',
   '[{"url":"/images/products/brew-gallery/main.png"},{"url":"/images/products/brew-gallery/thumb-1.png"},{"url":"/images/products/brew-gallery/thumb-2.png"},{"url":"/images/products/brew-gallery/thumb-3.png"}]'::jsonb,
   19.00, '/ tier base price', true, 4.9, 1232, 50, 10),
  ('the-refill', 'The Refill', 'Signature Curation', 'A pair of artisanal glasses along with tongs and reusable whisky stones. For those who like a refined way to wind down after a busy day.',
   '[{"url":"/images/products/the-refill.png"}]'::jsonb,
   19.00, '/ tier base price', true, 4.9, 1232, 50, 20),
  ('the-writers-choice', 'The Writer''s Choice', 'Signature Curation', 'A custom notebook, a quality pen, and an insulated bottle that keeps drinks hot for hours (or cold just as long). Hydrated. Organized. Appreciated.',
   '[{"url":"/images/products/the-writers-choice.png"}]'::jsonb,
   49.00, '/ tier base price', true, 4.9, 1232, 50, 30),
  ('the-reset', 'The Reset', 'Signature Curation', 'A deep tissue percussion massager with six attachments and a recovery wrap to match. This was made for the leader who never stops moving.',
   '[{"url":"/images/products/the-reset.png"}]'::jsonb,
   74.00, '/ tier base price', true, 4.9, 1232, 50, 40),
  ('the-enoteca', 'The Enoteca', 'Signature Curation', 'An effortless electric bottle opener and the bar tools to back it up. For celebrating wins, big and small.',
   '[{"url":"/images/products/the-enoteca.png"}]'::jsonb,
   74.00, '/ tier base price', true, 4.9, 1232, 50, 50),
  ('the-respite', 'The Respite', 'Signature Curation', 'A signature scented candle and a set of reed diffusers, designed to make appreciation feel personal, not routine.',
   '[{"url":"/images/products/the-respite.png"}]'::jsonb,
   49.00, '/ tier base price', true, 4.9, 1232, 50, 60)
on conflict (slug) do update set
  name = excluded.name, eyebrow = excluded.eyebrow, description = excluded.description,
  images = excluded.images, price_amount = excluded.price_amount, price_unit = excluded.price_unit,
  in_stock = excluded.in_stock, rating = excluded.rating, review_count = excluded.review_count,
  default_quantity = excluded.default_quantity, sort_order = excluded.sort_order;

insert into public.shop_products
  (slug, name, price, images, modal_description, size_options, rating, review_count, sort_order)
values
  ('brew-and-bite', 'The Brew and Bite', 19.00,
   '[{"url":"/images/shop/brew-and-bite.png"},{"url":"/images/shop/brew-and-bite-gallery/thumb-1.png"},{"url":"/images/shop/brew-and-bite-gallery/thumb-2.png"},{"url":"/images/shop/brew-and-bite-gallery/thumb-3.png"}]'::jsonb,
   'A ceramic brewing kit and an elegant mug. Because great meetings begin with a great first sip. Carefully packaged in presentation-ready, customizable signature boxes.', '[{"label":"1 Pack","price":19},{"label":"2 Pack","price":36,"badge":"Popular"},{"label":"3 Pack","price":59,"badge":"Best Value"}]'::jsonb, 4.9, 1232, 10),
  ('editors-pick', 'The Editor''s Pick', 49.00,
   '[{"url":"/images/shop/editors-pick.png"}]'::jsonb,
   null, null, 4.9, 1232, 20),
  ('writers-choice', 'The Writer''s Choice', 49.00,
   '[{"url":"/images/shop/writers-choice.png"}]'::jsonb,
   null, null, 4.9, 1232, 30),
  ('single-acrylic-box', 'Single Acrylic Box', 12.00,
   '[{"url":"/images/shop/single-acrylic-box.png"}]'::jsonb,
   null, null, 4.9, 1232, 40),
  ('executive-self-care-kit', 'The Executive Self-Care Kit', 74.00,
   '[{"url":"/images/shop/executive-self-care-kit.png"}]'::jsonb,
   null, null, 4.9, 1232, 50),
  ('signature-set', 'The Signature Set: Corporate Gift with Acrylic Boxes', 34.95,
   '[{"url":"/images/shop/signature-set.png"}]'::jsonb,
   null, null, 4.9, 1232, 60),
  ('taste-tester', 'The Taste Tester: Corporate Gift with Assorted Bags', 59.95,
   '[{"url":"/images/shop/taste-tester.png"}]'::jsonb,
   null, null, 4.9, 1232, 70)
on conflict (slug) do update set
  name = excluded.name, price = excluded.price, images = excluded.images,
  modal_description = excluded.modal_description, size_options = excluded.size_options,
  rating = excluded.rating, review_count = excluded.review_count, sort_order = excluded.sort_order;

insert into public.addons (slug, title, price, description, images, sort_order)
values
  ('single-acrylic-box', 'Single Acrylic Box', 11.95, 'A classy, translucent box with our signature chocolate-crisp bites; the most elegant add-on.',
   '[{"url":"/images/addons/single-acrylic-box.png"}]'::jsonb, 10),
  ('4oz-bag', '4 oz. Bag', 7.95, 'A delicious bag of our signature chocolate-crisp bites; everyone''s go-to add-on.',
   '[{"url":"/images/addons/4oz-bag-hero.png"}]'::jsonb, 20),
  ('corporate-gift-assorted-bags', 'Corporate Gift with Assorted Bags', 59.95, 'A curated assortment of our signature chocolate-crisp bites, nestled inside a premium magnetic gift box.',
   '[{"url":"/images/addons/corporate-gift-assorted-bags.png"}]'::jsonb, 30),
  ('corporate-gift-acrylic-boxes', 'Corporate Gift with Acrylic Boxes', 34.95, 'A matching pair of our best-selling acrylic boxes, set inside a premium magnetic outer box.',
   '[{"url":"/images/addons/corporate-gift-acrylic-boxes.png"}]'::jsonb, 40)
on conflict (slug) do update set
  title = excluded.title, price = excluded.price, description = excluded.description,
  images = excluded.images, sort_order = excluded.sort_order;
