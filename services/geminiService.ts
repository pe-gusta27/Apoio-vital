import { GoogleGenAI } from "@google/genai";

export interface AudioData {
  data: string;
  mimeType: string;
}

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY não configurada no ambiente.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getEmergencyGuidance = async (scenario: string, audio?: AudioData) => {
  const ai = getAIClient();
  
  const systemInstruction = `
    Você é o ApoioVital, um assistente especializado em fornecer instruções de emergência para pessoas com deficiência ou necessidades especiais.
    Seu tom deve ser CALMO, DIRETO e CLARO.
    Use frases curtas.
    Forneça instruções passo a passo.
    Se a situação parecer uma emergência médica grave, comece SEMPRE dizendo para ligar para o 192 (SAMU) ou 193 (Bombeiros).
    Adapte as orientações considerando que o usuário pode ter limitações físicas, sensoriais ou cognitivas.
    Responda em Português do Brasil.
  `;

  const parts: any[] = [];
  
  if (audio) {
    parts.push({
      inlineData: {
        data: audio.data,
        mimeType: audio.mimeType
      }
    });
  }
  
  if (scenario) {
    parts.push({ text: scenario });
  } else if (audio) {
    parts.push({ text: "Analise o áudio acima e forneça orientações de primeiros socorros imediatas para a situação descrita." });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: parts.length > 0 ? parts : [{ text: "Olá" }] },
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    if (!response.text) throw new Error("Resposta vazia da IA");
    return response.text;
  } catch (error) {
    console.error("Erro ao obter orientação da IA:", error);
    throw error;
  }
};

export const editImageWithPrompt = async (base64ImageData: string, mimeType: string, prompt: string) => {
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const returnedMimeType = part.inlineData.mimeType || 'image/png';
          return `data:${returnedMimeType};base64,${base64EncodeString}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
};