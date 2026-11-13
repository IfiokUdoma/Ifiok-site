
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/admin");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin");
  }

  return <EditorClient />;
}
