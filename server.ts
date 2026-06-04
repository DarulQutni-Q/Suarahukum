import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const ANALYSIS_PROMPT_BASIC = `Kamu adalah asisten hukum Indonesia senior. Analisis dokumen dalam gambar ini secara menyeluruh namun ringkas (summary-level). Jika gambar bukan merupakan dokumen hukum, kontrak, atau surat resmi terkait, set overallSafety ke "perlu_perhatian", dan kosongkan field lainnya. Jika dokumen tidak dapat dibaca, isi semua field dengan nilai kosong yang sesuai dan set overallSafety ke perlu_perhatian.`;

const ANALYSIS_PROMPT_DEEP = `Kamu adalah asisten hukum Indonesia senior. Analisis dokumen dalam gambar-gambar ini secara sangat mendalam, pasal-demi-pasal. Jika gambar bukan merupakan dokumen hukum, kontrak, atau surat resmi terkait, set overallSafety ke "perlu_perhatian", dan kosongkan field lainnya. Jika dokumen tidak dapat dibaca, isi semua field dengan nilai kosong yang sesuai dan set overallSafety ke perlu_perhatian.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    documentType: { type: Type.STRING, description: "jenis dokumen dalam 2-3 kata" },
    summary: { type: Type.STRING, description: "ringkasan dokumen dalam 2-3 kalimat bahasa Indonesia sederhana" },
    yourRights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          right: { type: Type.STRING, description: "judul hak singkat" },
          explanation: { type: Type.STRING, description: "penjelasan rinci" }
        }
      }
    },
    dangerClauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clause: { type: Type.STRING, description: "ringkasan klausul berbahaya yang spesifik" },
          risk: { type: Type.STRING, description: "kenapa berbahaya secara rinci" },
          level: { type: Type.STRING, description: "tinggi atau sedang" }
        }
      }
    },
    safeClauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clause: { type: Type.STRING, description: "ringkasan klausul menguntungkan" },
          note: { type: Type.STRING, description: "kenapa bagus untuk Anda" }
        }
      }
    },
    recommendedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "langkah tindakan" }
    },
    overallSafety: { type: Type.STRING, description: "aman atau perlu_perhatian atau berbahaya" },
    overallSafetyExplanation: { type: Type.STRING, description: "satu kalimat penjelasan penilaian keseluruhan" }
  },
  required: [
    "documentType",
    "summary",
    "yourRights",
    "dangerClauses",
    "safeClauses",
    "recommendedActions",
    "overallSafety",
    "overallSafetyExplanation"
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle base64 images
  app.use(express.json({ limit: '50mb' }));

  app.post("/api/analyze", async (req, res) => {
    try {
      const { images, plan } = req.body;
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Gambar tidak ditemukan." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Konfigurasi API belum lengkap. Hubungi pengembang." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const modelName = 'gemini-2.5-flash';
      
      const parts: any[] = images.map((img: string) => ({
        inlineData: { mimeType: "image/jpeg", data: img }
      }));
      parts.push({ text: plan === 'free' ? ANALYSIS_PROMPT_BASIC : ANALYSIS_PROMPT_DEEP });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: parts,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const text = response.text || "{}";
      res.json({ text });
    } catch (error: any) {
      console.warn("Express Route Error:", error);
      let userMessage = "Gagal memproses gambar dengan AI.";
      if (error.message?.includes('quota') || error.message?.includes('429')) {
         userMessage = "Kuota API Anda telah habis. Silakan periksa paket tagihan Gemini API Anda.";
      }
      res.status(500).json({ error: userMessage });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { question, context } = req.body;
      if (!question || !context) {
        return res.status(400).json({ error: "Pertanyaan atau konteks tidak ditemukan." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Konfigurasi API belum lengkap." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `Konteks dokumen: ${context}\n\nInstruksi:\n1. Jawablah HANYA jika pertanyaan berkaitan dengan dokumen hukum tersebut.\n2. JAWABAN MAKSIMAL 110 KATA. Harus sangat ringkas, padat, langsung merangkum poin paling penting dari pertanyaan user.\n3. DILARANG KERAS menggunakan format Markdown seperti tanda bintang (**), miring (*), angka/bullet point tebal, atau hashtag. Ketik paragraf biasa (plain text).\n\nJika pertanyaan di luar konteks, tolak dengan sopan dalam 1 kalimat.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: question,
        config: {
          temperature: 0.3,
          systemInstruction: systemInstruction
        }
      });

      let text = response.text || "";
      // Regex untuk membuang karakter markdown (bintang, underscore, hashtag)
      text = text.replace(/[*_#]/g, '');
      
      res.json({ text });
    } catch (error: any) {
      console.warn("Express Route Error:", error);
      res.status(500).json({ error: error.message || "Terjadi kesalahan server." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
