-- Clean up duplicate roles for info@markarydsbowling.se
-- Keep only the admin role and remove the user role

DELETE FROM user_roles 
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'info@markarydsbowling.se') 
AND role = 'user';