-- Migration: 20261111000003_platform_regional_settings.sql
-- Description: Centralized Global Regional & Localization Settings with RLS and Audit Trail

CREATE TABLE IF NOT EXISTS public.platform_regional_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  currency TEXT NOT NULL DEFAULT 'INR',
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  number_format TEXT NOT NULL DEFAULT 'indian' CHECK (number_format IN ('us', 'indian', 'european')),
  date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY')),
  time_format TEXT NOT NULL DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  measurement_system TEXT NOT NULL DEFAULT 'metric' CHECK (measurement_system IN ('us_customary', 'metric')),
  locale TEXT NOT NULL DEFAULT 'en-IN' CHECK (locale IN ('en-US', 'en-IN', 'en-GB', 'de-DE', 'fr-FR')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by_profile_id TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.platform_regional_settings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone (authenticated buyers, suppliers, admins, and visitors) can view active regional settings
CREATE POLICY "Allow public read of platform regional settings"
  ON public.platform_regional_settings
  FOR SELECT
  USING (true);

-- Policy 2: Strictly authorized administrators alone can insert or update platform regional settings
CREATE POLICY "Allow admin write to platform regional settings"
  ON public.platform_regional_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::text
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::text
        AND profiles.role = 'admin'
    )
  );

-- Seed default global settings row
INSERT INTO public.platform_regional_settings (
  id,
  currency,
  currency_symbol,
  number_format,
  date_format,
  time_format,
  measurement_system,
  locale,
  timezone,
  updated_at,
  updated_by_profile_id
) VALUES (
  'global',
  'INR',
  '₹',
  'indian',
  'DD/MM/YYYY',
  '24h',
  'metric',
  'en-IN',
  'Asia/Kolkata',
  timezone('utc'::text, now()),
  'usr-admin-01'
) ON CONFLICT (id) DO NOTHING;

-- Comments
COMMENT ON TABLE public.platform_regional_settings IS 'Global platform-wide regional, currency, timezone and localization configuration managed by root administrators.';

