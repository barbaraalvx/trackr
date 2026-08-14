"use client";

import { useState, useTransition } from "react";
import {
  createContext,
  toggleArchiveContext,
  createCategory,
  toggleArchiveCategory,
  updateRequireConfirmation,
} from "./actions";
import { Plus, Archive, ArchiveRestore, Settings2, Tag, FolderKanban, Check } from "lucide-react";

interface AdminClientProps {
  initialContexts: any[];
  initialCategories: any[];
  initialSettings: any;
}

const colorPresets = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#64748b", // slate
];

export default function AdminClient({
  initialContexts,
  initialCategories,
  initialSettings,
}: AdminClientProps) {
  const [requireConfirm, setRequireConfirm] = useState(
    initialSettings?.requireConfirmationBeforeSave ?? true
  );
  const [isPending, startTransition] = useTransition();

  // Context form
  const [contextName, setContextName] = useState("");
  const [contextColor, setContextColor] = useState("#3b82f6");

  // Category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#10b981");

  const handleToggleSetting = (checked: boolean) => {
    setRequireConfirm(checked);
    startTransition(async () => {
      await updateRequireConfirmation(checked);
    });
  };

  const handleAddContext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextName.trim()) return;

    const formData = new FormData();
    formData.append("name", contextName);
    formData.append("color", contextColor);

    startTransition(async () => {
      await createContext(formData);
      setContextName("");
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("color", categoryColor);

    startTransition(async () => {
      await createCategory(formData);
      setCategoryName("");
    });
  };

  return (
    <div className="space-y-8">
      {/* App Settings Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-200">
              Configurações do Fluxo de Salvar
            </h2>
            <p className="text-xs text-slate-400">
              Defina como a aplicação deve se comportar ao criar novas entradas
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3.5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={requireConfirm}
            onChange={(e) => handleToggleSetting(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 bg-slate-900"
          />
          <div>
            <span className="text-sm font-medium text-slate-200">
              Revisar itens com títulos gerados por IA antes de salvar
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Quando ativo, abre um modal de confirmação para validar/editar os títulos gerados pela IA antes de gravar no banco de dados.
            </p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contexts Section */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-200">
                Contextos (Projetos)
              </h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {initialContexts.length}
            </span>
          </div>

          {/* Add Context Form */}
          <form onSubmit={handleAddContext} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={contextName}
                onChange={(e) => setContextName(e.target.value)}
                placeholder="Ex: Indicium, Pessoal, Estudos"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Criar
              </button>
            </div>

            {/* Color selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Cor:</span>
              <div className="flex items-center gap-1.5">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContextColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center ${
                      contextColor === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    {contextColor === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Contexts List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {initialContexts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Nenhum contexto cadastrado ainda.
              </p>
            ) : (
              initialContexts.map((ctx) => (
                <div
                  key={ctx.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    ctx.archived
                      ? "bg-slate-950/40 border-slate-900 text-slate-500 opacity-60"
                      : "bg-slate-950 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: ctx.color }}
                    />
                    <span className="text-sm font-medium">{ctx.name}</span>
                    {ctx.archived && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        Arquivado
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      startTransition(() =>
                        toggleArchiveContext(ctx.id, ctx.archived)
                      )
                    }
                    title={ctx.archived ? "Desarquivar" : "Arquivar"}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {ctx.archived ? (
                      <ArchiveRestore className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Tag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-slate-200">
                Categorias (Tags)
              </h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {initialCategories.length}
            </span>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Bug, Feature, Reunião"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Criar
              </button>
            </div>

            {/* Color selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Cor:</span>
              <div className="flex items-center gap-1.5">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center ${
                      categoryColor === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    {categoryColor === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {initialCategories.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Nenhuma categoria cadastrada ainda.
              </p>
            ) : (
              initialCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    cat.archived
                      ? "bg-slate-950/40 border-slate-900 text-slate-500 opacity-60"
                      : "bg-slate-950 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                    {cat.archived && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        Arquivado
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      startTransition(() =>
                        toggleArchiveCategory(cat.id, cat.archived)
                      )
                    }
                    title={cat.archived ? "Desarquivar" : "Arquivar"}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {cat.archived ? (
                      <ArchiveRestore className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
