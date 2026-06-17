-- Instructions for setting up your Supabase database:
-- 1. Go to your Supabase project dashboard -> SQL Editor
-- 2. Paste and run the following queries:

CREATE TABLE resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own resumes
CREATE POLICY "Users can manage their own resumes" 
  ON resumes 
  FOR ALL 
  USING (auth.uid() = user_id);
