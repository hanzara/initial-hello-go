-- Create genomes table
CREATE TABLE IF NOT EXISTS public.genomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  version TEXT,
  total_modules INT DEFAULT 0,
  total_functions INT DEFAULT 0,
  total_dependencies INT DEFAULT 0,
  complexity_score FLOAT,
  health_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_modules table
CREATE TABLE IF NOT EXISTS public.genome_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT,
  lines_of_code INT DEFAULT 0,
  complexity INT DEFAULT 0,
  dependencies_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_functions table
CREATE TABLE IF NOT EXISTS public.genome_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.genome_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  complexity INT DEFAULT 0,
  lines_of_code INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_dependencies table
CREATE TABLE IF NOT EXISTS public.genome_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_packages table
CREATE TABLE IF NOT EXISTS public.genome_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT,
  size_kb INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_health table
CREATE TABLE IF NOT EXISTS public.genome_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  score FLOAT,
  status TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_suggestions table
CREATE TABLE IF NOT EXISTS public.genome_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  category TEXT,
  impact_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  difficulty TEXT,
  category TEXT,
  xp_points INT DEFAULT 0,
  duration_minutes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create lesson_comments table
CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  quiz_score INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS on new tables
ALTER TABLE public.genomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop if exists first to avoid conflicts)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read genomes" ON public.genomes;
  DROP POLICY IF EXISTS "Allow public read genome_modules" ON public.genome_modules;
  DROP POLICY IF EXISTS "Allow public read genome_functions" ON public.genome_functions;
  DROP POLICY IF EXISTS "Allow public read genome_dependencies" ON public.genome_dependencies;
  DROP POLICY IF EXISTS "Allow public read genome_packages" ON public.genome_packages;
  DROP POLICY IF EXISTS "Allow public read genome_health" ON public.genome_health;
  DROP POLICY IF EXISTS "Allow public read genome_suggestions" ON public.genome_suggestions;
  DROP POLICY IF EXISTS "Allow public read lessons" ON public.lessons;
  DROP POLICY IF EXISTS "Allow public read lesson_comments" ON public.lesson_comments;
  DROP POLICY IF EXISTS "Users can read their own progress" ON public.user_progress;
  DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
  DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
  DROP POLICY IF EXISTS "Allow public insert genomes" ON public.genomes;
  DROP POLICY IF EXISTS "Allow public insert lessons" ON public.lessons;
  DROP POLICY IF EXISTS "Allow public insert lesson_comments" ON public.lesson_comments;
END $$;

-- Create RLS Policies
CREATE POLICY "Allow public read genomes" ON public.genomes FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_modules" ON public.genome_modules FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_functions" ON public.genome_functions FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_dependencies" ON public.genome_dependencies FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_packages" ON public.genome_packages FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_health" ON public.genome_health FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_suggestions" ON public.genome_suggestions FOR SELECT USING (true);
CREATE POLICY "Allow public read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Allow public read lesson_comments" ON public.lesson_comments FOR SELECT USING (true);

-- User progress policies
CREATE POLICY "Users can read their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Allow public insert for demo purposes
CREATE POLICY "Allow public insert genomes" ON public.genomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert lessons" ON public.lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert lesson_comments" ON public.lesson_comments FOR INSERT WITH CHECK (true);