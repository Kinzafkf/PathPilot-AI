import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Code2,
  DollarSign,
  Briefcase,
  BookOpen,
  ArrowLeft,
  Share2,
  BookmarkCheck,
  Check,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { RoadmapOutputData, RoadmapInputData } from '../types';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';

interface RoadmapDetailPageProps {
  roadmap: RoadmapOutputData;
  inputData?: RoadmapInputData;
  savedId?: string;
  onBack: () => void;
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
}

export const RoadmapDetailPage: React.FC<RoadmapDetailPageProps> = ({
  roadmap,
  inputData,
  savedId: initialSavedId,
  onBack,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [savedId, setSavedId] = useState<string | undefined>(initialSavedId);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active tab inside roadmap view
  const [activeSection, setActiveSection] = useState<
    'overview' | 'phases' | 'weekly' | 'projects' | 'interview' | 'jobs' | 'checklist'
  >('overview');

  // Interactive checklist state
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleChecklist = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSaveToAccount = async () => {
    if (!user) {
      onOpenAuth('signin');
      return;
    }
    setIsSaving(true);
    try {
      const saved = await dbService.saveRoadmap({
        user_id: user.id,
        title: `${roadmap.targetJobRole} Roadmap (${inputData?.university || 'Graduate'})`,
        career_goal: roadmap.careerGoal,
        input_data: inputData || {},
        roadmap_data: roadmap,
      });
      setSavedId(saved.id);
    } catch (err) {
      console.error('Failed to save roadmap:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySummary = () => {
    const text = `PathPilot AI Career Roadmap for ${roadmap.targetJobRole}\nGoal: ${roadmap.careerGoal}\nPhases: ${roadmap.learningPhases?.length || 0} Phases\nEstimated PKR Salary: ${roadmap.salaryExpectationsPKR?.entryLevel || 'Market Competitive'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const checklistItems = roadmap.careerChecklist || [
    { id: 'c1', category: 'Projects', item: 'Build 2+ production-grade full-stack portfolio projects.' },
    { id: 'c2', category: 'Resume', item: 'Format 1-page ATS compliant resume and score > 80% on PathPilot.' },
    { id: 'c3', category: 'LinkedIn', item: 'Add target role keywords & connect with 50+ Pakistani tech recruiters.' },
    { id: 'c4', category: 'DSA', item: 'Solve 30+ top interview coding problems on LeetCode.' },
    { id: 'c5', category: 'Applications', item: 'Apply to 15+ verified openings on Rozee.pk & LinkedIn.' },
  ];

  return (
    <div id="roadmap-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Bar: Back & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          id="back-to-generator-btn"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmaps</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            id="share-roadmap-btn"
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
          </button>

          {user ? (
            savedId ? (
              <span className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
                <BookmarkCheck className="w-4 h-4" />
                <span>Saved to My Roadmaps</span>
              </span>
            ) : (
              <button
                id="save-roadmap-btn"
                onClick={handleSaveToAccount}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save to My Account'}</span>
              </button>
            )
          ) : (
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Sign In to Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Roadmap Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold">
              Target Role: {roadmap.targetJobRole}
            </span>
            {inputData?.university && (
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {inputData.university}
              </span>
            )}
            {inputData?.weeklyHours && (
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs">
                ⏱ {inputData.weeklyHours} hrs/week
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {roadmap.careerGoal}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {roadmap.summary}
          </p>
        </div>
      </div>

      {/* Navigation Tabs inside the Roadmap */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'overview', label: 'Skills & Gaps', icon: Layers },
          { id: 'phases', label: 'Learning Phases (1-5)', icon: Compass },
          { id: 'weekly', label: 'Weekly Schedule', icon: Calendar },
          { id: 'projects', label: 'Portfolio Projects', icon: Code2 },
          { id: 'interview', label: 'Interview Preparation', icon: HelpCircle },
          { id: 'jobs', label: 'Job Strategy & PKR Salary', icon: DollarSign },
          { id: 'checklist', label: 'Career Checklist', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              id={`roadmap-subtab-${tab.id}`}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Overview & Skill Gaps */}
      {activeSection === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Skill assessment & Gaps grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Skills Assessment */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Current Skills Assessment
                </h3>
              </div>

              <div className="space-y-3">
                {roadmap.currentSkillAssessment?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {item.skill}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.commentary}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.level === 'Proficient'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.level === 'Developing'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Skill Gaps */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Identified Gaps for Pakistani Tech Employers
                </h3>
              </div>

              <div className="space-y-3">
                {roadmap.skillGaps?.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {gap.skill}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400">ETA: {gap.estimatedTimeToLearn}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            gap.importance === 'High'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {gap.importance} Priority
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {gap.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Tech Stack Matrix */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recommended Technologies & Tools Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {roadmap.recommendedTechnologies?.map((group, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 block">
                    {group.category}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tools?.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-800 dark:text-slate-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Learning Phases (1 to 5) */}
      {activeSection === 'phases' && (
        <div className="space-y-6 animate-in fade-in">
          {roadmap.learningPhases?.map((phase, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                    {phase.phaseNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {phase.title}
                    </h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      ⏱ Duration: {phase.duration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">Key Topics Covered:</span>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    {phase.topics?.map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-start space-x-1.5">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">Practical Tasks & Deliverables:</span>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    {phase.tasks?.map((task, tIdx) => (
                      <li key={tIdx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                <span><strong>Milestone Outcome:</strong> {phase.expectedOutcome}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Weekly Schedule */}
      {activeSection === 'weekly' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmap.weeklyPlan?.map((week, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                    Week {week.week}
                  </span>
                  <span className="text-[11px] text-slate-400">Target Focus</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {week.focus}
                </h4>

                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {week.tasks?.map((task, tIdx) => (
                    <li key={tIdx} className="flex items-start space-x-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  🏁 Milestone: {week.milestone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Portfolio Projects */}
      {activeSection === 'projects' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmap.portfolioProjects?.map((proj, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        proj.difficulty === 'Beginner'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : proj.difficulty === 'Intermediate'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {proj.difficulty}
                    </span>
                    <Code2 className="w-4 h-4 text-slate-400" />
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {proj.title}
                  </h4>

                  <div className="flex flex-wrap gap-1">
                    {proj.technologies?.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">Features:</span>
                    <ul className="space-y-1 text-slate-500 dark:text-slate-400">
                      {proj.features?.map((f, fIdx) => (
                        <li key={fIdx}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white block mb-0.5">Recruiter Value in Pakistan:</strong>
                  {proj.learningOutcome}
                </div>
              </div>
            ))}
          </div>

          {/* Certifications Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Recommended Certifications & Pakistani Initiatives</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmap.recommendedCertifications?.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{cert.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      {cert.costType}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Provider: {cert.provider}</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{cert.whyUseful}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Interview Preparation */}
      {activeSection === 'interview' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Technical Interview Focus Topics
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {roadmap.interviewPreparation?.technicalTopics?.map((t, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-start space-x-2">
                    <span className="text-indigo-600 font-bold">#{idx + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Frequently Asked in Pakistani Software House Interviews
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {roadmap.interviewPreparation?.commonQuestions?.map((q, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-start space-x-2">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">Behavioral & Soft Skills for Pakistan Market</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roadmap.interviewPreparation?.softSkills?.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                  • {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Job Strategy & PKR Salary */}
      {activeSection === 'jobs' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Salary Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold text-base">
                Pakistani Tech Market Salary Benchmarks (PKR)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/10 space-y-1">
                <span className="text-xs text-slate-300 block">Entry Level / Fresh Grad</span>
                <span className="text-lg font-extrabold text-white block">
                  {roadmap.salaryExpectationsPKR?.entryLevel || 'PKR 65,000 – 110,000 / mo'}
                </span>
                <span className="text-[10px] text-slate-300">0 - 1 year experience</span>
              </div>

              <div className="p-4 rounded-xl bg-white/10 space-y-1">
                <span className="text-xs text-slate-300 block">Junior Developer (1-2 yrs)</span>
                <span className="text-lg font-extrabold text-emerald-300 block">
                  {roadmap.salaryExpectationsPKR?.junior || 'PKR 120,000 – 190,000 / mo'}
                </span>
                <span className="text-[10px] text-slate-300">Proven production track record</span>
              </div>

              <div className="p-4 rounded-xl bg-white/10 space-y-1">
                <span className="text-xs text-slate-300 block">Mid-Level Engineer (2-3+ yrs)</span>
                <span className="text-lg font-extrabold text-amber-300 block">
                  {roadmap.salaryExpectationsPKR?.midLevel || 'PKR 200,000 – 380,000+ / mo'}
                </span>
                <span className="text-[10px] text-slate-300">Architecture & code ownership</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 pt-2 border-t border-white/10">
              {roadmap.salaryExpectationsPKR?.disclaimer ||
                'Salaries are indicative estimates for major tech hubs (Lahore, Islamabad, Karachi) based on tier-1 and tier-2 software houses and product firms.'}
            </p>
          </div>

          {/* Job Platforms */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Target Pakistani Platforms & Application Strategy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roadmap.jobSearchStrategy?.pakistaniJobPlatforms?.map((plat, idx) => (
                <a
                  key={idx}
                  href={plat.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition group flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition flex items-center space-x-1">
                      <span>{plat.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{plat.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Interactive Career Checklist */}
      {activeSection === 'checklist' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Your Career Milestone Checklist
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click items as you accomplish them to track your journey to job-readiness.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              {Object.values(completedItems).filter(Boolean).length} / {checklistItems.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item, idx) => {
              const isChecked = !!completedItems[item.id || `chk_${idx}`];
              return (
                <div
                  key={item.id || idx}
                  onClick={() => toggleChecklist(item.id || `chk_${idx}`)}
                  className={`p-4 rounded-xl border transition flex items-start space-x-3 cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {item.category || 'Milestone'}
                    </span>
                    <p className={`text-xs font-medium ${isChecked ? 'line-through opacity-80' : ''}`}>
                      {item.item}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
