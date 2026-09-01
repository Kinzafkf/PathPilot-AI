import React from 'react';
import {
  Compass,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award,
  Briefcase,
  Layers,
  GraduationCap,
  ShieldCheck,
  Building2,
  DollarSign,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { PAKISTANI_UNIVERSITIES } from '../data/pakistanConstants';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <div id="landing-page" className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tag badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Built Specifically for Pakistani CS & IT Students</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Your Career. Your Path.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            PathPilot AI helps Pakistani Computer Science students and fresh graduates build personalized, market-ready career roadmaps and score their resumes against strict ATS criteria.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="hero-build-roadmap-btn"
              onClick={() => onNavigate('roadmap-gen')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>Build My Career Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-analyze-resume-btn"
              onClick={() => onNavigate('resume-analyzer')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-sm shadow-sm transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Analyze My Resume</span>
            </button>
          </div>

          {/* Key metrics / trust proof */}
          <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="block text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">16+</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tech Career Specializations</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">PKR Benchmark</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Realistic Local Salary Data</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="block text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">8 Categories</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Deep ATS Scoring Engine</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">100% Free</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">For Pakistani Students</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Feature Previews */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Two Powerful Pillars
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Engineered for the Pakistani Tech Market
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Bridge the university curriculum gap and crack your first software engineering, full-stack, or AI role.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: AI Career Roadmap Generator */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  AI Career Roadmap Generator
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Input your university (FAST, NUST, COMSATS, IIUI, UET, etc.), current skills, and weekly study hours. Gemini AI crafts a 5-phase customized learning schedule with local platform links and projects.
                </p>

                {/* Micro preview */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span>Phase 1: Foundations & Core Stack</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Weeks 1-4</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full w-2/3 rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Includes DSA, modern TypeScript, PostgreSQL schemas, and portfolio project architecture.
                  </p>
                </div>
              </div>

              <button
                id="preview-roadmap-cta-btn"
                onClick={() => onNavigate('roadmap-gen')}
                className="w-full py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Generate Your Custom Roadmap</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: ATS Resume Analyzer & PDF Report */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  ATS Resume Analyzer & PDF Report
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Upload your PDF resume. Our parsing engine checks layout, keywords, quantifiable metrics, and grammar. Download a professional PDF audit report with concrete bullet point rewrites.
                </p>

                {/* Micro preview score */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-6 mb-6">
                  <ScoreGauge score={82} size="sm" />
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">ATS Score: 82/100 (Competitive)</span>
                    <span className="text-slate-500 dark:text-slate-400 block">Identified 4 missing tech keywords and 2 weak action verbs to upgrade.</span>
                  </div>
                </div>
              </div>

              <button
                id="preview-resume-cta-btn"
                onClick={() => onNavigate('resume-analyzer')}
                className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Upload & Score Resume PDF</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Breakdown */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Comprehensive Toolkit
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Everything You Need to Get Hired
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">AI Career Roadmaps</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Step-by-step 20-week learning curves customized to your current skill level and target role.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">ATS Resume Analysis</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                0-100 scoring with bullet-level critique, keyword optimization, and professional PDF downloads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Pakistani Salary Insights</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Realistic PKR salary ranges for entry, junior, and mid-level roles across Lahore, Islamabad, and Karachi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Certifications Guide</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Guidance on DigiSkills.pk, NAVTTC, and applying for 100% Coursera financial aid as a Pakistani student.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Portfolio Projects</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standout project ideas with production feature checklists to impress local software house interviewers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Job Search Guidance</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Strategies for Rozee.pk, Mustakbil, BrightSpyre, and cold LinkedIn messaging to Pakistani tech leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (3 Steps) */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Three Easy Steps
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              How PathPilot AI Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Tell Us About Yourself</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Select your university, degree, current skill strengths, target role, and weekly available study hours.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Get Your AI-Powered Plan</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Gemini AI analyzes skill gaps and generates a week-by-week roadmap and ATS resume audit.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Build Skills & Apply Confidently</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Build portfolio projects, track learning milestones, and apply directly to Pakistani software firms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why PathPilot AI */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <GraduationCap className="w-4 h-4" />
                <span>Localized For Pakistani Graduates</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Why Generic Global Advice Fails Pakistani Students
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Most international platforms assume US/EU job pipelines. PathPilot AI addresses the unique challenges of the Pakistani tech industry: the gap between university theory and software house expectations, rupee salary benchmarks, local internship cycles, and regional recruitment platforms.
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Pakistani Universities:</strong> Tailored for FAST, NUST, COMSATS, IIUI, UET, GIKI, and all HEC recognized institutions.
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Local Market Realities:</strong> Targeted guidance for Pakistani software houses (Systems, Arbisoft, 10Pearls, Contour, etc.).
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>No Fake Data:</strong> Real Google Gemini AI API processing and Supabase PostgreSQL persistence.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-indigo-800/60">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Target Campuses</span>
                <span className="text-[11px] bg-indigo-800/80 px-2 py-0.5 rounded text-indigo-200">Across Pakistan</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PAKISTANI_UNIVERSITIES.slice(0, 10).map((uni, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] text-slate-200 transition"
                  >
                    {uni.split('(')[0].trim()}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-indigo-800/60 text-xs text-indigo-200">
                Supporting students from Islamabad, Lahore, Karachi, Peshawar, Quetta, Faisalabad, and remote regions.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="py-16 bg-gradient-to-tr from-indigo-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Building Your Career Path Today
          </h3>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto">
            Join thousands of Pakistani CS & IT students taking control of their tech careers with personalized roadmaps and ATS-optimized resumes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              id="cta-get-started-btn"
              onClick={() => onNavigate('roadmap-gen')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-bold text-sm shadow-lg transition cursor-pointer"
            >
              Generate Free Roadmap
            </button>
            <button
              id="cta-signup-btn"
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/60 border border-white/20 text-white font-bold text-sm transition cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
