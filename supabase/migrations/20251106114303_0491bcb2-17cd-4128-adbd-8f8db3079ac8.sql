-- Create app role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create repositories table
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  provider TEXT NOT NULL, -- github, gitlab, etc
  default_branch TEXT DEFAULT 'main',
  genome_fingerprint JSONB,
  health_score INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own repos"
  ON public.repositories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repos"
  ON public.repositories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repos"
  ON public.repositories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repos"
  ON public.repositories FOR DELETE
  USING (auth.uid() = user_id);

-- Create genome_analyses table
CREATE TABLE public.genome_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  efficiency_score INTEGER DEFAULT 0,
  security_issues JSONB DEFAULT '[]'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.genome_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analyses of their repos"
  ON public.genome_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.repositories
      WHERE repositories.id = genome_analyses.repository_id
      AND repositories.user_id = auth.uid()
    )
  );

-- Create mutations table
CREATE TABLE public.mutations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  campaign_id UUID,
  mutation_type TEXT NOT NULL,
  original_code TEXT NOT NULL,
  mutated_code TEXT NOT NULL,
  description TEXT,
  confidence_score DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, testing, approved, rejected
  improvement_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mutations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mutations of their repos"
  ON public.mutations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.repositories
      WHERE repositories.id = mutations.repository_id
      AND repositories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert mutations for their repos"
  ON public.mutations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.repositories
      WHERE repositories.id = mutations.repository_id
      AND repositories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update mutations of their repos"
  ON public.mutations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.repositories
      WHERE repositories.id = mutations.repository_id
      AND repositories.user_id = auth.uid()
    )
  );

-- Create mutation_tests table
CREATE TABLE public.mutation_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mutation_id UUID REFERENCES public.mutations(id) ON DELETE CASCADE,
  test_results JSONB NOT NULL,
  cpu_usage DECIMAL(10,2),
  memory_usage DECIMAL(10,2),
  latency_ms DECIMAL(10,2),
  pass_rate DECIMAL(5,2),
  cost_per_request DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mutation_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view test results"
  ON public.mutation_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mutations
      JOIN public.repositories ON repositories.id = mutations.repository_id
      WHERE mutations.id = mutation_tests.mutation_id
      AND repositories.user_id = auth.uid()
    )
  );

-- Create marketplace_items table
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  optimization_type TEXT NOT NULL,
  code_template TEXT NOT NULL,
  price_credits INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view marketplace items"
  ON public.marketplace_items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own items"
  ON public.marketplace_items FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own items"
  ON public.marketplace_items FOR UPDATE
  USING (auth.uid() = seller_id);

-- Create triggers for updated_at
CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON public.repositories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mutations_updated_at
  BEFORE UPDATE ON public.mutations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_items_updated_at
  BEFORE UPDATE ON public.marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_repositories_user_id ON public.repositories(user_id);
CREATE INDEX idx_genome_analyses_repository_id ON public.genome_analyses(repository_id);
CREATE INDEX idx_mutations_repository_id ON public.mutations(repository_id);
CREATE INDEX idx_mutations_status ON public.mutations(status);
CREATE INDEX idx_mutation_tests_mutation_id ON public.mutation_tests(mutation_id);
CREATE INDEX idx_marketplace_items_tags ON public.marketplace_items USING GIN(tags);