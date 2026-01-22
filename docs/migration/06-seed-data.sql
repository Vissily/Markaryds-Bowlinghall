-- ============================================================
-- LOVABLE CLOUD MIGRATION - SEED DATA
-- Genererad: 2026-01-22
-- ============================================================

-- ============================================================
-- OPENING HOURS
-- ============================================================
INSERT INTO public.opening_hours (id, day_of_week, open_time, close_time, is_closed) VALUES
  ('29c6dfb4-5e27-4665-bd44-9772f01ce60b', 0, '11:00:00', '16:00:00', false),
  ('3c1ec612-325c-4790-85bb-da821122b4a1', 1, '10:00:00', '20:00:00', false),
  ('d3ac8969-5398-4d3a-a3b8-991f37bbdd45', 2, '10:00:00', '20:00:00', false),
  ('76b8adb2-d616-4af7-aa7c-63b132780a3d', 3, '10:00:00', '21:00:00', false),
  ('c0e50f77-32be-460f-86ce-2cf74e5a2e98', 4, '10:00:00', '21:00:00', false),
  ('c185a473-737b-41c1-bd32-3f26f706de87', 5, '10:00:00', '00:00:00', false),
  ('22f2df89-3672-433b-8227-672992e15999', 6, '15:00:00', '23:00:00', false);

-- ============================================================
-- PRICE ITEMS
-- ============================================================
INSERT INTO public.price_items (id, category, name, description, price, currency, is_active, sort_order) VALUES
  ('1b9a9e1a-f5f0-40c2-8661-13bbb1d88169', 'Dart', 'Dart', '200:-/timme', 200, 'SEK', true, 1),
  ('02e7cea2-a00d-4fab-827d-1dbda92a0ae1', 'Medlemmar i markaryds bowlingklubb från och med 1/8', 'Måndag - Fredag 10-17', '22:-/serie', 22, 'SEK', true, 1),
  ('dd46ca5f-4cdb-4df4-a7aa-31d4ceac0947', 'Medlemmar i markaryds bowlingklubb från och med 1/8', 'Måndag - Torsdag 17-21', '27:-/Serie', 27, 'SEK', true, 2),
  ('9b4556ea-338b-4278-869a-f97df96769d3', 'Medlemmar i markaryds bowlingklubb från och med 1/8', 'Lördag 15-18', '27:-/Serie', 27, 'SEK', true, 3),
  ('d9eb09a2-a29d-47f1-b0be-8eeb1af4b297', 'Medlemmar i markaryds bowlingklubb från och med 1/8', 'Söndag 11-16', '27:-/serie', 27, 'SEK', true, 4),
  ('f6885a4d-e317-43ac-b9a4-4aefaa0c7b43', 'Minigolf', 'Minigolf', '40:-/st', 40, 'SEK', true, 1),
  ('2a270ab2-83aa-4bff-8d89-2f7d5e83138e', 'Övriga (Ej medlemmar)', 'Måndag - Fredag 10-17', '30:-/Serie', 30, 'SEK', true, 1),
  ('a0bc6c0c-55a6-4e79-bd3d-3174d61ec4f3', 'Padel', 'Padel', '150:- -> 200:- /timme', 175, 'SEK', true, 1),
  ('c85af46b-7192-452d-8d85-ea4a0f793138', 'Shuffleboard', 'Shuffleboard', '100:-/Timme', 100, 'SEK', true, 1),
  ('bd479d59-e1f4-40ba-8f86-2947eeb3d7d1', 'Timdebitering', 'Måndag - Fredag 10-17', '180:-', 180, 'SEK', true, 1),
  ('a1768054-4df2-4838-b261-6ab07f1cf6d0', 'Timdebitering', 'Måndag - Torsdag 17-21', '220:-', 220, 'SEK', true, 2),
  ('0e30d72c-1808-47e8-b49a-ca5b8899563e', 'Timdebitering', 'Fredag 17-00', '290:-', 290, 'SEK', true, 3),
  ('7a042ea1-a53c-4e59-8bc7-e4a208a9eb62', 'Timdebitering', 'Lördag 15-21', '290:-', 290, 'SEK', true, 4),
  ('7080909a-7d9e-4ee7-9f3a-d656d5b42b7a', 'Timdebitering', 'Söndag 11-16', '180:-', 180, 'SEK', true, 5);

-- ============================================================
-- MENU CATEGORIES
-- ============================================================
INSERT INTO public.menu_categories (id, name, sort_order) VALUES
  ('3a8725e5-96de-494b-b52f-545265561d87', 'Förrätter', 1),
  ('f49aa8a9-e70f-4592-904c-e5012f201995', 'Huvudrätter', 2),
  ('286323c3-9a6a-4eb2-9729-8622b8ead83f', 'Barnmeny', 3),
  ('009ed5b5-1c42-4948-b56e-008bf5fbace9', 'Desserter', 4),
  ('8b8dc1e7-7577-4d2e-a29c-04ada0ee10fb', 'Alkoholfritt', 5),
  ('951c8755-d2c9-4665-9645-3043d2b986f4', 'Alkohol', 6);

