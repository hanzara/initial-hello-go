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

    console.log('Debugging code:', { language, codeLength: code.length });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert code debugger and test generator. Analyze the provided code and:

1. **Identify Issues**: Find syntax errors, logical bugs, potential runtime errors, and edge cases
2. **Generate Test Cases**: Create comprehensive test cases that would catch these issues
3. **Suggest Fixes**: Provide specific code fixes with explanations
4. **Security Review**: Flag any security vulnerabilities

Return your analysis in this JSON structure:
{
  "issues": [
    {
      "type": "syntax|logic|runtime|security",
      "line": number,
      "severity": "critical|high|medium|low",
      "description": "Issue description",
      "fix": "Suggested fix code"
    }
  ],
  "testCases": [
    {
      "description": "Test description",
      "input": "Test input",
      "expectedOutput": "Expected result"
    }
  ],
  "overallAssessment": "Brief overall code quality assessment"
}`;

    const userPrompt = `Debug this ${language || 'code'}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

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
        response_format: { type: "json_object" }
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
    const debugResult = JSON.parse(data.choices[0].message.content);

    console.log('Successfully generated debug analysis');

    return new Response(
      JSON.stringify(debugResult), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in debug-code function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
