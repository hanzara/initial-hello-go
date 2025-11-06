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

    console.log('Scanning code for security:', { language, codeLength: code.length });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert security auditor. Analyze the provided code for security vulnerabilities and risks including:

1. **Injection Attacks**: SQL injection, XSS, command injection
2. **Authentication & Authorization**: Weak auth, insecure session management
3. **Data Exposure**: Sensitive data leaks, insecure storage
4. **Cryptography**: Weak encryption, insecure random numbers
5. **Input Validation**: Missing or improper input validation
6. **Dependencies**: Known vulnerable libraries or patterns
7. **API Security**: Rate limiting, authentication flaws
8. **Error Handling**: Information disclosure through errors

For each vulnerability, provide:
- Severity level (Critical/High/Medium/Low)
- Line number or code section
- Vulnerability description
- Exploitation scenario
- Secure code fix
- Prevention recommendations

Format your response in clean markdown with clear sections and security ratings.`;

    const userPrompt = `Perform security audit on this ${language || 'code'}:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

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
    const securityReport = data.choices[0].message.content;

    console.log('Successfully generated security report');

    return new Response(
      JSON.stringify({ securityReport }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in security-scan function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});