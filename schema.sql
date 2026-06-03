-- Robust Database Schema for Central School of Commerce Typing Portal
-- Supports re-running multiple times safely

-- 1. Profiles Table (Create if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  mobile_number TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Passages Table (Create if not exists)
CREATE TABLE IF NOT EXISTS public.passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('english', 'tamil')),
  level TEXT NOT NULL CHECK (level IN ('junior', 'senior')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Test Results Table (Create if not exists)
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES public.passages(id) ON DELETE CASCADE,
  wpm INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  strokes INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  typed_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- 5. Drop policies if they already exist to prevent collision errors
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read passages" ON public.passages;
DROP POLICY IF EXISTS "Users can view and write own test results" ON public.test_results;
DROP POLICY IF EXISTS "All users can view test results for leaderboard" ON public.test_results;

-- 6. Create RLS Policies
CREATE POLICY "Users can view and update own profile" ON public.profiles 
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Authenticated users can read passages" ON public.passages 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view and write own test results" ON public.test_results 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "All users can view test results for leaderboard" ON public.test_results 
  FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Indexes for Performance (Create if not exists)
CREATE INDEX IF NOT EXISTS idx_passages_lang_level ON public.passages(language, level);
CREATE INDEX IF NOT EXISTS idx_test_results_user ON public.test_results(user_id);

-- 8. Profile Sync Trigger Setup
-- Drop existing trigger and function first to avoid conflict errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, mobile_number, date_of_birth)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'mobile_number', ''),
    CASE WHEN (new.raw_user_meta_data->>'date_of_birth') IS NOT NULL 
         THEN (new.raw_user_meta_data->>'date_of_birth')::DATE 
         ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    mobile_number = COALESCE(EXCLUDED.mobile_number, profiles.mobile_number),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, profiles.date_of_birth);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
