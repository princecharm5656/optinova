// One place that decides: is a plan running, about to end, or over?
// Used by the admin pages, the account page, the banners and the API routes.

export type Plan = "free" | "pro" | "teams";
export type BillingPeriod = "monthly" | "yearly";
/** free = no paid plan (or canceled) | active = running | expiring = running, ends within EXPIRING_DAYS | expired = end date passed */
export type SubState = "free" | "active" | "expiring" | "expired";

export const EXPIRING_DAYS = 3;
/** Fixed lengths keep it predictable: "1 month" = 30 days, "1 year" = 365 days. */
export const PERIOD_DAYS: Record<BillingPeriod, number> = { monthly: 30, yearly: 365 };
const DAY = 86_400_000;

export type SubRow = {
  plan: string | null;
  status: string | null;
  started_at: string | null;
  current_period_end: string | null;
  billing_period: string | null;
} | null | undefined;

export type SubInfo = {
  state: SubState;
  plan: Plan;
  startedAt: string | null;
  endsAt: string | null;
  /** Whole days left, rounded UP (1 = less than 24 hours left). null if not running. */
  daysLeft: number | null;
  billingPeriod: BillingPeriod | null;
};

export const isRunning = (s: SubState) => s === "active" || s === "expiring";

export function describeSubscription(row: SubRow, now: Date = new Date()): SubInfo {
  const free: SubInfo = { state: "free", plan: "free", startedAt: null, endsAt: null, daysLeft: null, billingPeriod: null };
  if (!row || row.status !== "active" || (row.plan !== "pro" && row.plan !== "teams")) return free;

  const plan = row.plan as Plan;
  const billingPeriod: BillingPeriod | null =
    row.billing_period === "yearly" ? "yearly" : row.billing_period === "monthly" ? "monthly" : null;
  const base = { plan, startedAt: row.started_at, endsAt: row.current_period_end, billingPeriod };

  // No end date = not a running plan (this can never be "forever" by accident).
  const end = row.current_period_end ? new Date(row.current_period_end) : null;
  if (!end || Number.isNaN(end.getTime()) || end.getTime() <= now.getTime()) {
    return { ...base, state: "expired", daysLeft: null };
  }
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / DAY);
  return { ...base, state: daysLeft <= EXPIRING_DAYS ? "expiring" : "active", daysLeft };
}

/**
 * Dates after a payment is confirmed.
 * Still running -> the new period is ADDED to the current end (paying early never loses days).
 * Not running   -> starts now.
 */
export function nextPeriod(row: SubRow, period: BillingPeriod, now: Date = new Date()): { startedAt: Date; endsAt: Date } {
  const info = describeSubscription(row, now);
  const running = isRunning(info.state) && info.endsAt;
  const base = running ? new Date(info.endsAt as string) : now;
  const startedAt = running && info.startedAt ? new Date(info.startedAt) : now;
  return { startedAt, endsAt: new Date(base.getTime() + PERIOD_DAYS[period] * DAY) };
}

export const formatDate = (iso: string | Date | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

/** "in 2 days", "within 24 hours" ... for banners. */
export function timeLeftText(info: SubInfo, now: Date = new Date()): string {
  if (!info.endsAt) return "";
  const ms = new Date(info.endsAt).getTime() - now.getTime();
  if (ms <= 0) return "has ended";
  if (ms <= DAY) return "ends within 24 hours";
  return `ends in ${info.daysLeft} days`;
}
