interface VercelRequest {
  method?: string;
  body: any;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}
import { GoogleGenAI } from '@google/genai';
import { generateLocalRoadmap } from '../src/utils/aiEngine';

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

  const input = req.body;
  if (!input || !input.careerGoal || !input.targetJobRole) {
    return res.status(400).json({ error: 'Career goal and target job role are required.' });
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
1. Ground all recommendations in the real Pakistani job market (Systems Ltd, 10Pearls, Arbisoft, Contour Software, Devsinc, local startups, and freelance/remote platforms).
2. Integrate Pakistani learning initiatives (DigiSkills.pk, NAVTTC, PIAIC) alongside global platforms (Coursera with Financial Aid, edX, freeCodeCamp, YouTube in Urdu/English).
3. Provide realistic PKR salary ranges for Pakistan market.
4. Ensure the roadmap is tailored specifically to their current skills and gaps.

OUTPUT JSON ONLY.
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
      if (parsedJson && parsedJson.learningPhases) {
        return res.status(200).json(parsedJson);
      }
    } catch (err: any) {
      console.warn('Vercel Gemini roadmap notice, falling back:', err?.message);
    }
  }

  const localResult = generateLocalRoadmap(input);
  return res.status(200).json(localResult);
}
