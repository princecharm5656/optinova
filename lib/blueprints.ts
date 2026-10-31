import { createClient } from "@/lib/supabase/server";
import type { Blueprint } from "@/lib/magic/types";

/**
 * Saves a generated blueprint for the logged-in user (row-level security applies).
 * Never throws: if saving fails the user still gets their blueprint, just without history.
 */
export async function saveBlueprint(prompt: string, blueprint: Blueprint): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blueprints")
      .insert({ prompt, title: blueprint.meta.businessName, data: blueprint })
      .select("id")
      .single();
    if (error) {
      console.error("[blueprints] save failed:", error.code, error.message);
      return null;
    }
    return data.id as string;
  } catch (e: any) {
    console.error("[blueprints] save crashed:", e?.message || e);
    return null;
  }
}
