interface VercelRequest {
  method?: string;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== ''),
  });
}
