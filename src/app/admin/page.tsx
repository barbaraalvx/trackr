import { getContexts, getCategories, getAppSettings } from "./actions";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const initialContexts = await getContexts();
  const initialCategories = await getCategories();
  const initialSettings = await getAppSettings();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Painel de Administração
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerencie seus contextos, categorias e preferências da aplicação
        </p>
      </div>

      <AdminClient
        initialContexts={initialContexts}
        initialCategories={initialCategories}
        initialSettings={initialSettings}
      />
    </div>
  );
}
