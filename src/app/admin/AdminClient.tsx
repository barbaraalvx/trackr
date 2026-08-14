"use client";

import { useState, useTransition } from "react";
import {
  createContext,
  updateContext,
  toggleArchiveContext,
  deleteContext,
  createCategory,
  updateCategory,
  toggleArchiveCategory,
  deleteCategory,
  updateRequireConfirmation,
} from "./actions";
import { CHIP_FAMILIES, getChipStyle } from "@/lib/constants/chip-colors";
import {
  Plus,
  Archive,
  ArchiveRestore,
  Settings2,
  Tag,
  FolderKanban,
  Check,
  Pipette,
  Pencil,
  Trash2,
  X,
  Palette,
  Type,
} from "lucide-react";

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

  // Create forms state
  const [contextName, setContextName] = useState("");
  const [contextColor, setContextColor] = useState(CHIP_FAMILIES[0].id);
  const [contextTextColor, setContextTextColor] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(CHIP_FAMILIES[1].id);
  const [categoryTextColor, setCategoryTextColor] = useState("");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: "context" | "category";
    name: string;
    color: string;
    textColor: string;
  } | null>(null);

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
    formData.append("textColor", contextTextColor);

    startTransition(async () => {
      await createContext(formData);
      setContextName("");
      setContextTextColor("");
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("color", categoryColor);
    formData.append("textColor", categoryTextColor);

    startTransition(async () => {
      await createCategory(formData);
      setCategoryName("");
      setCategoryTextColor("");
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    const formData = new FormData();
    formData.append("name", editingItem.name);
    formData.append("color", editingItem.color);
    formData.append("textColor", editingItem.textColor);

    startTransition(async () => {
      if (editingItem.type === "context") {
        await updateContext(editingItem.id, formData);
      } else {
        await updateCategory(editingItem.id, formData);
      }
      setEditingItem(null);
    });
  };

  const handleDeleteItem = async (id: string, type: "context" | "category", name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o item "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      if (type === "context") {
        await deleteContext(id);
      } else {
        await deleteCategory(id);
      }
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

            {/* Background Color & Text Color Pickers */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-[#5F5E5A] flex items-center gap-1">
                  <Palette className="w-3 h-3 text-[#712B13]" /> cor fundo:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CHIP_FAMILIES.map((fam) => (
                    <button
                      key={fam.id}
                      type="button"
                      title={fam.name}
                      onClick={() => setContextColor(fam.id)}
                      style={{ backgroundColor: fam.light.bg, borderColor: fam.light.text }}
                      className={`w-4 h-4 rounded-[4px] border transition-transform flex items-center justify-center ${
                        contextColor === fam.id ? "scale-125 ring-2 ring-[#712B13] ring-offset-1" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {contextColor === fam.id && <Check className="w-2.5 h-2.5 text-[#2C2C2A]" />}
                    </button>
                  ))}

                  <label
                    title="cor personalizada do fundo"
                    className="w-4 h-4 rounded-[4px] border border-[#D3D1C7] bg-[#FAF9F6] cursor-pointer flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden"
                  >
                    <Pipette className="w-2.5 h-2.5 text-[#5F5E5A]" />
                    <input
                      type="color"
                      value={contextColor.startsWith("#") ? contextColor : "#F5C4B3"}
                      onChange={(e) => setContextColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Text Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#5F5E5A] flex items-center gap-1">
                  <Type className="w-3 h-3 text-[#712B13]" /> cor fonte:
                </span>
                <label className="flex items-center gap-2 cursor-pointer bg-[#FAF9F6] border border-[#D3D1C7] px-2 py-0.5 rounded-[6px] text-[11px] text-[#2C2C2A]">
                  <input
                    type="color"
                    value={contextTextColor || "#4A1B0C"}
                    onChange={(e) => setContextTextColor(e.target.value)}
                    className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                  />
                  <span>{contextTextColor ? contextTextColor : "automático"}</span>
                </label>
                {contextTextColor && (
                  <button
                    type="button"
                    onClick={() => setContextTextColor("")}
                    className="text-[10px] text-[#5F5E5A] hover:text-[#712B13]"
                  >
                    limpar
                  </button>
                )}
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
                const chipStyle = getChipStyle(ctx.color, "context", ctx.textColor);
                return (
                  <div
                    key={ctx.id}
                    className={`flex items-center justify-between p-2.5 rounded-[8px] border ${
                      ctx.archived
                        ? "bg-[#FAF9F6] border-[#D3D1C7] opacity-60"
                        : "bg-[#FAF9F6] border-[#D3D1C7]"
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

                    <div className="flex items-center gap-1">
                      {/* Edit button */}
                      <button
                        onClick={() =>
                          setEditingItem({
                            id: ctx.id,
                            type: "context",
                            name: ctx.name,
                            color: ctx.color,
                            textColor: ctx.textColor || "",
                          })
                        }
                        title="editar"
                        className="p-1.5 text-[#5F5E5A] hover:text-[#712B13] hover:bg-[#EFECE6] rounded-[6px] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Archive button */}
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

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteItem(ctx.id, "context", ctx.name)}
                        title="excluir permanentemente"
                        className="p-1.5 text-[#5F5E5A] hover:text-rose-600 hover:bg-rose-50 rounded-[6px] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

            {/* Background Color & Text Color Pickers */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-[#5F5E5A] flex items-center gap-1">
                  <Palette className="w-3 h-3 text-[#712B13]" /> cor fundo:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CHIP_FAMILIES.map((fam) => (
                    <button
                      key={fam.id}
                      type="button"
                      title={fam.name}
                      onClick={() => setCategoryColor(fam.id)}
                      style={{ backgroundColor: fam.medium.bg, borderColor: fam.medium.text }}
                      className={`w-4 h-4 rounded-[4px] border transition-transform flex items-center justify-center ${
                        categoryColor === fam.id ? "scale-125 ring-2 ring-[#712B13] ring-offset-1" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {categoryColor === fam.id && <Check className="w-2.5 h-2.5 text-[#2C2C2A]" />}
                    </button>
                  ))}

                  <label
                    title="cor personalizada do fundo"
                    className="w-4 h-4 rounded-[4px] border border-[#D3D1C7] bg-[#FAF9F6] cursor-pointer flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden"
                  >
                    <Pipette className="w-2.5 h-2.5 text-[#5F5E5A]" />
                    <input
                      type="color"
                      value={categoryColor.startsWith("#") ? categoryColor : "#F0997B"}
                      onChange={(e) => setCategoryColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Text Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#5F5E5A] flex items-center gap-1">
                  <Type className="w-3 h-3 text-[#712B13]" /> cor fonte:
                </span>
                <label className="flex items-center gap-2 cursor-pointer bg-[#FAF9F6] border border-[#D3D1C7] px-2 py-0.5 rounded-[6px] text-[11px] text-[#2C2C2A]">
                  <input
                    type="color"
                    value={categoryTextColor || "#4A1B0C"}
                    onChange={(e) => setCategoryTextColor(e.target.value)}
                    className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                  />
                  <span>{categoryTextColor ? categoryTextColor : "automático"}</span>
                </label>
                {categoryTextColor && (
                  <button
                    type="button"
                    onClick={() => setCategoryTextColor("")}
                    className="text-[10px] text-[#5F5E5A] hover:text-[#712B13]"
                  >
                    limpar
                  </button>
                )}
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
                const chipStyle = getChipStyle(cat.color, "category", cat.textColor);
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between p-2.5 rounded-[8px] border ${
                      cat.archived
                        ? "bg-[#FAF9F6] border-[#D3D1C7] opacity-60"
                        : "bg-[#FAF9F6] border-[#D3D1C7]"
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

                    <div className="flex items-center gap-1">
                      {/* Edit button */}
                      <button
                        onClick={() =>
                          setEditingItem({
                            id: cat.id,
                            type: "category",
                            name: cat.name,
                            color: cat.color,
                            textColor: cat.textColor || "",
                          })
                        }
                        title="editar"
                        className="p-1.5 text-[#5F5E5A] hover:text-[#712B13] hover:bg-[#EFECE6] rounded-[6px] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Archive button */}
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

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteItem(cat.id, "category", cat.name)}
                        title="excluir permanentemente"
                        className="p-1.5 text-[#5F5E5A] hover:text-rose-600 hover:bg-rose-50 rounded-[6px] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-[#2C2C2A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-6 max-w-md w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#D3D1C7] pb-3">
              <h3 className="font-serif text-base font-medium text-[#2C2C2A] capitalize">
                editar {editingItem.type === "context" ? "contexto" : "categoria"}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#5F5E5A] hover:text-[#2C2C2A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2C2C2A] mb-1">
                  nome
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] px-3 py-1.5 text-xs text-[#2C2C2A] focus:outline-none focus:border-[#712B13]"
                />
              </div>

              {/* Background Color Family / Custom */}
              <div>
                <label className="block text-xs font-medium text-[#2C2C2A] mb-1.5">
                  cor do fundo
                </label>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {CHIP_FAMILIES.map((fam) => (
                    <button
                      key={fam.id}
                      type="button"
                      title={fam.name}
                      onClick={() =>
                        setEditingItem({ ...editingItem, color: fam.id })
                      }
                      style={{
                        backgroundColor:
                          editingItem.type === "context" ? fam.light.bg : fam.medium.bg,
                      }}
                      className={`w-5 h-5 rounded-[4px] border transition-transform flex items-center justify-center ${
                        editingItem.color === fam.id
                          ? "ring-2 ring-[#712B13] scale-110"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {editingItem.color === fam.id && <Check className="w-3 h-3 text-[#2C2C2A]" />}
                    </button>
                  ))}

                  <label
                    title="cor personalizada do fundo"
                    className="w-5 h-5 rounded-[4px] border border-[#D3D1C7] bg-[#FAF9F6] cursor-pointer flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden"
                  >
                    <Pipette className="w-3 h-3 text-[#5F5E5A]" />
                    <input
                      type="color"
                      value={editingItem.color.startsWith("#") ? editingItem.color : "#F5C4B3"}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, color: e.target.value })
                      }
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Font Text Color */}
              <div>
                <label className="block text-xs font-medium text-[#2C2C2A] mb-1.5">
                  cor da fonte (texto)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#FAF9F6] border border-[#D3D1C7] px-2.5 py-1 rounded-[6px] text-xs text-[#2C2C2A]">
                    <input
                      type="color"
                      value={editingItem.textColor || "#4A1B0C"}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, textColor: e.target.value })
                      }
                      className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                    />
                    <span>{editingItem.textColor ? editingItem.textColor : "automático (família)"}</span>
                  </label>
                  {editingItem.textColor && (
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, textColor: "" })}
                      className="text-xs text-[#5F5E5A] hover:text-[#712B13]"
                    >
                      restaurar automático
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview Chip */}
              <div className="pt-2">
                <span className="block text-[11px] text-[#5F5E5A] mb-1">pré-visualização:</span>
                <span
                  className="px-3 py-1 rounded-[8px] text-xs font-medium border inline-block"
                  style={getChipStyle(editingItem.color, editingItem.type, editingItem.textColor)}
                >
                  {editingItem.name || "nome da tag"}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D3D1C7]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-1.5 rounded-[6px] text-xs text-[#5F5E5A] hover:text-[#2C2C2A] bg-[#FAF9F6] border border-[#D3D1C7]"
                >
                  cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="border border-[#712B13] text-[#712B13] hover:bg-[#712B13]/10 font-medium px-4 py-1.5 rounded-[6px] text-xs transition-colors disabled:opacity-50"
                >
                  salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
