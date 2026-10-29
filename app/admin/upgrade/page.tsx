"use client";

import { useState, useEffect } from "react";
import { Mail, Check, Clock, X } from "lucide-react";
import Container from "@/components/shared/container";
import Section from "@/components/wrapper/section";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface PendingUser {
  id: string;
  email: string;
  created_at: string;
  status: string;
}

export default function AdminUpgradePage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const supabase = createClient();

    // Get all users with their subscription status
    const { data: profiles } = await supabase
      .from("user_subscriptions")
      .select("user_id, status, created_at");

    const { data: authUsers } = await supabase.auth.admin.listUsers();

    const enriched = (authUsers?.users || []).map((u) => {
      const sub = profiles?.find((p) => p.user_id === u.id);
      return {
        id: u.id,
        email: u.email || "",
        created_at: u.created_at,
        status: sub?.status || "free",
      };
    });

    setUsers(enriched);
    setLoading(false);
  };

  const upgradeUser = async (userId: string, plan: string) => {
    const supabase = createClient();

    await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      plan,
      status: "active",
      updated_at: new Date().toISOString(),
    });

    alert(`✅ User upgraded to ${plan}!`);
    loadUsers();
  };

  const cancelSubscription = async (userId: string) => {
    if (!confirm("Cancel this user's subscription?")) return;

    const supabase = createClient();

    await supabase
      .from("user_subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    alert("❌ Subscription canceled");
    loadUsers();
  };

  return (
    <Section background="base" className="py-12 min-h-screen text-text-base">
      <Container>
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin: Manage Subscriptions</h1>
            <p className="text-text-muted mt-1">
              Upgrade users manually after bank transfer verification
            </p>
          </div>

          {loading ? (
            <p className="text-text-muted">Loading...</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-elevated border border-base-color rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {user.status === "active" ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                          ⭐ Active
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-base text-text-muted border border-base-color">
                          Free
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {user.status === "active" ? (
                      <Button
                        onClick={() => cancelSubscription(user.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => upgradeUser(user.id, "pro")}
                          size="sm"
                          className="bg-cyan-accent text-black"
                        >
                          → Pro
                        </Button>
                        <Button
                          onClick={() => upgradeUser(user.id, "teams")}
                          size="sm"
                          variant="outline"
                          className="border-purple-500/50 text-purple-400"
                        >
                          → Teams
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <p className="text-text-muted text-center py-8">No users yet</p>
              )}
            </div>
          )}

          <div className="bg-elevated/30 border border-base-color rounded-xl p-4 text-sm text-text-muted">
            <p className="font-semibold mb-2">📋 Workflow:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>User sends payment proof to your email</li>
              <li>You verify bank transfer in your banking app</li>
              <li>Open this admin page</li>
              <li>Click "Pro" or "Teams" button next to user</li>
              <li>User gets Pro access instantly</li>
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
