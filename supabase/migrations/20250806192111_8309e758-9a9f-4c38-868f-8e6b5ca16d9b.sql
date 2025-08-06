-- Update opening hours to match the correct schedule
-- Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6

-- Clear existing data and insert correct opening hours
DELETE FROM opening_hours;

INSERT INTO opening_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '11:00:00', '16:00:00', false), -- Söndag: 11-16
(1, '10:00:00', '20:00:00', false), -- Måndag: 10-20  
(2, '10:00:00', '20:00:00', false), -- Tisdag: 10-20
(3, '10:00:00', '21:00:00', false), -- Onsdag: 10-21
(4, '10:00:00', '21:00:00', false), -- Torsdag: 10-21
(5, '10:00:00', '00:00:00', false), -- Fredag: 10-00 (midnight)
(6, '15:00:00', '23:00:00', false); -- Lördag: 15-23