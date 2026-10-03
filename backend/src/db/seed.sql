-- WARNING: empties users, products, orders, etc. before inserting.
--
-- Demo logins:
--   admin@nova.dev     Admin@12345
--   aarav@example.com  Password123   (also meera@ and rohan@example.com)
-- ============================================================

-- pgcrypto lets PostgreSQL create bcrypt hashes, the same format the Node app checks.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

TRUNCATE order_items, orders, reviews, wishlist_items, cart_items, carts,
         products, categories, users RESTART IDENTITY CASCADE;

-- ---------- categories ----------
INSERT INTO categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Laptops, wearables and everyday gadgets.'),
  ('Audio', 'audio', 'Headphones, speakers and studio gear.'),
  ('Gaming', 'gaming', 'Peripherals built for long sessions.'),
  ('Workspace', 'workspace', 'Desks and accessories for focused work.'),
  ('Lifestyle', 'lifestyle', 'Carry-everywhere essentials.'),
  ('Home', 'home', 'Small upgrades for a calmer home.');

-- ---------- products ----------
-- image_url points at SVG files in backend/public/placeholders/ (served at /placeholders/...)
INSERT INTO products
  (category_id, name, description, price, discount_percent, stock, image_url, specs, is_featured)
SELECT c.id, v.name, v.description, v.price, v.discount, v.stock, v.image_url, v.specs::jsonb, v.featured
FROM (VALUES
  (1, 'technology', 'Aero 14 Ultrabook', 'A 14-inch ultrabook that weighs just 1.2 kg, with a bright 2.5K display and a battery that lasts a full working day.', 89999, 10, 12, '/placeholders/aero-14-ultrabook.svg', '{"Display":"14\" 2.5K IPS","Memory":"16 GB","Storage":"512 GB SSD","Weight":"1.2 kg"}', true),
  (2, 'technology', 'Pulse Smartwatch S2', 'Tracks sleep, heart rate and workouts on a crisp AMOLED screen. Water resistant and good for a week between charges.', 12999, 15, 40, '/placeholders/pulse-smartwatch-s2.svg', '{"Display":"1.4\" AMOLED","Battery":"7 days","Water resistance":"5 ATM","Connectivity":"Bluetooth 5.3"}', false),
  (3, 'technology', 'Halo 65W GaN Charger', 'A pocket-sized GaN charger with two USB-C ports and one USB-A, powerful enough for a laptop and quick enough for a phone.', 2499, 0, 120, '/placeholders/halo-65w-gan-charger.svg', '{"Output":"65 W","Ports":"2x USB-C, 1x USB-A","Size":"58 x 58 x 30 mm","Cable":"Not included"}', false),
  (4, 'technology', 'Orbit 10,000 mAh Power Bank', 'Slim power bank with fast charging in both directions. Fits in a jacket pocket and charges most phones twice.', 1999, 20, 75, '/placeholders/orbit-10-000-mah-power-bank.svg', '{"Capacity":"10,000 mAh","Output":"22.5 W","Ports":"USB-C, USB-A","Weight":"210 g"}', false),
  (5, 'technology', 'Lumen 4K Webcam', 'A 4K webcam with automatic light correction and a privacy shutter, for calls that look as good as you sound.', 7499, 0, 0, '/placeholders/lumen-4k-webcam.svg', '{"Resolution":"4K at 30 fps","Field of view":"90 degrees","Microphone":"Dual noise-reducing","Mount":"Monitor clip and tripod"}', false),
  (6, 'audio', 'Calm ANC Headphones', 'Over-ear headphones with adaptive noise cancelling and soft memory-foam cushions. Built for long flights and longer workdays.', 14999, 20, 30, '/placeholders/calm-anc-headphones.svg', '{"Battery":"40 hours","Noise cancelling":"Adaptive ANC","Drivers":"40 mm","Connectivity":"Bluetooth 5.3, 3.5 mm"}', true),
  (7, 'audio', 'Drift True Wireless Earbuds', 'Compact earbuds with a secure fit, clear calls and a pocketable charging case that adds three extra charges.', 4999, 10, 80, '/placeholders/drift-true-wireless-earbuds.svg', '{"Battery":"8 h + 24 h case","Water resistance":"IPX4","Drivers":"10 mm","Charging":"USB-C"}', false),
  (8, 'audio', 'Cove Bluetooth Speaker', 'A rugged portable speaker with surprisingly full sound. Splash proof, with a strap that clips onto a bag.', 3999, 0, 55, '/placeholders/cove-bluetooth-speaker.svg', '{"Battery":"16 hours","Water resistance":"IP67","Output":"20 W","Connectivity":"Bluetooth 5.2"}', false),
  (9, 'audio', 'Studio Condenser Microphone', 'A USB condenser microphone for podcasts, streams and voice work, with a built-in pop filter and zero-latency monitoring.', 8999, 0, 18, '/placeholders/studio-condenser-microphone.svg', '{"Pattern":"Cardioid","Sample rate":"48 kHz / 24-bit","Connection":"USB-C","Includes":"Desk stand"}', false),
  (10, 'audio', 'Vinyl Turntable Deck', 'A belt-drive turntable with a balanced tonearm and built-in preamp. Plug it into any speaker and play your records.', 12499, 5, 6, '/placeholders/vinyl-turntable-deck.svg', '{"Speeds":"33 / 45 RPM","Drive":"Belt","Preamp":"Built-in, switchable","Output":"RCA, Bluetooth"}', false),
  (11, 'gaming', 'Vector Mechanical Keyboard', 'A compact 75% keyboard with hot-swappable switches, a gasket-mounted plate and a satisfyingly solid typing sound.', 6499, 10, 45, '/placeholders/vector-mechanical-keyboard.svg', '{"Layout":"75% (84 keys)","Switches":"Hot-swappable linear","Connection":"USB-C, Bluetooth, 2.4 GHz","Keycaps":"Double-shot PBT"}', true),
  (12, 'gaming', 'Strike Pro Wireless Mouse', 'A lightweight wireless mouse with a precise sensor and a shape that stays comfortable through long sessions.', 3499, 0, 60, '/placeholders/strike-pro-wireless-mouse.svg', '{"Sensor":"26,000 DPI","Weight":"62 g","Battery":"70 hours","Buttons":"6 programmable"}', false),
  (13, 'gaming', 'Arena Wireless Controller', 'A responsive controller with textured grips, remappable back buttons and Hall-effect sticks that resist drift.', 4299, 15, 35, '/placeholders/arena-wireless-controller.svg', '{"Sticks":"Hall-effect","Battery":"30 hours","Connection":"Bluetooth, USB-C","Compatibility":"PC, Android, iOS"}', false),
  (14, 'gaming', 'Titan Gaming Chair', 'A supportive chair with adjustable lumbar support, 4D armrests and a breathable mesh back. Built for marathon sessions.', 18999, 25, 9, '/placeholders/titan-gaming-chair.svg', '{"Weight limit":"120 kg","Recline":"90 to 160 degrees","Armrests":"4D adjustable","Material":"Mesh and fabric"}', false),
  (15, 'workspace', 'Rise Standing Desk', 'A dual-motor standing desk with memory presets and a quiet, stable lift. Switch between sitting and standing in seconds.', 24999, 12, 8, '/placeholders/rise-standing-desk.svg', '{"Size":"140 x 70 cm","Height":"65 to 130 cm","Motors":"Dual","Max load":"80 kg"}', true),
  (16, 'workspace', 'Slate Monitor Arm', 'A gas-spring monitor arm that frees up desk space and lets you move your screen with one finger.', 3299, 0, 50, '/placeholders/slate-monitor-arm.svg', '{"Screen size":"17\" to 32\"","Max load":"9 kg","Mount":"Clamp or grommet","Cable":"Built-in management"}', false),
  (17, 'workspace', 'Grid Desk Mat XL', 'A large, smooth desk mat with stitched edges that fits a keyboard, mouse and notebook, and protects the desk beneath.', 1299, 0, 150, '/placeholders/grid-desk-mat-xl.svg', '{"Size":"90 x 40 cm","Thickness":"3 mm","Surface":"Micro-textured","Base":"Non-slip rubber"}', false),
  (18, 'workspace', 'Beam LED Desk Lamp', 'A slim desk lamp with adjustable colour temperature and brightness, plus a wireless charging pad in the base.', 2799, 10, 70, '/placeholders/beam-led-desk-lamp.svg', '{"Brightness":"5 levels","Colour temperature":"2700 to 6500 K","Charging":"10 W wireless pad","Power":"USB-C"}', false),
  (19, 'workspace', 'Dock Pro USB-C Hub', 'Turns one USB-C port into HDMI, Ethernet, SD card reader and three USB ports, with pass-through charging.', 4499, 0, 40, '/placeholders/dock-pro-usb-c-hub.svg', '{"Video":"HDMI 4K at 60 Hz","Ports":"3x USB-A, 1x USB-C PD","Network":"Gigabit Ethernet","Card reader":"SD and microSD"}', false),
  (20, 'lifestyle', 'Trail Insulated Bottle 750 ml', 'Double-wall stainless steel bottle that keeps drinks cold for 24 hours or hot for 12. Leak-proof and dishwasher safe.', 1299, 0, 200, '/placeholders/trail-insulated-bottle-750-ml.svg', '{"Capacity":"750 ml","Material":"Stainless steel","Keeps cold":"24 hours","Keeps hot":"12 hours"}', false),
  (21, 'lifestyle', 'Voyager 25 L Backpack', 'A weather-resistant everyday backpack with a padded laptop sleeve, hidden pocket and a trolley strap for travel days.', 4999, 15, 42, '/placeholders/voyager-25-l-backpack.svg', '{"Capacity":"25 L","Laptop sleeve":"Up to 16\"","Material":"Recycled polyester","Weight":"850 g"}', true),
  (22, 'lifestyle', 'Meridian Leather Wallet', 'A slim bifold in full-grain leather with RFID-blocking lining. It holds eight cards and cash without the bulk.', 1999, 0, 65, '/placeholders/meridian-leather-wallet.svg', '{"Material":"Full-grain leather","Card slots":"8","Protection":"RFID blocking","Size":"11 x 9 cm"}', false),
  (23, 'lifestyle', 'Daybreak Polarised Sunglasses', 'Lightweight polarised sunglasses with UV400 protection and a flexible frame that survives being sat on.', 2999, 20, 30, '/placeholders/daybreak-polarised-sunglasses.svg', '{"Lens":"Polarised, UV400","Frame":"TR90 nylon","Weight":"24 g","Includes":"Case and cloth"}', false),
  (24, 'home', 'Haven Aroma Diffuser', 'An ultrasonic diffuser with a soft ambient light and auto shut-off. Quiet enough for a bedroom.', 2199, 0, 48, '/placeholders/haven-aroma-diffuser.svg', '{"Capacity":"300 ml","Runtime":"Up to 10 hours","Light":"7 colours, dimmable","Noise":"Under 30 dB"}', false),
  (25, 'home', 'Brew Pour-over Kettle', 'A gooseneck kettle with precise temperature control and a hold function, made for patient pour-over coffee.', 3799, 10, 25, '/placeholders/brew-pour-over-kettle.svg', '{"Capacity":"0.9 L","Temperature range":"40 to 100 C","Hold":"60 minutes","Material":"Stainless steel"}', false),
  (26, 'home', 'Glow Smart Bulb 4-Pack', 'Four Wi-Fi bulbs with warm-to-cool white and full colour. Set scenes and schedules from your phone.', 1899, 0, 90, '/placeholders/glow-smart-bulb-4-pack.svg', '{"Pack":"4 bulbs","Base":"E27","Brightness":"800 lumens each","Connectivity":"Wi-Fi 2.4 GHz"}', false),
  (27, 'home', 'Cloud Throw Blanket', 'A soft, heavyweight knit throw that is warm without being bulky. Machine washable and made to be used daily.', 2499, 0, 33, '/placeholders/cloud-throw-blanket.svg', '{"Size":"150 x 200 cm","Material":"Cotton blend knit","Care":"Machine washable","Weight":"1.4 kg"}', false)
) AS v(ord, cat_slug, name, description, price, discount, stock, image_url, specs, featured)
JOIN categories c ON c.slug = v.cat_slug
ORDER BY v.ord;

