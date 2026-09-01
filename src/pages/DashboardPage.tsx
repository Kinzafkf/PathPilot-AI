import React, { useEffect, useState } from 'react';
import {
  Compass,
  FileText,
  BookmarkCheck,
  History,
  User,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Building2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { SavedRoadmap, SavedResumeAnalysis } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { PAKISTANI_JOB_PLATFORMS } from '../data/pakistanConstants';

interface DashboardPageProps {
  onNavigate: (tab: string, extraData?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([]);
  const [resumes, setResumes] = useState<SavedResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        const [userRoadmaps, userResumes] = await Promise.all([
          dbService.getRoadmaps(user.id),
          dbService.getResumeAnalyses(user.id),
        ]);
        setRoadmaps(userRoadmaps);
        setResumes(userResumes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Graduate';

  // Calculate Profile Completeness
  const calculateCompleteness = () => {
    let fieldsFilled = 0;
    const totalFields = 6;
    if (profile?.full_name) fieldsFilled++;
    if (profile?.university) fieldsFilled++;
    if (profile?.degree) fieldsFilled++;
    if (profile?.graduation_year) fieldsFilled++;
    if (profile?.career_goal) fieldsFilled++;
    if (profile?.bio) fieldsFilled++;
    return Math.round((fieldsFilled / totalFields) * 100);
  };

  const completeness = calculateCompleteness();
  const latestResume = resumes.length > 0 ? resumes[0] : null;
  const latestRoadmap = roadmaps.length > 0 ? roadmaps[0] : null;
  const latestAtsScore = latestResume ? latestResume.ats_score : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your career dashboard...</p>
      </div>
    );
  }

  return (
    <div id="dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pakistani Tech Graduate Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-emerald-400">{displayName}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {profile?.university ? `Student/Alum at ${profile.university}` : 'Your AI-powered career compass is ready.'}
              {profile?.career_goal ? ` • Target: ${profile.career_goal}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              id="dash-create-roadmap-btn"
              onClick={() => onNavigate('roadmap-gen')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Create Roadmap</span>
            </button>
            <button
              id="dash-analyze-resume-btn"
              onClick={() => onNavigate('resume-analyzer')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Analyze Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Roadmaps */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Roadmaps Created</span>
            <Compass className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {roadmaps.length}
          </p>
          <span className="text-[11px] text-slate-400">Personalized career paths</span>
        </div>

        {/* Stat 2: Resumes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Resumes Analyzed</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {resumes.length}
          </p>
          <span className="text-[11px] text-slate-400">ATS evaluations completed</span>
        </div>

        {/* Stat 3: Latest ATS Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Latest ATS Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {latestAtsScore !== null ? `${latestAtsScore}/100` : '—'}
          </p>
          <span className="text-[11px] text-slate-400">
            {latestAtsScore !== null ? (latestAtsScore >= 75 ? 'ATS Competitive' : 'Needs Optimization') : 'No resume uploaded yet'}
          </span>
        </div>

        {/* Stat 4: Profile Completion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Profile Completion</span>
            <User className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completeness}%
            </p>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            {completeness < 100 ? (
              <button
                onClick={() => onNavigate('profile')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Complete profile →
              </button>
            ) : (
              'Profile is 100% complete'
            )}
          </span>
        </div>
      </div>

      {/* 3. Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <button
            id="quick-action-roadmap"
            onClick={() => onNavigate('roadmap-gen')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Compass className="w-5 h-5" />
            </div>
            <span className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Create Roadmap
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              New custom AI plan
            </span>
          </button>

          <button
            id="quick-action-resume"
            onClick={() => onNavigate('resume-analyzer')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <span className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Analyze Resume
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Upload PDF for scoring
            </span>
          </button>

          <button
            id="quick-action-saved-roadmaps"
            onClick={() => onNavigate('my-roadmaps')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <span className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              My Roadmaps
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              View saved roadmaps
            </span>
          </button>

          <button
            id="quick-action-resume-reports"
            onClick={() => onNavigate('resume-reports')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <History className="w-5 h-5" />
            </div>
            <span className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Resume Reports
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Past analysis history
            </span>
          </button>

          <button
            id="quick-action-profile"
            onClick={() => onNavigate('profile')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-xs hover:shadow-md transition text-left group cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <User className="w-5 h-5" />
            </div>
            <span className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Edit Profile
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              University & career info
            </span>
          </button>
        </div>
      </div>

      {/* 4. Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Career Roadmap */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Latest Career Roadmap</h3>
            </div>
            {roadmaps.length > 0 && (
              <button
                onClick={() => onNavigate('my-roadmaps')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                View all ({roadmaps.length}) →
              </button>
            )}
          </div>

          {latestRoadmap ? (
            <div className="space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  {latestRoadmap.career_goal}
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {latestRoadmap.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {latestRoadmap.roadmap_data?.summary || 'Tailored career roadmap generated for Pakistani tech market.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(latestRoadmap.created_at).toLocaleDateString()}
                </span>
                <button
                  id="open-latest-roadmap-btn"
                  onClick={() => onNavigate('roadmap-detail', { roadmap: latestRoadmap.roadmap_data, input: latestRoadmap.input_data, id: latestRoadmap.id })}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition cursor-pointer flex items-center space-x-1"
                >
                  <span>Open Roadmap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <Compass className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No career roadmap generated yet.</p>
              <button
                onClick={() => onNavigate('roadmap-gen')}
                className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100 transition cursor-pointer"
              >
                Generate First Roadmap
              </button>
            </div>
          )}
        </div>

        {/* Latest Resume Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Latest Resume Analysis</h3>
            </div>
            {resumes.length > 0 && (
              <button
                onClick={() => onNavigate('resume-reports')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                View all ({resumes.length}) →
              </button>
            )}
          </div>

          {latestResume ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <ScoreGauge score={latestResume.ats_score} size="sm" />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white block truncate max-w-[220px]">
                    {latestResume.file_name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Target: {latestResume.target_role || 'Software Engineer'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Evaluated on {new Date(latestResume.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  id="open-latest-resume-btn"
                  onClick={() => onNavigate('resume-report-view', { analysis: latestResume.analysis_data, id: latestResume.id })}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center space-x-1"
                >
                  <span>View Full Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No resume analyzed yet.</p>
              <button
                onClick={() => onNavigate('resume-analyzer')}
                className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold text-xs hover:bg-emerald-100 transition cursor-pointer"
              >
                Upload & Analyze PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Pakistani Tech Job Opportunities Quick Board */}
      <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recommended Pakistani Job & Internship Portals
            </h3>
          </div>
          <span className="text-xs text-slate-500">Live External Portals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PAKISTANI_JOB_PLATFORMS.slice(0, 4).map((platform, idx) => (
            <a
              key={idx}
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    {platform.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {platform.description}
                </p>
              </div>
              <span className="mt-2 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                Explore listings →
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
