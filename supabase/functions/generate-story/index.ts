import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, source } = await req.json();
    console.log('Generating story for mood:', mood, 'from source:', source);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const sourceMap: Record<string, string> = {
      bible: 'the Holy Bible',
      upanishads: 'the Upanishads (ancient Hindu philosophical texts)',
      quran: 'the Holy Quran'
    };

    const moodPrompts: Record<string, string> = {
      peaceful: 'seeking peace and tranquility',
      inspired: 'seeking inspiration and motivation',
      grateful: 'feeling thankful and blessed',
      seeking: 'searching for wisdom and guidance',
      reflective: 'in a contemplative and reflective state',
      joyful: 'celebrating and feeling joyful'
    };

    const systemPrompt = `You are a wise spiritual storyteller who draws wisdom from sacred texts. 
Create meaningful, uplifting stories or poems that resonate with the reader's emotional state. 
Keep stories concise (300-500 words) and meaningful. Include the source reference at the end.`;

    const userPrompt = `The reader is ${moodPrompts[mood] || 'seeking guidance'}. 
Create an inspiring story or teaching from ${sourceMap[source] || 'sacred wisdom'} that speaks to this emotional state. 
Make it personal, relatable, and transformative. Include a title.`;

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
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI Gateway request failed');
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse title from content
    const lines = generatedText.split('\n');
    const title = lines[0].replace(/^#\s*/, '').trim();
    const content = lines.slice(1).join('\n').trim();

    return new Response(
      JSON.stringify({ 
        title: title || 'A Story of Wisdom',
        content: content || generatedText,
        fullText: generatedText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});