-- ---------- users (passwords hashed with bcrypt, cost 12) ----------
INSERT INTO users (name, email, password_hash, role, phone, address_line1, city, state, postal_code, country) VALUES
  ('NOVA Admin', 'admin@nova.dev', crypt('Admin@12345', gen_salt('bf', 12)), 'admin', '+91 98200 00001', '12 Station Road', 'Pune', 'Maharashtra', '411001', 'India'),
  ('Aarav Sharma', 'aarav@example.com', crypt('Password123', gen_salt('bf', 12)), 'customer', '+91 98765 43210', '24 Lake View Apartments', 'Mumbai', 'Maharashtra', '400050', 'India'),
  ('Meera Nair', 'meera@example.com', crypt('Password123', gen_salt('bf', 12)), 'customer', '+91 91234 56780', '7 Palm Grove Lane', 'Bengaluru', 'Karnataka', '560034', 'India'),
  ('Rohan Patil', 'rohan@example.com', crypt('Password123', gen_salt('bf', 12)), 'customer', '+91 90000 11223', '3 Market Street', 'Chiplun', 'Maharashtra', '415605', 'India');

-- ---------- reviews ----------
INSERT INTO reviews (user_id, product_id, rating, comment, created_at)
SELECT u.id, p.id, v.rating, v.comment, NOW() - v.days_ago * INTERVAL '1 day'
FROM (VALUES
  ('Calm ANC Headphones', 'aarav@example.com', 5, 'The noise cancelling is excellent on trains and the cushions stay comfortable for hours.', 1),
  ('Calm ANC Headphones', 'meera@example.com', 4, 'Great sound and battery life. The case is a little bulky.', 3),
  ('Vector Mechanical Keyboard', 'aarav@example.com', 5, 'Sounds fantastic out of the box. Hot-swap switches are a lovely touch.', 5),
  ('Vector Mechanical Keyboard', 'rohan@example.com', 4, 'Solid build. I wish the software was a little simpler.', 7),
  ('Rise Standing Desk', 'meera@example.com', 5, 'Very stable even at full height, and the presets are genuinely useful.', 9),
  ('Voyager 25 L Backpack', 'meera@example.com', 5, 'Fits my 16-inch laptop with room to spare. Survived monsoon season.', 11),
  ('Voyager 25 L Backpack', 'rohan@example.com', 4, 'Comfortable straps. Would like one more side pocket.', 13),
  ('Halo 65W GaN Charger', 'aarav@example.com', 5, 'Replaced three chargers with this one. It stays cool.', 15),
  ('Drift True Wireless Earbuds', 'rohan@example.com', 4, 'Good value and a secure fit. Call quality is clear.', 17),
  ('Aero 14 Ultrabook', 'aarav@example.com', 5, 'Light, fast and the screen is gorgeous. Easily lasts a full day.', 19),
  ('Pulse Smartwatch S2', 'meera@example.com', 3, 'Nice display, but notifications were occasionally delayed.', 21),
  ('Cove Bluetooth Speaker', 'rohan@example.com', 4, 'Loud and clear for its size. Took it to the beach.', 23),
  ('Strike Pro Wireless Mouse', 'aarav@example.com', 5, 'Light and precise. I forgot it was wireless.', 25),
  ('Arena Wireless Controller', 'rohan@example.com', 4, 'Hall-effect sticks feel great and the battery lasts all week.', 27),
  ('Trail Insulated Bottle 750 ml', 'meera@example.com', 5, 'Ice was still there the next afternoon.', 29),
  ('Beam LED Desk Lamp', 'aarav@example.com', 4, 'Warm light for evenings. The charging pad is handy.', 31),
  ('Haven Aroma Diffuser', 'meera@example.com', 4, 'Quiet and the light is soft. Easy to refill.', 33),
  ('Brew Pour-over Kettle', 'aarav@example.com', 5, 'The temperature control makes a noticeable difference to my coffee.', 35),
  ('Studio Condenser Microphone', 'rohan@example.com', 4, 'Clean recordings straight out of the box.', 37),
  ('Dock Pro USB-C Hub', 'meera@example.com', 3, 'Works well, but it gets warm under heavy use.', 1)
) AS v(product_name, email, rating, comment, days_ago)
JOIN products p ON p.name = v.product_name
JOIN users u ON u.email = v.email;

