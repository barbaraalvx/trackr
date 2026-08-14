"use client";

import { useState, useTransition } from "react";
import { processAndPrepareEntry, saveEntry, ItemWithTitle, ArtifactInput } from "@/app/actions/entry-actions";
import { getChipStyle } from "@/lib/constants/chip-colors";
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
  Bold,
  Italic,
  Code,
  List,
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

  const insertMarkdown = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    prefix: string,
    suffix: string = ""
  ) => {
    setter((prev) => `${prev}${prefix}texto${suffix}`);
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

  const typeLabels: Record<string, { label: string; colorClass: string }> = {
    done_today: { label: "feito hoje", colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    plan_tomorrow: { label: "planejado amanhã", colorClass: "bg-blue-50 text-blue-800 border-blue-200" },
    blocker: { label: "bloqueio", colorClass: "bg-rose-50 text-rose-800 border-rose-200" },
    comment: { label: "comentário", colorClass: "bg-amber-50 text-amber-800 border-amber-200" },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2C2A] flex items-center gap-2.5">
            <PenSquare className="w-6 h-6 text-[#712B13]" />
            nova entrada de log
          </h1>
          <p className="text-sm text-[#5F5E5A] mt-1 font-sans">
            digite suas atividades em texto livre com suporte a markdown. a ia nomeará e organizará os itens.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#C0DD97]/30 border border-[#97C459] text-[#173404] rounded-[8px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#173404] shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              entrada salva com sucesso! você pode visualizar na timeline ou gerar resumos.
            </span>
          </div>
          <button
            onClick={() => setSavedSuccess(false)}
            className="text-[#173404] hover:opacity-75 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Data da Entrada & Contexto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-5 shadow-sm">
          {/* Date picker */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#2C2C2A] mb-2">
              <Calendar className="w-4 h-4 text-[#712B13]" />
              1. data da entrada
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3.5 py-2 text-xs sm:text-sm text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            />
          </div>

          {/* Context dropdown */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#2C2C2A] mb-2">
              <FolderKanban className="w-4 h-4 text-[#712B13]" />
              contexto (projeto)
            </label>
            <select
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3.5 py-2 text-xs sm:text-sm text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            >
              <option value="">selecione um contexto (opcional)</option>
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

        {/* 2. O que fiz hoje? */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-medium text-[#2C2C2A]">
              2. o que fiz hoje? <span className="text-xs font-normal text-[#5F5E5A]">(um item por linha)</span>
            </label>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => insertMarkdown(setDoneToday, "**", "**")} title="Negrito" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Bold className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setDoneToday, "*", "*")} title="Itálico" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Italic className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setDoneToday, "`", "`")} title="Código" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Code className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setDoneToday, "- ")} title="Lista" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <textarea
            rows={4}
            value={doneToday}
            onChange={(e) => setDoneToday(e.target.value)}
            placeholder="- Corrigido **bug de renderização** no dashboard&#10;- Implementada integração com `API` de pagamentos&#10;- Reunião de alinhamento com equipe"
            className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] p-3 text-xs sm:text-sm text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#712B13] transition-colors font-mono"
          />
        </div>

        {/* 3. O que vou fazer amanhã? */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-medium text-[#2C2C2A]">
              3. o que vou fazer amanhã? <span className="text-xs font-normal text-[#5F5E5A]">(um item por linha)</span>
            </label>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => insertMarkdown(setPlanTomorrow, "**", "**")} title="Negrito" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Bold className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setPlanTomorrow, "*", "*")} title="Itálico" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Italic className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setPlanTomorrow, "`", "`")} title="Código" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Code className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setPlanTomorrow, "- ")} title="Lista" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <textarea
            rows={3}
            value={planTomorrow}
            onChange={(e) => setPlanTomorrow(e.target.value)}
            placeholder="- Finalizar testes unitários do módulo **X**&#10;- Documentar `endpoints` da API"
            className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] p-3 text-xs sm:text-sm text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#712B13] transition-colors font-mono"
          />
        </div>

        {/* 4. Bloqueios / Impedimentos */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-medium text-[#2C2C2A]">
              4. bloqueios / impedimentos <span className="text-xs font-normal text-[#5F5E5A]">(opcional, um item por linha)</span>
            </label>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => insertMarkdown(setBlockers, "**", "**")} title="Negrito" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Bold className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setBlockers, "*", "*")} title="Itálico" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Italic className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setBlockers, "`", "`")} title="Código" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Code className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <textarea
            rows={2}
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="- Aguardando credenciais do ambiente de `homologação`"
            className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] p-3 text-xs sm:text-sm text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#712B13] transition-colors font-mono"
          />
        </div>

        {/* 5. Comentários Extra */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-medium text-[#2C2C2A]">
              5. comentários extra <span className="text-xs font-normal text-[#5F5E5A]">(opcional)</span>
            </label>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => insertMarkdown(setComments, "**", "**")} title="Negrito" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Bold className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => insertMarkdown(setComments, "*", "*")} title="Itálico" className="p-1 text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] rounded-[6px]"><Italic className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="- Boa evolução na sprint hoje; impedimento do backend resolvido"
            className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] p-3 text-xs sm:text-sm text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#712B13] transition-colors font-mono"
          />
        </div>

        {/* 6. Artefatos / Links */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-[#2C2C2A]">
              <Link2 className="w-4 h-4 text-[#712B13]" />
              6. artefatos / links <span className="text-[#5F5E5A] font-normal">(PRs, Docs, Figma, etc.)</span>
            </label>
            <button
              type="button"
              onClick={handleAddArtifact}
              className="text-xs font-medium text-[#712B13] hover:bg-[#712B13]/10 flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[#712B13]/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              adicionar artefato
            </button>
          </div>

          {artifactsList.length === 0 ? (
            <p className="text-xs text-[#888780] italic">
              nenhum artefato adicionado. clique no botão acima para vincular PRs ou documentos.
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
                    placeholder="rótulo (ex: PR #123)"
                    className="w-1/3 bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-2 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                  />
                  <input
                    type="url"
                    required
                    value={art.url}
                    onChange={(e) =>
                      handleUpdateArtifact(idx, "url", e.target.value)
                    }
                    placeholder="https://github.com/..."
                    className="flex-1 bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-2 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveArtifact(idx)}
                    className="p-2 text-[#5F5E5A] hover:text-rose-600 rounded-[6px] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. Categorias do dia (Tags) */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-5 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-medium text-[#2C2C2A] mb-3">
            <Tag className="w-4 h-4 text-[#712B13]" />
            7. categorias do dia (tags)
          </label>
          <div className="flex flex-wrap gap-2">
            {categoriesList.filter((c) => !c.archived).length === 0 ? (
              <p className="text-xs text-[#888780]">
                nenhuma categoria cadastrada. cadastre em admin.
              </p>
            ) : (
              categoriesList
                .filter((c) => !c.archived)
                .map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  const chipStyle = getChipStyle(cat.color, "category");
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`px-3 py-1 rounded-[8px] text-xs font-medium border transition-all ${
                        isSelected
                          ? "ring-2 ring-[#712B13] ring-offset-1 shadow-sm font-semibold"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      style={chipStyle}
                    >
                      {cat.name}
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full border border-[#712B13] text-[#712B13] hover:bg-[#712B13]/10 font-medium py-3 rounded-[6px] text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>processando itens com ia...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#712B13]" />
              <span>gerar títulos & salvar log</span>
            </>
          )}
        </button>
      </form>

      {/* Review Modal */}
      {reviewModalOpen && preparedData && (
        <div className="fixed inset-0 z-50 bg-[#2C2C2A]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 sm:p-8 max-w-2xl w-full shadow-xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[#D3D1C7] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-[6px] bg-[#712B13]/10 text-[#712B13] border border-[#712B13]/20">
                  <Sparkles className="w-4 h-4 text-[#712B13]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-medium text-[#2C2C2A]">
                    revisão dos itens & títulos
                  </h2>
                  <p className="text-xs text-[#5F5E5A]">
                    confira ou edite os títulos gerados pela ia antes de salvar definitivamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-[#5F5E5A] hover:text-[#2C2C2A] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items review list */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {preparedData.items.length === 0 ? (
                <p className="text-xs text-[#888780] italic text-center py-4">
                  nenhum texto preenchido nos campos.
                </p>
              ) : (
                preparedData.items.map((item, idx) => {
                  const typeBadge = typeLabels[item.type];
                  return (
                    <div
                      key={idx}
                      className="bg-[#FAF9F6] border border-[#D3D1C7] rounded-[8px] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-[6px] border ${typeBadge.colorClass}`}
                        >
                          {typeBadge.label}
                        </span>
                      </div>

                      {/* Editable title */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#5F5E5A] mb-1 flex items-center gap-1">
                          <Edit2 className="w-3 h-3 text-[#712B13]" />
                          título curto (ia / editável):
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleTitleChange(idx, e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] font-medium focus:outline-none focus:border-[#712B13]"
                        />
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#5F5E5A] bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#D3D1C7]">
                        {item.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D3D1C7]">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2.5 rounded-[6px] text-xs font-medium text-[#5F5E5A] hover:text-[#2C2C2A] bg-[#FAF9F6] border border-[#D3D1C7] transition-colors"
              >
                voltar e editar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isPending}
                className="border border-[#712B13] text-[#712B13] hover:bg-[#712B13]/10 font-medium px-6 py-2.5 rounded-[6px] text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#712B13]" />
                )}
                confirmar & salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
