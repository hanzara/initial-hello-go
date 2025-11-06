import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repositoryId } = await req.json();

    if (!repositoryId) {
      return new Response(
        JSON.stringify({ error: "Repository ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get repository details
    const { data: repo, error: repoError } = await supabaseClient
      .from("repositories")
      .select("*")
      .eq("id", repositoryId)
      .single();

    if (repoError) throw repoError;

    console.log("Analyzing repository:", repo.name);

    // AI-powered genome analysis using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a world-class software architect and security expert analyzing codebases. 
Provide a comprehensive genome analysis including:
1. Code structure and architecture patterns
2. Security vulnerabilities and risks
3. Performance optimization opportunities
4. Code quality metrics
5. Technical debt indicators

Return JSON with: efficiency_score (0-100), security_issues array, performance_metrics object, analysis_data object.`
          },
          {
            role: "user",
            content: `Analyze this repository: ${repo.name} (${repo.provider})
URL: ${repo.url}
Branch: ${repo.default_branch}

Provide a detailed genome analysis.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse AI response (attempt to extract JSON)
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        efficiency_score: 75,
        security_issues: [],
        performance_metrics: { score: "Good" },
        analysis_data: { complexity: "Medium", summary: content }
      };
    } catch {
      analysisResult = {
        efficiency_score: 75,
        security_issues: [],
        performance_metrics: { score: "Good" },
        analysis_data: { complexity: "Medium", summary: content }
      };
    }

    // Store genome analysis
    const { error: analysisError } = await supabaseClient
      .from("genome_analyses")
      .insert({
        repository_id: repositoryId,
        efficiency_score: analysisResult.efficiency_score,
        security_issues: analysisResult.security_issues,
        performance_metrics: analysisResult.performance_metrics,
        analysis_data: analysisResult.analysis_data,
      });

    if (analysisError) throw analysisError;

    // Update repository with health score
    await supabaseClient
      .from("repositories")
      .update({
        health_score: analysisResult.efficiency_score,
        last_analyzed_at: new Date().toISOString(),
        genome_fingerprint: analysisResult.analysis_data,
      })
      .eq("id", repositoryId);

    console.log("Analysis complete");

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-repository:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
