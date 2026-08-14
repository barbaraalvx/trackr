import { getContexts, getCategories } from "@/app/admin/actions";
import EntryForm from "@/components/entry/EntryForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const contextsList = await getContexts();
  const categoriesList = await getCategories();

  return <EntryForm contextsList={contextsList} categoriesList={categoriesList} />;
}
