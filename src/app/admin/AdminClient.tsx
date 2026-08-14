"use client";

import { useState, useTransition } from "react";
import {
  createContext,
  toggleArchiveContext,
  createCategory,
  toggleArchiveCategory,
  updateRequireConfirmation,
} from "./actions";
import { CHIP_FAMILIES, getChipStyle } from "@/lib/constants/chip-colors";
import { Plus, Archive, ArchiveRestore, Settings2, Tag, FolderKanban, Check, Pipette } from "lucide-react";

interface AdminClientProps {
  initialContexts: any[];
  initialCategories: any[];
  initialSettings: any;
}

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
  const [contextColor, setContextColor] = useState(CHIP_FAMILIES[0].id);

  // Category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(CHIP_FAMILIES[1].id);

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
    <div className="space-y-8 font-sans">
      {/* App Settings Card */}
      <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-[6px] bg-[#712B13]/10 text-[#712B13] border border-[#712B13]/20">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-base font-medium text-[#2C2C2A]">
              configurações do fluxo de salvar
            </h2>
            <p className="text-xs text-[#5F5E5A]">
              defina como a aplicação deve se comportar ao criar novas entradas
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 bg-[#FAF9F6] rounded-[8px] border border-[#D3D1C7]">
          <div className="pr-4">
            <span className="text-sm font-medium text-[#2C2C2A] block">
              revisar itens com títulos gerados por ia antes de salvar
            </span>
            <p className="text-xs text-[#5F5E5A] mt-0.5">
              quando ativo, abre um modal de confirmação para validar/editar os títulos gerados pela ia antes de gravar no banco de dados.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={requireConfirm}
            onClick={() => handleToggleSetting(!requireConfirm)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-[10px] border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              requireConfirm ? "bg-[#712B13]" : "bg-[#D3D1C7]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-[8px] bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                requireConfirm ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contexts Section */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 text-[#712B13]" />
              <h2 className="font-serif text-base font-medium text-[#2C2C2A]">
                contextos (projetos)
              </h2>
            </div>
            <span className="text-xs text-[#5F5E5A] bg-[#EFECE6] px-2 py-0.5 rounded-[6px] border border-[#D3D1C7]">
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
                placeholder="ex: Indicium, Pessoal, Estudos"
                className="flex-1 bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3.5 py-2 text-xs text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#712B13]"
              />
              <button
                type="submit"
                disabled={isPending}
                className="border border-[#712B13] text-[#712B13] hover:bg-[#712B13]/10 font-medium px-4 py-2 rounded-[6px] text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                criar
              </button>
            </div>

            {/* Color selector with 8 families */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#5F5E5A]">cor:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CHIP_FAMILIES.map((fam) => (
                  <button
                    key={fam.id}
                    type="button"
                    title={fam.name}
                    onClick={() => setContextColor(fam.id)}
                    style={{ backgroundColor: fam.light.bg, borderColor: fam.light.text }}
                    className={`w-5 h-5 rounded-[6px] border transition-transform flex items-center justify-center ${
                      contextColor === fam.id ? "scale-110 ring-2 ring-[#712B13] ring-offset-1" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {contextColor === fam.id && <Check className="w-3 h-3 text-[#2C2C2A]" />}
                  </button>
                ))}

                {/* Custom Color Picker */}
                <label
                  title="escolher cor personalizada"
                  className="w-5 h-5 rounded-[6px] border border-[#D3D1C7] bg-[#FAF9F6] cursor-pointer flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden"
                >
                  <Pipette className="w-3 h-3 text-[#5F5E5A]" />
                  <input
                    type="color"
                    value={contextColor.startsWith("#") ? contextColor : "#712B13"}
                    onChange={(e) => setContextColor(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </form>

          {/* Contexts List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {initialContexts.length === 0 ? (
              <p className="text-xs text-[#888780] text-center py-4">
                nenhum contexto cadastrado ainda.
              </p>
            ) : (
              initialContexts.map((ctx) => {
                const chipStyle = getChipStyle(ctx.color, "context");
                return (
                  <div
                    key={ctx.id}
                    className={`flex items-center justify-between p-2.5 rounded-[8px] border ${
                      ctx.archived
                        ? "bg-[#FAF9F6] border-[#D3D1C7] text-[#888780] opacity-60"
                        : "bg-[#FAF9F6] border-[#D3D1C7] text-[#2C2C2A]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-2.5 py-0.5 rounded-[8px] text-xs font-medium border"
                        style={chipStyle}
                      >
                        {ctx.name}
                      </span>
                      {ctx.archived && (
                        <span className="text-[10px] bg-[#EFECE6] text-[#5F5E5A] px-1.5 py-0.5 rounded-[6px]">
                          arquivado
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        startTransition(() =>
                          toggleArchiveContext(ctx.id, ctx.archived)
                        )
                      }
                      title={ctx.archived ? "desarquivar" : "arquivar"}
                      className="p-1.5 text-[#5F5E5A] hover:text-[#712B13] hover:bg-[#EFECE6] rounded-[6px] transition-colors"
                    >
                      {ctx.archived ? (
                        <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-[#712B13]" />
              <h2 className="font-serif text-base font-medium text-[#2C2C2A]">
                categorias (tags)
              </h2>
            </div>
            <span className="text-xs text-[#5F5E5A] bg-[#EFECE6] px-2 py-0.5 rounded-[6px] border border-[#D3D1C7]">
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
                placeholder="ex: Bug, Feature, Reunião"
                className="flex-1 bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3.5 py-2 text-xs text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#712B13]"
              />
              <button
                type="submit"
                disabled={isPending}
                className="border border-[#712B13] text-[#712B13] hover:bg-[#712B13]/10 font-medium px-4 py-2 rounded-[6px] text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                criar
              </button>
            </div>

            {/* Color selector with 8 families */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#5F5E5A]">cor:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CHIP_FAMILIES.map((fam) => (
                  <button
                    key={fam.id}
                    type="button"
                    title={fam.name}
                    onClick={() => setCategoryColor(fam.id)}
                    style={{ backgroundColor: fam.medium.bg, borderColor: fam.medium.text }}
                    className={`w-5 h-5 rounded-[6px] border transition-transform flex items-center justify-center ${
                      categoryColor === fam.id ? "scale-110 ring-2 ring-[#712B13] ring-offset-1" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {categoryColor === fam.id && <Check className="w-3 h-3 text-[#2C2C2A]" />}
                  </button>
                ))}

                {/* Custom Color Picker */}
                <label
                  title="escolher cor personalizada"
                  className="w-5 h-5 rounded-[6px] border border-[#D3D1C7] bg-[#FAF9F6] cursor-pointer flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden"
                >
                  <Pipette className="w-3 h-3 text-[#5F5E5A]" />
                  <input
                    type="color"
                    value={categoryColor.startsWith("#") ? categoryColor : "#712B13"}
                    onChange={(e) => setCategoryColor(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {initialCategories.length === 0 ? (
              <p className="text-xs text-[#888780] text-center py-4">
                nenhuma categoria cadastrada ainda.
              </p>
            ) : (
              initialCategories.map((cat) => {
                const chipStyle = getChipStyle(cat.color, "category");
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between p-2.5 rounded-[8px] border ${
                      cat.archived
                        ? "bg-[#FAF9F6] border-[#D3D1C7] text-[#888780] opacity-60"
                        : "bg-[#FAF9F6] border-[#D3D1C7] text-[#2C2C2A]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-2.5 py-0.5 rounded-[8px] text-xs font-medium border"
                        style={chipStyle}
                      >
                        {cat.name}
                      </span>
                      {cat.archived && (
                        <span className="text-[10px] bg-[#EFECE6] text-[#5F5E5A] px-1.5 py-0.5 rounded-[6px]">
                          arquivado
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        startTransition(() =>
                          toggleArchiveCategory(cat.id, cat.archived)
                        )
                      }
                      title={cat.archived ? "desarquivar" : "arquivar"}
                      className="p-1.5 text-[#5F5E5A] hover:text-[#712B13] hover:bg-[#EFECE6] rounded-[6px] transition-colors"
                    >
                      {cat.archived ? (
                        <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
