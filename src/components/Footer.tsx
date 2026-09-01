import React from 'react';
import { Compass, Heart, ExternalLink, ShieldCheck, MapPin } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight">PathPilot AI 2.0</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-powered Career Navigation & ATS Resume Analysis designed specifically for Pakistani Computer Science & IT students and fresh graduates.
            </p>
            <div className="flex items-center space-x-1 text-slate-400 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Tailored for Pakistani Tech Ecosystem</span>
            </div>
          </div>

          {/* Col 2: Core Solutions */}
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Core Platform</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('roadmap-gen')}
                  className="hover:text-white transition"
                >
                  AI Career Roadmap Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('resume-analyzer')}
                  className="hover:text-white transition"
                >
                  ATS Resume Analyzer & PDF Report
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className="hover:text-white transition"
                >
                  Student Career Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('my-roadmaps')}
                  className="hover:text-white transition"
                >
                  Saved Learning Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Pakistani Tech Resources */}
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Local Ecosystem</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://digiskills.pk"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-white transition"
                >
                  <span>DigiSkills.pk (Govt of Pakistan)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.rozee.pk"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-white transition"
                >
                  <span>Rozee.pk Tech Jobs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.mustakbil.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-white transition"
                >
                  <span>Mustakbil.com Internships</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://navttc.gov.pk"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-white transition"
                >
                  <span>NAVTTC Prime Minister High-Tech</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Target Campuses */}
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Target Campuses</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-2">
              Calibrated for graduates from NUST, FAST-NUCES, COMSATS, IIUI, Air University, Bahria, UET, PIEAS, GIKI, LUMS, PUCIT, and all Pakistani universities.
            </p>
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-800 rounded-lg text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real Gemini AI & Supabase RLS</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} PathPilot AI. All rights reserved. Vercel & Supabase Ready.</p>
          <div className="flex items-center space-x-1">
            <span>Built for Pakistani CS students with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>& Google Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
