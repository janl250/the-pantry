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
    const {
      language = 'de',
      availableDishes = [],
      preferences = {},
      regenerateDay = null,
      currentPlan = null
    } = await req.json();

    if (!availableDishes || availableDishes.length === 0) {
      return new Response(
        JSON.stringify({ error: language === 'de' ? "Keine Gerichte verfügbar" : "No dishes available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const {
      cuisines = [],
      maxDifficulty = 'hard',
      maxCookingTime = 'long',
      dietaryPreferences = []
    } = preferences;

    // Build dish list for the AI
    const dishListStr = availableDishes.map((d: any) =>
      `- ${d.name} (${d.cuisine}, ${d.difficulty}, ${d.cookingTime}, Kategorie: ${d.category}, Zutaten: ${d.tags?.join(', ') || 'keine'})`
    ).join('\n');

    const prefNotes: string[] = [];
    if (cuisines.length > 0) prefNotes.push(`Bevorzugte Küchen: ${cuisines.join(', ')}`);
    if (maxDifficulty !== 'hard') prefNotes.push(`Maximale Schwierigkeit: ${maxDifficulty}`);
    if (maxCookingTime !== 'long') prefNotes.push(`Maximale Kochzeit: ${maxCookingTime}`);
    if (dietaryPreferences.length > 0) prefNotes.push(`Ernährung: ${dietaryPreferences.join(', ')}`);

    const prefsStr = prefNotes.length > 0 ? prefNotes.join('\n') : 'Keine besonderen Präferenzen';

    let userPrompt: string;

    if (regenerateDay && currentPlan) {
      const otherDays = Object.entries(currentPlan)
        .filter(([day]) => day !== regenerateDay)
        .map(([day, dish]: [string, any]) => `${day}: ${dish}`)
        .join(', ');

      userPrompt = language === 'de'
        ? `Ersetze das Gericht für ${regenerateDay}. Die anderen Tage haben: ${otherDays}. Wähle ein anderes Gericht das gut dazu passt und Abwechslung bietet.`
        : `Replace the dish for ${regenerateDay}. Other days have: ${otherDays}. Choose a different dish that fits well and provides variety.`;
    } else {
      userPrompt = language === 'de'
        ? `Erstelle einen ausgewogenen 7-Tage-Wochenplan (Montag bis Sonntag). Beachte die Präferenzen:\n${prefsStr}`
        : `Create a balanced 7-day weekly plan (Monday to Sunday). Consider preferences:\n${prefsStr}`;
    }

    const systemPrompt = language === 'de'
      ? `Du bist ein Ernährungsberater und Meal-Planner. Erstelle einen ausgewogenen Wochenplan.

REGELN:
- Wähle NUR Gerichte aus der folgenden Liste
- Variiere die Küchen über die Woche (nicht 2x die gleiche Küche hintereinander)
- Variiere die Kategorien (nicht 2x Pasta hintereinander)
- Schnelle Gerichte unter der Woche (Mo-Do), aufwändigere am Wochenende erlaubt
- Kein Gericht darf sich in der Woche wiederholen
- Beachte die Ernährungspräferenzen des Users

${regenerateDay ? `Antworte NUR mit dem JSON für den einen Tag:
{ "${regenerateDay}": "Gericht-Name" }` :
`Antworte IMMER im folgenden JSON-Format:
{
  "monday": "Gericht-Name",
  "tuesday": "Gericht-Name",
  "wednesday": "Gericht-Name",
  "thursday": "Gericht-Name",
  "friday": "Gericht-Name",
  "saturday": "Gericht-Name",
  "sunday": "Gericht-Name"
}`}

Verwende EXAKT die Gerichtnamen aus der Liste. Antworte NUR mit dem JSON.

Verfügbare Gerichte:
${dishListStr}`
      : `You are a nutritionist and meal planner. Create a balanced weekly plan.

RULES:
- Choose ONLY dishes from the following list
- Vary cuisines throughout the week (no same cuisine 2 days in a row)
- Vary categories (no pasta 2 days in a row)
- Quick dishes on weekdays (Mon-Thu), more elaborate ones allowed on weekends
- No dish may repeat in the week
- Respect user's dietary preferences

${regenerateDay ? `Respond ONLY with JSON for that one day:
{ "${regenerateDay}": "Dish-Name" }` :
`ALWAYS respond in this JSON format:
{
  "monday": "Dish-Name",
  "tuesday": "Dish-Name",
  "wednesday": "Dish-Name",
  "thursday": "Dish-Name",
  "friday": "Dish-Name",
  "saturday": "Dish-Name",
  "sunday": "Dish-Name"
}`}

Use EXACTLY the dish names from the list. Respond ONLY with the JSON.

Available dishes:
${dishListStr}`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: language === 'de' ? "Zu viele Anfragen. Bitte warte kurz." : "Too many requests." }),
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

    let plan;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      plan = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse plan from AI response");
    }

    return new Response(
      JSON.stringify({ plan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in weekly-plan-generator:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate plan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
