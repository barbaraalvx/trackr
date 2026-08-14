"use client";

import { useState, useTransition } from "react";
import { processAndPrepareEntry, saveEntry, ItemWithTitle, ArtifactInput } from "@/app/actions/entry-actions";
import {
  PenSquare,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  FolderKanban,
  Tag,
  Link2,
  CheckCircle2,
  X,
  Edit2,
  Loader2,
} from "lucide-react";

interface EntryFormProps {
  contextsList: any[];
  categoriesList: any[];
}

export default function EntryForm({ contextsList, categoriesList }: EntryFormProps) {
  const [doneToday, setDoneToday] = useState("");
  const [planTomorrow, setPlanTomorrow] = useState("");
  const [blockers, setBlockers] = useState("");
  const [comments, setComments] = useState("");

  const [contextId, setContextId] = useState<string>("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [artifactsList, setArtifactsList] = useState<ArtifactInput[]>([]);
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [preparedData, setPreparedData] = useState<{
    rawText: string;
    entryDate: string;
    contextId?: string | null;
    categoryIds: string[];
    artifactsList: ArtifactInput[];
    items: ItemWithTitle[];
  } | null>(null);

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleAddArtifact = () => {
    setArtifactsList((prev) => [...prev, { label: "", url: "" }]);
  };

  const handleRemoveArtifact = (index: number) => {
    setArtifactsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateArtifact = (
    index: number,
    field: "label" | "url",
    value: string
  ) => {
    setArtifactsList((prev) =>
      prev.map((art, i) => (i === index ? { ...art, [field]: value } : art))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setSavedSuccess(false);

    try {
      const result = await processAndPrepareEntry({
        doneToday,
        planTomorrow,
        blockers,
        comments,
        contextId: contextId || undefined,
        categoryIds: selectedCategoryIds,
        artifactsList,
        entryDate,
      });

      if (result.requireConfirmation) {
        setPreparedData(result.preparedData);
        setReviewModalOpen(true);
      } else {
        await saveEntry(result.preparedData);
        resetForm();
        setSavedSuccess(true);
      }
    } catch (err) {
      console.error("Error submitting entry:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!preparedData) return;
    startTransition(async () => {
      await saveEntry(preparedData);
      setReviewModalOpen(false);
      setPreparedData(null);
      resetForm();
      setSavedSuccess(true);
    });
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    if (!preparedData) return;
    const updatedItems = preparedData.items.map((item, i) =>
      i === index ? { ...item, title: newTitle } : item
    );
    setPreparedData({ ...preparedData, items: updatedItems });
  };

  const resetForm = () => {
    setDoneToday("");
    setPlanTomorrow("");
    setBlockers("");
    setComments("");
    setArtifactsList([]);
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    done_today: { label: "Feito hoje", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    plan_tomorrow: { label: "Planejado amanhã", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    blocker: { label: "Bloqueio", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    comment: { label: "Comentário", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
            <PenSquare className="w-7 h-7 text-indigo-400" />
            Nova Entrada de Log
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Digite suas atividades em texto livre por campo. A IA vai nomear e organizar tudo.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">
              Entrada salva com sucesso! Você pode visualizar na Timeline ou gerar Resumos.
            </span>
          </div>
          <button
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-400 hover:text-emerald-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta Header Bar: Date, Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
          {/* Date picker */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Data da Entrada
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Context dropdown */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              Contexto (Projeto)
            </label>
            <select
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Selecione um contexto (opcional)</option>
              {contextsList
                .filter((c) => !c.archived)
                .map((ctx) => (
                  <option key={ctx.id} value={ctx.id}>
                    {ctx.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Categories Multi-Select Chips */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-3">
            <Tag className="w-4 h-4 text-emerald-400" />
            Categorias do Dia (Tags)
          </label>
          <div className="flex flex-wrap gap-2">
            {categoriesList.filter((c) => !c.archived).length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhuma categoria cadastrada. Cadastre em Admin.
              </p>
            ) : (
              categoriesList
                .filter((c) => !c.archived)
                .map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                        isSelected
                          ? "bg-slate-800 text-slate-100 shadow-sm"
                          : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                      style={{
                        borderColor: isSelected ? cat.color : undefined,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.name}</span>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Textareas */}
        <div className="space-y-4">
          {/* Done Today */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-2">
            <label className="block text-sm font-semibold text-emerald-400">
              O que fiz hoje? <span className="text-xs font-normal text-slate-400">(um item por linha/bullet)</span>
            </label>
            <textarea
              rows={4}
              value={doneToday}
              onChange={(e) => setDoneToday(e.target.value)}
              placeholder="- Corrigido bug de renderização no dashboard&#10;- Implementada integração com API de pagamentos&#10;- Reunião de alinhamento com equipe"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Plan Tomorrow */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-2">
            <label className="block text-sm font-semibold text-indigo-400">
              O que vou fazer amanhã? <span className="text-xs font-normal text-slate-400">(um item por linha/bullet)</span>
            </label>
            <textarea
              rows={3}
              value={planTomorrow}
              onChange={(e) => setPlanTomorrow(e.target.value)}
              placeholder="- Finalizar testes unitários do módulo X&#10;- Documentar endpoints da API"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Blockers */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-2">
            <label className="block text-sm font-semibold text-rose-400">
              Bloqueios / Impedimentos <span className="text-xs font-normal text-slate-400">(opcional, um item por linha)</span>
            </label>
            <textarea
              rows={2}
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="- Aguardando credenciais do ambiente de homologação"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Comments */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-2">
            <label className="block text-sm font-semibold text-amber-400">
              Comentários extra <span className="text-xs font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="- Boa evolução na sprint hoje; impedimento do backend resolvido"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Artifacts Block */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Link2 className="w-4 h-4 text-indigo-400" />
              Artefatos / Links <span className="text-slate-500 font-normal">(PRs, Docs, Figma, etc.)</span>
            </label>
            <button
              type="button"
              onClick={handleAddArtifact}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-900/60 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Artefato
            </button>
          </div>

          {artifactsList.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Nenhum artefato adicionado. Clique no botão acima para vincular PRs ou documentos.
            </p>
          ) : (
            <div className="space-y-2">
              {artifactsList.map((art, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={art.label || ""}
                    onChange={(e) =>
                      handleUpdateArtifact(idx, "label", e.target.value)
                    }
                    placeholder="Rótulo (ex: PR #123)"
                    className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="url"
                    required
                    value={art.url}
                    onChange={(e) =>
                      handleUpdateArtifact(idx, "url", e.target.value)
                    }
                    placeholder="https://github.com/..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveArtifact(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold py-3.5 rounded-2xl text-base shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processando itens com IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span>Gerar Títulos & Salvar Log</span>
            </>
          )}
        </button>
      </form>

      {/* Review Modal */}
      {reviewModalOpen && preparedData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    Revisão dos Itens & Títulos
                  </h2>
                  <p className="text-xs text-slate-400">
                    Confira ou edite os títulos gerados pela IA antes de salvar definitivamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items review list */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {preparedData.items.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Nenhum texto preenchido nos campos.
                </p>
              ) : (
                preparedData.items.map((item, idx) => {
                  const typeBadge = typeLabels[item.type];
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}
                        >
                          {typeBadge.label}
                        </span>
                      </div>

                      {/* Editable title */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                          <Edit2 className="w-3 h-3 text-indigo-400" />
                          Título Curto (IA / Editável):
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleTitleChange(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
                        {item.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 transition-colors"
              >
                Voltar e Editar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirmar & Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
