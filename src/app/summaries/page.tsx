import { getContexts } from "@/app/admin/actions";
import SummariesClient from "./SummariesClient";

export const dynamic = "force-dynamic";

export default async function SummariesPage() {
  const contextsList = await getContexts();

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2C2A]">
          resumos & insights com ia
        </h1>
        <p className="text-sm text-[#5F5E5A] mt-1">
          gere sínteses narrativas, métricas e análises do seu trabalho por período
        </p>
      </div>

      <SummariesClient contextsList={contextsList} />
    </div>
  );
}
