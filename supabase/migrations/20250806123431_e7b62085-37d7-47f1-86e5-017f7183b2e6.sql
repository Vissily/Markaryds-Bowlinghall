-- First, update categories to match the actual menu
DELETE FROM menu_categories;

INSERT INTO menu_categories (name, sort_order) VALUES
('Förrätter', 1),
('Huvudrätter', 2), 
('Barnmeny', 3),
('Desserter', 4),
('Alkoholfritt', 5),
('Alkohol', 6);

-- Get category IDs for insertion (we'll need to do this step by step)
-- Let's insert all menu items from the existing Menu.tsx

-- Förrätter
INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'PUBTALLRIK', 'Nachochips, lökrigar, mozzarellasticks, chili chicken & vitlöksås', 60, 1, true
FROM menu_categories WHERE name = 'Förrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'POMMESTALLRIK', 'Knapriga pommes frites med valfri dip', 30, 2, true
FROM menu_categories WHERE name = 'Förrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'NACHOCHIPS', 'Krispiga nachos med ost & dippa', 40, 3, true
FROM menu_categories WHERE name = 'Förrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'OST & SKINKTOAST', 'Varm toast med sallad & dressing', 40, 4, true
FROM menu_categories WHERE name = 'Förrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'RÄKMACKA', 'Klassisk räkmacka på färskt bröd', 60, 5, true
FROM menu_categories WHERE name = 'Förrätter';

-- Huvudrätter
INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'KALVSNITZEL', 'Stekt potatis & bearnaisesås', 160, 1, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'ANGUSBURGARE', '200g nötkött, ost & bacon, pommes och bbq-sås', 140, 2, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'HAMBURGERTALLRIK', '90g nötkött, dressing, sallad, gurka, tomat och pommes', 90, 3, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'HALLOUMIBURGARE', 'Vegetarisk med dressing, sallad, gurka, tomat, ostskiva & pommes', 110, 4, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'KYCKLINGSPETT', 'Marinerade spett med pommes & bbq-sås', 110, 5, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'SPÅTTA', 'Färsk fisk med stekt potatis & remoulad sås', 95, 6, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'SPAGETTI BOLOGNESE', 'Klassisk köttfärssås med parmesan', 80, 7, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'NUGGETSTALLRIK', 'Knapriga kycklingnuggets med pommes', 80, 8, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'RÄKBOMB', 'Husets specialitet med färska räkor', 125, 9, true
FROM menu_categories WHERE name = 'Huvudrätter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'SALLAD', 'Välj mellan räk, kyckling eller halloumi', 95, 10, true
FROM menu_categories WHERE name = 'Huvudrätter';