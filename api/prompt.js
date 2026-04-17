export const config = { runtime: 'edge' };

const STYLE_DESCRIPTIONS = {
  ink_lineart:   'ink and line art (clean outlines, cross-hatching for shading, strong contour lines, pen-like quality)',
  painterly:     'painterly and loose style (expressive brushwork, blended colours, soft edges, impressionistic feel)',
  geometric:     'geometric and graphic style (bold shapes, flat colours, strong contrast, graphic design aesthetic)',
  pencil_sketch: 'pencil sketch style (soft graphite lines, hatching and shading, smudged tones, raw sketch quality)',
};

const THEME_DESCRIPTIONS = {
  animals:  'animals and creatures',
  nature:   'nature, plants, landscapes',
  space:    'space, sci-fi, futuristic worlds',
  fantasy:  'fantasy, magic, mythical worlds',
  people:   'people, characters, portraits',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { theme, style, mood } = await req.json();
  const themeDesc = THEME_DESCRIPTIONS[theme] || theme;
  const styleDesc = STYLE_DESCRIPTIONS[style] || style;

  const system = `You are an experienced art teacher designing drawing challenges for kids and teens aged 9+.
Generate a specific, inspiring drawing challenge tailored to the student's chosen theme and art style.
The challenge MUST incorporate the art style — not just the subject. Reference specific techniques for that style.
Respond ONLY with valid JSON, no markdown, no extra text.
JSON format:
{
  "emoji": "single relevant emoji",
  "title": "short evocative title (max 7 words)",
  "description": "2 sentences: what to draw AND one style-specific technique to try",
  "tips": ["technique tip specific to their style", "composition or subject tip", "one detail that will make it come alive"]
}
Tips must be concrete and actionable, referencing the chosen art style.`;

  const userMsg = `Theme: ${themeDesc}
Art style: ${styleDesc}
Mood: ${mood}

Generate a drawing challenge that naturally combines this theme with the specific techniques of ${styleDesc}.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      system,
      messages: [{ role: 'user', content: userMsg }]
    })
  });

  const data = await res.json();
  const text = data.content?.map(c => c.text || '').join('') || '';
  const clean = text.replace(/```json|```/g, '').trim();

  return new Response(clean, {
    headers: { 'Content-Type': 'application/json' }
  });
}
