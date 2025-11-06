import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  repositoryId: string;
  branch?: string;
  mode?: 'full' | 'incremental' | 'diff';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { repositoryId, branch = 'main', mode = 'full' }: ScanRequest = await req.json();

    console.log(`Starting genome scan for repo ${repositoryId}, branch: ${branch}, mode: ${mode}`);

    // Get repository details
    const { data: repo, error: repoError } = await supabaseClient
      .from('repositories')
      .select('*')
      .eq('id', repositoryId)
      .single();

    if (repoError || !repo) {
      throw new Error('Repository not found');
    }

    const startTime = Date.now();

    // Create genome record
    const { data: genome, error: genomeError } = await supabaseClient
      .from('genomes')
      .insert({
        repository_id: repositoryId,
        branch,
        fingerprint: 'pending',
        scan_status: 'running',
        metadata: {
          repo_url: repo.url,
          repo_name: repo.name,
          provider: repo.provider
        }
      })
      .select()
      .single();

    if (genomeError || !genome) {
      throw new Error('Failed to create genome record');
    }

    // Record scan history
    const { data: { user } } = await supabaseClient.auth.getUser();
    await supabaseClient
      .from('genome_scan_history')
      .insert({
        repository_id: repositoryId,
        genome_id: genome.id,
        branch,
        scan_type: mode,
        triggered_by: user?.id
      });

    // PHASE 1: Clone & Setup (simulated - would use ephemeral container in production)
    console.log('Phase 1: Repository analysis...');
    
    // PHASE 2: Language Detection & File Discovery
    const languageStats = await detectLanguages(repo.url);
    
    // PHASE 3: Parse modules and extract genome data
    const modules = await parseModules(genome.id, languageStats);
    
    // PHASE 4: Extract functions from modules
    const functions = await extractFunctions(modules);
    
    // PHASE 5: Build dependency graph
    const dependencies = await buildDependencyGraph(genome.id, modules);
    
    // PHASE 6: Analyze external packages
    const packages = await analyzePackages(genome.id, repo.url);
    
    // PHASE 7: Run security scans
    const securityIssues = await runSecurityScan(packages, functions);
    
    // PHASE 8: Compute metrics and scores
    const metrics = computeMetrics(modules, functions, dependencies, packages);
    
    // PHASE 9: Generate AI suggestions
    const suggestions = await generateSuggestions(genome.id, metrics, securityIssues);
    
    // PHASE 10: Industry comparison
    const industryBaseline = await compareToIndustry(genome.id, metrics);

    // Calculate final fingerprint
    const fingerprint = await calculateGenomeFingerprint(modules, functions);
    
    const scanDuration = Date.now() - startTime;

    // Update genome with results
    const { error: updateError } = await supabaseClient
      .from('genomes')
      .update({
        fingerprint,
        efficiency_score: metrics.efficiencyScore,
        scan_status: 'completed',
        scan_duration_ms: scanDuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', genome.id);

    if (updateError) {
      console.error('Failed to update genome:', updateError);
    }

    // Store health summary
    await supabaseClient
      .from('genome_health')
      .insert({
        genome_id: genome.id,
        security_risk: metrics.securityRisk,
        test_coverage: metrics.testCoverage,
        unused_files: metrics.unusedFiles,
        technical_debt_score: metrics.technicalDebtScore,
        performance_score: metrics.performanceScore,
        maintainability_score: metrics.maintainabilityScore
      });

    console.log(`Genome scan completed in ${scanDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        genome_id: genome.id,
        efficiency_score: metrics.efficiencyScore,
        scan_duration_ms: scanDuration,
        modules_count: modules.length,
        functions_count: functions.length,
        suggestions_count: suggestions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Genome mapping error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions for genome analysis

async function detectLanguages(repoUrl: string) {
  // In production: analyze repo files to detect languages
  // For now, return mock data based on common patterns
  console.log('Detecting languages for:', repoUrl);
  
  return {
    javascript: { files: 45, loc: 8500 },
    typescript: { files: 32, loc: 6200 },
    css: { files: 18, loc: 2100 },
    html: { files: 12, loc: 1800 },
    json: { files: 8, loc: 450 }
  };
}

async function parseModules(genomeId: string, languageStats: any) {
  // In production: use Tree-sitter to parse AST for each file
  // Store modules in database
  console.log('Parsing modules for genome:', genomeId);
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const modules = [];
  const languages = Object.keys(languageStats);
  
  for (const lang of languages) {
    const fileCount = languageStats[lang].files;
    
    for (let i = 0; i < fileCount; i++) {
      const module = {
        genome_id: genomeId,
        path: `src/${lang}/module_${i}.${lang}`,
        language: lang,
        loc: Math.floor(Math.random() * 500) + 50,
        fingerprint: crypto.randomUUID(),
        metadata: {
          imports: Math.floor(Math.random() * 10),
          exports: Math.floor(Math.random() * 5)
        }
      };
      
      modules.push(module);
    }
  }

  // Batch insert modules
  const { data, error } = await supabaseClient
    .from('genome_modules')
    .insert(modules)
    .select();

  if (error) {
    console.error('Error inserting modules:', error);
    return [];
  }

  return data || [];
}

async function extractFunctions(modules: any[]) {
  // In production: extract functions using AST parsing
  console.log('Extracting functions from modules');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const functions = [];
  
  for (const module of modules) {
    const funcCount = Math.floor(Math.random() * 8) + 2;
    
    for (let i = 0; i < funcCount; i++) {
      const startLine = (i * 20) + 1;
      const complexity = Math.floor(Math.random() * 20) + 1;
      
      functions.push({
        module_id: module.id,
        name: `function_${i}`,
        start_line: startLine,
        end_line: startLine + Math.floor(Math.random() * 30) + 10,
        cyclomatic_complexity: complexity,
        fingerprint: crypto.randomUUID(),
        parameters: JSON.stringify([]),
        security_warnings: complexity > 15 ? JSON.stringify(['High complexity']) : JSON.stringify([]),
        metadata: {}
      });
    }
  }

  // Batch insert functions
  const { data, error } = await supabaseClient
    .from('genome_functions')
    .insert(functions)
    .select();

  if (error) {
    console.error('Error inserting functions:', error);
    return [];
  }

  return data || [];
}

async function buildDependencyGraph(genomeId: string, modules: any[]) {
  // In production: analyze imports/requires to build dependency graph
  console.log('Building dependency graph');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const dependencies = [];
  
  // Create random dependencies between modules
  for (let i = 0; i < modules.length * 2; i++) {
    const from = modules[Math.floor(Math.random() * modules.length)];
    const to = modules[Math.floor(Math.random() * modules.length)];
    
    if (from.id !== to.id) {
      dependencies.push({
        genome_id: genomeId,
        from_module_id: from.id,
        to_module_id: to.id,
        dependency_type: 'import',
        metadata: {}
      });
    }
  }

  // Insert dependencies
  const { data, error } = await supabaseClient
    .from('genome_dependencies')
    .insert(dependencies)
    .select();

  if (error) {
    console.error('Error inserting dependencies:', error);
    return [];
  }

  return data || [];
}

async function analyzePackages(genomeId: string, repoUrl: string) {
  // In production: parse package.json, requirements.txt, go.mod, etc.
  console.log('Analyzing external packages');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const commonPackages = [
    { name: 'react', version: '18.2.0', is_dev: false, vuln: 0 },
    { name: 'lodash', version: '4.17.20', is_dev: false, vuln: 1 },
    { name: 'axios', version: '1.5.0', is_dev: false, vuln: 0 },
    { name: 'express', version: '4.18.0', is_dev: false, vuln: 2 },
    { name: 'jest', version: '29.0.0', is_dev: true, vuln: 0 }
  ];

  const packages = commonPackages.map(pkg => ({
    genome_id: genomeId,
    name: pkg.name,
    version: pkg.version,
    is_dev_dependency: pkg.is_dev,
    vulnerability_count: pkg.vuln,
    vulnerabilities: pkg.vuln > 0 ? JSON.stringify([{ severity: 'medium', cve: 'CVE-2024-XXXXX' }]) : JSON.stringify([]),
    metadata: {}
  }));

  const { data, error } = await supabaseClient
    .from('genome_packages')
    .insert(packages)
    .select();

  if (error) {
    console.error('Error inserting packages:', error);
    return [];
  }

  return data || [];
}

async function runSecurityScan(packages: any[], functions: any[]) {
  // In production: query vulnerability databases, run static analysis
  console.log('Running security scans');
  
  const issues = [];
  
  // Check packages for vulnerabilities
  for (const pkg of packages) {
    if (pkg.vulnerability_count > 0) {
      issues.push({
        type: 'dependency',
        severity: 'medium',
        title: `Vulnerable dependency: ${pkg.name}`,
        description: `Package ${pkg.name}@${pkg.version} has known vulnerabilities`
      });
    }
  }
  
  // Check functions for security issues
  for (const func of functions) {
    const warnings = JSON.parse(func.security_warnings || '[]');
    if (warnings.length > 0) {
      issues.push({
        type: 'code',
        severity: 'high',
        title: `Security issue in ${func.name}`,
        description: warnings.join(', ')
      });
    }
  }
  
  return issues;
}

function computeMetrics(modules: any[], functions: any[], dependencies: any[], packages: any[]) {
  // Compute various quality metrics
  console.log('Computing metrics');
  
  const totalLOC = modules.reduce((sum, m) => sum + (m.loc || 0), 0);
  const avgComplexity = functions.length > 0 
    ? functions.reduce((sum, f) => sum + (f.cyclomatic_complexity || 0), 0) / functions.length 
    : 0;
  
  const vulnPackages = packages.filter(p => p.vulnerability_count > 0).length;
  const securityRisk = vulnPackages > 5 ? 'critical' : vulnPackages > 2 ? 'high' : vulnPackages > 0 ? 'medium' : 'low';
  
  // Calculate efficiency score (0-100)
  let efficiencyScore = 100;
  efficiencyScore -= Math.min(30, avgComplexity * 2); // Complexity penalty
  efficiencyScore -= Math.min(20, vulnPackages * 5); // Security penalty
  efficiencyScore -= Math.min(15, (totalLOC / 1000) * 2); // Size penalty
  efficiencyScore = Math.max(0, Math.round(efficiencyScore));
  
  return {
    efficiencyScore,
    securityRisk,
    testCoverage: Math.floor(Math.random() * 60) + 20,
    unusedFiles: Math.floor(modules.length * 0.1),
    technicalDebtScore: Math.floor(Math.random() * 40) + 20,
    performanceScore: Math.floor(Math.random() * 30) + 60,
    maintainabilityScore: 100 - Math.round(avgComplexity * 3),
    totalLOC,
    avgComplexity,
    moduleCount: modules.length,
    functionCount: functions.length,
    dependencyCount: dependencies.length
  };
}

async function generateSuggestions(genomeId: string, metrics: any, securityIssues: any[]) {
  // In production: use ML model to generate suggestions
  console.log('Generating AI suggestions');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const suggestions = [];
  
  if (metrics.avgComplexity > 10) {
    suggestions.push({
      genome_id: genomeId,
      suggestion_type: 'refactor',
      title: 'Reduce code complexity',
      description: 'Several functions have high cyclomatic complexity. Consider breaking them into smaller, more manageable functions.',
      confidence: 0.85,
      priority: 'high',
      template_patch: '// Extract complex logic into separate functions'
    });
  }
  
  if (securityIssues.length > 0) {
    suggestions.push({
      genome_id: genomeId,
      suggestion_type: 'security',
      title: 'Update vulnerable dependencies',
      description: `Found ${securityIssues.length} security issues. Update dependencies to latest secure versions.`,
      confidence: 0.95,
      priority: 'critical',
      template_patch: 'npm audit fix'
    });
  }
  
  if (metrics.testCoverage < 60) {
    suggestions.push({
      genome_id: genomeId,
      suggestion_type: 'testing',
      title: 'Improve test coverage',
      description: `Test coverage is ${metrics.testCoverage}%. Aim for at least 80% coverage.`,
      confidence: 0.90,
      priority: 'medium',
      template_patch: '// Add unit tests for critical functions'
    });
  }

  if (suggestions.length > 0) {
    const { data, error } = await supabaseClient
      .from('genome_suggestions')
      .insert(suggestions)
      .select();

    if (error) {
      console.error('Error inserting suggestions:', error);
      return [];
    }

    return data || [];
  }

  return [];
}

async function compareToIndustry(genomeId: string, metrics: any) {
  // In production: compare against industry baseline corpus
  console.log('Comparing to industry baselines');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const category = 'web_application'; // Would be detected from patterns
  const similarityScore = 0.72 + (Math.random() * 0.15);

  const { data, error } = await supabaseClient
    .from('genome_industry_baseline')
    .insert({
      genome_id: genomeId,
      category,
      similarity_score: similarityScore,
      baseline_metrics: {
        avg_efficiency_score: 75,
        avg_complexity: 8,
        avg_test_coverage: 68
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting industry baseline:', error);
    return null;
  }

  return data;
}

async function calculateGenomeFingerprint(modules: any[], functions: any[]) {
  // In production: Calculate Merkle tree hash of all fingerprints
  console.log('Calculating genome fingerprint');
  
  const allFingerprints = [
    ...modules.map(m => m.fingerprint),
    ...functions.map(f => f.fingerprint)
  ];
  
  // Simple hash combination (in production, use proper Merkle tree)
  const combined = allFingerprints.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `genome:${hashHex.substring(0, 16)}`;
}
