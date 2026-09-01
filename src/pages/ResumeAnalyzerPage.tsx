import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Wand2,
  X,
  FileType,
} from 'lucide-react';
import { ResumeAnalysisData } from '../types';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';

interface ResumeAnalyzerPageProps {
  onAnalysisCompleted: (data: ResumeAnalysisData, savedId?: string) => void;
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
}

const SAMPLE_RESUME_TEXT = `
MUHAMMAD HAMZA
Islamabad, Pakistan | +92 300 1234567 | hamza.cs@nuces.edu.pk
LinkedIn: linkedin.com/in/muhammad-hamza | GitHub: github.com/m-hamza-dev

OBJECTIVE
Motivated Computer Science graduate from FAST-NUCES looking for an entry-level Software Engineer position where I can utilize my programming and problem solving skills to contribute to company growth.

EDUCATION
FAST - National University of Computer and Emerging Sciences (NUCES), Islamabad
Bachelor of Science in Computer Science (BS CS) — Graduated June 2024
CGPA: 3.42 / 4.00
Relevant Coursework: Data Structures & Algorithms, Database Systems, Web Engineering, Software Engineering, OOP (C++), Operating Systems.

TECHNICAL SKILLS
- Programming Languages: JavaScript (ES6+), Python, C++, SQL
- Frontend: HTML5, CSS3, React.js, Tailwind CSS
- Backend: Node.js, Express.js, REST APIs
- Databases: PostgreSQL, MongoDB, MySQL
- Tools & Version Control: Git, GitHub, VS Code, Postman

EXPERIENCE / INTERNSHIPS
Software Engineering Intern | TechSol Software House, Islamabad
June 2023 – August 2023
- Worked on client web applications using React.js and Node.js
- Helped the team fix front-end UI bugs and responsiveness issues
- Responsible for writing backend REST API endpoints for user authentication
- Collaborated with 4 team members using Git and Agile Scrum methodology

PROJECTS
1. E-Commerce Multi-Vendor Marketplace (Final Year Project)
Technologies: React, Node.js, Express, PostgreSQL, Stripe (Test mode), Tailwind CSS
- Built a complete full-stack web application with buyer and vendor dashboards.
- Implemented JWT authentication, password hashing with bcrypt, and product search with filter categories.
- Hosted frontend on Vercel and backend on Render with PostgreSQL database.

2. Student Task & GPA Tracker
Technologies: Python, Flask, SQLite, Bootstrap
- Created a student productivity portal that calculates semester SGPA/CGPA and tracks pending course assignments.
- Used SQLite for local relational database persistence.

ACHIEVEMENTS & CERTIFICATIONS
- 2nd Place in FAST ACM Speed Programming Competition (2023)
- Meta Front-End Developer Specialization (Coursera)
- DigiSkills Freelancing & WordPress Certifications
`;

