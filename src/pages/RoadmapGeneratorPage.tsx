import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Loader2,
  Building2,
  GraduationCap,
  Clock,
  Target,
  Code2,
  User,
  AlertCircle,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import {
  PAKISTANI_UNIVERSITIES,
  DEGREE_PROGRAMS,
  GRADUATION_STATUSES,
  CAREER_FIELDS,
  SKILL_PRESETS,
} from '../data/pakistanConstants';
import { RoadmapInputData, RoadmapOutputData } from '../types';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';

interface RoadmapGeneratorPageProps {
  onRoadmapGenerated: (data: RoadmapOutputData, input: RoadmapInputData, savedId?: string) => void;
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
}

export const RoadmapGeneratorPage: React.FC<RoadmapGeneratorPageProps> = ({
  onRoadmapGenerated,
  onOpenAuth,
}) => {
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState<RoadmapInputData>({
    fullName: profile?.full_name || '',
    university: profile?.university || 'FAST National University (NUCES)',
    degree: profile?.degree || 'BS Computer Science',
    graduationStatus: profile?.current_status || 'Final Year Student (7th/8th Semester)',
    currentSkills: ['JavaScript', 'HTML/CSS', 'C++ / OOP', 'Basic SQL'],
    skillLevel: 'Beginner',
    experienceLevel: 'Student',
    careerGoal: 'Become a high-earning Full Stack Web Developer in Pakistan or Global Remote',
    preferredField: 'Full-Stack Software Engineering',
    weeklyHours: 18,
    targetJobRole: 'Junior Full-Stack Software Engineer',
  });

  const [skillInput, setSkillInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick preset loader
  const applyPreset = (preset: {
    role: string;
    field: string;
    goal: string;
    skills: string[];
  }) => {
    setFormData((prev) => ({
      ...prev,
      targetJobRole: preset.role,
      preferredField: preset.field,
      careerGoal: preset.goal,
      currentSkills: preset.skills,
    }));
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!formData.currentSkills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        currentSkills: [...prev.currentSkills, skillInput.trim()],
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      currentSkills: prev.currentSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.targetJobRole || !formData.careerGoal) {
      setErrorMsg('Please specify your target job role and career goal.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate roadmap from AI service.');
      }

      // Save to database if user is logged in
      let savedId: string | undefined = undefined;
      if (user) {
        try {
          const savedRecord = await dbService.saveRoadmap({
            user_id: user.id,
            title: `${formData.targetJobRole} Roadmap (${formData.university || 'CS Graduate'})`,
            career_goal: formData.careerGoal,
            input_data: formData,
            roadmap_data: data,
          });
          savedId = savedRecord.id;
        } catch (dbErr) {
          console.warn('Database save warning:', dbErr);
        }
      }

      onRoadmapGenerated(data, formData, savedId);
    } catch (err: any) {
      console.error('Roadmap error:', err);
      setErrorMsg(err.message || 'An error occurred while communicating with Gemini AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="roadmap-generator-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Powered by Google Gemini 3.7 Flash</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AI Career Roadmap Generator
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Tailored specifically for Pakistani CS/IT students and fresh graduates. Get a week-by-week plan with local tech platforms, certifications, portfolio projects, and PKR salary estimates.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="mb-8 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Role Presets (Click to autofill):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                role: 'Junior Full-Stack Engineer',
                field: 'Full-Stack Software Engineering',
                goal: 'Land a junior full-stack developer job in a top Pakistani software house (Systems, 10Pearls, Arbisoft)',
                skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git'],
              })
            }
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition cursor-pointer"
          >
            💻 Full-Stack Web
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                role: 'AI / Machine Learning Engineer',
                field: 'Artificial Intelligence & Machine Learning',
                goal: 'Work as an applied AI & LLM Engineer building real-world AI applications and pipelines',
                skills: ['Python', 'Pandas/NumPy', 'Machine Learning Basics', 'SQL', 'FastAPI'],
              })
            }
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition cursor-pointer"
          >
            🤖 AI / ML Engineer
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                role: 'DevOps & Cloud Associate',
                field: 'Cloud Computing & DevOps',
                goal: 'Join a high-growth tech firm managing AWS/GCP infrastructure and CI/CD pipelines',
                skills: ['Linux / Bash', 'Docker Basics', 'Git', 'Networking Fundamentals', 'Python'],
              })
            }
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition cursor-pointer"
          >
            ☁️ Cloud & DevOps
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                role: 'Associate Mobile App Developer (Flutter/React Native)',
                field: 'Mobile Application Development',
                goal: 'Build cross-platform mobile apps for Pakistani FinTech or global startups',
                skills: ['Flutter / Dart', 'React Native Basics', 'REST APIs', 'Firebase', 'Git'],
              })
            }
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition cursor-pointer"
          >
            📱 Mobile Developer
          </button>
        </div>
      </div>

      {errorMsg && (
        <div id="roadmap-gen-error" className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-start space-x-3 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <strong className="block font-semibold">Generation Notice:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Section 1: Personal & Education */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>1. Academic Background in Pakistan</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                id="roadmap-fullname-input"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Ali Ahmed"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pakistani University / Institute
              </label>
              <select
                id="roadmap-university-select"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {PAKISTANI_UNIVERSITIES.map((uni, idx) => (
                  <option key={idx} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Degree Program
              </label>
              <select
                id="roadmap-degree-select"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {DEGREE_PROGRAMS.map((deg, idx) => (
                  <option key={idx} value={deg}>
                    {deg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Status / Semester
              </label>
              <select
                id="roadmap-status-select"
                value={formData.graduationStatus}
                onChange={(e) => setFormData({ ...formData, graduationStatus: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {GRADUATION_STATUSES.map((stat, idx) => (
                  <option key={idx} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Skills & Experience */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>2. Current Skills & Experience</span>
          </h2>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Technical Skills (Languages, Frameworks, DBs)
              </label>
              <div className="flex space-x-2">
                <input
                  id="add-skill-input"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill (e.g. Docker, Tailwind, Java) and hit Add"
                  className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Add Skill
                </button>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.currentSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Self-Assessed Skill Level
                </label>
                <select
                  id="roadmap-skill-level-select"
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner (University coursework & basic syntax)</option>
                  <option value="Intermediate">Intermediate (Built small projects & comfortable with APIs)</option>
                  <option value="Advanced">Advanced (Full-stack architecture & production deployments)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Experience Level
                </label>
                <select
                  id="roadmap-exp-level-select"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Student">Student (Currently enrolled in BS/MS)</option>
                  <option value="Fresh Graduate">Fresh Graduate (0-6 months since graduation)</option>
                  <option value="Junior / 1 yr exp">Junior Developer (6-18 months experience)</option>
                  <option value="Career Switcher">Career Switcher (Transitioning into Tech)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Goals & Study Commitment */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>3. Career Goal & Study Commitment</span>
          </h2>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Field
                </label>
                <select
                  id="roadmap-field-select"
                  value={formData.preferredField}
                  onChange={(e) => setFormData({ ...formData, preferredField: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {CAREER_FIELDS.map((f, idx) => (
                    <option key={idx} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Role *
                </label>
                <input
                  id="roadmap-target-role-input"
                  type="text"
                  required
                  value={formData.targetJobRole}
                  onChange={(e) => setFormData({ ...formData, targetJobRole: e.target.value })}
                  placeholder="e.g. Junior Full-Stack MERN Developer"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Career Goal Summary *
              </label>
              <textarea
                id="roadmap-career-goal-textarea"
                rows={2}
                required
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                placeholder="e.g. I want to clear entry tests and technical interviews at top software houses in Lahore/Islamabad with a salary of 90k+ PKR/month."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Weekly Available Study Hours: <strong className="text-indigo-600 dark:text-indigo-400">{formData.weeklyHours} hours/week</strong>
                </label>
                <span className="text-[11px] text-slate-400">
                  (~{Math.round(formData.weeklyHours / 7)} hours / day)
                </span>
              </div>
              <input
                id="roadmap-hours-range"
                type="range"
                min={5}
                max={45}
                step={1}
                value={formData.weeklyHours}
                onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5 hrs (Part-time student)</span>
                <span>20 hrs (Balanced)</span>
                <span>40+ hrs (Intensive bootcamp mode)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            id="generate-roadmap-submit-btn"
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gemini AI is analyzing Pakistan job market & crafting your roadmap...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate My Tailored Career Roadmap</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
