import { getContexts, getCategories, getAppSettings } from "./actions";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const initialContexts = await getContexts();
  const initialCategories = await getCategories();
  const initialSettings = await getAppSettings();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2C2A]">
          painel de administração
        </h1>
        <p className="text-sm text-[#5F5E5A] mt-1 font-sans">
          gerencie seus contextos, categorias e preferências da aplicação
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