-- ============================================================
-- MENU ITEMS (sample - full list in data export)
-- ============================================================
INSERT INTO public.menu_items (id, category_id, name, description, price, available, sort_order) VALUES
  ('107551fe-35e8-4822-ac0b-d9131ad1c38f', '3a8725e5-96de-494b-b52f-545265561d87', 'PUBTALLRIK', 'Nachochips, lökringar, chili chicken & vitlöksås', 60, true, 1),
  ('70a0c1a3-359e-4fcf-9955-5360fbba6d4e', '3a8725e5-96de-494b-b52f-545265561d87', 'POMMESTALLRIK', 'Knapriga pommes frites med valfri dip', 35, true, 2),
  ('e4b8c0af-af92-4b91-b0a8-8c1c4b73b4b4', '3a8725e5-96de-494b-b52f-545265561d87', 'NACHOCHIPS', 'Krispiga nachos med ost & dippa', 40, true, 3),
  ('855bbdfb-83f3-4857-9e11-66c783926605', '3a8725e5-96de-494b-b52f-545265561d87', 'OST & SKINKTOAST', 'Varm toast med sallad & dressing', 45, true, 4),
  ('2039c34f-8eda-44f9-b2b8-33beba7bcb75', '3a8725e5-96de-494b-b52f-545265561d87', 'RÄKMACKA', 'Klassisk räkmacka på färskt bröd', 65, true, 5),
  ('c468bfa5-4cf8-4692-9d16-a701cb75ea48', 'f49aa8a9-e70f-4592-904c-e5012f201995', 'KALVSNITZEL', 'Stekt potatis & bearnaisesås', 175, true, 1),
  ('1cb3d399-2450-4cc8-a07c-d51f158583b5', 'f49aa8a9-e70f-4592-904c-e5012f201995', 'ANGUSBURGARE', '200g nötkött, ost & bacon, pommes och bbq-sås', 145, true, 2),
  ('1d297ff2-92f1-4977-9e2f-e71c8f45dfa7', 'f49aa8a9-e70f-4592-904c-e5012f201995', 'KYCKLINGSPETT', 'Kycklingspett med pommes & bbq-sås', 110, true, 5),
  ('87d01d87-8b07-4b77-b6c8-e3a8c04d2534', '286323c3-9a6a-4eb2-9729-8622b8ead83f', 'HAMBURGERTALLRIK', 'Perfekt storlek för barn', 60, true, 1),
  ('113b5d7f-0f6b-40ec-9701-4f37cfa755f3', '286323c3-9a6a-4eb2-9729-8622b8ead83f', 'NUGGETSTALLRIK', 'Barnfavorit med pommes', 60, true, 2),
  ('7e18f7ce-3050-4ea3-a13b-ffccae19ca27', '286323c3-9a6a-4eb2-9729-8622b8ead83f', 'SPAGETTI BOLOGNESE', 'Mild köttfärssås', 60, true, 4),
  ('395f7ec1-60d7-4856-b4d0-456f83834036', '009ed5b5-1c42-4948-b56e-008bf5fbace9', 'BROWNIE', 'Varm brownie med vaniljglass', 45, true, 2),
  ('816fb5ad-e920-47ba-a2d9-5d98c3725f0c', '8b8dc1e7-7577-4d2e-a29c-04ada0ee10fb', 'REDBULL', 'Klassisk energidryck', 25, true, 5),
  ('192b7b54-f8bc-4630-b384-332d82df3f29', '8b8dc1e7-7577-4d2e-a29c-04ada0ee10fb', 'VATTEN', 'Citron, Naturell, Hallon/Fläder', 15, true, 6),
  ('a9e7202c-7839-4b53-8545-64a12661461c', '951c8755-d2c9-4665-9645-3043d2b986f4', 'STARKÖL 33CL', 'Carlsberg, Heineken', 52, true, 2),
  ('c9b63263-0ec8-42e5-8ade-65ff06101f2d', '951c8755-d2c9-4665-9645-3043d2b986f4', 'PROSECCO', 'Mousserande vin', 79, true, 3),
  ('175ff93f-8f93-420d-a957-029348fcf76b', '951c8755-d2c9-4665-9645-3043d2b986f4', 'CIDER', 'Smirnoff Ice, Breezer, Crush jordgubb 7%', 60, true, 6);

