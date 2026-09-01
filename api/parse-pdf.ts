interface VercelRequest {
  method?: string;
  body: any;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}
import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No PDF data provided.' });
    }

    const base64Idx = base64Data.indexOf('base64,');
    const cleanBase64 = base64Idx !== -1 ? base64Data.substring(base64Idx + 7) : base64Data;
    const buffer = Buffer.from(cleanBase64.trim(), 'base64');
    const parsed = await pdfParse(buffer);

    return res.status(200).json({
      text: (parsed.text || '').trim(),
      numPages: parsed.numpages,
      fileName: fileName || 'Uploaded_Resume.pdf',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to parse PDF', details: err?.message });
  }
}
