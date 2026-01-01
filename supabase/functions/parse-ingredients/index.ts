import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedIngredient {
  ingredient_name: string;
  grams: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  is_ai_estimated: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Ingredient text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing ingredients text:', text);

    const systemPrompt = `You are a nutrition expert. Parse the given ingredient text and return structured nutritional data.

For each ingredient, estimate the macros per 100g based on standard nutritional databases.

Return ONLY a JSON array with this exact structure (no markdown, no explanation):
[
  {
    "ingredient_name": "chicken breast",
    "grams": 200,
    "protein_per_100g": 31,
    "carbs_per_100g": 0,
    "fats_per_100g": 3.6,
    "fiber_per_100g": 0
  }
]

Rules:
- Extract weight in grams from the text (e.g., "200g chicken" = 200 grams)
- If no weight specified, estimate a reasonable portion size
- Use realistic nutritional values for common foods
- Normalize ingredient names (e.g., "chix breast" → "chicken breast")
- All numeric values should be numbers, not strings`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid DeepSeek API key' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to parse ingredients with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response:', content);

    // Parse the JSON response
    let ingredients: ParsedIngredient[];
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      ingredients = JSON.parse(cleanedContent);
      
      // Validate and sanitize each ingredient
      ingredients = ingredients.map(ing => ({
        ingredient_name: String(ing.ingredient_name || 'Unknown'),
        grams: Math.max(0, Number(ing.grams) || 100),
        protein_per_100g: Math.max(0, Number(ing.protein_per_100g) || 0),
        carbs_per_100g: Math.max(0, Number(ing.carbs_per_100g) || 0),
        fats_per_100g: Math.max(0, Number(ing.fats_per_100g) || 0),
        fiber_per_100g: Math.max(0, Number(ing.fiber_per_100g) || 0),
        is_ai_estimated: true,
      }));
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ingredients }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-ingredients function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
