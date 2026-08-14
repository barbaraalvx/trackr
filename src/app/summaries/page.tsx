import { getContexts } from "@/app/admin/actions";
import SummariesClient from "./SummariesClient";

export default async function SummariesPage() {
  const contextsList = await getContexts();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Resumos & Insights com IA
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gere sínteses narrativas, métricas e análises do seu trabalho por período
        </p>
      </div>

      <SummariesClient contextsList={contextsList} />
    </div>
  );
}
