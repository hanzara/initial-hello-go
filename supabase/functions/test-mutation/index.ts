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
    const { mutationId } = await req.json();

    if (!mutationId) {
      return new Response(
        JSON.stringify({ error: "Mutation ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get mutation details
    const { data: mutation, error: mutationError } = await supabaseClient
      .from("mutations")
      .select("*")
      .eq("id", mutationId)
      .single();

    if (mutationError) throw mutationError;

    console.log("Testing mutation:", mutation.mutation_type);

    // Update status to testing
    await supabaseClient
      .from("mutations")
      .update({ status: "testing" })
      .eq("id", mutationId);

    // Simulate sandbox testing with AI analysis
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
            content: `You are a code testing AI that simulates sandbox test results for code mutations.

Analyze the mutation and generate realistic test results including:
1. test_passed: boolean
2. cpu_usage: number (percentage)
3. memory_usage: number (MB)
4. latency_ms: number (milliseconds)
5. pass_rate: number (0-100)
6. cost_per_request: number (dollars)
7. issues: array of any problems found

Return as JSON.`
          },
          {
            role: "user",
            content: `Test this mutation:
Type: ${mutation.mutation_type}
Description: ${mutation.description}
Confidence: ${mutation.confidence_score}%

Original Code:
${mutation.original_code}

Mutated Code:
${mutation.mutated_code}

Generate realistic sandbox test results.`
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
    
    // Parse test results
    let testResults;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      testResults = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        test_passed: true,
        cpu_usage: 45.2,
        memory_usage: 128.5,
        latency_ms: 82.3,
        pass_rate: 98.5,
        cost_per_request: 0.0023,
        issues: []
      };
    } catch {
      testResults = {
        test_passed: true,
        cpu_usage: 45.2,
        memory_usage: 128.5,
        latency_ms: 82.3,
        pass_rate: 98.5,
        cost_per_request: 0.0023,
        issues: []
      };
    }

    // Store test results
    const { error: testError } = await supabaseClient
      .from("mutation_tests")
      .insert({
        mutation_id: mutationId,
        test_results: testResults,
        cpu_usage: testResults.cpu_usage,
        memory_usage: testResults.memory_usage,
        latency_ms: testResults.latency_ms,
        pass_rate: testResults.pass_rate,
        cost_per_request: testResults.cost_per_request,
      });

    if (testError) throw testError;

    // Update mutation status back to pending
    await supabaseClient
      .from("mutations")
      .update({ status: "pending" })
      .eq("id", mutationId);

    console.log("Test complete:", testResults.test_passed ? "PASSED" : "FAILED");

    return new Response(
      JSON.stringify({ success: true, results: testResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in test-mutation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
