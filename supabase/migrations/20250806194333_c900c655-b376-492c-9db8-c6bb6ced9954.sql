-- First, check if Alkohol category exists in menu_categories, if not create it
INSERT INTO menu_categories (name, sort_order)
SELECT 'Alkohol', 10
WHERE NOT EXISTS (
    SELECT 1 FROM menu_categories WHERE name = 'Alkohol'
);

-- Get the category ID for Alkohol
INSERT INTO menu_items (category_id, name, description, price, available, sort_order)
SELECT 
    mc.id,
    'Fat 21',
    'Fatöl',
    59,
    true,
    1
FROM menu_categories mc
WHERE mc.name = 'Alkohol'
AND NOT EXISTS (
    SELECT 1 FROM menu_items mi 
    WHERE mi.category_id = mc.id AND mi.name = 'Fat 21'
);

INSERT INTO menu_items (category_id, name, description, price, available, sort_order)
SELECT 
    mc.id,
    'Holba',
    'Fatöl',
    63,
    true,
    2
FROM menu_categories mc
WHERE mc.name = 'Alkohol'
AND NOT EXISTS (
    SELECT 1 FROM menu_items mi 
    WHERE mi.category_id = mc.id AND mi.name = 'Holba'
);

INSERT INTO menu_items (category_id, name, description, price, available, sort_order)
SELECT 
    mc.id,
    'Bryggmästaren Pilsner',
    'Fatöl',
    65,
    true,
    3
FROM menu_categories mc
WHERE mc.name = 'Alkohol'
AND NOT EXISTS (
    SELECT 1 FROM menu_items mi 
    WHERE mi.category_id = mc.id AND mi.name = 'Bryggmästaren Pilsner'
);

INSERT INTO menu_items (category_id, name, description, price, available, sort_order)
SELECT 
    mc.id,
    'Zlatopramen',
    'Fatöl',
    69,
    true,
    4
FROM menu_categories mc
WHERE mc.name = 'Alkohol'
AND NOT EXISTS (
    SELECT 1 FROM menu_items mi 
    WHERE mi.category_id = mc.id AND mi.name = 'Zlatopramen'
);

INSERT INTO menu_items (category_id, name, description, price, available, sort_order)
SELECT 
    mc.id,
    'Bron IPA',
    'Fatöl',
    69,
    true,
    5
FROM menu_categories mc
WHERE mc.name = 'Alkohol'
AND NOT EXISTS (
    SELECT 1 FROM menu_items mi 
    WHERE mi.category_id = mc.id AND mi.name = 'Bron IPA'
);