import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();
    
    if (!code) {
      throw new Error('Code is required');
    }

    console.log('Analyzing code complexity:', { language, codeLength: code.length });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert at analyzing algorithmic complexity. Analyze the provided code and provide detailed complexity analysis including:

1. **Time Complexity**: Big O notation for each function/algorithm
2. **Space Complexity**: Memory usage analysis
3. **Cyclomatic Complexity**: Code complexity score
4. **Cognitive Complexity**: How hard is it to understand
5. **Performance Bottlenecks**: Identify slow sections
6. **Scalability Analysis**: How code performs with large inputs
7. **Algorithm Efficiency**: Compare current vs optimal algorithms

For each analysis point, provide:
- Current complexity with Big O notation
- Explanation of why this is the complexity
- Possible improvements with their complexity
- Real-world performance implications
- Visual comparison (e.g., O(n) vs O(log n))

Include practical examples:
- How performance changes with input size
- Memory usage patterns
- Recommendations for optimization

Format your response in clean markdown with clear sections, code examples, and complexity graphs/comparisons.`;

    const userPrompt = `Analyze the complexity of this ${language || 'code'}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const complexityAnalysis = data.choices[0].message.content;

    console.log('Successfully generated complexity analysis');

    return new Response(
      JSON.stringify({ complexityAnalysis }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in complexity-analysis function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});