import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, context } = req.body;
    if (!question || !context) {
      return res.status(400).json({ error: 'Pertanyaan atau konteks tidak ditemukan.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Konfigurasi API belum lengkap.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `Konteks dokumen: ${context}\n\nInstruksi:\n1. Jawablah HANYA jika pertanyaan berkaitan dengan dokumen hukum tersebut.\n2. JAWABAN MAKSIMAL 110 KATA. Harus sangat ringkas, padat, langsung merangkum poin paling penting dari pertanyaan user.\n3. DILARANG KERAS menggunakan format Markdown seperti tanda bintang (**), miring (*), angka/bullet point tebal, atau hashtag. Ketik paragraf biasa (plain text).\n\nJika pertanyaan di luar konteks, tolak dengan sopan dalam 1 kalimat.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        temperature: 0.3,
        systemInstruction: systemInstruction,
      },
    });

    let text = response.text || '';
    // Buang karakter markdown (bintang, underscore, hashtag)
    text = text.replace(/[*_#]/g, '');

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan server/Quota Limit.' });
  }
}
