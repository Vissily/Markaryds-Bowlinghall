-- Clear existing price items and add the correct prices
DELETE FROM price_items;

-- Add new price items with correct categories and prices
-- Medlemmar i markaryds bowlingklubb från och med 1/8
INSERT INTO price_items (category, name, description, price, currency, is_active, sort_order) VALUES
('Medlemmar i markaryds bowlingklubb från och med 1/8', 'Måndag - Fredag 10-17', '22:-/serie', 22, 'SEK', true, 1),
('Medlemmar i markaryds bowlingklubb från och med 1/8', 'Måndag - Torsdag 17-21', '27:-/Serie', 27, 'SEK', true, 2),
('Medlemmar i markaryds bowlingklubb från och med 1/8', 'Lördag 15-18', '27:-/Serie', 27, 'SEK', true, 3),
('Medlemmar i markaryds bowlingklubb från och med 1/8', 'Söndag 11-16', '27:-/serie', 27, 'SEK', true, 4),

-- Övriga (Ej medlemmar)
('Övriga (Ej medlemmar)', 'Måndag - Fredag 10-17', '30:-/Serie', 30, 'SEK', true, 1),

-- Timdebitering
('Timdebitering', 'Måndag - Fredag 10-17', '180:-', 180, 'SEK', true, 1),
('Timdebitering', 'Måndag - Torsdag 17-21', '220:-', 220, 'SEK', true, 2),
('Timdebitering', 'Fredag 17-00', '290:-', 290, 'SEK', true, 3),
('Timdebitering', 'Lördag 15-21', '290:-', 290, 'SEK', true, 4),
('Timdebitering', 'Söndag 11-16', '180:-', 180, 'SEK', true, 5),

-- Shuffleboard
('Shuffleboard', 'Shuffleboard', '100:-/Timme', 100, 'SEK', true, 1),

-- Dart
('Dart', 'Dart', '200:-/timme', 200, 'SEK', true, 1),

-- Minigolf
('Minigolf', 'Minigolf', '40:-/st', 40, 'SEK', true, 1),

-- Padel
('Padel', 'Padel', '150:- -> 200:- /timme', 175, 'SEK', true, 1);