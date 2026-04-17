export const config = { runtime: 'edge' };

const STYLE_DESCRIPTIONS = {
  ink_lineart:   'ink and line art (clean outlines, cross-hatching for shading, strong contour lines, pen-like quality)',
  painterly:     'painterly and loose style (expressive brushwork, blended colours, soft edges, impressionistic feel)',
  geometric:     'geometric and graphic style (bold shapes, flat colours, strong contrast, graphic design aesthetic)',
  pencil_sketch: 'pencil sketch style (soft graphite lines, hatching and shading, smudged tones, raw sketch quality)',
};
const STYLE_DESCRIPTIONS_ZH = {
  ink_lineart:   '线条插画风格（干净的轮廓线、交叉排线表现阴影、强调线条的力度）',
  painterly:     '写意水彩风格（随意的笔触、颜色自然融合、边缘柔和、印象派感觉）',
  geometric:     '几何图形风格（大胆的形状、纯色块、强烈对比、平面设计感）',
  pencil_sketch: '铅笔素描风格（柔和的铅笔线条、排线和阴影、涂抹效果、手绘草稿感）',
};

const THEME_DESCRIPTIONS = {
  animals:  'animals and creatures',
  nature:   'nature, plants, landscapes',
  space:    'space, sci-fi, futuristic worlds',
  fantasy:  'fantasy, magic, mythical worlds',
  people:   'people, characters, portraits',
};
const THEME_DESCRIPTIONS_ZH = {
  animals:  '动物和生物',
  nature:   '自然、植物、风景',
  space:    '太空、科幻、未来世界',
  fantasy:  '奇幻、魔法、神话世界',
  people:   '人物、角色、肖像',
};

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  const { theme, style, mood, lang } = await req.json();
  const isZh = lang === 'zh';

  const themeDesc = isZh ? (THEME_DESCRIPTIONS_ZH[theme] || theme) : (THEME_DESCRIPTIONS[theme] || theme);
  const styleDesc = isZh ? (STYLE_DESCRIPTIONS_ZH[style] || style) : (STYLE_DESCRIPTIONS[style] || style);

  const system = isZh
    ? `你是一位经验丰富的美术老师，正在为9岁以上的孩子设计绘画挑战题目。
根据学生选择的主题和绘画风格，生成一个具体、有趣的绘画挑战。
挑战内容必须结合绘画风格——不只是主题，要提到该风格的具体技巧。
只输出合法的JSON，不要有任何markdown格式或多余的文字。
JSON格式：
{
  "emoji": "一个相关的emoji",
  "title": "简短有趣的标题（最多7个字）",
  "description": "两句话：要画什么，以及一个与风格相关的技巧",
  "tips": ["针对该风格的技巧提示", "构图或主题建议", "一个让画面更生动的细节"]
}
提示必须具体可操作，要结合所选的绘画风格。`
    : `You are an experienced art teacher designing drawing challenges for kids and teens aged 9+.
Generate a specific, inspiring drawing challenge tailored to the student's chosen theme and art style.
The challenge MUST incorporate the art style — not just the subject. Reference specific techniques for that style.
Respond ONLY with valid JSON, no markdown, no extra text.
JSON format:
{
  "emoji": "single relevant emoji",
  "title": "short evocative title (max 7 words)",
  "description": "2 sentences: what to draw AND one style-specific technique to try",
  "tips": ["technique tip specific to their style", "composition or subject tip", "one detail that will make it come alive"]
}`;

  const userMsg = isZh
    ? `主题：${themeDesc}\n绘画风格：${styleDesc}\n心情：${mood}\n\n请生成一个将该主题与${styleDesc}的具体技巧自然结合的绘画挑战。`
    : `Theme: ${themeDesc}\nArt style: ${styleDesc}\nMood: ${mood}\n\nGenerate a drawing challenge that naturally combines this theme with the specific techniques of ${styleDesc}.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system,
      messages: [{ role: 'user', content: userMsg }]
    })
  });

  const data = await res.json();
  const text = data.content?.map(c => c.text || '').join('') || '';
  const clean = text.replace(/```json|```/g, '').trim();

  return new Response(clean, { headers: { 'Content-Type': 'application/json' } });
}
