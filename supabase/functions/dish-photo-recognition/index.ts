import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, language = 'de', existingDishes = [] } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const existingDishList = existingDishes.length > 0
      ? (language === 'de'
        ? `\n\nHier ist eine Liste existierender Gerichte in der Sammlung: ${existingDishes.join(', ')}. Prüfe ob das erkannte Gericht einem dieser Gerichte entspricht und setze "existsInCollection" auf true falls ja, zusammen mit dem "existingName".`
        : `\n\nHere is a list of existing dishes in the collection: ${existingDishes.join(', ')}. Check if the recognized dish matches any of these and set "existsInCollection" to true if so, along with "existingName".`)
      : '';

    const systemPrompt = language === 'de'
      ? `Du bist ein Experte für Gericht-Erkennung. Analysiere das Foto eines fertigen Gerichts und identifiziere es.
         Antworte IMMER im folgenden JSON-Format:
         {
           "name": "Name des erkannten Gerichts",
           "description": "Kurze appetitanregende Beschreibung (1-2 Sätze)",
           "category": "Kategorie (z.B. pasta, meat, fish, vegetable, soup, salad, rice, chicken, seafood, noodles, appetizer, dessert, pizza)",
           "cuisine": "Küche (z.B. Italian, German, Japanese, Thai, Chinese, Indian, French, American, Mexican, Greek, Spanish, Korean, Vietnamese, Mediterranean)",
           "difficulty": "easy/medium/hard",
           "cookingTime": "quick/medium/long",
           "tags": ["zutat1", "zutat2", "zutat3"],
           "confidence": 0.85,
           "existsInCollection": false,
           "existingName": null
         }
         Antworte NUR mit dem JSON. Verwende englische Werte für category, cuisine, difficulty, cookingTime und tags.${existingDishList}`
      : `You are a dish recognition expert. Analyze the photo of a finished dish and identify it.
         ALWAYS respond in the following JSON format:
         {
           "name": "Name of the recognized dish",
           "description": "Short appetizing description (1-2 sentences)",
           "category": "Category (e.g. pasta, meat, fish, vegetable, soup, salad, rice, chicken, seafood, noodles, appetizer, dessert, pizza)",
           "cuisine": "Cuisine (e.g. Italian, German, Japanese, Thai, Chinese, Indian, French, American, Mexican, Greek, Spanish, Korean, Vietnamese, Mediterranean)",
           "difficulty": "easy/medium/hard",
           "cookingTime": "quick/medium/long",
           "tags": ["ingredient1", "ingredient2", "ingredient3"],
           "confidence": 0.85,
           "existsInCollection": false,
           "existingName": null
         }
         Respond ONLY with the JSON. Use English values for category, cuisine, difficulty, cookingTime and tags.${existingDishList}`;

    const userPrompt = language === 'de'
      ? "Was ist dieses Gericht? Analysiere das Foto und identifiziere es."
      : "What is this dish? Analyze the photo and identify it.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: language === 'de' ? "Zu viele Anfragen. Bitte warte kurz." : "Too many requests. Please wait." }),
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

    let dish;
    try {
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
    console.error("Error in dish-photo-recognition:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to recognize dish" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
