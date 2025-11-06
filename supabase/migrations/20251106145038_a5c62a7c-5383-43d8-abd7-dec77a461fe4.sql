-- Create genomes table
CREATE TABLE public.genomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  fingerprint TEXT NOT NULL,
  efficiency_score DECIMAL(5,2),
  scan_status TEXT NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending', 'running', 'completed', 'failed')),
  scan_duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_modules table
CREATE TABLE public.genome_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE NOT NULL,
  path TEXT NOT NULL,
  language TEXT NOT NULL,
  loc INTEGER NOT NULL DEFAULT 0,
  fingerprint TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_functions table
CREATE TABLE public.genome_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.genome_modules(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  cyclomatic_complexity INTEGER DEFAULT 1,
  fingerprint TEXT NOT NULL,
  parameters JSONB DEFAULT '[]',
  security_warnings JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_dependencies table
CREATE TABLE public.genome_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE NOT NULL,
  from_module_id UUID REFERENCES public.genome_modules(id) ON DELETE CASCADE NOT NULL,
  to_module_id UUID REFERENCES public.genome_modules(id) ON DELETE CASCADE NOT NULL,
  dependency_type TEXT NOT NULL DEFAULT 'import',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_packages table
CREATE TABLE public.genome_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  is_dev_dependency BOOLEAN DEFAULT false,
  vulnerability_count INTEGER DEFAULT 0,
  vulnerabilities JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_scan_history table
CREATE TABLE public.genome_scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE NOT NULL,
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  branch TEXT NOT NULL,
  scan_type TEXT NOT NULL DEFAULT 'full' CHECK (scan_type IN ('full', 'incremental', 'diff')),
  triggered_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_health table
CREATE TABLE public.genome_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE NOT NULL,
  security_risk TEXT CHECK (security_risk IN ('low', 'medium', 'high', 'critical')),
  test_coverage DECIMAL(5,2),
  unused_files INTEGER DEFAULT 0,
  technical_debt_score DECIMAL(5,2),
  performance_score DECIMAL(5,2),
  maintainability_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_industry_baseline table
CREATE TABLE public.genome_industry_baseline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  similarity_score DECIMAL(5,4),
  baseline_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.genomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_industry_baseline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for genomes
CREATE POLICY "Users can view their genomes"
ON public.genomes FOR SELECT
USING (repository_id IN (SELECT id FROM public.repositories WHERE user_id = auth.uid()));

CREATE POLICY "System can manage genomes"
ON public.genomes FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for genome_modules
CREATE POLICY "Users can view their genome modules"
ON public.genome_modules FOR SELECT
USING (genome_id IN (SELECT id FROM public.genomes WHERE repository_id IN (SELECT id FROM public.repositories WHERE user_id = auth.uid())));

CREATE POLICY "System can manage genome modules"
ON public.genome_modules FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for genome_functions
CREATE POLICY "Users can view their genome functions"
ON public.genome_functions FOR SELECT
USING (module_id IN (SELECT id FROM public.genome_modules WHERE genome_id IN (SELECT id FROM public.genomes WHERE repository_id IN (SELECT id FROM public.repositories WHERE user_id = auth.uid()))));

CREATE POLICY "System can manage genome functions"
ON public.genome_functions FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for genome_dependencies
CREATE POLICY "Users can view their genome dependencies"
ON public.genome_dependencies FOR SELECT
USING (genome_id IN (SELECT id FROM public.genomes WHERE repository_id IN (SELECT id FROM public.repositories WHERE user_id = auth.uid())));

CREATE POLICY "System can manage genome dependencies"
ON public.genome_dependencies FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for genome_packages
CREATE POLICY "Users can view their genome packages"
ON public.genome_packages FOR SELECT
USING (genome_id IN (SELECT id FROM public.genomes WHERE repository_id IN (SELECT id FROM public.repositories WHERE user_id = auth.uid())));

CREATE POLICY "System can manage genome packages"
ON public.genome_packages FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for genome_scan_history
CREATE POLICY "Users can view their scan history"
ON public.genome_scan_history FOR SELECT
USING (repository_id IN (SELECT id FROM public.repositories WHERE user_id = auth.uid()));

CREATE POLICY "System can manage scan history"
ON public.genome_scan_history FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for genome_health
CREATE POLICY "Users can view their genome health"
ON public.genome_health FOR SELECT
USING (genome_id IN (SELECT id FROM public.genomes WHERE repository_id IN (SELECT id FROM public.repositories WHERE user_id = auth.uid())));

CREATE POLICY "System can manage genome health"
ON public.genome_health FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for genome_industry_baseline
CREATE POLICY "Users can view their industry baseline"
ON public.genome_industry_baseline FOR SELECT
USING (genome_id IN (SELECT id FROM public.genomes WHERE repository_id IN (SELECT id FROM public.repositories WHERE user_id = auth.uid())));

CREATE POLICY "System can manage industry baseline"
ON public.genome_industry_baseline FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_genomes_repository ON public.genomes(repository_id);
CREATE INDEX idx_genome_modules_genome ON public.genome_modules(genome_id);
CREATE INDEX idx_genome_functions_module ON public.genome_functions(module_id);
CREATE INDEX idx_genome_dependencies_genome ON public.genome_dependencies(genome_id);
CREATE INDEX idx_genome_packages_genome ON public.genome_packages(genome_id);
CREATE INDEX idx_genome_scan_history_repo ON public.genome_scan_history(repository_id);
CREATE INDEX idx_genome_health_genome ON public.genome_health(genome_id);