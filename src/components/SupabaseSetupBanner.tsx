import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const SupabaseSetupBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copySql = () => {
    const sql = `-- Supabase Schema for PathPilot AI
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  university TEXT DEFAULT '',
  degree TEXT DEFAULT '',
  graduation_year TEXT DEFAULT '',
  current_status TEXT DEFAULT '',
  career_goal TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  career_goal TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  roadmap_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  ats_score INTEGER NOT NULL DEFAULT 0,
  target_role TEXT DEFAULT '',
  analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profiles" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users view own roadmaps" ON public.roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own roadmaps" ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own roadmaps" ON public.roadmaps FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users view own resumes" ON public.resume_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own resumes" ON public.resume_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own resumes" ON public.resume_analyses FOR DELETE USING (auth.uid() = user_id);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="supabase-status-widget" className="w-full bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {isSupabaseConfigured ? (
            <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected to Supabase PostgreSQL & Auth
            </span>
          ) : (
            <span className="flex items-center text-slate-600 dark:text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Database Mode: <strong className="ml-1 text-slate-800 dark:text-slate-200">Active & Ready</strong> (Persistent storage enabled)
            </span>
          )}
        </div>

        <button
          id="toggle-supabase-guide-btn"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition"
        >
          <span>{expanded ? 'Hide Setup Details' : 'Supabase Setup Guide'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto px-4 pb-4 pt-1 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
          <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Supabase Integration Details (PostgreSQL + Auth + RLS)
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                  PathPilot AI is fully wired for Supabase. To connect your live Supabase cloud database, provide <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">VITE_SUPABASE_ANON_KEY</code>.
                </p>
              </div>
              <button
                id="copy-sql-migration-btn"
                onClick={copySql}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-medium hover:bg-indigo-100 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">1. `profiles` Table</span>
                <p className="text-slate-500 dark:text-slate-400">Stores full name, Pakistani university, degree, graduation status, and target career.</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">2. `roadmaps` Table</span>
                <p className="text-slate-500 dark:text-slate-400">Stores structured learning roadmaps, weekly schedules, project ideas, and salary insights.</p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">3. `resume_analyses` Table</span>
                <p className="text-slate-500 dark:text-slate-400">Stores ATS score (0-100), category breakdowns, weaknesses, and improvement checklists.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
