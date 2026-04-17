# Little Art Studio

AI-powered drawing app for kids. Draw → get encouraging feedback from Claude.

## Project structure

```
little-art-studio/
├── public/
│   └── index.html        ← the entire frontend
├── api/
│   ├── prompt.js         ← generates drawing challenges
│   └── feedback.js       ← reads child's drawing, gives feedback
├── vercel.json           ← routing config
└── README.md
```

## Deploy to Vercel (free, ~5 minutes)

### Step 1 — Push to GitHub

1. Go to https://github.com/new and create a new repo (e.g. `little-art-studio`)
2. On your computer, open a terminal in this folder and run:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/little-art-studio.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to https://vercel.com and sign in (free account, sign in with GitHub)
2. Click **Add New → Project**
3. Import your `little-art-studio` repo
4. Click **Deploy** — Vercel auto-detects the config

### Step 3 — Add your Anthropic API key

1. In your Vercel project dashboard, go to **Settings → Environment Variables**
2. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from https://console.anthropic.com
3. Click **Save**, then go to **Deployments** and click **Redeploy**

That's it — your app is live at `https://your-project.vercel.app`

---

## What works right now

- 3-question interest quiz (theme / style / mood)
- AI generates a personalised drawing challenge (Claude Haiku)
- Canvas with brush, eraser, 3 sizes, 10 colours, undo, clear
- AI reads the actual drawing and gives warm, specific feedback (Claude Haiku with vision)
- Guest mode: full experience, no saving
- Download drawing as PNG (signed-in users)

## Cost estimate (Claude Haiku)

| Action | Approx cost |
|---|---|
| Generate prompt | ~$0.0003 |
| Image feedback | ~$0.001 |
| 100 full sessions | ~$0.13 |

Very low cost for early testing.

## Next steps (after validation)

- [ ] User accounts (Supabase auth)
- [ ] Drawing gallery / archive
- [ ] Chapters / unlock system
- [ ] Share to public gallery
- [ ] Multi-player co-drawing
- [ ] More brush types

## Local development

No build step needed. Just open `public/index.html` in a browser.

To test the API routes locally, install Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Then add your API key to a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-...
```
