import { GoogleGenAI } from "@google/genai";

export interface GroupedDayData {
  date: string;
  contextName?: string;
  items: {
    type: string;
    title: string;
    description: string;
  }[];
}

export interface SummaryResult {
  summary: string;
  insights: {
    went_well: string;
    gaps: string;
    blockers_notes: string;
  };
}

export async function generateSummaryWithGemini(
  periodType: string,
  periodStart: string,
  periodEnd: string,
  groupedData: GroupedDayData[]
): Promise<SummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if API key is not set
  if (!apiKey || !apiKey.trim()) {
    const totalItems = groupedData.reduce((acc, d) => acc + d.items.length, 0);
    return {
      summary: `Resumo do período (${periodStart} a ${periodEnd}): Foram registrados ${groupedData.length} dias de atividade com um total de ${totalItems} itens.`,
      insights: {
        went_well: "Entregas registradas com frequência no período.",
        gaps: "Configure a GEMINI_API_KEY em .env.local para gerar análises profundas de IA.",
        blockers_notes: "Acompanhamento regular de impedimentos ativo.",
      },
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Você vai receber os registros estruturados de atividades de um período de trabalho (${periodType}: ${periodStart} até ${periodEnd}), agrupados por dia.

Sua tarefa é gerar:
1. Um resumo narrativo em português, em Markdown corrido, cobrindo:
   - Principais atividades e evolução do período
   - Bloqueios encontrados e se/como foram resolvidos
   - Principais entregas
2. Uma seção de análise/insights inferida a partir dos dados, cobrindo:
   - went_well: o que deu certo no período (padrões positivos, boas entregas)
   - gaps: o que pareceu faltar (lacunas, bloqueios recorrentes ou não resolvidos, gargalos)
   - blockers_notes: observações gerais sobre os bloqueios do período

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "summary": "...",
  "insights": {
    "went_well": "...",
    "gaps": "...",
    "blockers_notes": "..."
  }
}

Dados do período:
${JSON.stringify(groupedData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const parsed: SummaryResult = JSON.parse(responseText);

    if (parsed && parsed.summary && parsed.insights) {
      return parsed;
    }
  } catch (error) {
    console.error("Error generating summary with Gemini API:", error);
  }

  // Fallback on error
  return {
    summary: `Resumo do período (${periodStart} a ${periodEnd}): ${groupedData.length} dias de atividades registradas.`,
    insights: {
      went_well: "Registros realizados regularmente.",
      gaps: "Análise avançada indisponível no momento.",
      blockers_notes: "Sem observações críticas adicionais.",
    },
  };
}
