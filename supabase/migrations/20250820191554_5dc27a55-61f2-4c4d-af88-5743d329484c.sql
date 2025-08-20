-- Fix security issues in event_registrations table

-- Add missing UPDATE policy - only admins should be able to update registrations
CREATE POLICY "Admins can update event registrations" 
ON public.event_registrations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add user_id column to track registrations by authenticated users (optional)
-- This allows users to view their own registrations if they were logged in
ALTER TABLE public.event_registrations 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add policy to allow users to view their own registrations
CREATE POLICY "Users can view their own registrations" 
ON public.event_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add policy to allow users to update their own registrations
CREATE POLICY "Users can update their own registrations" 
ON public.event_registrations 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add policy to allow users to delete their own registrations
CREATE POLICY "Users can delete their own registrations" 
ON public.event_registrations 
FOR DELETE 
USING (auth.uid() = user_id);