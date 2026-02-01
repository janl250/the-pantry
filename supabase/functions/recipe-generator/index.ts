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
    const { ingredients, language = 'de', excludeDishes = [] } = await req.json();

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

    const excludeNote = excludeDishes.length > 0 
      ? (language === 'de' 
          ? `\n\nWICHTIG: Schlage NICHT diese Gerichte vor, da sie bereits vorgeschlagen wurden: ${excludeDishes.join(', ')}. Wähle ein ANDERES Gericht.`
          : `\n\nIMPORTANT: Do NOT suggest these dishes as they were already suggested: ${excludeDishes.join(', ')}. Choose a DIFFERENT dish.`)
      : '';

    const systemPrompt = language === 'de' 
      ? `Du bist ein kreativer Koch-Assistent. Basierend auf den gegebenen Zutaten schlägst du ein passendes Gericht vor.
         Antworte IMMER im folgenden JSON-Format:
         {
           "name": "Name des Gerichts",
           "description": "Eine appetitanregende Beschreibung des Gerichts (2-3 Sätze)",
           "cookingTime": "Geschätzte Kochzeit (z.B. '30 Min', '1 Stunde')",
           "difficulty": "Einfach/Mittel/Schwer",
           "cuisine": "Art der Küche (z.B. Italienisch, Asiatisch, Deutsch)",
           "category": "Kategorie (z.B. Pasta, Fleisch, Vegetarisch, Suppe)"
         }
         Antworte NUR mit dem JSON, keine zusätzlichen Texte. Sei kreativ und schlage realistische, leckere Gerichte vor.${excludeNote}`
      : `You are a creative cooking assistant. Based on the given ingredients, suggest a suitable dish.
         ALWAYS respond in the following JSON format:
         {
           "name": "Name of the dish",
           "description": "An appetizing description of the dish (2-3 sentences)",
           "cookingTime": "Estimated cooking time (e.g. '30 min', '1 hour')",
           "difficulty": "Easy/Medium/Hard",
           "cuisine": "Type of cuisine (e.g. Italian, Asian, American)",
           "category": "Category (e.g. Pasta, Meat, Vegetarian, Soup)"
         }
         Respond ONLY with the JSON, no additional text. Be creative and suggest realistic, delicious dishes.${excludeNote}`;

    const userMessage = language === 'de'
      ? `Schlage ein Gericht vor, das man mit folgenden Zutaten zubereiten kann: ${ingredients.join(', ')}. Du kannst davon ausgehen, dass Grundzutaten wie Salz, Pfeffer, Öl verfügbar sind.`
      : `Suggest a dish that can be prepared with these ingredients: ${ingredients.join(', ')}. You may assume basic ingredients like salt, pepper, oil are available.`;

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
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: language === 'de' ? "Zu viele Anfragen. Bitte warte kurz." : "Too many requests. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: language === 'de' ? "AI-Credits aufgebraucht." : "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from AI
    let dish;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      dish = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse dish from AI response");
    }

    return new Response(
      JSON.stringify({ dish }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in recipe-generator:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to find dish" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
