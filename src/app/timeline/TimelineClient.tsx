"use client";

import { useState, useTransition } from "react";
import { getTimelineEntries } from "./actions";
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
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Filter className="w-4 h-4 text-indigo-400" />
            Filtros da Timeline
          </div>
          {(contextId || categoryId || startDate || endDate) && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Context Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Contexto</label>
            <select
              value={contextId}
              onChange={(e) => {
                setContextId(e.target.value);
                handleFilter(e.target.value, categoryId, startDate, endDate);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todos os contextos</option>
              {contextsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                handleFilter(contextId, e.target.value, startDate, endDate);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todas as categorias</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                handleFilter(contextId, categoryId, e.target.value, endDate);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleFilter(contextId, categoryId, startDate, e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-6">
        {entriesList.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">
              Nenhuma entrada encontrada
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Não existem registros para os filtros selecionados. Tente ajustar os filtros ou registrar um novo dia.
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
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-5 hover:border-slate-700/80 transition-colors shadow-lg"
              >
                {/* Header: Date, Context badge, Categories chips */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100 capitalize">
                        {formattedDate}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Log #{entry.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Context Badge */}
                    {entry.context && (
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-xl border flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${entry.context.color}15`,
                          borderColor: `${entry.context.color}40`,
                          color: entry.context.color,
                        }}
                      >
                        <FolderKanban className="w-3.5 h-3.5" />
                        {entry.context.name}
                      </span>
                    )}

                    {/* Category Chips */}
                    {entry.entryCategories?.map((ec: any) => (
                      <span
                        key={ec.category.id}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg border flex items-center gap-1"
                        style={{
                          backgroundColor: `${ec.category.color}15`,
                          borderColor: `${ec.category.color}30`,
                          color: ec.category.color,
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        {ec.category.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Items Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Done Today */}
                  {doneItems.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        Feito Hoje ({doneItems.length})
                      </h4>
                      <ul className="space-y-2">
                        {doneItems.map((item: any) => (
                          <li
                            key={item.id}
                            className="text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-0.5"
                          >
                            <span className="font-semibold text-slate-200 block">
                              {item.title || item.description}
                            </span>
                            {item.title && (
                              <span className="text-slate-400 block text-[11px]">
                                {item.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Plan Tomorrow */}
                  {planItems.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <ListTodo className="w-4 h-4" />
                        Planejado para Amanhã ({planItems.length})
                      </h4>
                      <ul className="space-y-2">
                        {planItems.map((item: any) => (
                          <li
                            key={item.id}
                            className="text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-0.5"
                          >
                            <span className="font-semibold text-slate-200 block">
                              {item.title || item.description}
                            </span>
                            {item.title && (
                              <span className="text-slate-400 block text-[11px]">
                                {item.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Blockers */}
                  {blockerItems.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertOctagon className="w-4 h-4" />
                        Bloqueios ({blockerItems.length})
                      </h4>
                      <ul className="space-y-2">
                        {blockerItems.map((item: any) => (
                          <li
                            key={item.id}
                            className="text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-0.5"
                          >
                            <span className="font-semibold text-rose-300 block">
                              {item.title || item.description}
                            </span>
                            {item.title && (
                              <span className="text-slate-400 block text-[11px]">
                                {item.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Comments */}
                  {commentItems.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4" />
                        Comentários Extra ({commentItems.length})
                      </h4>
                      <ul className="space-y-2">
                        {commentItems.map((item: any) => (
                          <li
                            key={item.id}
                            className="text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-0.5"
                          >
                            <span className="font-semibold text-slate-200 block">
                              {item.title || item.description}
                            </span>
                            {item.title && (
                              <span className="text-slate-400 block text-[11px]">
                                {item.description}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Artifacts Section */}
                {entry.artifacts && entry.artifacts.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                      <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                      Artefatos:
                    </span>
                    {entry.artifacts.map((art: any) => (
                      <a
                        key={art.id}
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 hover:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800/50 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{art.label || art.url}</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
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
