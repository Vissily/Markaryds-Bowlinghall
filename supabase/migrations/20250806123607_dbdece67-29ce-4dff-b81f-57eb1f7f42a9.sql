-- Update opening hours to match the Hours.tsx component
-- From Hours.tsx: 
-- Måndag - Tisdag: 10:00 - 20:00
-- Onsdag - Torsdag: 10:00 - 21:00  
-- Fredag: 10:00 - 00:00 (midnight)
-- Lördag: 15:00 - 23:00
-- Söndag: 11:00 - 16:00

UPDATE opening_hours SET open_time = '10:00', close_time = '20:00' WHERE day_of_week = 1; -- Måndag
UPDATE opening_hours SET open_time = '10:00', close_time = '20:00' WHERE day_of_week = 2; -- Tisdag  
UPDATE opening_hours SET open_time = '10:00', close_time = '21:00' WHERE day_of_week = 3; -- Onsdag
UPDATE opening_hours SET open_time = '10:00', close_time = '21:00' WHERE day_of_week = 4; -- Torsdag
UPDATE opening_hours SET open_time = '10:00', close_time = '24:00' WHERE day_of_week = 5; -- Fredag (midnight)
UPDATE opening_hours SET open_time = '15:00', close_time = '23:00' WHERE day_of_week = 6; -- Lördag
UPDATE opening_hours SET open_time = '11:00', close_time = '16:00' WHERE day_of_week = 0; -- Söndag