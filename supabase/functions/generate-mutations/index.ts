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
    const { repositoryId, count = 5 } = await req.json();

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

    // Get latest genome analysis
    const { data: analysis, error: analysisError } = await supabaseClient
      .from("genome_analyses")
      .select("*")
      .eq("repository_id", repositoryId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (analysisError || !analysis) {
      return new Response(
        JSON.stringify({ error: "No genome analysis found. Run a DNA scan first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating mutations for repository:", repositoryId);

    // AI-powered mutation generation using Lovable AI
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
            content: `You are an elite code optimization AI that generates code mutations for performance, security, and efficiency improvements.

Generate ${count} specific code mutations based on the genome analysis. Each mutation should include:
1. mutation_type: Category (e.g., "Performance Loop Optimization", "Security Hardening", "Memory Management")
2. original_code: Simulated example of current pattern
3. mutated_code: Improved version
4. description: Clear explanation of the improvement
5. confidence_score: 0-100 based on safety and impact
6. improvement_metrics: Expected improvements (latency, memory, security score)

Return as JSON array of mutations.`
          },
          {
            role: "user",
            content: `Based on this genome analysis, generate ${count} code mutations:
Efficiency Score: ${analysis.efficiency_score}
Security Issues: ${JSON.stringify(analysis.security_issues)}
Performance Metrics: ${JSON.stringify(analysis.performance_metrics)}

Generate practical, safe mutations that will improve the codebase.`
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
    
    // Parse mutations
    let mutations;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      mutations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      // Fallback: create sample mutations
      mutations = [{
        mutation_type: "Performance Optimization",
        original_code: "// Sample original code",
        mutated_code: "// Sample optimized code",
        description: "Improved algorithm complexity",
        confidence_score: 85,
        improvement_metrics: { latency: "-25%", memory: "-10%" }
      }];
    }

    // Store mutations in database
    const mutationsToInsert = mutations.map((m: any) => ({
      repository_id: repositoryId,
      mutation_type: m.mutation_type,
      original_code: m.original_code,
      mutated_code: m.mutated_code,
      description: m.description,
      confidence_score: m.confidence_score,
      improvement_metrics: m.improvement_metrics,
      status: "pending",
    }));

    const { error: insertError } = await supabaseClient
      .from("mutations")
      .insert(mutationsToInsert);

    if (insertError) throw insertError;

    console.log(`Generated ${mutations.length} mutations`);

    return new Response(
      JSON.stringify({ success: true, count: mutations.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-mutations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
