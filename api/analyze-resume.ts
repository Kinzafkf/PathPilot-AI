interface VercelRequest {
  method?: string;
  body: any;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}
import { GoogleGenAI } from '@google/genai';
import { generateLocalResumeAnalysis } from '../src/utils/aiEngine';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resumeText, fileName, targetRole } = req.body;
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
    return res.status(400).json({ error: 'Resume text is required and must contain meaningful content.' });
  }

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `
You are an expert ATS Specialist and Technical Recruiter for Pakistani and global tech companies.
Analyze this resume text:
Target Role: ${targetRole || 'Software Engineer'}
File: ${fileName || 'Resume.pdf'}

RESUME TEXT:
"""
${resumeText.slice(0, 15000)}
"""

OUTPUT STRICT JSON ONLY with ATS score (0-100), category breakdown, strengths, weaknesses, missing keywords, bullet improvements, and actionable fixes.
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
        return res.status(200).json(parsedJson);
      }
    } catch (err: any) {
      console.warn('Vercel Gemini resume notice, falling back:', err?.message);
    }
  }

  const localResult = generateLocalResumeAnalysis(resumeText, fileName, targetRole);
  return res.status(200).json(localResult);
}
