-- Create repositories table
CREATE TABLE IF NOT EXISTS public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  url TEXT NOT NULL,
  default_branch TEXT,
  health_score DECIMAL(5,2),
  genome_fingerprint JSONB,
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own repositories"
ON public.repositories
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create genome_analyses table
CREATE TABLE IF NOT EXISTS public.genome_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  performance_metrics JSONB,
  security_issues JSONB,
  efficiency_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.genome_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analyses for their repositories"
ON public.genome_analyses
FOR SELECT
USING (
  repository_id IN (
    SELECT id FROM public.repositories WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert analyses"
ON public.genome_analyses
FOR INSERT
WITH CHECK (true);

-- Create genome_suggestions table
CREATE TABLE IF NOT EXISTS public.genome_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.genome_analyses(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'implemented', 'rejected')),
  template_patch TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.genome_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their suggestions"
ON public.genome_suggestions
FOR SELECT
USING (
  repository_id IN (
    SELECT id FROM public.repositories WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their suggestions"
ON public.genome_suggestions
FOR UPDATE
USING (
  repository_id IN (
    SELECT id FROM public.repositories WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert suggestions"
ON public.genome_suggestions
FOR INSERT
WITH CHECK (true);