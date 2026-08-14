import { getContexts, getCategories } from "@/app/admin/actions";
import { getTimelineEntries } from "./actions";
import TimelineClient from "./TimelineClient";

export default async function TimelinePage() {
  const initialEntries = await getTimelineEntries();
  const contextsList = await getContexts();
  const categoriesList = await getCategories();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Timeline de Atividades
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Histórico cronológico de todos os seus registros estruturados
        </p>
      </div>

      <TimelineClient
        initialEntries={initialEntries}
        contextsList={contextsList}
        categoriesList={categoriesList}
      />
    </div>
  );
}
