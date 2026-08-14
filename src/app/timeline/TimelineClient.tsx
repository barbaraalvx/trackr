"use client";

import { useState, useTransition } from "react";
import { getTimelineEntries } from "./actions";
import { renderMarkdownText } from "@/lib/utils/markdown-renderer";
import { getChipStyle } from "@/lib/constants/chip-colors";
import {
  Calendar,
  Filter,
  FolderKanban,
  Tag,
  Link2,
  ExternalLink,
  CheckCircle2,
  ListTodo,
  AlertOctagon,
  MessageSquare,
  RotateCcw,
} from "lucide-react";

interface TimelineClientProps {
  initialEntries: any[];
  contextsList: any[];
  categoriesList: any[];
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

  const [isPending, startTransition] = useTransition();

  const handleFilter = (
    newCtx = contextId,
    newCat = categoryId,
    newStart = startDate,
    newEnd = endDate
  ) => {
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
    handleFilter("", "", "", "");
  };

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
          {/* Context Filter */}
          <div>
            <label className="block text-[11px] text-[#5F5E5A] mb-1">contexto</label>
            <select
              value={contextId}
              onChange={(e) => {
                setContextId(e.target.value);
                handleFilter(e.target.value, categoryId, startDate, endDate);
              }}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            >
              <option value="">todos os contextos</option>
              {contextsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] text-[#5F5E5A] mb-1">categoria</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                handleFilter(contextId, e.target.value, startDate, endDate);
              }}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            >
              <option value="">todas as categorias</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-[11px] text-[#5F5E5A] mb-1">data inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                handleFilter(contextId, categoryId, e.target.value, endDate);
              }}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-[11px] text-[#5F5E5A] mb-1">data final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleFilter(contextId, categoryId, startDate, e.target.value);
              }}
              className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
            />
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-6">
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
          entriesList.map((entry) => {
            const formattedDate = new Date(
              entry.entryDate + "T00:00:00"
            ).toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const doneItems = entry.activityItems.filter(
              (i: any) => i.type === "done_today"
            );
            const planItems = entry.activityItems.filter(
              (i: any) => i.type === "plan_tomorrow"
            );
            const blockerItems = entry.activityItems.filter(
              (i: any) => i.type === "blocker"
            );
            const commentItems = entry.activityItems.filter(
              (i: any) => i.type === "comment"
            );

            return (
              <div
                key={entry.id}
                className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 space-y-5 shadow-sm hover:border-[#B4B2A9] transition-colors"
              >
                {/* Header: Date, Context badge, Categories chips */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D3D1C7] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[6px] bg-[#FAF9F6] border border-[#D3D1C7] text-[#712B13]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-medium text-[#2C2C2A] capitalize">
                        {formattedDate}
                      </h3>
                      <span className="text-[11px] text-[#888780]">
                        log #{entry.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Context Badge (Light Shade) */}
                    {entry.context && (
                      <span
                        className="text-xs font-medium px-2.5 py-0.5 rounded-[8px] border"
                        style={getChipStyle(entry.context.color, "context")}
                      >
                        {entry.context.name}
                      </span>
                    )}

                    {/* Category Chips (Medium Shade) */}
                    {entry.entryCategories?.map((ec: any) => (
                      <span
                        key={ec.category.id}
                        className="text-xs font-medium px-2.5 py-0.5 rounded-[8px] border"
                        style={getChipStyle(ec.category.color, "category")}
                      >
                        {ec.category.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Items Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Done Today */}
                  {doneItems.length > 0 && (
                    <div className="bg-[#FAF9F6] border border-[#D3D1C7] rounded-[8px] p-4 space-y-2.5">
                      <h4 className="text-xs font-medium text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        feito hoje ({doneItems.length})
                      </h4>
                      <ul className="space-y-2">
                        {doneItems.map((item: any) => (
                          <li
                            key={item.id}
                            className="text-xs bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#D3D1C7] space-y-1"
                          >
                            <span className="font-medium text-[#2C2C2A] block">
                              {renderMarkdownText(item.title || item.description)}
                            </span>
                            {item.title && (
                              <div className="text-[#5F5E5A] block text-[11px]">
                                {renderMarkdownText(item.description)}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Plan Tomorrow */}
                  {planItems.length > 0 && (
                    <div className="bg-[#FAF9F6] border border-[#D3D1C7] rounded-[8px] p-4 space-y-2.5">
                      <h4 className="text-xs font-medium text-blue-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <ListTodo className="w-3.5 h-3.5" />
                        planejado amanhã ({planItems.length})
                      </h4>
                      <ul className="space-y-2">
                        {planItems.map((item: any) => (
                          <li
                            key={item.id}
                            className="text-xs bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#D3D1C7] space-y-1"
                          >
                            <span className="font-medium text-[#2C2C2A] block">
                              {renderMarkdownText(item.title || item.description)}
                            </span>
                            {item.title && (
                              <div className="text-[#5F5E5A] block text-[11px]">
                                {renderMarkdownText(item.description)}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Blockers */}
                  {blockerItems.length > 0 && (
                    <div className="bg-[#FAF9F6] border border-[#D3D1C7] rounded-[8px] p-4 space-y-2.5">
                      <h4 className="text-xs font-medium text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        bloqueios ({blockerItems.length})
                      </h4>
                      <ul className="space-y-2">
                        {blockerItems.map((item: any) => (
                          <li
                            key={item.id}
                            className="text-xs bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#D3D1C7] space-y-1"
                          >
                            <span className="font-medium text-rose-900 block">
                              {renderMarkdownText(item.title || item.description)}
                            </span>
                            {item.title && (
                              <div className="text-[#5F5E5A] block text-[11px]">
                                {renderMarkdownText(item.description)}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Comments */}
                  {commentItems.length > 0 && (
                    <div className="bg-[#FAF9F6] border border-[#D3D1C7] rounded-[8px] p-4 space-y-2.5">
                      <h4 className="text-xs font-medium text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5" />
                        comentários extra ({commentItems.length})
                      </h4>
                      <ul className="space-y-2">
                        {commentItems.map((item: any) => (
                          <li
                            key={item.id}
                            className="text-xs bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#D3D1C7] space-y-1"
                          >
                            <span className="font-medium text-[#2C2C2A] block">
                              {renderMarkdownText(item.title || item.description)}
                            </span>
                            {item.title && (
                              <div className="text-[#5F5E5A] block text-[11px]">
                                {renderMarkdownText(item.description)}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Artifacts Section */}
                {entry.artifacts && entry.artifacts.length > 0 && (
                  <div className="pt-2 border-t border-[#D3D1C7] flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium text-[#5F5E5A] flex items-center gap-1 mr-1">
                      <Link2 className="w-3.5 h-3.5 text-[#712B13]" />
                      artefatos:
                    </span>
                    {entry.artifacts.map((art: any) => (
                      <a
                        key={art.id}
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#712B13] hover:underline bg-[#FAF9F6] px-2.5 py-1 rounded-[6px] border border-[#D3D1C7] flex items-center gap-1.5 transition-colors"
                      >
                        <span>{art.label || art.url}</span>
                        <ExternalLink className="w-3 h-3 text-[#712B13]" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
