import { createClient } from "./client";

export async function logActivity(
  userId: string,
  action: string,
  metadata?: Record<string, any>
) {
  try {
    const supabase = createClient();
    await supabase.from("user_activity").insert({
      user_id: userId,
      action,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
}
