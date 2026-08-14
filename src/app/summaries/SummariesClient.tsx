"use client";

import { useState, useTransition } from "react";
import { getOrGenerateSummary } from "./actions";
import { renderMarkdownText } from "@/lib/utils/markdown-renderer";
import {
  Sparkles,
  Calendar,
  FolderKanban,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Database,
  BarChart3,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SummariesClientProps {
  contextsList: any[];
  savedSummaries: any[];
}

const PERIOD_LABELS: Record<string, string> = {
  daily: "diário",
  weekly: "semanal",
  biweekly: "quinzenal",
  monthly: "mensal",
  custom: "sprint",
};

function SummaryDisplay({
  summaryRecord,
  fromCache,
  onRegenerate,
  isPending,
}: {
  summaryRecord: any;
  fromCache: boolean;
  onRegenerate: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Cache & Metadata Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F6] border border-[#D3D1C7] rounded-[8px] p-3.5 px-5">
        <div className="flex items-center gap-2 text-xs">
          {fromCache ? (
            <span className="flex items-center gap-1.5 text-amber-800 font-medium">
              <Database className="w-4 h-4" />
              resumo servido do cache (período fechado)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#712B13] font-medium">
              <Sparkles className="w-4 h-4" />
              novo resumo processado por ia
            </span>
          )}
          <span className="text-[#888780]">•</span>
          <span className="text-[#5F5E5A]">
            {summaryRecord.periodStart === summaryRecord.periodEnd
              ? summaryRecord.periodStart
              : `${summaryRecord.periodStart} até ${summaryRecord.periodEnd}`}
          </span>
          {summaryRecord.periodType && (
            <>
              <span className="text-[#888780]">•</span>
              <span className="text-[#5F5E5A] capitalize">
                {PERIOD_LABELS[summaryRecord.periodType] ?? summaryRecord.periodType}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isPending}
          className="text-xs text-[#712B13] hover:underline flex items-center gap-1.5 bg-[#FFFFFF] px-3 py-1.5 rounded-[6px] border border-[#D3D1C7] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          regenerar ({summaryRecord.regeneratedCount || 0}x)
        </button>
      </div>

      {/* Metrics Cards */}
      {summaryRecord.metricsJson && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5F5E5A] text-xs font-medium mb-1">
              <BarChart3 className="w-4 h-4 text-[#712B13]" />
              dias registrados
            </div>
            <div className="font-serif text-2xl font-medium text-[#2C2C2A]">
              {summaryRecord.metricsJson.totalEntries}
            </div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5F5E5A] text-xs font-medium mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              itens concluídos
            </div>
            <div className="font-serif text-2xl font-medium text-emerald-800">
              {summaryRecord.metricsJson.doneCount}
            </div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5F5E5A] text-xs font-medium mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              bloqueios
            </div>
            <div className="font-serif text-2xl font-medium text-rose-800">
              {summaryRecord.metricsJson.blockersCount}
            </div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5F5E5A] text-xs font-medium mb-1">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              planejados
            </div>
            <div className="font-serif text-2xl font-medium text-blue-800">
              {summaryRecord.metricsJson.planCount}
            </div>
          </div>
        </div>
      )}

      {/* Narrative Summary — with Markdown rendering */}
      <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-[#D3D1C7] pb-3">
          <Sparkles className="w-5 h-5 text-[#712B13]" />
          <h2 className="font-serif text-base font-medium text-[#2C2C2A]">
            resumo narrativo
          </h2>
        </div>
        <div className="text-sm text-[#2C2C2A] leading-relaxed space-y-2 font-sans">
          {summaryRecord.content
            .split("\n")
            .filter((line: string) => line.trim() !== "")
            .map((line: string, i: number) => (
              <p key={i}>{renderMarkdownText(line)}</p>
            ))}
        </div>
      </div>

      {/* Insights Grid */}
      {summaryRecord.insightsJson && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF9F6] border border-[#9FE1CB] rounded-[10px] p-5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-[#04342C] text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              o que deu certo
            </div>
            <p className="text-xs text-[#2C2C2A] leading-relaxed">
              {renderMarkdownText(summaryRecord.insightsJson.went_well)}
            </p>
          </div>
          <div className="bg-[#FAF9F6] border border-[#FAC775] rounded-[10px] p-5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-[#412402] text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              o que pareceu faltar
            </div>
            <p className="text-xs text-[#2C2C2A] leading-relaxed">
              {renderMarkdownText(summaryRecord.insightsJson.gaps)}
            </p>
          </div>
          <div className="bg-[#FAF9F6] border border-[#F5C4B3] rounded-[10px] p-5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-[#4A1B0C] text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              bloqueios
            </div>
            <p className="text-xs text-[#2C2C2A] leading-relaxed">
              {renderMarkdownText(summaryRecord.insightsJson.blockers_notes)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SummariesClient({ contextsList, savedSummaries }: SummariesClientProps) {
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "biweekly" | "monthly" | "custom">("weekly");
  const [contextId, setContextId] = useState("");
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split("T")[0]);
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split("T")[0]);

  const [currentResult, setCurrentResult] = useState<{ fromCache: boolean; summaryRecord: any } | null>(null);
  const [isPending, startTransition] = useTransition();

  // History accordion state
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const handleGenerate = (forceRegenerate = false) => {
    startTransition(async () => {
      const res = await getOrGenerateSummary({
        periodType,
        contextId: contextId || undefined,
        referenceDate,
        customStartDate: periodType === "custom" ? customStartDate : undefined,
        customEndDate: periodType === "custom" ? customEndDate : undefined,
        forceRegenerate,
      });
      setCurrentResult(res);
      // scroll to result
      setTimeout(() => document.getElementById("summary-result")?.scrollIntoView({ behavior: "smooth" }), 100);
    });
  };

  const periodOptions = [
    { id: "daily" as const, label: "diário" },
    { id: "weekly" as const, label: "semanal" },
    { id: "biweekly" as const, label: "quinzenal" },
    { id: "monthly" as const, label: "mensal" },
    { id: "custom" as const, label: "sprint / personalizado" },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Controls Bar */}
      <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Period type selector */}
          <div className="flex bg-[#FAF9F6] p-1 rounded-[8px] border border-[#D3D1C7] flex-wrap gap-0.5">
            {periodOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriodType(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[6px] transition-all ${
                  periodType === opt.id
                    ? "bg-[#712B13] text-white shadow-sm"
                    : "text-[#5F5E5A] hover:text-[#2C2C2A]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Context & Date filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#712B13] shrink-0" />
              <select
                value={contextId}
                onChange={(e) => setContextId(e.target.value)}
                className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
              >
                <option value="">todos os contextos</option>
                {contextsList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {periodType !== "custom" ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#712B13] shrink-0" />
                <input
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-[#712B13] shrink-0" />
                <span className="text-xs text-[#5F5E5A]">de:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-2.5 py-1 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                />
                <span className="text-xs text-[#5F5E5A]">até:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-2.5 py-1 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleGenerate(false)}
          disabled={isPending}
          className="w-full border border-[#712B13] text-[#712B13] hover:bg-[#712B13]/10 font-medium py-3 rounded-[6px] text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>gerando resumo e insights com gemini ia...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#712B13]" />
              <span>gerar resumo do período</span>
            </>
          )}
        </button>
      </div>

      {/* Current Result */}
      {currentResult && currentResult.summaryRecord && (
        <div id="summary-result">
          <SummaryDisplay
            summaryRecord={currentResult.summaryRecord}
            fromCache={currentResult.fromCache}
            onRegenerate={() => handleGenerate(true)}
            isPending={isPending}
          />
        </div>
      )}

      {/* Saved Summaries History */}
      {savedSummaries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#5F5E5A] uppercase tracking-wider">
            <History className="w-4 h-4 text-[#712B13]" />
            histórico de resumos salvos ({savedSummaries.length})
          </div>

          <div className="space-y-2">
            {savedSummaries.map((s) => {
              const isExpanded = expandedHistoryId === s.id;
              const periodLabel = PERIOD_LABELS[s.periodType] ?? s.periodType;
              const dateRange =
                s.periodStart === s.periodEnd
                  ? s.periodStart
                  : `${s.periodStart} → ${s.periodEnd}`;
              const generatedAt = new Date(s.generatedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={s.id}
                  className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] shadow-sm overflow-hidden"
                >
                  {/* Accordion header */}
                  <button
                    type="button"
                    onClick={() => setExpandedHistoryId(isExpanded ? null : s.id)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-[#FAF9F6] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-[6px] bg-[#712B13]/10 text-[#712B13] shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-[#2C2C2A] capitalize">
                            {periodLabel}
                          </span>
                          <span className="text-xs text-[#5F5E5A]">{dateRange}</span>
                          {s.isClosedPeriod && (
                            <span className="text-[10px] bg-[#EFECE6] text-[#5F5E5A] px-1.5 py-0.5 rounded-[6px] border border-[#D3D1C7]">
                              fechado
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#888780]">
                          gerado em {generatedAt}
                          {s.regeneratedCount > 0 && ` · ${s.regeneratedCount}x regenerado`}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#888780] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#888780] shrink-0" />
                    )}
                  </button>

                  {/* Accordion body */}
                  {isExpanded && (
                    <div className="border-t border-[#D3D1C7] p-4 pt-5 space-y-6 bg-[#FAF9F6]">
                      {/* Metrics */}
                      {s.metricsJson && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-3">
                            <div className="text-[11px] text-[#5F5E5A] mb-0.5">dias registrados</div>
                            <div className="font-serif text-xl font-medium text-[#2C2C2A]">{s.metricsJson.totalEntries}</div>
                          </div>
                          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-3">
                            <div className="text-[11px] text-[#5F5E5A] mb-0.5">concluídos</div>
                            <div className="font-serif text-xl font-medium text-emerald-800">{s.metricsJson.doneCount}</div>
                          </div>
                          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-3">
                            <div className="text-[11px] text-[#5F5E5A] mb-0.5">bloqueios</div>
                            <div className="font-serif text-xl font-medium text-rose-800">{s.metricsJson.blockersCount}</div>
                          </div>
                          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-3">
                            <div className="text-[11px] text-[#5F5E5A] mb-0.5">planejados</div>
                            <div className="font-serif text-xl font-medium text-blue-800">{s.metricsJson.planCount}</div>
                          </div>
                        </div>
                      )}

                      {/* Narrative with Markdown */}
                      <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-4 space-y-2">
                        <div className="text-xs font-medium text-[#712B13] uppercase tracking-wider mb-2">resumo narrativo</div>
                        <div className="text-xs text-[#2C2C2A] leading-relaxed space-y-1.5">
                          {s.content
                            .split("\n")
                            .filter((line: string) => line.trim() !== "")
                            .map((line: string, i: number) => (
                              <p key={i}>{renderMarkdownText(line)}</p>
                            ))}
                        </div>
                      </div>

                      {/* Insights */}
                      {s.insightsJson && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-[#FFFFFF] border border-[#9FE1CB] rounded-[8px] p-3 space-y-1">
                            <div className="text-[11px] font-semibold text-[#04342C] uppercase tracking-wider">o que deu certo</div>
                            <p className="text-xs text-[#2C2C2A] leading-relaxed">{renderMarkdownText(s.insightsJson.went_well)}</p>
                          </div>
                          <div className="bg-[#FFFFFF] border border-[#FAC775] rounded-[8px] p-3 space-y-1">
                            <div className="text-[11px] font-semibold text-[#412402] uppercase tracking-wider">o que pareceu faltar</div>
                            <p className="text-xs text-[#2C2C2A] leading-relaxed">{renderMarkdownText(s.insightsJson.gaps)}</p>
                          </div>
                          <div className="bg-[#FFFFFF] border border-[#F5C4B3] rounded-[8px] p-3 space-y-1">
                            <div className="text-[11px] font-semibold text-[#4A1B0C] uppercase tracking-wider">bloqueios</div>
                            <p className="text-xs text-[#2C2C2A] leading-relaxed">{renderMarkdownText(s.insightsJson.blockers_notes)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
