-- Add invited_by and state columns to leads table
-- invited_by: stores who referred/invited the lead (free text)
-- state: Brazilian state the lead is from (e.g., 'SP', 'RJ')

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS invited_by TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT;
