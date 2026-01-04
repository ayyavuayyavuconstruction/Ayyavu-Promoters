/*
  # Real Estate Management System Schema

  ## Overview
  Creates the complete database schema for the EstateNexus real estate management application.

  ## New Tables
  
  ### `company_settings`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Company name
  - `logo_url` (text) - Logo image URL
  - `street` (text) - Street address
  - `city` (text) - City
  - `state` (text) - State/Province
  - `zip` (text) - Postal code
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `projects`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Project name
  - `location` (text) - Project location
  - `launch_date` (date) - Project launch date
  - `image_urls` (jsonb) - Array of image URLs
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `sites`
  - `id` (uuid, primary key) - Unique identifier
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `number` (text) - Site/unit number
  - `status` (text) - Status: SOLD, BOOKED, UNSOLD
  - `customer_name` (text) - Customer name
  - `customer_phone` (text) - Customer phone
  - `facing` (text) - Direction the site faces
  - `dimensions` (jsonb) - North, South, East, West dimensions
  - `land_area_sqft` (numeric) - Land area in square feet
  - `land_cost_per_sqft` (numeric) - Cost per square foot for land
  - `construction_area_sqft` (numeric) - Construction area in square feet
  - `construction_rate_per_sqft` (numeric) - Construction rate per square foot
  - `profit_margin_percentage` (numeric) - Profit margin percentage
  - `image_urls` (jsonb) - Array of image URLs
  - `projected_completion_date` (date) - Expected completion date
  - `booking_date` (date) - Date when booked
  - `sale_date` (date) - Date when sold
  - `tags` (jsonb) - Array of tags
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `payment_records`
  - `id` (uuid, primary key) - Unique identifier
  - `site_id` (uuid, foreign key) - Reference to sites table
  - `amount` (numeric) - Payment amount
  - `date` (date) - Payment date
  - `method` (text) - Payment method
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Create policies for public access (no auth required for this app)
*/

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'ESTATENEXUS',
  logo_url text,
  street text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  zip text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  launch_date date DEFAULT CURRENT_DATE,
  image_urls jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number text NOT NULL,
  status text NOT NULL DEFAULT 'UNSOLD',
  customer_name text,
  customer_phone text,
  facing text NOT NULL DEFAULT 'North',
  dimensions jsonb NOT NULL DEFAULT '{"north": 30, "south": 30, "east": 40, "west": 40}'::jsonb,
  land_area_sqft numeric NOT NULL DEFAULT 1200,
  land_cost_per_sqft numeric NOT NULL DEFAULT 0,
  construction_area_sqft numeric NOT NULL DEFAULT 0,
  construction_rate_per_sqft numeric NOT NULL DEFAULT 0,
  profit_margin_percentage numeric DEFAULT 0,
  image_urls jsonb DEFAULT '[]'::jsonb,
  projected_completion_date date,
  booking_date date,
  sale_date date,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  method text NOT NULL DEFAULT 'Bank Transfer',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sites_project_id ON sites(project_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_site_id ON payment_records(site_id);

-- Enable Row Level Security
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
-- Company Settings Policies
CREATE POLICY "Allow public read access to company_settings"
  ON company_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to company_settings"
  ON company_settings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to company_settings"
  ON company_settings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Projects Policies
CREATE POLICY "Allow public read access to projects"
  ON projects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to projects"
  ON projects
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to projects"
  ON projects
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to projects"
  ON projects
  FOR DELETE
  TO public
  USING (true);

-- Sites Policies
CREATE POLICY "Allow public read access to sites"
  ON sites
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to sites"
  ON sites
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to sites"
  ON sites
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to sites"
  ON sites
  FOR DELETE
  TO public
  USING (true);

-- Payment Records Policies
CREATE POLICY "Allow public read access to payment_records"
  ON payment_records
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to payment_records"
  ON payment_records
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to payment_records"
  ON payment_records
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to payment_records"
  ON payment_records
  FOR DELETE
  TO public
  USING (true);

-- Insert default company settings
INSERT INTO company_settings (name, street, city, state, zip)
VALUES ('ESTATENEXUS', '', '', '', '')
ON CONFLICT DO NOTHING;