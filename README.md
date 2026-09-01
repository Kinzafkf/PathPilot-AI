<div align="center">

# 🚀 PathPilot AI

### Empowering Pakistani CS & IT Students and Fresh Graduates with AI-Driven Career Roadmaps & ATS Resume Intelligence

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-6C3CE9?style=for-the-badge)](https://pathai-sigma.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Gemini AI](https://img.shields.io/badge/Powered_by-Gemini_AI-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**🔗 Live App:** **[pathai-sigma.vercel.app](https://pathai-sigma.vercel.app/)**

</div>

---

## 📖 About

**PathPilot AI** is an AI-powered career counseling and technical recruitment platform built specifically for the **Pakistani tech ecosystem**. It bridges the gap between academic curricula and real-world hiring expectations across top Pakistani tech companies — **Systems Ltd, 10Pearls, Arbisoft, Contour Software, Devsinc, Afiniti, NETSOL, TRG** — as well as high-growth local startups and global remote opportunities.

Instead of generic, one-size-fits-all career advice, PathPilot AI generates **hyper-localized, data-grounded roadmaps and resume feedback** — tuned to Pakistani salary benchmarks, hiring trends, and national learning initiatives.

---

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

### 🎯 AI Career Roadmap Generator
- Personalized **20-week milestone-driven curriculums** based on target role, university background, current skills, and weekly study bandwidth
- Grounded in the **Pakistani market**: local entry-level salary benchmarks (PKR), hiring software houses, in-demand regional tech stacks, and national programs (**DigiSkills.pk, NAVTTC, PIAIC**)
- Interactive checklists with real-time progress tracking + clean **PDF export** for offline study

</td>
<td width="50%" valign="top">

### 📄 ATS Resume Analyzer & Fixer
- **0–100 ATS Compatibility Score** covering technical keywords, quantifiable achievements, formatting, and section hierarchy
- Rewrites weak bullet points into high-impact, metrics-driven lines using the **Google XYZ formula**
- Direct ingestion of `.pdf`, `.txt`, or `.md` files — or paste resume text directly

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🏢 Pakistani Tech Hub Directory
- Explore top hiring companies across **Lahore, Karachi, Islamabad/Rawalpindi, Faisalabad, and Peshawar**
- Salary trends, interview processes, and tech stacks for junior/associate engineering roles

</td>
<td width="50%" valign="top">

### 💾 Cloud Persistence & Accessibility
- Save roadmaps and resume reports to a personal dashboard via **Supabase**
- Safe **guest mode** with client-side caching — no mandatory sign-up
- Seamless **Dark/Light theme** switching, zero flash on load, fully responsive across devices

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 · TypeScript · Tailwind CSS v4 · Motion |
| **Backend / Server** | Express.js + Vite Middleware (local) · Vercel Serverless Functions (`/api/*`) |
| **AI Engine** | Google Gemini 2.5 / 3.7 Flash (`@google/genai`) with local heuristic fallback |
| **Document Processing** | `pdf-parse`, `jspdf` |
| **Database & Auth** | Supabase (`@supabase/supabase-js`) |
| **Icons** | Lucide React |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm / bun / yarn / pnpm
- A free **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/)

### Setup

```bash
git clone https://github.com/your-username/pathpilot-ai.git
cd pathpilot-ai
npm install
```

Copy the environment template and fill in your keys:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — for cloud sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Run the dev server:

```bash
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)**.

---

## ☁️ Deployment

PathPilot AI is live at **[pathai-sigma.vercel.app](https://pathai-sigma.vercel.app/)**, deployed on Vercel using the included `vercel.json` and `/api/` serverless functions.

To deploy your own copy:

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects the Vite framework
3. Add environment variables in **Project Settings**: `GEMINI_API_KEY`, and optionally `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy** — live in under a minute with full SSL and serverless AI endpoints

---

## 🛡️ Security & Privacy

- `.env` files, API keys, credentials, and `node_modules/` are excluded from version control via `.gitignore`
- All Gemini API calls are processed **server-side only** (`/api/*` on Vercel, `server.ts` locally) — API keys never reach the client bundle

---

## 📄 License

Licensed under the [MIT License](LICENSE).

<div align="center">

Made with 💜 for Pakistan's next generation of tech talent

</div>