-- ============================================================
-- SITE CONTENT
-- ============================================================
INSERT INTO public.site_content (id, section_key, title, subtitle, description, button_text, button_link, metadata) VALUES
  ('9695ef38-2b6a-4a9a-a1f3-b66529c36981', 'hero', 'Markaryds Bowlinghall', 'Sedan 2013', 'Mer än bara bowling – upplev padel, minigolf, dart och shuffleboard i Smålands modernaste aktivitetshall', 'Boka Din Aktivitet', '#activities', '{"stats": [{"icon": "Users", "label": "Spelare per vecka", "value": "450"}, {"icon": "Calendar", "label": "Öppettimmar per vecka", "value": "70"}, {"icon": "Star", "label": "Olika aktiviteter", "value": "5"}]}'::jsonb),
  ('f95303a4-b220-4c2f-bbbf-25c2beba448d', 'about', 'Om Markaryds Bowlinghall', NULL, 'Vi har varit en del av Markaryd sedan 2013 och erbjuder mycket mer än bara bowling.', NULL, NULL, '{}'::jsonb),
  ('e2341ef2-97f9-4485-a330-1aeebedc359e', 'activities', 'Våra Aktiviteter', NULL, 'Upplev våra olika aktiviteter i en modern och välkomnande miljö.', NULL, NULL, '{}'::jsonb),
  ('9cd06ae2-2d58-4d94-8022-d8f5b8748dcf', 'hours', 'Öppettider', NULL, 'Vi är öppna sju dagar i veckan för din bekvämlighet.', NULL, NULL, '{}'::jsonb),
  ('94c1fb40-9023-4385-b6ef-2a533304aa4f', 'contact', 'Kontakta Oss', NULL, 'Välkommen att höra av dig för bokning eller frågor.', NULL, NULL, '{}'::jsonb);

-- ============================================================
-- LIVESTREAMS
-- ============================================================
INSERT INTO public.livestreams (id, title, description, youtube_video_id, status, scheduled_start, scheduled_end, is_main_stream, featured) VALUES
  ('c269094f-5f00-4177-9920-df560d63b486', 'Bowling Bana 1-4', '', '52G1uLm8mco', 'live', '2025-09-20 14:00:00+00', '2025-09-20 17:00:00+00', true, true),
  ('749b132c-2127-48b3-9c52-513dbee4b25b', 'Bowling Bana 5-8', '', '52G1uLm8mco', 'live', '2025-09-20 14:00:00+00', '2025-09-20 16:00:00+00', true, true);

-- ============================================================
-- MARKARYDSLIGAN SERIES
-- ============================================================
INSERT INTO public.markarydsligan_series (id, name, schedule, url, sort_order) VALUES
  ('6796030f-c079-4f76-8d38-a487bf830d0b', 'Serie A', 'Måndag 19:00', 'https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=9076&fromAdmin=1', 0),
  ('9be80a00-8c92-42e2-8ad5-a2492bc2723e', 'Serie B', 'Tis 19:30', 'https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=9077&fromAdmin=1', 1),
  ('da1ca7d3-c10d-4103-829a-d5de8fc89c77', 'Serie C', 'Mån 18:00', 'https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=9078&fromAdmin=1', 2),
  ('6c6f6d5e-2c82-45ab-a9da-057685134534', 'Serie D', 'Tis 17:30', 'https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=9079&fromAdmin=1', 3),
  ('ff4f0c62-852b-45e9-a511-1faf33e7fb1a', 'Serie E', 'Tis 18:30', 'https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=9080&fromAdmin=1', 4),
  ('a4fe3eed-b0fe-4918-b13d-1547b8343eea', '55+ Grupp 1', 'Torsdagar 14:00', 'https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8822&fromAdmin=1', 5),
  ('95165b90-f09c-458c-96cc-688093d30249', '55+ Grupp 2', 'Torsdagar 15:30', 'https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8823&fromAdmin=1', 6);

-- ============================================================
-- EVENTS (current)
-- ============================================================
INSERT INTO public.events (id, title, description, event_date, event_type, status, featured, has_big_screen, image_url, current_participants) VALUES
  ('1f9a5676-8c6e-4d1a-8b78-47f293e19a9a', 'Trubadurkväll', NULL, '2026-03-06 19:00:00+00', 'tournament', 'upcoming', true, false, 'https://suoffsrethbczunoanmn.supabase.co/storage/v1/object/public/event-images/423a698d-a03f-4cf3-8fad-6ab933f28ce6/events/1768128182747.jpg', 0);

-- ============================================================
-- EVENTS INTERESTS (current)
-- ============================================================
INSERT INTO public.event_interests (id, event_id, ip_hash) VALUES
  ('e26b21e6-6748-4fbf-bded-c74287a66be6', '1f9a5676-8c6e-4d1a-8b78-47f293e19a9a', '14ba0b9759def1f33ee332e7cb5f103bdb2de474a9f65bc703fbb411f1b388cc');