-- ---------- wishlist ----------
INSERT INTO wishlist_items (user_id, product_id)
SELECT u.id, p.id
FROM (VALUES
  ('aarav@example.com', 'Rise Standing Desk'),
  ('aarav@example.com', 'Studio Condenser Microphone'),
  ('meera@example.com', 'Aero 14 Ultrabook')
) AS v(email, product_name)
JOIN users u ON u.email = v.email
JOIN products p ON p.name = v.product_name;

-- ---------- orders and order_items ----------
-- Prices are snapshotted into order_items (sale price at order time).
-- Tax = 18% of subtotal. Shipping = 99, free at subtotal >= 5000. Same rules as constants.js.
WITH lines AS (
  SELECT v.ref, p.id AS product_id, p.name AS product_name,
         ROUND(p.price * (100 - p.discount_percent) / 100.0, 2) AS unit_price,
         v.qty
  FROM (VALUES
    ('NOVA-2026-7K2M9Q', 'Calm ANC Headphones', 1),
    ('NOVA-2026-7K2M9Q', 'Halo 65W GaN Charger', 2),
    ('NOVA-2026-B4XN6T', 'Vector Mechanical Keyboard', 1),
    ('NOVA-2026-B4XN6T', 'Grid Desk Mat XL', 1),
    ('NOVA-2026-H8D3WF', 'Voyager 25 L Backpack', 1),
    ('NOVA-2026-H8D3WF', 'Trail Insulated Bottle 750 ml', 2),
    ('NOVA-2026-R5C2YJ', 'Rise Standing Desk', 1),
    ('NOVA-2026-M9P4LA', 'Drift True Wireless Earbuds', 1),
    ('NOVA-2026-M9P4LA', 'Orbit 10,000 mAh Power Bank', 1),
    ('NOVA-2026-T6V8EZ', 'Haven Aroma Diffuser', 1),
    ('NOVA-2026-T6V8EZ', 'Glow Smart Bulb 4-Pack', 2),
    ('NOVA-2026-K3G7NS', 'Titan Gaming Chair', 1)
  ) AS v(ref, product_name, qty)
  JOIN products p ON p.name = v.product_name
),
subtotals AS (
  SELECT ref, SUM(unit_price * qty) AS subtotal FROM lines GROUP BY ref
),
priced AS (
  SELECT ref, subtotal,
         ROUND(subtotal * 0.18, 2) AS tax,
         CASE WHEN subtotal >= 5000 THEN 0 ELSE 99 END AS shipping_fee
  FROM subtotals
),
new_orders AS (
  INSERT INTO orders
    (order_ref, user_id, status, subtotal, tax, shipping_fee, total,
     shipping_name, shipping_phone, shipping_line1, shipping_city,
     shipping_state, shipping_postal, shipping_country, created_at, updated_at)
  SELECT v.ref, u.id, v.status, pr.subtotal, pr.tax, pr.shipping_fee,
         pr.subtotal + pr.tax + pr.shipping_fee,
         u.name, u.phone, u.address_line1, u.city, u.state, u.postal_code, u.country,
         NOW() - v.days_ago * INTERVAL '1 day',
         NOW() - v.days_ago * INTERVAL '1 day'
  FROM (VALUES
    ('NOVA-2026-7K2M9Q', 'aarav@example.com', 'delivered', 45),
    ('NOVA-2026-B4XN6T', 'aarav@example.com', 'shipped', 4),
    ('NOVA-2026-H8D3WF', 'meera@example.com', 'delivered', 30),
    ('NOVA-2026-R5C2YJ', 'meera@example.com', 'processing', 2),
    ('NOVA-2026-M9P4LA', 'rohan@example.com', 'confirmed', 1),
    ('NOVA-2026-T6V8EZ', 'rohan@example.com', 'pending', 0),
    ('NOVA-2026-K3G7NS', 'rohan@example.com', 'cancelled', 12)
  ) AS v(ref, email, status, days_ago)
  JOIN users u ON u.email = v.email
  JOIN priced pr ON pr.ref = v.ref
  RETURNING id, order_ref
)
INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
SELECT n.id, l.product_id, l.product_name, l.unit_price, l.qty
FROM lines l
JOIN new_orders n ON n.order_ref = l.ref;

COMMIT;

-- ---------- check: you should see 6 / 27 / 4 / 20 / 3 / 7 / 12 ----------
SELECT (SELECT COUNT(*) FROM categories)     AS categories,
       (SELECT COUNT(*) FROM products)       AS products,
       (SELECT COUNT(*) FROM users)          AS users,
       (SELECT COUNT(*) FROM reviews)        AS reviews,
       (SELECT COUNT(*) FROM wishlist_items) AS wishlist,
       (SELECT COUNT(*) FROM orders)         AS orders,
       (SELECT COUNT(*) FROM order_items)    AS order_items;
