-- Fix board_members year_in_college constraint to allow all valid values
ALTER TABLE board_members DROP CONSTRAINT IF EXISTS board_members_year_in_college_check;

-- Add proper constraint for year_in_college
ALTER TABLE board_members ADD CONSTRAINT board_members_year_in_college_check 
CHECK (year_in_college IN ('freshman', 'sophomore', 'junior', 'senior', 'graduate', 'other') OR year_in_college IS NULL);

-- Add share_count column to events table for tracking shares
ALTER TABLE events ADD COLUMN IF NOT EXISTS share_count integer DEFAULT 0;