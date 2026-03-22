-- Add city and birth_date columns to leads table
-- city: city the lead is from (free text)
-- birth_date: lead's date of birth (ISO date string)

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE;
