import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, language = 'de' } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide at least one ingredient" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = language === 'de' 
      ? `Du bist ein kreativer Koch-Assistent. Basierend auf den gegebenen Zutaten schlägst du ein leckeres Gericht vor. 
         Antworte IMMER im folgenden JSON-Format:
         {
           "name": "Name des Gerichts",
           "description": "Kurze Beschreibung (1-2 Sätze)",
           "cookingTime": "Kochzeit in Minuten (z.B. '30 Min')",
           "difficulty": "Einfach/Mittel/Schwer",
           "servings": "Anzahl Portionen",
           "ingredients": ["Liste", "der", "Zutaten", "mit", "Mengen"],
           "instructions": ["Schritt 1", "Schritt 2", "Schritt 3"]
         }
         Antworte NUR mit dem JSON, keine zusätzlichen Texte.`
      : `You are a creative cooking assistant. Based on the given ingredients, suggest a delicious dish.
         ALWAYS respond in the following JSON format:
         {
           "name": "Name of the dish",
           "description": "Short description (1-2 sentences)",
           "cookingTime": "Cooking time in minutes (e.g. '30 min')",
           "difficulty": "Easy/Medium/Hard",
           "servings": "Number of servings",
           "ingredients": ["List", "of", "ingredients", "with", "amounts"],
           "instructions": ["Step 1", "Step 2", "Step 3"]
         }
         Respond ONLY with the JSON, no additional text.`;

    const userMessage = language === 'de'
      ? `Erstelle ein Rezept mit folgenden Zutaten: ${ingredients.join(', ')}. Du kannst auch gängige Küchenzutaten wie Salz, Pfeffer, Öl, Zwiebeln, Knoblauch verwenden, falls nötig.`
      : `Create a recipe using these ingredients: ${ingredients.join(', ')}. You may also use common kitchen ingredients like salt, pepper, oil, onions, garlic if needed.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from AI
    let recipe;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recipe = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse recipe from AI response");
    }

    return new Response(
      JSON.stringify({ recipe }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in recipe-generator:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate recipe" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
