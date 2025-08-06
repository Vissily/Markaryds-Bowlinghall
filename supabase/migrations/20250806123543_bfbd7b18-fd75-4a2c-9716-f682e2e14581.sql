-- Continue with remaining menu items

-- Barnmeny
INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'HAMBURGERTALLRIK', 'Perfekt storlek för barn', 60, 1, true
FROM menu_categories WHERE name = 'Barnmeny';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'NUGGETSTALLRIK', 'Barnfavorit med pommes', 60, 2, true
FROM menu_categories WHERE name = 'Barnmeny';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'KYCKLINGSPETT M.POMMES', 'Mild marinering, perfekt för barn', 60, 3, true
FROM menu_categories WHERE name = 'Barnmeny';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'SPAGETTI BOLOGNESE', 'Mild köttfärssås', 60, 4, true
FROM menu_categories WHERE name = 'Barnmeny';

-- Desserter
INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'VANILJGLASS', 'Kreamy vaniljglass med chokladsås', 40, 1, true
FROM menu_categories WHERE name = 'Desserter';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'BROWNIE', 'Varm brownie med vaniljglass', 45, 2, true
FROM menu_categories WHERE name = 'Desserter';

-- Alkoholfritt
INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'LÄSK', 'Cola Cola, Cola Zero, Fanta, Sprite', 25, 1, true
FROM menu_categories WHERE name = 'Alkoholfritt';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'ALKOHOLFRITT ÖL', 'Carlsberg, Cider Päron', 25, 2, true
FROM menu_categories WHERE name = 'Alkoholfritt';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'MER/FESTIS', 'Apelsin, Päron, Äpple Hallon/Svart vinbär, Cactus lime', 25, 3, true
FROM menu_categories WHERE name = 'Alkoholfritt';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'ENERGIDRYCKER', 'Powerade, Nocco, Vitamin Well', 25, 4, true
FROM menu_categories WHERE name = 'Alkoholfritt';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'REDBULL', 'Klassisk energidryck', 20, 5, true
FROM menu_categories WHERE name = 'Alkoholfritt';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'VATTEN', 'Citron, Naturell, Hallon/Fläder', 15, 6, true
FROM menu_categories WHERE name = 'Alkoholfritt';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'KAFFE/TE', 'Nybryggt kaffe eller te', 10, 7, true
FROM menu_categories WHERE name = 'Alkoholfritt';

-- Alkohol
INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'STARKÖL 50CL', 'Mariestads, Eriksberg, Norrlands Guld, Bryggmästarens', 63, 1, true
FROM menu_categories WHERE name = 'Alkohol';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'STARKÖL 33CL', 'Carlsberg, Heineken', 52, 2, true
FROM menu_categories WHERE name = 'Alkohol';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'PROSECCO', 'Mousserande vin', 79, 3, true
FROM menu_categories WHERE name = 'Alkohol';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'IPA', 'Lagunitas, Hard Hittin', 64, 4, true
FROM menu_categories WHERE name = 'Alkohol';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'VIN', 'Quiet Life Chardonnay vitt, Quiet Life Shiraz rött', 65, 5, true
FROM menu_categories WHERE name = 'Alkohol';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'CIDER', 'Smirnoff Ice, Breezer, Crush jordgubb 7%', 60, 6, true
FROM menu_categories WHERE name = 'Alkohol';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'FATÖL HOLBA', 'Liten 0,25 / Stor 0,4', 48, 7, true
FROM menu_categories WHERE name = 'Alkohol';

INSERT INTO menu_items (category_id, name, description, price, sort_order, available) 
SELECT id, 'GLUTENFRI ÖL', 'Crocodil', 50, 8, true
FROM menu_categories WHERE name = 'Alkohol';