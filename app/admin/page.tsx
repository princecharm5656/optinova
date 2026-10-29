"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, Activity, DollarSign, TrendingUp, Mail, Globe, Sparkles } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  proUsers: number;
  totalUsage: number;
  recentUsers: UserDetail[];
  toolUsage: Record<string, number>;
  revenue: { total: number; count: number };
}

interface UserDetail {
  id: string;
  email: string;
  created_at: string;
  last_sign_in: string | null;
  email_confirmed: boolean;
  status: string;
  plan: string;
  tool_usage_count: number;
  country: string;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { data: authData } = await supabase.auth.admin.listUsers();
      const users = authData?.users || [];

      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("status", "active");

      const [captions, hashtags, bios, emails, stories] = await Promise.all([
        supabase.from("captions_history").select("*"),
        supabase.from("hashtags_history").select("*"),
        supabase.from("bios_history").select("*"),
        supabase.from("emails_history").select("*"),
        supabase.from("stories_history").select("*"),
      ]);

      const allUsage = [
        ...(captions.data || []),
        ...(hashtags.data || []),
        ...(bios.data || []),
        ...(emails.data || []),
        ...(stories.data || []),
      ];

      const toolUsage: Record<string, number> = {
        caption: 0,
        hashtag: 0,
        bio: 0,
        email: 0,
        story: 0,
      };

      allUsage.forEach((item: any) => {
        if (item.tool_type && toolUsage[item.tool_type] !== undefined) {
          toolUsage[item.tool_type]++;
        }
      });

      const recentUsers: UserDetail[] = users.map((u: any) => {
        const sub = subs?.find((s: any) => s.user_id === u.id);
        const userUsage = allUsage.filter((item: any) => item.user_id === u.id);

        return {
          id: u.id,
          email: u.email || "N/A",
          created_at: u.created_at,
          last_sign_in: u.last_sign_in_at || null,
          email_confirmed: u.email_confirmed_at ? true : false,
          status: sub ? "pro" : "free",
          plan: sub?.plan || "free",
          tool_usage_count: userUsage.length,
          country: u.user_metadata?.country || "Unknown",
        };
      });

      const proCount = subs?.length || 0;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const activeUsers = users.filter(
        (u: any) => u.last_sign_in_at && new Date(u.last_sign_in_at) > sevenDaysAgo
      ).length;

      setData({
        totalUsers: users.length,
        activeUsers,
        proUsers: proCount,
        totalUsage: allUsage.length,
        recentUsers,
        toolUsage,
        revenue: { total: proCount * 9, count: proCount },
      });

      setLoading(false);
    } catch (error) {
      console.error("Analytics error:", error);
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Section background="base" className="py-12 min-h-screen text-text-base">
        <Container>
          <div className="text-center py-20">
            <p className="text-cyan-accent">Loading admin dashboard...</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-text-muted mt-1">Complete analytics & user management</p>
            </div>
            <Button onClick={loadAnalytics} variant="outline" size="sm">
              Refresh Data
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Users}
              label="Total Users"
              value={data.totalUsers}
              color="cyan"
            />
            <MetricCard
              icon={Activity}
              label="Active (7d)"
              value={data.activeUsers}
              color="purple"
            />
            <MetricCard
              icon={DollarSign}
              label="MRR"
              value={`$${data.revenue.total}`}
              color="green"
            />
            <MetricCard
              icon={Sparkles}
              label="AI Usage"
              value={data.totalUsage}
              color="orange"
            />
          </div>

          {/* Tool Usage */}
          <div className="bg-elevated border border-base-color rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-orange-400" />
              Tool Usage
            </h2>
            <div className="space-y-3">
              {Object.entries(data.toolUsage).map(([tool, count]) => {
                const total = Object.values(data.toolUsage).reduce((s, v) => s + v, 0);
                const percent = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={tool}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-base capitalize text-sm">{tool}</span>
                      <span className="text-cyan-accent text-sm">
                        {count} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-base rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-accent to-purple-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Details Table */}
          <div className="bg-elevated border border-base-color rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-accent" />
                All Users ({data.recentUsers.length})
              </h2>
              <Button
                onClick={() => {
                  const csv = [
                    ["Email", "Status", "Joined", "Last Sign In", "Usage"],
                    ...data.recentUsers.map((u) => [
                      u.email,
                      u.status,
                      u.created_at,
                      u.last_sign_in || "Never",
                      u.tool_usage_count,
                    ]),
                  ];
                  const csvContent = csv.map((row) => row.join(",")).join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `optinova-users-${Date.now()}.csv`;
                  a.click();
                }}
                size="sm"
                className="bg-cyan-accent text-black"
              >
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-base-color">
                    <th className="text-left py-3 px-2 text-text-muted">Email</th>
                    <th className="text-left py-3 px-2 text-text-muted">Status</th>
                    <th className="text-left py-3 px-2 text-text-muted">Joined</th>
                    <th className="text-left py-3 px-2 text-text-muted">Last Sign In</th>
                    <th className="text-left py-3 px-2 text-text-muted">Usage</th>
                    <th className="text-left py-3 px-2 text-text-muted">Country</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-base-color/50">
                      <td className="py-3 px-2 text-text-base">{user.email}</td>
                      <td className="py-3 px-2">
                        {user.status === "pro" ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-cyan-accent/20 text-cyan-accent">
                            Pro
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-base text-text-muted">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-text-muted text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-text-muted text-xs">
                        {user.last_sign_in
                          ? new Date(user.last_sign_in).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="py-3 px-2 text-cyan-accent font-semibold">
                        {user.tool_usage_count}
                      </td>
                      <td className="py-3 px-2 text-text-muted text-xs">
                        {user.country}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.recentUsers.length === 0 && (
                <p className="text-center text-text-muted py-8">No users yet</p>
              )}
            </div>
          </div>

          <p className="text-xs text-text-muted text-center">
            Founded by Ram Dhingana · OptiNova Admin Panel
          </p>

        </div>
      </Container>
    </Section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClass: Record<string, string> = {
    cyan: "text-cyan-accent bg-cyan-accent/10",
    purple: "text-purple-400 bg-purple-400/10",
    green: "text-green-400 bg-green-400/10",
    orange: "text-orange-400 bg-orange-400/10",
  };

  return (
    <div className="bg-elevated border border-base-color rounded-2xl p-6">
      <div className={`inline-flex p-3 rounded-xl ${colorClass[color] || colorClass.cyan} mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-text-muted text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
