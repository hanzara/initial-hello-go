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
    const { code, language, explanation } = await req.json();
    
    if (!code || !explanation) {
      throw new Error('Code and explanation are required');
    }

    console.log('Generating lesson for:', { language, codeLength: code.length });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert educational content creator specializing in programming education. Based on the provided code and its explanation, generate a comprehensive interactive lesson that transforms code into a personalized learning experience.

Your response MUST be valid JSON with this exact structure:
{
  "title": "Lesson title (concise, engaging, and descriptive - max 60 chars)",
  "summary": "Brief summary of what the lesson teaches (2-3 sentences, max 160 chars)",
  "concepts": ["concept1", "concept2", "concept3"],
  "difficulty_level": "beginner|intermediate|advanced",
  "duration_minutes": 5-15,
  "xp_points": 10-50,
  "youtube_search_queries": ["specific search query 1", "specific search query 2", "specific search query 3"],
  "quiz": [
    {
      "question": "Quiz question text that tests understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Why this is correct and what concept it reinforces"
    }
  ],
  "learning_objectives": [
    "Clear, actionable objective 1 (e.g., 'Understand how const variables work')",
    "Clear, actionable objective 2",
    "Clear, actionable objective 3"
  ],
  "key_takeaways": [
    "Important takeaway 1 (practical insight students should remember)",
    "Important takeaway 2",
    "Important takeaway 3"
  ],
  "next_topics": [
    "Related topic 1 to explore next (e.g., 'let vs const comparison')",
    "Related topic 2",
    "Related topic 3"
  ]
}

Guidelines:
- Generate 2-4 quiz questions that progressively test understanding
- Make YouTube search queries specific and educational (e.g., "JavaScript const variable scope explained", "const vs let differences tutorial")
- Learning objectives should be specific and measurable
- Key takeaways should be practical insights students can apply immediately
- Next topics should build on the current lesson logically
- Adjust XP points based on difficulty: beginner (10-20), intermediate (20-35), advanced (35-50)
- Duration should reflect actual time needed to understand the content`;

    const userPrompt = `Code (${language || 'unknown'}):\n\`\`\`\n${code}\n\`\`\`\n\nExplanation:\n${explanation}\n\nGenerate an interactive lesson based on this code and explanation.`;

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
    const lessonContent = data.choices[0].message.content;

    // Parse the JSON response
    let lessonData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = lessonContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       lessonContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : lessonContent;
      lessonData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Failed to generate structured lesson data');
    }

    console.log('Successfully generated lesson');

    return new Response(
      JSON.stringify({ lesson: lessonData }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-lesson function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});