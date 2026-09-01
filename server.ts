import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import * as pdfParseModule from 'pdf-parse';
import { generateLocalRoadmap, generateLocalResumeAnalysis } from './src/utils/aiEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parsers with generous limits for PDF base64 payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy Google Gen AI client helper
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Universal robust PDF text extractor supporting pdf-parse v2, legacy, and stream fallback
async function extractTextFromPdfBuffer(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  // Method 1: pdf-parse v2 class (new PDFParse({ data }))
  try {
    const pdfModule: any = pdfParseModule;
    const PDFParseClass = pdfModule?.PDFParse || pdfModule?.default?.PDFParse;
    if (PDFParseClass) {
      const parser = new PDFParseClass({ data: new Uint8Array(buffer) });
      const res = await parser.getText();
      try {
        await parser.destroy?.();
      } catch (_) {}
      const clean = (res?.text || '').replace(/-- \d+ of \d+ --/g, '').trim();
      if (clean.length >= 10) {
        return {
          text: clean,
          numPages: res?.total || (res?.pages ? res.pages.length : 1),
        };
      }
    }
  } catch (v2Err: any) {
    console.warn('PDFParse v2 extraction notice, trying fallback:', v2Err?.message);
  }

  // Method 2: Legacy pdf-parse function
  try {
    const pdfModule: any = pdfParseModule;
    const fn = typeof pdfModule === 'function' ? pdfModule : (typeof pdfModule?.default === 'function' ? pdfModule.default : null);
    if (fn) {
      const res = await fn(buffer);
      const clean = (res?.text || '').trim();
      if (clean.length >= 10) {
        return {
          text: clean,
          numPages: res?.numpages || 1,
        };
      }
    }
  } catch (fnErr: any) {
    console.warn('Legacy pdf-parse function notice:', fnErr?.message);
  }

  // Method 3: Direct PDF stream text operator extraction (Tj and TJ operators)
  try {
    const raw = buffer.toString('latin1');
    const chunks: string[] = [];
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(raw)) !== null) {
      const cleaned = match[1].replace(/\\([()\\])/g, '$1').trim();
      if (cleaned.length > 0) chunks.push(cleaned);
    }
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    while ((match = arrayTjRegex.exec(raw)) !== null) {
      const inner = match[1];
      const innerMatches = inner.match(/\(([^)]+)\)/g);
      if (innerMatches) {
        for (const m of innerMatches) {
          const c = m.slice(1, -1).replace(/\\([()\\])/g, '$1').trim();
          if (c.length > 0) chunks.push(c);
        }
      }
    }
    const fullText = chunks.join(' ').trim();
    if (fullText.length >= 15) {
      return {
        text: fullText,
        numPages: 1,
      };
    }
  } catch (rawErr: any) {
    console.warn('Raw text stream extraction notice:', rawErr?.message);
  }

  throw new Error('Unable to extract legible text from this PDF. Please ensure it is not a flat image-only scan or password-protected.');
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const key = process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(key && key !== 'MY_GEMINI_API_KEY' && key.trim() !== ''),
  });
});

// 1. PDF Parsing Endpoint
app.post('/api/parse-pdf', async (req: Request, res: Response) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No PDF data provided.' });
    }

    // Strip data url prefix if present robustly
    const base64Idx = base64Data.indexOf('base64,');
    const cleanBase64 = base64Idx !== -1 ? base64Data.substring(base64Idx + 7) : base64Data;
    const buffer = Buffer.from(cleanBase64.trim(), 'base64');

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'The uploaded file appears to be empty.' });
    }

    const { text, numPages } = await extractTextFromPdfBuffer(buffer);

    return res.json({
      text,
      numPages,
      fileName: fileName || 'Uploaded_Resume.pdf',
    });
  } catch (err: any) {
    console.error('PDF extraction error:', err?.message);
    return res.status(422).json({
      error: 'Failed to extract text from the PDF document. It may be a scanned image without selectable text, or corrupted. You can switch to the "Paste Resume Text" tab or load the sample resume to test immediately.',
      details: err?.message,
    });
  }
});

