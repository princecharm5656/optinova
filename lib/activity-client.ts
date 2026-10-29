export async function logActivity(action: string, metadata: Record<string, any> = {}) {
  try {
    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, metadata }),
    });
  } catch {
    // Silent fail - don't break UX
  }
}
