export const config = { runtime: 'edge' };

const FEEDBACK_MODES = {
  encourage: {
    en: { tone: 'purely encouraging and warm', instruction: 'Focus entirely on what is interesting, creative, or expressive. Notice specific details. End with one gentle tip framed as an exciting possibility. Never mention what is missing.' },
    zh: { tone: '完全鼓励、温暖', instruction: '专注于画作中有趣、有创意或有表现力的地方。注意具体细节。最后用一句话提一个温柔的小建议，用"如果……会更棒哦"的方式表达。绝对不提缺点。' }
  },
  improve: {
    en: { tone: 'warm and constructive, like a supportive coach', instruction: 'Start with genuine praise for one specific thing. Then give one clear, actionable suggestion for improvement. Keep it friendly and specific.' },
    zh: { tone: '温暖且有建设性，像一个支持你的教练', instruction: '先真诚地夸奖一个具体的优点，解释为什么好。然后给出一个清晰、可操作的改进建议。保持友善和具体。' }
  },
  honest: {
    en: { tone: 'honest and direct, like a real art teacher', instruction: 'Give a balanced critique. Identify one genuine strength and explain WHY it works. Then give 1-2 specific honest areas to develop. Be direct but kind.' },
    zh: { tone: '诚实直接，像一个真正的美术老师', instruction: '给出平衡的评价。指出一个真正的优点并解释原因。然后给出1-2个具体需要改进的地方。直接但友善，提到具体的技巧。' }
  },
  highlights: {
    en: { tone: 'brief and upbeat', instruction: 'Just 2 sentences: one specific thing that stands out, and one quick tip. No more.' },
    zh: { tone: '简短活泼', instruction: '只说两句话：一个最突出的亮点，加一个简单的小建议。不要更多了。' }
  },
};

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  const { imageBase64, promptTitle, artStyle, feedbackMode, lang } = await req.json();
  const isZh = lang === 'zh';
  const mode = FEEDBACK_MODES[feedbackMode] || FEEDBACK_MODES.encourage;
  const m = isZh ? mode.zh : mode.en;

  const system = isZh
    ? `你是一位美术老师，正在给9岁以上的学生点评他们的画作。
语气：${m.tone}。
要求：${m.instruction}
重要：一定要提到你在画作中真实看到的具体内容——某个形状、颜色选择、线条质感或构图决定。不要给出泛泛的评价。
总回复控制在3-5句话。直接和学生说话。用简单、亲切的中文。
${artStyle ? `学生使用的是${artStyle}风格——如果相关，可以提到他们的画与这种风格的关系。` : ''}`
    : `You are an art teacher giving feedback to a student aged 9+ on their drawing.
Tone: ${m.tone}.
Instructions: ${m.instruction}
Important: Always reference something SPECIFIC you can actually see in the drawing. Never give generic feedback.
Keep your total response to 3-5 sentences. Speak directly to the student.
${artStyle ? `The student is working in ${artStyle} style — if relevant, reference how their drawing relates to that style.` : ''}`;

  const userMsg = isZh
    ? `学生被要求画："${promptTitle || '任何他们喜欢的东西'}"。这是他们的画作，请给出点评。`
    : `The student was asked to draw: "${promptTitle || 'anything they like'}". Here is their drawing.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
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

  return new Response(JSON.stringify({ feedback: text }), { headers: { 'Content-Type': 'application/json' } });
}
