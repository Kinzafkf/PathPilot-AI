import React, { useState } from 'react';
import {
  FileText,
  Download,
  ArrowLeft,
  BookmarkCheck,
  Check,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronRight,
  TrendingUp,
  Tag,
  Lightbulb,
  FileCheck2,
} from 'lucide-react';
import { ResumeAnalysisData } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { exportResumeAnalysisToPDF } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';

interface ResumeReportPageProps {
  analysis: ResumeAnalysisData;
  savedId?: string;
  onBack: () => void;
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
}

export const ResumeReportPage: React.FC<ResumeReportPageProps> = ({
  analysis,
  savedId: initialSavedId,
  onBack,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [savedId, setSavedId] = useState<string | undefined>(initialSavedId);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Active subtab in report
  const [activeTab, setActiveTab] = useState<'overview' | 'bullets' | 'keywords' | 'fixes' | 'summary'>('overview');

  const handleDownloadPDF = () => {
    setIsExportingPDF(true);
    try {
      exportResumeAnalysisToPDF(analysis);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveToAccount = async () => {
    if (!user) {
      onOpenAuth('signin');
      return;
    }
    setIsSaving(true);
    try {
      const saved = await dbService.saveResumeAnalysis({
        user_id: user.id,
        file_name: analysis.fileName || 'Resume_Analysis.pdf',
        ats_score: analysis.atsScore || 70,
        target_role: analysis.targetRole || 'Software Engineer',
        analysis_data: analysis,
      });
      setSavedId(saved.id);
    } catch (err) {
      console.error('Failed to save resume analysis:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copySummaryText = () => {
    if (analysis.improvedProfessionalSummary) {
      navigator.clipboard.writeText(analysis.improvedProfessionalSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const categoryEntries = [
    { label: 'ATS Compatibility', val: analysis.categoryScores?.atsCompatibility ?? 75 },
    { label: 'Technical & Soft Skills', val: analysis.categoryScores?.skills ?? 70 },
    { label: 'Experience & Projects', val: analysis.categoryScores?.experience ?? 68 },
    { label: 'Education & Degree', val: analysis.categoryScores?.education ?? 85 },
    { label: 'Keywords & Job Match', val: analysis.categoryScores?.keywords ?? 60 },
    { label: 'Formatting & Layout', val: analysis.categoryScores?.formatting ?? 80 },
    { label: 'Grammar & Tone', val: analysis.categoryScores?.grammar ?? 90 },
    { label: 'Professional Impact', val: analysis.categoryScores?.professionalImpact ?? 65 },
  ];

  return (
    <div id="resume-report-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          id="back-to-analyzer-btn"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analyzer</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            id="download-pdf-report-btn"
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPDF ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          {user ? (
            savedId ? (
              <span className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
                <BookmarkCheck className="w-4 h-4" />
                <span>Saved to Reports</span>
              </span>
            ) : (
              <button
                id="save-report-btn"
                onClick={handleSaveToAccount}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save to Account'}</span>
              </button>
            )
          ) : (
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Sign In to Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Gauge Column */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            <ScoreGauge score={analysis.atsScore || 70} size="lg" label="Overall ATS Score" />
            <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Target: <strong className="text-slate-800 dark:text-slate-200">{analysis.targetRole || 'Software Role'}</strong>
            </div>
          </div>

          {/* Quick Category Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Evaluation Report
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {analysis.fileName || 'Uploaded_Resume.pdf'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluated against software house benchmarks, ATS screening algorithms, and Pakistani CS hiring standards.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {categoryEntries.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 truncate text-[11px] font-medium">{cat.label}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{cat.val}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat.val >= 80 ? 'bg-emerald-500' : cat.val >= 65 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${cat.val}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs for Report Details */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'overview', label: 'Strengths & Gaps' },
          { id: 'bullets', label: 'Weak Bullet Point Rewrites' },
          { id: 'keywords', label: 'Keywords & Action Verbs' },
          { id: 'fixes', label: 'Action Items & Recommendations' },
          { id: 'summary', label: 'Optimized Summary & Checklist' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`report-subtab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. Strengths & Gaps Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          {/* Strengths */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Identified Strengths & High Points
              </h3>
            </div>

            <div className="space-y-2.5">
              {analysis.strengths?.map((str, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2.5"
                >
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Critical Weaknesses & Red Flags
              </h3>
            </div>

            <div className="space-y-2.5">
              {analysis.weaknesses?.map((weak, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2.5"
                >
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>{weak}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Bullet Point Rewrites Tab */}
      {activeTab === 'bullets' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <strong>STAR Formula Transformation:</strong> Transform passive task descriptions into quantifiable business and engineering achievements.
          </div>

          <div className="space-y-4">
            {analysis.weakBulletPoints?.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                {/* Original */}
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                  <span className="font-bold text-rose-700 dark:text-rose-300 block">❌ Original Bullet in Resume:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-mono">"{item.original}"</p>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 block pt-1">
                    <strong>Issue:</strong> {item.issue}
                  </span>
                </div>

                {/* AI Improved */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 block">
                      ✨ AI-Optimized STAR Rewrite (High Impact):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.improved);
                      }}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium">"{item.improved}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Keywords & Action Verbs */}
      {activeTab === 'keywords' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Missing Keywords Grid */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <Tag className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Missing High-Value Keywords for {analysis.targetRole}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add these keywords to your skills section and bullet points to pass recruiter ATS filters:
            </p>

            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords?.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-800"
                >
                  + {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Action Verbs Critique */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Action Verb Upgrades
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.weakActionVerbs?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-600">Weak Verb: "{item.weak}"</span>
                    <span className="text-[10px] text-slate-400">Replace With</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.strongerAlternatives?.map((alt, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Action Items & Recommendations */}
      {activeTab === 'fixes' && (
        <div className="space-y-4 animate-in fade-in">
          {analysis.actionableIssues?.map((issue, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                  {issue.category || 'Optimization Area'}
                </span>
                <span className="text-xs font-bold text-slate-400">Action Item #{idx + 1}</span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Problem: {issue.problem}
              </h4>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                <strong>Why It Matters:</strong> {issue.whyItMatters}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                <strong>Recommended Fix:</strong> {issue.recommendedFix}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Optimized Summary & Checklist */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Improved Summary */}
          {analysis.improvedProfessionalSummary && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Recommended Professional Summary</span>
                </h3>
                <button
                  id="copy-summary-btn"
                  onClick={copySummaryText}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {analysis.improvedProfessionalSummary}
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Final ATS Optimization Checklist</span>
            </h3>

            <div className="space-y-2">
              {analysis.improvementChecklist?.map((chk, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2.5"
                >
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{chk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
