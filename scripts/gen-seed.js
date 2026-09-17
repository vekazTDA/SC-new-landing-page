const fs = require('fs'), ts = require('typescript'), path = require('path');
const root = '/Users/vekazhadzic/Desktop/SC-NEW-LANDING';
function load(file) {
  const src = fs.readFileSync(path.join(root, 'src/data', file), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} };
  new Function('module', 'exports', js)(m, m.exports);
  return m.exports;
}
const q = (s) => s === null || s === undefined ? 'null' : `'${String(s).replace(/'/g, "''")}'`;
const j = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
const imgs = (arr) => j(arr.map((url) => ({ url })));
const money = (s) => typeof s === 'number' ? s.toFixed(2) : Number(String(s).replace(/[^0-9.]/g, '')).toFixed(2);

const { PRODUCTS } = load('products.ts');
const { SHOP_PRODUCTS, SHOP_RATING } = load('shopProducts.ts');
const { ADDONS } = load('addons.ts');

let out = `-- supabase/migrations/0002_seed_catalog.sql
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
`;
out += PRODUCTS.map((p, i) => `  (${q(p.slug)}, ${q(p.name)}, ${q(p.eyebrow)}, ${q(p.description)},
   ${imgs(p.images)},
   ${money(p.price)}, ${q(p.priceUnit)}, ${p.inStock}, ${p.rating}, ${p.reviewCount}, ${p.defaultQuantity}, ${(i + 1) * 10})`).join(',\n');
out += `
on conflict (slug) do update set
  name = excluded.name, eyebrow = excluded.eyebrow, description = excluded.description,
  images = excluded.images, price_amount = excluded.price_amount, price_unit = excluded.price_unit,
  in_stock = excluded.in_stock, rating = excluded.rating, review_count = excluded.review_count,
  default_quantity = excluded.default_quantity, sort_order = excluded.sort_order;

insert into public.shop_products
  (slug, name, price, images, modal_description, size_options, rating, review_count, sort_order)
values
`;
out += SHOP_PRODUCTS.map((p, i) => `  (${q(p.slug)}, ${q(p.name)}, ${money(p.price)},
   ${imgs(p.images)},
   ${q(p.modalDescription)}, ${p.sizeOptions ? j(p.sizeOptions) : 'null'}, ${SHOP_RATING.rating}, ${SHOP_RATING.reviewCount}, ${(i + 1) * 10})`).join(',\n');
out += `
on conflict (slug) do update set
  name = excluded.name, price = excluded.price, images = excluded.images,
  modal_description = excluded.modal_description, size_options = excluded.size_options,
  rating = excluded.rating, review_count = excluded.review_count, sort_order = excluded.sort_order;

insert into public.addons (slug, title, price, description, images, sort_order)
values
`;
out += ADDONS.map((a, i) => `  (${q(a.slug)}, ${q(a.title)}, ${money(a.price)}, ${q(a.description)},
   ${imgs([a.image])}, ${(i + 1) * 10})`).join(',\n');
out += `
on conflict (slug) do update set
  title = excluded.title, price = excluded.price, description = excluded.description,
  images = excluded.images, sort_order = excluded.sort_order;
`;
process.stdout.write(out);
console.error(`seeded ${PRODUCTS.length} products, ${SHOP_PRODUCTS.length} shop products, ${ADDONS.length} addons`);
