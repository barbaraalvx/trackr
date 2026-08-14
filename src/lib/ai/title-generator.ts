import { GoogleGenAI } from "@google/genai";

export interface ItemForTitle {
  index: number;
  type: string;
  description: string;
}

export interface GeneratedTitle {
  index: number;
  title: string;
}

export async function generateTitlesForItems(
  items: ItemForTitle[]
): Promise<GeneratedTitle[]> {
  if (!items || items.length === 0) return [];

  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if API key is not configured yet
  if (!apiKey || !apiKey.trim()) {
    return items.map((item) => ({
      index: item.index,
      title: item.description.split(" ").slice(0, 7).join(" "),
    }));
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Você vai receber uma lista de itens de log de atividades de trabalho, em português.
Para cada item, gere um "title" curto (até 8 palavras), objetivo, que nomeie a atividade.
Não altere nem resuma a descrição original.

DIRETRIZ IMPORTANTE: sempre que a descrição contiver informações sobre impacto, resultado ou valor gerado pela atividade (ex: bug corrigido que afetava X usuários, feature que reduziu tempo de Y, documentação que desbloqueou o time), priorize capturar esse valor no título. Isso ajudará a profissional a se posicionar e se comunicar melhor futuramente.

Resposta ESTRITAMENTE em formato JSON com o seguinte esquema:
[
  { "index": 0, "title": "..." },
  { "index": 1, "title": "..." }
]

Itens:
${JSON.stringify(items, null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const parsed: GeneratedTitle[] = JSON.parse(responseText);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error("Error generating titles with Gemini API:", error);
  }

  // Fallback on error
  return items.map((item) => ({
    index: item.index,
    title: item.description.split(" ").slice(0, 7).join(" "),
  }));
}
