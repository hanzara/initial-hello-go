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
    const { campaignId } = await req.json();

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: "Campaign ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("campaigns")
      .select("*, repositories(*)")
      .eq("id", campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Update campaign status to running
    await supabaseClient
      .from("campaigns")
      .update({ 
        status: "running", 
        started_at: new Date().toISOString(),
        progress: 0 
      })
      .eq("id", campaignId);

    console.log("Running campaign:", campaign.name);

    // Get latest genome analysis for context
    const { data: analysis } = await supabaseClient
      .from("genome_analyses")
      .select("*")
      .eq("repository_id", campaign.repository_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // Generate mutations using AI with campaign-specific goals
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
            content: `You are an elite code optimization AI for the TDG Evolution Engine.

Generate ${campaign.max_variants} code mutations optimized for these goals:
- Speed Priority: ${campaign.goal_weights.speed}%
- Cost Priority: ${campaign.goal_weights.cost}%
- Memory Priority: ${campaign.goal_weights.memory}%
- Security Priority: ${campaign.goal_weights.security}%
- Maintainability Priority: ${campaign.goal_weights.maintainability}%

Target: ${campaign.target_module || 'entire codebase'}
Scope: ${campaign.scope}

Each mutation must include:
1. mutation_type: Category (Performance/Security/Memory/Cost Optimization)
2. original_code: Example of current pattern
3. mutated_code: Improved version
4. description: Clear explanation
5. confidence_score: 0-100 based on safety
6. safety_score: 0-100 based on risk assessment
7. improvement_metrics: Expected improvements
8. explain: Natural language rationale
9. diff: Simplified diff format
10. metrics_before: Baseline metrics (latency, memory, cost, security_score)
11. metrics_after: Expected improved metrics

Return as JSON array of mutations.`
          },
          {
            role: "user",
            content: `Campaign: ${campaign.name}
Repository: ${campaign.repositories?.name || 'Unknown'}
${analysis ? `
Genome Analysis:
- Efficiency Score: ${analysis.efficiency_score}
- Complexity Score: ${analysis.complexity_score}
- Security Issues: ${JSON.stringify(analysis.security_issues)}
- Performance Metrics: ${JSON.stringify(analysis.performance_metrics)}
` : ''}

Generate ${campaign.max_variants} high-impact, safe mutations prioritizing the specified goals.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        await supabaseClient.from("campaigns").update({ status: "failed" }).eq("id", campaignId);
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        await supabaseClient.from("campaigns").update({ status: "failed" }).eq("id", campaignId);
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
      mutations = [];
    }

    // Update progress to 50%
    await supabaseClient
      .from("campaigns")
      .update({ progress: 50 })
      .eq("id", campaignId);

    // Calculate composite scores based on goal weights
    const calculateCompositeScore = (m: any) => {
      const weights = campaign.goal_weights;
      const before = m.metrics_before || {};
      const after = m.metrics_after || {};
      
      let score = 0;
      
      // Speed improvement
      if (before.latency_ms && after.latency_ms) {
        const speedImprovement = ((before.latency_ms - after.latency_ms) / before.latency_ms) * 100;
        score += (speedImprovement * weights.speed) / 100;
      }
      
      // Cost improvement
      if (before.cost && after.cost) {
        const costImprovement = ((before.cost - after.cost) / before.cost) * 100;
        score += (costImprovement * weights.cost) / 100;
      }
      
      // Memory improvement
      if (before.memory_mb && after.memory_mb) {
        const memoryImprovement = ((before.memory_mb - after.memory_mb) / before.memory_mb) * 100;
        score += (memoryImprovement * weights.memory) / 100;
      }
      
      // Security improvement
      if (before.security_score && after.security_score) {
        const securityImprovement = ((after.security_score - before.security_score) / before.security_score) * 100;
        score += (securityImprovement * weights.security) / 100;
      }
      
      // Apply safety penalty
      const safetyScore = m.safety_score || 98;
      if (safetyScore < 80) {
        score *= 0.5; // 50% penalty for low safety
      } else if (safetyScore < 90) {
        score *= 0.8; // 20% penalty for medium safety
      }
      
      return Math.max(0, Math.min(100, score));
    };

    // Store mutations with composite scores
    const mutationsToInsert = mutations.map((m: any) => {
      const compositeScore = calculateCompositeScore(m);
      
      return {
        repository_id: campaign.repository_id,
        campaign_id: campaignId,
        mutation_type: m.mutation_type,
        original_code: m.original_code,
        mutated_code: m.mutated_code,
        description: m.description,
        confidence_score: m.confidence_score,
        safety_score: m.safety_score || 98,
        improvement_metrics: m.improvement_metrics,
        explain: m.explain,
        diff: m.diff,
        metrics_before: m.metrics_before,
        metrics_after: m.metrics_after,
        composite_score: compositeScore,
        status: "pending",
      };
    });

    const { error: insertError } = await supabaseClient
      .from("mutations")
      .insert(mutationsToInsert);

    if (insertError) throw insertError;

    // Create history entries
    const { data: insertedMutations } = await supabaseClient
      .from("mutations")
      .select("id")
      .eq("campaign_id", campaignId);

    if (insertedMutations) {
      const historyEntries = insertedMutations.map(m => ({
        mutation_id: m.id,
        action: "created",
        actor: "ai_evolution_engine",
        metadata: { campaign_id: campaignId }
      }));

      await supabaseClient
        .from("mutation_history")
        .insert(historyEntries);
    }

    // Update campaign to completed
    await supabaseClient
      .from("campaigns")
      .update({ 
        status: "completed", 
        completed_at: new Date().toISOString(),
        progress: 100 
      })
      .eq("id", campaignId);

    console.log(`Campaign completed: Generated ${mutations.length} mutations`);

    return new Response(
      JSON.stringify({ success: true, count: mutations.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in run-campaign:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
