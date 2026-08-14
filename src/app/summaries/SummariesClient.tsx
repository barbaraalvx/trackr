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
    { id: "daily", label: "Diário" },
    { id: "weekly", label: "Semanal" },
    { id: "biweekly", label: "Quinzenal" },
    { id: "monthly", label: "Mensal" },
    { id: "custom", label: "Sprint / Personalizado" },
  ];

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Period type selector */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex-wrap">
            {periodOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriodType(opt.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  periodType === opt.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Context & Date filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-400 shrink-0" />
              <select
                value={contextId}
                onChange={(e) => setContextId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Todos os contextos</option>
                {contextsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {periodType !== "custom" ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <input
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs text-slate-400">De:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-400">Até:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
          className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Gerando Resumo e Insights com Gemini IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Gerar Resumo da Sprint / Período</span>
            </>
          )}
        </button>
      </div>

      {/* Results Display */}
      {summaryData && summaryData.summaryRecord && (
        <div className="space-y-6">
          {/* Cache & Metadata Notice */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/60 rounded-xl p-3.5 px-5">
            <div className="flex items-center gap-2 text-xs">
              {summaryData.fromCache ? (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Database className="w-4 h-4" />
                  Resumo servido do Cache (Período Fechado)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Sparkles className="w-4 h-4" />
                  Novo Resumo Processado por IA
                </span>
              )}
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                Período: {summaryData.summaryRecord.periodStart} até {summaryData.summaryRecord.periodEnd}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isPending}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-900/60 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
              Regenerar com IA ({summaryData.summaryRecord.regeneratedCount || 0}x)
            </button>
          </div>

          {/* Metrics Cards */}
          {summaryData.summaryRecord.metricsJson && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Dias Registrados
                </div>
                <div className="text-2xl font-bold text-slate-100">
                  {summaryData.summaryRecord.metricsJson.totalEntries}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Itens Concluídos
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {summaryData.summaryRecord.metricsJson.doneCount}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Bloqueios Registrados
                </div>
                <div className="text-2xl font-bold text-rose-400">
                  {summaryData.summaryRecord.metricsJson.blockersCount}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Planejados
                </div>
                <div className="text-2xl font-bold text-indigo-400">
                  {summaryData.summaryRecord.metricsJson.planCount}
                </div>
              </div>
            </div>
          )}

          {/* Narrative Summary */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">
                Resumo Narrativo da Sprint / Período
              </h2>
            </div>

            <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {summaryData.summaryRecord.content}
            </div>
          </div>

          {/* Insights Grid */}
          {summaryData.summaryRecord.insightsJson && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Went Well */}
              <div className="bg-slate-900/60 border border-emerald-900/40 rounded-2xl p-5 backdrop-blur-sm space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  O que deu certo
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {summaryData.summaryRecord.insightsJson.went_well}
                </p>
              </div>

              {/* Gaps */}
              <div className="bg-slate-900/60 border border-amber-900/40 rounded-2xl p-5 backdrop-blur-sm space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  O que pareceu faltar
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {summaryData.summaryRecord.insightsJson.gaps}
                </p>
              </div>

              {/* Blockers Notes */}
              <div className="bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-5 backdrop-blur-sm space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Observações de Bloqueios
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
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
