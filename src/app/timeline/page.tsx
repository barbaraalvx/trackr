import { getContexts, getCategories } from "@/app/admin/actions";
import { getTimelineEntries } from "./actions";
import TimelineClient from "./TimelineClient";

export default async function TimelinePage() {
  const initialEntries = await getTimelineEntries();
  const contextsList = await getContexts();
  const categoriesList = await getCategories();

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2C2A]">
          timeline de atividades
        </h1>
        <p className="text-sm text-[#5F5E5A] mt-1">
          histórico cronológico de todos os seus registros estruturados
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
