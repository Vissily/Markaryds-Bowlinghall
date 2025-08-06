-- Manually confirm the email for info@markarydsbowling.se
-- This will update the auth.users table to mark the email as confirmed

UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email = 'info@markarydsbowling.se';