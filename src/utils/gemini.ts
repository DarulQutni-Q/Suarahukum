export async function prepareImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const maxDimension = 1400;
      let width = img.width;
      let height = img.height;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Gagal memproses gambar."));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("File bukan gambar yang valid."));
    };
    
    img.src = objectUrl;
  });
}

function parseGeminiResponse(rawText: string) {
  try {
    const parsed = JSON.parse(rawText);
    
    // Basic validation
    if (!parsed.documentType || !parsed.summary || !parsed.overallSafety || !parsed.overallSafetyExplanation) {
      throw new Error("Respons tidak memiliki field yang diwajibkan.");
    }
    
    return parsed;
  } catch (error: any) {
    console.log("PARSE ERROR DETAILED:", error, "RAW TEXT:", rawText);
    throw new Error(`Gagal mengurai hasil analisis dari AI. Pemicu: ${error.message}`);
  }
}

export async function analyzeDocument(base64Images: string[], plan: string = 'free') {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ images: base64Images, plan })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal menghubungi server.");
    }
    
    const data = await response.json();
    return parseGeminiResponse(data.text);
  } catch (error: any) {
    throw new Error(error.message || "Terjadi kesalahan saat menganalisis dokumen.");
  }
}

export async function askQuestion(question: string, context: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question, context })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal menghubungi server.");
    }
    
    const data = await response.json();
    return data.text;
  } catch (error: any) {
    throw new Error(error.message || "Terjadi kesalahan.");
  }
}