export const ResumeAnalyzerPage: React.FC<ResumeAnalyzerPageProps> = ({
  onAnalysisCompleted,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('Junior Full-Stack Software Engineer');
  const [manualText, setManualText] = useState('');
  const [useManualMode, setUseManualMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = () => {
        setUseManualMode(true);
        setManualText(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsText(selectedFile);
      return;
    }
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file (.pdf format), or switch to "Paste Text" to paste your resume directly.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit.');
      return;
    }
    setErrorMsg('');
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const loadSampleResume = () => {
    setUseManualMode(true);
    setManualText(SAMPLE_RESUME_TEXT);
    setTargetRole('Junior Full-Stack Software Engineer');
    setErrorMsg('');
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let textToAnalyze = manualText.trim();
    let fileName = 'Pasted_Resume_Text.txt';

    setIsProcessing(true);

    try {
      if (!useManualMode) {
        if (!file) {
          setErrorMsg('Please select or drop a PDF resume first, or switch to paste mode.');
          setIsProcessing(false);
          return;
        }

        fileName = file.name;
        setStatusMessage('Extracting readable text from your PDF document...');

        // Convert file to Base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });

        // Call backend /api/parse-pdf
        const parseRes = await fetch('/api/parse-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data, fileName: file.name }),
        });

        const parseData = await parseRes.json();
        if (!parseRes.ok) {
          throw new Error(parseData.error || 'Failed to parse text from the PDF file.');
        }

        textToAnalyze = parseData.text;
      }

      if (!textToAnalyze || textToAnalyze.length < 50) {
        throw new Error('The resume text is too short to perform an ATS evaluation. Please provide a complete resume.');
      }

      setStatusMessage('Gemini AI is scoring ATS keywords, category weights, and bullet points...');

      // Call backend /api/analyze-resume
      const analyzeRes = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: textToAnalyze,
          fileName,
          targetRole,
        }),
      });

      const analysisData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analysisData.error || 'Failed to analyze resume with AI.');
      }

      // Save to database if user is logged in
      let savedId: string | undefined = undefined;
      if (user) {
        try {
          const saved = await dbService.saveResumeAnalysis({
            user_id: user.id,
            file_name: fileName,
            ats_score: analysisData.atsScore || 70,
            target_role: targetRole,
            analysis_data: analysisData,
          });
          savedId = saved.id;
        } catch (dbErr) {
          console.warn('Database save warning:', dbErr);
        }
      }

      onAnalysisCompleted(analysisData, savedId);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during resume analysis.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  return (
    <div id="resume-analyzer-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real ATS Engine with PDF Export</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          ATS Resume Analyzer & Scoring
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Upload your PDF resume to calculate your 0-100 ATS score, uncover missing keywords, upgrade passive bullet points, and download an audit report.
        </p>
      </div>

      {/* Mode Switch & Sample Preset */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setUseManualMode(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              !useManualMode
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📄 Upload PDF Resume
          </button>
          <button
            type="button"
            onClick={() => setUseManualMode(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              useManualMode
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ✍️ Paste Text
          </button>
        </div>

        <button
          type="button"
          onClick={loadSampleResume}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-medium transition cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Load Sample FAST CS Graduate Resume</span>
        </button>
      </div>

      {errorMsg && (
        <div id="resume-analysis-error" className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 space-y-2 text-xs text-red-700 dark:text-red-300">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong className="block font-semibold">Evaluation Notice:</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 pl-7">
            <button
              type="button"
              onClick={() => { setUseManualMode(true); setErrorMsg(''); }}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-semibold hover:underline cursor-pointer"
            >
              ✍️ Switch to Paste Text
            </button>
            <button
              type="button"
              onClick={loadSampleResume}
              className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              🪄 Load Sample FAST CS Graduate Resume
            </button>
          </div>
        </div>
      )}

      {/* Main Upload / Input Form */}
      <form onSubmit={handleAnalyze} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Target Job Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Job Role for ATS Keyword Matching *
          </label>
          <input
            id="resume-target-role-input"
            type="text"
            required
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Junior Full-Stack Software Engineer, React Developer, AI/ML Associate"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              'Junior Full-Stack Engineer',
              'React / Frontend Developer',
              'Backend Node.js Engineer',
              'Python / AI Associate',
              'Mobile Flutter Developer',
            ].map((role, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTargetRole(role)}
                className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
              >
                + {role}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone or Text Area */}
        {!useManualMode ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Upload PDF Resume File
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {!file ? (
              <div
                id="resume-dropzone"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition cursor-pointer ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Drag and drop your PDF resume here, or <span className="text-emerald-600 dark:text-emerald-400 underline">browse files</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Supports standard text-based PDF documents up to 10MB
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB • PDF Document Ready
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resume Text Content
            </label>
            <textarea
              id="resume-text-input"
              rows={12}
              required
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste your complete resume text including Education, Skills, Projects, Experience, and Certifications..."
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              {manualText.length} characters provided
            </span>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            id="analyze-resume-submit-btn"
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{statusMessage || 'Analyzing resume with Gemini AI...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze Resume & Calculate ATS Score</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