// 2. Career Roadmap Generation Endpoint
app.post('/api/generate-roadmap', async (req: Request, res: Response) => {
  try {
    const input = req.body;

    if (!input || !input.careerGoal || !input.targetJobRole) {
      return res.status(400).json({ error: 'Invalid input. Career goal and target job role are required.' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `
You are an expert Chief Technology Career Advisor specializing in the Pakistani Tech Ecosystem, software houses (Lahore, Islamabad/Rawalpindi, Karachi, Faisalabad, Peshawar), multinational tech firms, and global remote opportunities.

Generate a comprehensive, personalized, realistic, and highly actionable Career Roadmap for a Pakistani CS/IT student or graduate.

USER PROFILE:
- Full Name: ${input.fullName || 'Student'}
- University: ${input.university || 'Pakistani University'}
- Degree/Program: ${input.degree || 'BS Computer Science'}
- Graduation Status / Current Semester: ${input.graduationStatus || 'Final Year / Fresh Graduate'}
- Current Skills: ${Array.isArray(input.currentSkills) ? input.currentSkills.join(', ') : input.currentSkills || 'Basics'}
- Self-Assessed Skill Level: ${input.skillLevel || 'Beginner'}
- Experience Level: ${input.experienceLevel || 'Student'}
- Desired Career Goal: ${input.careerGoal}
- Target Job Role: ${input.targetJobRole}
- Preferred Field: ${input.preferredField || 'Software Engineering'}
- Weekly Available Study Hours: ${input.weeklyHours || 15} hours/week

PAKISTANI CONTEXT REQUIREMENTS:
1. Ground all recommendations in the real Pakistani job market (entry-level hiring at Systems Ltd, 10Pearls, Arbisoft, Contour Software, Afiniti, i2c, Netsol, Devsinc, VentureDive, local startups, and freelance/remote platforms).
2. Integrate Pakistani learning initiatives (DigiSkills.pk, NAVTTC, PIAIC) alongside global platforms (Coursera with Financial Aid, edX, freeCodeCamp, YouTube in Urdu/English).
3. Provide realistic PKR salary ranges for Pakistan market (Entry level fresh graduate, Junior with 1 yr experience, Mid-level with 2-3 yrs). Clearly note that these are estimated market ranges.
4. Ensure the roadmap is tailored specifically to their current skills and gaps rather than generic fluff.

OUTPUT JSON FORMAT ONLY with the following exact schema:
{
  "careerGoal": "${input.careerGoal}",
  "targetJobRole": "${input.targetJobRole}",
  "summary": "2-3 concise paragraphs summarizing the tailored plan, current strengths, and timeline to market-readiness in Pakistan.",
  "currentSkillAssessment": [
    { "skill": "Skill name", "level": "Proficient | Developing | Basic", "commentary": "Brief analysis of how this helps their goal" }
  ],
  "skillGaps": [
    { "skill": "Missing critical skill", "importance": "High | Medium | Low", "reason": "Why Pakistani tech employers demand this", "estimatedTimeToLearn": "e.g., 2 weeks" }
  ],
  "recommendedTechnologies": [
    { "category": "Core Stack", "tools": ["tool1", "tool2"] },
    { "category": "Databases & Cloud", "tools": ["tool3", "tool4"] },
    { "category": "DevOps & Tools", "tools": ["tool5", "tool6"] }
  ],
  "learningPhases": [
    {
      "phaseNumber": 1,
      "title": "Phase 1 — Foundations & Core Competencies",
      "duration": "e.g., Weeks 1-4 (4 Weeks)",
      "topics": ["topic1", "topic2", "topic3"],
      "tasks": ["task1", "task2"],
      "expectedOutcome": "Tangible milestone achieved at the end of phase"
    },
    {
      "phaseNumber": 2,
      "title": "Phase 2 — Advanced Concepts & Production Tools",
      "duration": "e.g., Weeks 5-8 (4 Weeks)",
      "topics": ["topic1", "topic2", "topic3"],
      "tasks": ["task1", "task2"],
      "expectedOutcome": "Tangible milestone"
    },
    {
      "phaseNumber": 3,
      "title": "Phase 3 — Industry-Grade Architecture & Testing",
      "duration": "e.g., Weeks 9-12 (4 Weeks)",
      "topics": ["topic1", "topic2"],
      "tasks": ["task1", "task2"],
      "expectedOutcome": "Tangible milestone"
    },
    {
      "phaseNumber": 4,
      "title": "Phase 4 — Portfolio Projects & Deployment",
      "duration": "e.g., Weeks 13-16 (4 Weeks)",
      "topics": ["topic1", "topic2"],
      "tasks": ["task1", "task2"],
      "expectedOutcome": "Live deployed portfolio"
    },
    {
      "phaseNumber": 5,
      "title": "Phase 5 — Interview Preparation & Job Applications",
      "duration": "e.g., Weeks 17-20 (4 Weeks)",
      "topics": ["topic1", "topic2"],
      "tasks": ["task1", "task2"],
      "expectedOutcome": "Job offers and interviewing confidence"
    }
  ],
  "weeklyPlan": [
    { "week": 1, "focus": "Weekly focus title", "tasks": ["Specific action 1", "Specific action 2"], "milestone": "End of week milestone" },
    { "week": 2, "focus": "Weekly focus title", "tasks": ["Specific action 1", "Specific action 2"], "milestone": "End of week milestone" },
    { "week": 3, "focus": "Weekly focus title", "tasks": ["Specific action 1", "Specific action 2"], "milestone": "End of week milestone" },
    { "week": 4, "focus": "Weekly focus title", "tasks": ["Specific action 1", "Specific action 2"], "milestone": "End of week milestone" },
    { "week": 5, "focus": "Weekly focus title", "tasks": ["Specific action 1", "Specific action 2"], "milestone": "End of week milestone" },
    { "week": 6, "focus": "Weekly focus title", "tasks": ["Specific action 1", "Specific action 2"], "milestone": "End of week milestone" },
    { "week": 7, "focus": "Weekly focus title", "tasks": ["Specific action 1", "Specific action 2"], "milestone": "End of week milestone" },
    { "week": 8, "focus": "Weekly focus title", "tasks": ["Specific action 1", "Specific action 2"], "milestone": "End of week milestone" }
  ],
  "recommendedCertifications": [
    {
      "name": "Certification Name",
      "provider": "e.g., Meta / AWS / Google / DigiSkills.pk",
      "costType": "Free | Paid | Financial Aid Available | Govt Funded (DigiSkills/NAVTTC)",
      "whyUseful": "How it helps in Pakistan job market"
    }
  ],
  "portfolioProjects": [
    {
      "title": "Project Name (e.g. Pakistani E-Commerce Logistics Hub or Local FinTech Dashboard)",
      "difficulty": "Beginner | Intermediate | Advanced",
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "learningOutcome": "What this proves to technical recruiters in Pakistan"
    }
  ],
  "interviewPreparation": {
    "technicalTopics": ["DSA topic", "System design fundamental", "Framework internals"],
    "commonQuestions": ["Technical question 1", "Technical question 2", "Pakistani company HR question"],
    "codingPrepTips": ["LeetCode strategy", "Clean code tips"],
    "softSkills": ["Communication in technical interviews", "Salary negotiation etiquette in Pakistan"]
  },
  "jobSearchStrategy": {
    "pakistaniJobPlatforms": [
      { "name": "LinkedIn Pakistan", "url": "https://www.linkedin.com/jobs", "description": "How to optimize profile for Pakistani tech recruiters" },
      { "name": "Rozee.pk", "url": "https://www.rozee.pk", "description": "Applying for local software house openings" },
      { "name": "Mustakbil.com", "url": "https://www.mustakbil.com", "description": "Finding graduate internships" }
    ],
    "localLearningResources": [
      { "name": "DigiSkills.pk / NAVTTC", "description": "Government supported skill enhancement" },
      { "name": "Coursera Financial Aid", "description": "How to apply for 100% financial assistance in Pakistan" }
    ],
    "resumeTips": ["One page standard", "Include live GitHub and Vercel/Render URLs", "Highlight Final Year Project (FYP)"],
    "applicationStrategy": ["Custom cover notes", "Referral outreach on LinkedIn", "Cold email tech leads"]
  },
  "salaryExpectationsPKR": {
    "entryLevel": "PKR 60,000 – PKR 110,000 / month",
    "junior": "PKR 110,000 – PKR 190,000 / month",
    "midLevel": "PKR 200,000 – PKR 380,000+ / month",
    "disclaimer": "Salary figures are approximate market estimates in Pakistan based on tier-1 and tier-2 software houses in major cities (Lahore, Karachi, Islamabad) and may vary based on individual problem-solving skills, English fluency, and company tier."
  },
  "careerChecklist": [
    { "id": "chk_1", "category": "Portfolio", "item": "Host 2+ full-stack production projects with clean README and live demo links." },
    { "id": "chk_2", "category": "LinkedIn", "item": "Optimize LinkedIn headline with target role and key technologies; connect with 50+ Pakistani tech leads." },
    { "id": "chk_3", "category": "Resume", "item": "Format single-page ATS resume with quantifiable metrics and zero spelling errors." },
    { "id": "chk_4", "category": "DSA", "item": "Solve top 50 LeetCode / HackerRank problems in arrays, strings, trees, and dynamic programming." },
    { "id": "chk_5", "category": "Networking", "item": "Attend local tech meetups (GDG, FAST/NUST job fairs, DevFest Pakistan)." }
  ]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        let responseText = (response.text || '').trim();
        responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

        const parsedJson = JSON.parse(responseText);
        if (parsedJson && parsedJson.learningPhases && Array.isArray(parsedJson.learningPhases)) {
          return res.json(parsedJson);
        }
      } catch (geminiErr: any) {
        console.warn('Gemini roadmap generation fallback triggered:', geminiErr?.message);
      }
    }

    // High-fidelity local AI engine fallback
    const localResult = generateLocalRoadmap(input);
    return res.json(localResult);
  } catch (err: any) {
    console.error('Roadmap generation error:', err?.message);
    try {
      const fallback = generateLocalRoadmap(req.body || {});
      return res.json(fallback);
    } catch (fatalErr: any) {
      return res.status(500).json({
        error: 'Something went wrong while generating your career roadmap. Please try again.',
        details: fatalErr?.message,
      });
    }
  }
});

// 3. Resume ATS Analyzer Endpoint
app.post('/api/analyze-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText, fileName, targetRole } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({
        error: 'Resume text is required and must contain meaningful content.',
      });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `
You are an expert ATS (Applicant Tracking System) Specialist and Senior Technical Recruiter who evaluates resumes for top software companies, tech startups, and global remote organizations, with deep familiarity with Pakistani CS/IT graduates.

Carefully and thoroughly analyze the following resume text.
Target Job Role: ${targetRole || 'Software Engineer / Computer Science Graduate'}
Resume File Name: ${fileName || 'Resume.pdf'}

RESUME TEXT CONTENT:
"""
${resumeText.slice(0, 15000)}
"""

Evaluate the resume on:
1. ATS Compatibility (standard headings, machine readability, single column, contact format)
2. Technical & Soft Skills (clarity, modern tech relevance, depth)
3. Project & Work Experience (STAR method, quantifiable achievements, numbers/percentages vs passive duties)
4. Education & Certifications
5. Keywords & Job Match
6. Formatting & Layout consistency
7. Grammar, Tone & Action Verbs
8. Professional Impact & Summary

Provide realistic, tough, actionable feedback with a calculated ATS score between 0 and 100 based on true market criteria.

OUTPUT STRICT JSON ONLY with the following exact schema:
{
  "fileName": "${fileName || 'Resume.pdf'}",
  "targetRole": "${targetRole || 'Software Engineer'}",
  "atsScore": 76,
  "categoryScores": {
    "atsCompatibility": 80,
    "skills": 75,
    "experience": 68,
    "education": 90,
    "keywords": 65,
    "formatting": 80,
    "grammar": 88,
    "professionalImpact": 70
  },
  "strengths": [
    "Specific strong point 1",
    "Specific strong point 2",
    "Specific strong point 3"
  ],
  "weaknesses": [
    "Specific weakness 1",
    "Specific weakness 2",
    "Specific weakness 3"
  ],
  "missingKeywords": [
    "Docker", "RESTful APIs", "CI/CD", "Unit Testing", "TypeScript"
  ],
  "missingSkills": [
    "Automated Testing", "Cloud Deployment (AWS/GCP)", "Database Indexing"
  ],
  "highlightSkills": [
    "Strong skills identified that should be brought to top"
  ],
  "weakBulletPoints": [
    {
      "original": "Worked on a web application using React and Node",
      "issue": "Lacks measurable impact, scale, and specific engineering contributions",
      "improved": "Architected responsive React/Node.js web dashboard with REST APIs, reducing page load latency by 35% across 500+ active users"
    },
    {
      "original": "Responsible for database queries and bug fixes",
      "issue": "Passive 'responsible for' wording with no metric",
      "improved": "Optimized PostgreSQL relational schemas and indexed queries, cutting query execution time by 40%"
    }
  ],
  "weakActionVerbs": [
    {
      "weak": "Helped",
      "strongerAlternatives": ["Spearheaded", "Coordinated", "Engineered", "Implemented"]
    },
    {
      "weak": "Worked on",
      "strongerAlternatives": ["Developed", "Architected", "Constructed", "Optimized"]
    }
  ],
  "repeatedWords": [
    "Managed", "Created", "Good"
  ],
  "formattingIssues": [
    "Bullet points lack consistent punctuation",
    "Headers should use standard ATS names: Summary, Technical Skills, Projects, Experience, Education"
  ],
  "grammarIssues": [
    "Inconsistent tense (mixed past and present tense in previous roles)"
  ],
  "contactIssues": [
    "Ensure clickable GitHub and LinkedIn links are present without full URL clutter"
  ],
  "educationIssues": [
    "Mention expected graduation month/year and CGPA if >= 3.0"
  ],
  "projectWeaknesses": [
    "Projects lack live deployment URLs and GitHub repository links"
  ],
  "careerGapsCommentary": "Analysis of employment/academic timeline continuity.",
  "actionableIssues": [
    {
      "category": "Impact",
      "problem": "Bullet points list passive tasks instead of quantified business/engineering outcomes",
      "whyItMatters": "Recruiters and ATS score quantifiable results 3x higher than passive task descriptions",
      "recommendedFix": "Use the formula: [Action Verb] + [Specific Feature/Task] + [Tech Used] + [Measurable Result %/numbers]"
    },
    {
      "category": "Keywords",
      "problem": "Missing modern industry keywords like CI/CD, TypeScript, or Containerization",
      "whyItMatters": "ATS algorithms reject resumes that fail keyword density thresholds for software roles",
      "recommendedFix": "Add a dedicated Technical Skills matrix categorized by Languages, Frameworks, Databases, and Tools"
    },
    {
      "category": "Links",
      "problem": "No direct links to live GitHub repos or hosted demos",
      "whyItMatters": "Pakistani software houses prioritize fresh graduates who prove coding ability via verified code",
      "recommendedFix": "Add clean hyperlinks (e.g. github.com/username) to top 2 capstone projects"
    }
  ],
  "improvedProfessionalSummary": "Compelling 3-4 sentence professional summary tailored specifically to the user's background and target role.",
  "improvedBulletExamples": [
    "Engineered scalable full-stack web application utilizing TypeScript, React, and PostgreSQL, containerized with Docker.",
    "Integrated Google Gemini AI API into client dashboard, automating analytical workflows for 200+ daily requests."
  ],
  "recommendedKeywords": [
    "TypeScript", "RESTful APIs", "PostgreSQL", "Docker", "Git/GitHub", "State Management", "CI/CD", "Agile/Scrum"
  ],
  "recommendedSkills": [
    "TypeScript", "Docker", "Database Optimization", "Unit Testing (Jest/Cypress)"
  ],
  "improvementChecklist": [
    "Replace passive phrases ('Responsible for', 'Helped') with strong action verbs",
    "Quantify at least 3 project bullets with metrics (e.g. %, users, latency)",
    "Categorize technical skills into Languages, Frameworks, Databases, Tools",
    "Add live GitHub and deployed URLs to top projects",
    "Run spellcheck and verify single-column ATS clean layout"
  ]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });

        let responseText = (response.text || '').trim();
        responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

        const parsedJson = JSON.parse(responseText);
        if (parsedJson && typeof parsedJson.atsScore === 'number') {
          return res.json(parsedJson);
        }
      } catch (geminiErr: any) {
        console.warn('Gemini resume analysis fallback triggered:', geminiErr?.message);
      }
    }

    // High-fidelity local ATS analysis engine fallback
    const localResult = generateLocalResumeAnalysis(resumeText, fileName, targetRole);
    return res.json(localResult);
  } catch (err: any) {
    console.error('Resume analysis error:', err?.message);
    try {
      const fallback = generateLocalResumeAnalysis(req.body?.resumeText || '', req.body?.fileName || 'Resume.pdf', req.body?.targetRole);
      return res.json(fallback);
    } catch (fatalErr: any) {
      return res.status(500).json({
        error: 'Something went wrong while analyzing your resume. Please try again.',
        details: fatalErr?.message,
      });
    }
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PathPilot AI Server is running on port ${PORT}`);
  });
}

startServer();
