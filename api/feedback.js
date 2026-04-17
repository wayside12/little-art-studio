export const config = { runtime: 'edge' };

const FEEDBACK_MODES = {
  encourage: {
    tone: 'purely encouraging and warm',
    instruction: 'Focus entirely on what is interesting, creative, or expressive in the drawing. Notice specific details. End with one gentle optional tip framed as an exciting possibility, not a correction. Never mention what is missing or could be better.',
  },
  improve: {
    tone: 'warm and constructive, like a supportive coach',
    instruction: 'Start with genuine praise for one specific thing that works well. Then give one clear, actionable suggestion for improvement — something concrete they can try next time. Keep it friendly and specific to what you actually see.',
  },
  honest: {
    tone: 'honest and direct, like a real art teacher',
    instruction: 'Give a balanced critique. Identify one genuine strength and explain WHY it works. Then give 1-2 specific, honest areas to develop — reference what you actually see in the drawing. Be direct but kind. Mention a specific technique that would help.',
  },
  highlights: {
    tone: 'brief and upbeat',
    instruction: 'Just 2 sentences: one specific thing that stands out, and one quick tip. No more.',
  },
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

  const { imageBase64, promptTitle, artStyle, feedbackMode } = await req.json();
  const mode = FEEDBACK_MODES[feedbackMode] || FEEDBACK_MODES.encourage;

  const system = `You are an art teacher giving feedback to a student aged 9+ on their drawing.
Tone: ${mode.tone}.
Instructions: ${mode.instruction}
Important: Always reference something SPECIFIC you can actually see in the drawing — a shape, a colour choice, a line quality, a composition decision. Never give generic feedback.
Keep your total response to 3-5 sentences. Speak directly to the student.
${artStyle ? `The student is working in ${artStyle} style — if relevant, reference how their drawing relates to that style.` : ''}`;

  const userMsg = `The student was asked to draw: "${promptTitle || 'anything they like'}". Here is their drawing.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 250,
      system,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imageBase64 } },
          { type: 'text', text: userMsg }
        ]
      }]
    })
  });

  const data = await res.json();
  const text = data.content?.map(c => c.text || '').join('').trim() || '';

  return new Response(JSON.stringify({ feedback: text }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
