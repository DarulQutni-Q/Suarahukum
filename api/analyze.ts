import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const ANALYSIS_PROMPT_DEEP = `Kamu adalah asisten hukum Indonesia senior. Analisis dokumen dalam gambar-gambar ini secara sangat mendalam, pasal-demi-pasal. Jika gambar bukan merupakan dokumen hukum, kontrak, atau surat resmi terkait, set overallSafety ke "perlu_perhatian", dan kosongkan field lainnya. Jika dokumen tidak dapat dibaca, isi semua field dengan nilai kosong yang sesuai dan set overallSafety ke perlu_perhatian.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    documentType: { type: Type.STRING, description: 'jenis dokumen dalam 2-3 kata' },
    summary: { type: Type.STRING, description: 'ringkasan dokumen dalam 2-3 kalimat bahasa Indonesia sederhana' },
    yourRights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          right: { type: Type.STRING, description: 'judul hak singkat' },
          explanation: { type: Type.STRING, description: 'penjelasan rinci' },
        },
      },
    },
    dangerClauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clause: { type: Type.STRING, description: 'ringkasan klausul berbahaya yang spesifik' },
          risk: { type: Type.STRING, description: 'kenapa berbahaya secara rinci' },
          level: { type: Type.STRING, description: 'tinggi atau sedang' },
        },
      },
    },
    safeClauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clause: { type: Type.STRING, description: 'ringkasan klausul menguntungkan' },
          note: { type: Type.STRING, description: 'kenapa bagus untuk Anda' },
        },
      },
    },
    recommendedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: 'langkah tindakan' },
    },
    overallSafety: { type: Type.STRING, description: 'aman atau perlu_perhatian atau berbahaya' },
    overallSafetyExplanation: { type: Type.STRING, description: 'satu kalimat penjelasan penilaian keseluruhan' },
  },
  required: [
    'documentType',
    'summary',
    'yourRights',
    'dangerClauses',
    'safeClauses',
    'recommendedActions',
    'overallSafety',
    'overallSafetyExplanation',
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { images, plan } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Gambar tidak ditemukan.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Konfigurasi API belum lengkap. Hubungi pengembang.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = images.map((img: string) => ({
      inlineData: { mimeType: 'image/jpeg', data: img },
    }));
    parts.push({ text: plan === 'free' ? ANALYSIS_PROMPT_BASIC : ANALYSIS_PROMPT_DEEP });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const text = response.text || '{}';
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Analyze API Error:', error);
    let userMessage = 'Gagal memproses gambar dengan AI.';
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      userMessage = 'Kuota API Anda telah habis. Silakan periksa paket tagihan Gemini API Anda.';
    }
    return res.status(500).json({ error: userMessage });
  }
}
