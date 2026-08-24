"use client";

import { useState, useTransition } from "react";
import { getTimelineEntries, updateEntry, deleteEntry, UpdateEntryPayload } from "./actions";
import { renderMarkdownText } from "@/lib/utils/markdown-renderer";
import { getChipStyle } from "@/lib/constants/chip-colors";
import {
  Calendar,
  Filter,
  FolderKanban,
  Link2,
  ExternalLink,
  CheckCircle2,
  ListTodo,
  AlertOctagon,
  MessageSquare,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
} from "lucide-react";

const PAGE_SIZE = 9;

interface TimelineClientProps {
  initialEntries: any[];
  contextsList: any[];
  categoriesList: any[];
}

function EntryCard({ entry, isExpanded, onToggle, onEdit, onDelete }: {
  entry: any;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formattedDate = new Date(entry.entryDate + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const doneItems = entry.activityItems.filter((i: any) => i.type === "done_today");
  const planItems = entry.activityItems.filter((i: any) => i.type === "plan_tomorrow");
  const blockerItems = entry.activityItems.filter((i: any) => i.type === "blocker");
  const commentItems = entry.activityItems.filter((i: any) => i.type === "comment");

  const summaryParts: string[] = [];
  if (doneItems.length) summaryParts.push(`${doneItems.length} feito${doneItems.length > 1 ? "s" : ""}`);
  if (planItems.length) summaryParts.push(`${planItems.length} planejado${planItems.length > 1 ? "s" : ""}`);
  if (blockerItems.length) summaryParts.push(`${blockerItems.length} bloqueio${blockerItems.length > 1 ? "s" : ""}`);
  if (commentItems.length) summaryParts.push(`${commentItems.length} comentário${commentItems.length > 1 ? "s" : ""}`);

  return (
    <div
      className={`bg-[#FFFFFF] border rounded-[10px] shadow-sm transition-all duration-200 ${
        isExpanded
          ? "border-[#712B13]/40 col-span-1 sm:col-span-2 md:col-span-3"
          : "border-[#D3D1C7] hover:border-[#B4B2A9]"
      }`}
    >
      {/* Card header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 space-y-2"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-[6px] bg-[#FAF9F6] border border-[#D3D1C7] text-[#712B13] shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-sm font-medium text-[#2C2C2A] capitalize truncate">
                {formattedDate}
              </h3>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#888780] shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#888780] shrink-0 mt-0.5" />
          )}
        </div>

        {/* Chips row */}
        {(entry.context || entry.entryCategories?.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {entry.context && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] border"
                style={getChipStyle(entry.context.color, "context", entry.context.textColor)}
              >
                {entry.context.name}
              </span>
            )}
            {entry.entryCategories?.map((ec: any) => (
              <span
                key={ec.category.id}
                className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] border"
                style={getChipStyle(ec.category.color, "category", ec.category.textColor)}
              >
                {ec.category.name}
              </span>
            ))}
          </div>
        )}

        {/* Summary line — only when collapsed */}
        {!isExpanded && summaryParts.length > 0 && (
          <p className="text-[11px] text-[#888780]">{summaryParts.join(" · ")}</p>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[#D3D1C7] p-4 space-y-4 bg-[#FAF9F6] rounded-b-[10px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doneItems.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-3 space-y-2">
                <h4 className="text-[11px] font-medium text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  feito hoje ({doneItems.length})
                </h4>
                <ul className="space-y-1.5">
                  {doneItems.map((item: any) => (
                    <li key={item.id} className="text-xs bg-[#FAF9F6] p-2 rounded-[6px] border border-[#D3D1C7] space-y-0.5">
                      <span className="font-medium text-[#2C2C2A] block">
                        {renderMarkdownText(item.title || item.description)}
                      </span>
                      {item.title && (
                        <span className="text-[#5F5E5A] text-[11px] block">
                          {renderMarkdownText(item.description)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {planItems.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-3 space-y-2">
                <h4 className="text-[11px] font-medium text-blue-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <ListTodo className="w-3.5 h-3.5" />
                  planejado amanhã ({planItems.length})
                </h4>
                <ul className="space-y-1.5">
                  {planItems.map((item: any) => (
                    <li key={item.id} className="text-xs bg-[#FAF9F6] p-2 rounded-[6px] border border-[#D3D1C7] space-y-0.5">
                      <span className="font-medium text-[#2C2C2A] block">
                        {renderMarkdownText(item.title || item.description)}
                      </span>
                      {item.title && (
                        <span className="text-[#5F5E5A] text-[11px] block">
                          {renderMarkdownText(item.description)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {blockerItems.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-3 space-y-2">
                <h4 className="text-[11px] font-medium text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  bloqueios ({blockerItems.length})
                </h4>
                <ul className="space-y-1.5">
                  {blockerItems.map((item: any) => (
                    <li key={item.id} className="text-xs bg-[#FAF9F6] p-2 rounded-[6px] border border-[#D3D1C7] space-y-0.5">
                      <span className="font-medium text-rose-900 block">
                        {renderMarkdownText(item.title || item.description)}
                      </span>
                      {item.title && (
                        <span className="text-[#5F5E5A] text-[11px] block">
                          {renderMarkdownText(item.description)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {commentItems.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[8px] p-3 space-y-2">
                <h4 className="text-[11px] font-medium text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />
                  comentários ({commentItems.length})
                </h4>
                <ul className="space-y-1.5">
                  {commentItems.map((item: any) => (
                    <li key={item.id} className="text-xs bg-[#FAF9F6] p-2 rounded-[6px] border border-[#D3D1C7] space-y-0.5">
                      <span className="font-medium text-[#2C2C2A] block">
                        {renderMarkdownText(item.title || item.description)}
                      </span>
                      {item.title && (
                        <span className="text-[#5F5E5A] text-[11px] block">
                          {renderMarkdownText(item.description)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {entry.artifacts?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#D3D1C7]">
              <span className="text-[11px] font-medium text-[#5F5E5A] flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-[#712B13]" />
                artefatos:
              </span>
              {entry.artifacts.map((art: any) => (
                <a
                  key={art.id}
                  href={art.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#712B13] hover:underline bg-[#FFFFFF] px-2.5 py-1 rounded-[6px] border border-[#D3D1C7] flex items-center gap-1.5"
                >
                  {art.label || art.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}

          {/* Edit / Delete actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              apagar entrada
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs text-[#712B13] border border-[#712B13]/40 hover:bg-[#712B13]/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              editar entrada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimelineClient({
  initialEntries,
  contextsList,
  categoriesList,
}: TimelineClientProps) {
  const [entriesList, setEntriesList] = useState(initialEntries);
  const [contextId, setContextId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isPending, startTransition] = useTransition();

  // Edit Modal State
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editContextId, setEditContextId] = useState("");
  const [editCategoryIds, setEditCategoryIds] = useState<string[]>([]);
  const [editActivityItems, setEditActivityItems] = useState<
    { id?: string; type: "done_today" | "plan_tomorrow" | "blocker" | "comment"; title: string; description: string }[]
  >([]);
  const [editArtifacts, setEditArtifacts] = useState<{ id?: string; label: string; url: string }[]>([]);

  const handleOpenEditModal = (entry: any) => {
    setEditingEntry(entry);
    setEditDate(entry.entryDate);
    setEditContextId(entry.contextId || "");
    setEditCategoryIds(entry.entryCategories?.map((ec: any) => ec.category.id) || []);
    setEditActivityItems(
      entry.activityItems.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title || "",
        description: item.description || "",
      }))
    );
    setEditArtifacts(
      entry.artifacts?.map((art: any) => ({
        id: art.id,
        label: art.label || "",
        url: art.url || "",
      })) || []
    );
  };

  const handleAddActivityItem = () => {
    setEditActivityItems((prev) => [
      ...prev,
      { type: "done_today", title: "", description: "" },
    ]);
  };

  const handleUpdateActivityItem = (index: number, field: string, value: string) => {
    setEditActivityItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveActivityItem = (index: number) => {
    setEditActivityItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddArtifact = () => {
    setEditArtifacts((prev) => [...prev, { label: "", url: "" }]);
  };

  const handleUpdateArtifact = (index: number, field: string, value: string) => {
    setEditArtifacts((prev) =>
      prev.map((art, i) => (i === index ? { ...art, [field]: value } : art))
    );
  };

  const handleRemoveArtifact = (index: number) => {
    setEditArtifacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;

    startTransition(async () => {
      await updateEntry({
        entryId: editingEntry.id,
        entryDate: editDate,
        contextId: editContextId || null,
        categoryIds: editCategoryIds,
        activityItems: editActivityItems,
        artifacts: editArtifacts,
      });

      setEditingEntry(null);
      // Refresh entries
      const updated = await getTimelineEntries({
        contextId: contextId || undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setEntriesList(updated);
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!window.confirm("Tem certeza que deseja apagar esta entrada? Esta ação não pode ser desfeita.")) {
      return;
    }

    startTransition(async () => {
      await deleteEntry(entryId);
      if (expandedId === entryId) setExpandedId(null);
      const updated = await getTimelineEntries({
        contextId: contextId || undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setEntriesList(updated);
    });
  };

  const handleFilter = (
    newCtx = contextId,
    newCat = categoryId,
    newStart = startDate,
    newEnd = endDate
  ) => {
    setExpandedId(null);
    setCurrentPage(1);
    startTransition(async () => {
      const data = await getTimelineEntries({
        contextId: newCtx || undefined,
        categoryId: newCat || undefined,
        startDate: newStart || undefined,
        endDate: newEnd || undefined,
      });
      setEntriesList(data);
    });
  };

  const handleReset = () => {
    setContextId("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    setExpandedId(null);
    setCurrentPage(1);
    handleFilter("", "", "", "");
  };

  const handleToggleCard = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const totalPages = Math.ceil(entriesList.length / PAGE_SIZE);
  const paginatedEntries = entriesList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Filters Bar */}
      <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-[#2C2C2A]">
            <Filter className="w-4 h-4 text-[#712B13]" />
            filtros da timeline
          </div>
          {(contextId || categoryId || startDate || endDate) && (
            <button
              onClick={handleReset}
              className="text-xs text-[#5F5E5A] hover:text-[#2C2C2A] flex items-center gap-1 bg-[#FAF9F6] px-2.5 py-1 rounded-[6px] border border-[#D3D1C7] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-[#5F5E5A] mb-1">contexto</label>
            <select
              value={contextId}
              onChange={(e) => { setContextId(e.target.value); handleFilter(e.target.value, categoryId, startDate, endDate); }}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            >
              <option value="">todos os contextos</option>
              {contextsList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-[#5F5E5A] mb-1">categoria</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); handleFilter(contextId, e.target.value, startDate, endDate); }}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            >
              <option value="">todas as categorias</option>
              {categoriesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-[#5F5E5A] mb-1">data inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); handleFilter(contextId, categoryId, e.target.value, endDate); }}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#5F5E5A] mb-1">data final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); handleFilter(contextId, categoryId, startDate, e.target.value); }}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            />
          </div>
        </div>
      </div>

      {/* Count */}
      {entriesList.length > 0 && (
        <div className="text-xs text-[#5F5E5A]">
          {entriesList.length} {entriesList.length === 1 ? "entrada encontrada" : "entradas encontradas"}
          {totalPages > 1 && ` · página ${currentPage} de ${totalPages}`}
        </div>
      )}

      {/* Grid */}
      {entriesList.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-12 text-center space-y-2 shadow-sm">
          <Calendar className="w-8 h-8 text-[#888780] mx-auto" />
          <h3 className="font-serif text-base font-medium text-[#2C2C2A]">
            nenhuma entrada encontrada
          </h3>
          <p className="text-xs text-[#5F5E5A] max-w-sm mx-auto">
            não existem registros para os filtros selecionados. tente ajustar os filtros ou registrar um novo dia.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}
        >
          {paginatedEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              isExpanded={expandedId === entry.id}
              onToggle={() => handleToggleCard(entry.id)}
              onEdit={() => handleOpenEditModal(entry)}
              onDelete={() => handleDeleteEntry(entry.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#D3D1C7] pb-3">
              <h2 className="font-serif text-lg font-medium text-[#2C2C2A] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#712B13]" />
                editar entrada
              </h2>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="p-1 text-[#888780] hover:text-[#2C2C2A] rounded-[6px]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date & Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5F5E5A] mb-1">data da entrada</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5F5E5A] mb-1">contexto</label>
                  <select
                    value={editContextId}
                    onChange={(e) => setEditContextId(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                  >
                    <option value="">sem contexto</option>
                    {contextsList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-medium text-[#5F5E5A] mb-1.5">categorias</label>
                <div className="flex flex-wrap gap-1.5">
                  {categoriesList.map((cat) => {
                    const isSelected = editCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setEditCategoryIds((prev) =>
                            isSelected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                          )
                        }
                        className={`text-xs px-2.5 py-1 rounded-[6px] border transition-all ${
                          isSelected
                            ? "bg-[#712B13] text-white border-[#712B13]"
                            : "bg-[#FAF9F6] text-[#5F5E5A] border-[#D3D1C7] hover:border-[#B4B2A9]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activity Items */}
              <div className="space-y-3 pt-2 border-t border-[#D3D1C7]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#5F5E5A] uppercase tracking-wider">
                    atividades
                  </label>
                  <button
                    type="button"
                    onClick={handleAddActivityItem}
                    className="text-xs text-[#712B13] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    adicionar item
                  </button>
                </div>

                <div className="space-y-3">
                  {editActivityItems.map((item, idx) => (
                    <div key={idx} className="bg-[#FAF9F6] border border-[#D3D1C7] rounded-[8px] p-3 space-y-2 relative">
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdateActivityItem(idx, "type", e.target.value)}
                          className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-2 py-1 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                        >
                          <option value="done_today">feito hoje</option>
                          <option value="plan_tomorrow">planejado amanhã</option>
                          <option value="blocker">bloqueio</option>
                          <option value="comment">comentário extra</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveActivityItem(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 text-xs"
                          title="Remover item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="título curto (opcional)"
                        value={item.title}
                        onChange={(e) => handleUpdateActivityItem(idx, "title", e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-2.5 py-1 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                      />

                      <textarea
                        rows={2}
                        placeholder="descrição do item (suporta markdown)"
                        value={item.description}
                        onChange={(e) => handleUpdateActivityItem(idx, "description", e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-2.5 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Artifacts */}
              <div className="space-y-3 pt-2 border-t border-[#D3D1C7]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#5F5E5A] uppercase tracking-wider">
                    artefatos / links
                  </label>
                  <button
                    type="button"
                    onClick={handleAddArtifact}
                    className="text-xs text-[#712B13] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    adicionar link
                  </button>
                </div>

                <div className="space-y-2">
                  {editArtifacts.map((art, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Rótulo (ex: PR #123)"
                        value={art.label}
                        onChange={(e) => handleUpdateArtifact(idx, "label", e.target.value)}
                        className="w-1/3 bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-2.5 py-1 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={art.url}
                        onChange={(e) => handleUpdateArtifact(idx, "url", e.target.value)}
                        className="flex-1 bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-2.5 py-1 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveArtifact(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D3D1C7]">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-xs text-[#5F5E5A] hover:text-[#2C2C2A] bg-[#FAF9F6] border border-[#D3D1C7] rounded-[6px]"
              >
                cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isPending}
                className="px-4 py-2 text-xs font-medium text-white bg-[#712B13] hover:bg-[#5A220F] rounded-[6px] flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setExpandedId(null); }}
            disabled={currentPage === 1}
            className="p-2 rounded-[6px] border border-[#D3D1C7] text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => { setCurrentPage(page); setExpandedId(null); }}
              className={`w-8 h-8 text-xs rounded-[6px] border transition-all ${
                page === currentPage
                  ? "bg-[#712B13] text-white border-[#712B13]"
                  : "border-[#D3D1C7] text-[#5F5E5A] hover:bg-[#FAF9F6]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); setExpandedId(null); }}
            disabled={currentPage === totalPages}
            className="p-2 rounded-[6px] border border-[#D3D1C7] text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#FAF9F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
