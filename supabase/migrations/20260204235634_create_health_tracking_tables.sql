/*
  # Health Tracking App for Alcohol Lovers - Initial Schema

  ## Overview
  This migration creates the core tables for tracking alcohol-free days (休肝日)
  and managing weekly/monthly goals.

  ## New Tables
  
  ### `daily_records`
  Tracks the daily status of alcohol consumption
  - `id` (uuid, primary key) - Unique identifier
  - `date` (date, unique) - The date of the record
  - `status` (text) - Status: 'rest' (休肝日), 'drink' (飲酒), or 'unset' (未入力)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `goals`
  Stores user goals for weekly and monthly rest days
  - `id` (uuid, primary key) - Unique identifier
  - `weekly_goal` (integer) - Number of rest days per week (default: 2)
  - `monthly_goal` (integer) - Number of rest days per month (default: 8)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on both tables
  - Since this is an MVP without authentication, we allow public access
  - In production, these policies should be restricted to authenticated users
*/

-- Create daily_records table
CREATE TABLE IF NOT EXISTS daily_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('rest', 'drink', 'unset')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_goal integer NOT NULL DEFAULT 2 CHECK (weekly_goal >= 0 AND weekly_goal <= 7),
  monthly_goal integer NOT NULL DEFAULT 8 CHECK (monthly_goal >= 0 AND monthly_goal <= 31),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date DESC);

-- Enable RLS
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Public access policies for MVP (should be restricted in production)
CREATE POLICY "Allow public read access to daily_records"
  ON daily_records FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to daily_records"
  ON daily_records FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to daily_records"
  ON daily_records FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from daily_records"
  ON daily_records FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to goals"
  ON goals FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to goals"
  ON goals FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to goals"
  ON goals FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Insert default goals record
INSERT INTO goals (weekly_goal, monthly_goal)
VALUES (2, 8)
ON CONFLICT DO NOTHING;