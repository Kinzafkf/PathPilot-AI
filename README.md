# 🚀 PathPilot AI

**Empowering Pakistani CS & IT Students and Fresh Graduates with AI-Driven Career Roadmaps & ATS Resume Intelligence.**

PathPilot AI is an AI-powered career counseling and technical recruitment platform designed specifically for the Pakistani tech ecosystem. It bridges the gap between academic university curricula and real-world hiring expectations across top Pakistani tech companies (Systems Ltd, 10Pearls, Arbisoft, Contour Software, Devsinc, Afiniti, NETSOL, TRG), high-growth local startups, and global remote opportunities.

---

## ✨ Key Features

### 1. 🎯 AI Career Roadmap Generator
- **Personalized 20-Week Curriculums**: Generates customized, milestone-driven technical roadmaps based on your target role, university background, current skills, and weekly study bandwidth.
- **Pakistani Market Grounding**: Includes local entry-level salary benchmarks (in PKR), hiring software houses, in-demand regional tech stacks, and national learning initiatives (DigiSkills.pk, NAVTTC, PIAIC).
- **Interactive Checklists & PDF Export**: Track weekly milestone completion in real-time or export clean PDF roadmaps for offline study.

### 2. 📄 ATS Resume Analyzer & Fixer
- **0–100 ATS Compatibility Score**: Deep inspection of technical keywords, quantifiable achievements, formatting, section hierarchies, and grammar.
- **Actionable Bullet Enhancements**: Transforms weak resume lines into high-impact, metrics-driven bullet points using the Google XYZ formula (*"Accomplished [X], as measured by [Y], by doing [Z]"*).
- **Direct PDF & Text Ingestion**: Upload `.pdf`, `.txt`, or `.md` files, or paste raw resume text with instant text parsing.

### 3. 🏢 Pakistani Tech Hub Directory & Market Insights
- Explore top hiring companies across Lahore, Karachi, Islamabad/Rawalpindi, Faisalabad, and Peshawar.
- Salary trends, interview processes, and tech stacks for junior and associate engineering roles.

### 4. 🌓 Theme System & Accessibility
- Seamless Dark and Light theme switching with zero page-flash on initial load.
- Fully responsive design engineered for mobile devices, tablets, and wide desktop screens.

### 5. 💾 User Cloud Persistence (Supabase)
- Save generated roadmaps and ATS resume reports to your personal dashboard.
- Safe guest mode with client-side caching for quick access without mandatory sign-up.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/)
- **Backend / Server**: [Express.js](https://expressjs.com/) with [Vite Middleware](https://vite.dev/) (Local & Container Dev) + [Vercel Serverless Functions](https://vercel.com/docs/functions) (`/api/*`)
- **AI Engine**: [Google Gemini 2.5/3.7 Flash](https://ai.google.dev/) via `@google/genai` with fallback local evaluation heuristics
- **Document Processing**: `pdf-parse` (v2 & stream reader), `jspdf`
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
├── api/                     # Vercel Serverless Functions
│   ├── analyze-resume.ts    # POST: ATS Resume analysis with Gemini
│   ├── generate-roadmap.ts  # POST: 20-week roadmap generator
│   ├── parse-pdf.ts         # POST: PDF text extraction endpoint
│   └── health.ts            # GET: Server & AI health status
├── public/                  # Static assets & sample resumes
├── src/
│   ├── components/          # Reusable UI components (Navbar, Footer, etc.)
│   ├── context/             # AuthContext & ThemeContext providers
│   ├── data/                # Pakistani tech companies & role definitions
│   ├── pages/               # Application views
│   │   ├── HomePage.tsx
│   │   ├── RoadmapGeneratorPage.tsx
│   │   ├── ResumeAnalyzerPage.tsx
│   │   ├── TechDirectoryPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── AuthPage.tsx
│   ├── services/            # Supabase database & storage clients
│   ├── types/               # Global TypeScript definitions
│   ├── App.tsx              # Main routing & layout
│   ├── index.css            # Tailwind v4 theme definitions
│   └── main.tsx             # React DOM entry point
├── .env.example             # Example environment variable template
├── .gitignore               # Ignored secrets, builds, and dependencies
├── package.json             # NPM dependencies & build scripts
├── server.ts                # Express development & full-stack container server
├── vercel.json              # Vercel deployment & routing configuration
└── vite.config.ts           # Vite build pipeline configuration
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn** / **pnpm**
- **Google Gemini API Key** (Free from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/pathpilot-ai.git
cd pathpilot-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in your keys:
```env
# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) Supabase Credentials for user cloud sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

PathPilot AI includes native Vercel configuration (`vercel.json` & `/api/` serverless functions).

### Step-by-Step Deployment:

1. **Push your code to GitHub / GitLab**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository.
3. Vercel automatically detects the Vite framework and `vercel.json` configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Add Environment Variables in Vercel Project Settings**:
   - `GEMINI_API_KEY`: `AIzaSy...` (Your Gemini API Key)
   - *(Optional)* `VITE_SUPABASE_URL`: `https://...supabase.co`
   - *(Optional)* `VITE_SUPABASE_ANON_KEY`: `eyJ...`
5. Click **Deploy**. Your app will be live with full SSL and serverless AI endpoints in ~1 minute.

---

## 🛡️ Security & Privacy

- Sensitive `.env` files, API keys, credentials, and `node_modules/` are strictly excluded from version control via `.gitignore`.
- All Gemini API calls are securely processed server-side (`/api/*` in Vercel and `server.ts` in containers). API keys are **never** exposed to client browser bundles.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
