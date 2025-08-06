-- Add new alcohol category with draft beer items
INSERT INTO price_items (category, name, description, price, currency, is_active, sort_order) VALUES
('Alkohol', 'Fat 21', 'Fatöl', 59, 'SEK', true, 1),
('Alkohol', 'Holba', 'Fatöl', 63, 'SEK', true, 2),
('Alkohol', 'Bryggmästaren Pilsner', 'Fatöl', 65, 'SEK', true, 3),
('Alkohol', 'Zlatopramen', 'Fatöl', 69, 'SEK', true, 4),
('Alkohol', 'Bron IPA', 'Fatöl', 69, 'SEK', true, 5);