"use client";

import { useState, useTransition } from "react";
import { getOrGenerateSummary } from "./actions";
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
} from "lucide-react";

interface SummariesClientProps {
  contextsList: any[];
}

export default function SummariesClient({ contextsList }: SummariesClientProps) {
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "biweekly" | "monthly" | "custom">("weekly");
  const [contextId, setContextId] = useState("");
  const [referenceDate, setReferenceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [summaryData, setSummaryData] = useState<{
    fromCache: boolean;
    summaryRecord: any;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

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
      setSummaryData(res);
    });
  };

  const periodOptions: { id: "daily" | "weekly" | "biweekly" | "monthly" | "custom"; label: string }[] = [
    { id: "daily", label: "diário" },
    { id: "weekly", label: "semanal" },
    { id: "biweekly", label: "quinzenal" },
    { id: "monthly", label: "mensal" },
    { id: "custom", label: "sprint / personalizado" },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Controls Bar */}
      <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Period type selector */}
          <div className="flex bg-[#FAF9F6] p-1 rounded-[8px] border border-[#D3D1C7] flex-wrap">
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
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
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
              <div className="flex items-center gap-2">
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

        {/* Generate Button */}
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
              <span>gerar resumo da sprint / período</span>
            </>
          )}
        </button>
      </div>

      {/* Results Display */}
      {summaryData && summaryData.summaryRecord && (
        <div className="space-y-6">
          {/* Cache & Metadata Notice */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F6] border border-[#D3D1C7] rounded-[8px] p-3.5 px-5">
            <div className="flex items-center gap-2 text-xs">
              {summaryData.fromCache ? (
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
                período: {summaryData.summaryRecord.periodStart} até {summaryData.summaryRecord.periodEnd}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isPending}
              className="text-xs text-[#712B13] hover:underline flex items-center gap-1.5 bg-[#FFFFFF] px-3 py-1.5 rounded-[6px] border border-[#D3D1C7] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
              regenerar com ia ({summaryData.summaryRecord.regeneratedCount || 0}x)
            </button>
          </div>

          {/* Metrics Cards */}
          {summaryData.summaryRecord.metricsJson && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#5F5E5A] text-xs font-medium mb-1">
                  <BarChart3 className="w-4 h-4 text-[#712B13]" />
                  dias registrados
                </div>
                <div className="font-serif text-2xl font-medium text-[#2C2C2A]">
                  {summaryData.summaryRecord.metricsJson.totalEntries}
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#5F5E5A] text-xs font-medium mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  itens concluídos
                </div>
                <div className="font-serif text-2xl font-medium text-emerald-800">
                  {summaryData.summaryRecord.metricsJson.doneCount}
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#5F5E5A] text-xs font-medium mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  bloqueios registrados
                </div>
                <div className="font-serif text-2xl font-medium text-rose-800">
                  {summaryData.summaryRecord.metricsJson.blockersCount}
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#5F5E5A] text-xs font-medium mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  planejados
                </div>
                <div className="font-serif text-2xl font-medium text-blue-800">
                  {summaryData.summaryRecord.metricsJson.planCount}
                </div>
              </div>
            </div>
          )}

          {/* Narrative Summary */}
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-[#D3D1C7] pb-3">
              <Sparkles className="w-5 h-5 text-[#712B13]" />
              <h2 className="font-serif text-base font-medium text-[#2C2C2A]">
                resumo narrativo da sprint / período
              </h2>
            </div>

            <div className="prose max-w-none text-sm text-[#2C2C2A] leading-relaxed whitespace-pre-line font-sans">
              {summaryData.summaryRecord.content}
            </div>
          </div>

          {/* Insights Grid */}
          {summaryData.summaryRecord.insightsJson && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Went Well */}
              <div className="bg-[#FAF9F6] border border-[#9FE1CB] rounded-[10px] p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#04342C] text-xs font-semibold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  o que deu certo
                </div>
                <p className="text-xs text-[#2C2C2A] leading-relaxed">
                  {summaryData.summaryRecord.insightsJson.went_well}
                </p>
              </div>

              {/* Gaps */}
              <div className="bg-[#FAF9F6] border border-[#FAC775] rounded-[10px] p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#412402] text-xs font-semibold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  o que pareceu faltar
                </div>
                <p className="text-xs text-[#2C2C2A] leading-relaxed">
                  {summaryData.summaryRecord.insightsJson.gaps}
                </p>
              </div>

              {/* Blockers Notes */}
              <div className="bg-[#FAF9F6] border border-[#F5C4B3] rounded-[10px] p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#4A1B0C] text-xs font-semibold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  observações de bloqueios
                </div>
                <p className="text-xs text-[#2C2C2A] leading-relaxed">
                  {summaryData.summaryRecord.insightsJson.blockers_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
