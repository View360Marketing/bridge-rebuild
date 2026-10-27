import React, { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { bootstrapAdmin } from "@/lib/booking/admin.functions";
import { toast } from "sonner";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In | The Bridges" },
      {
        name: "description",
        content: "Staff sign-in for The Bridges booking & property management.",
      },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const runBootstrap = useServerFn(bootstrapAdmin);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/admin" });
  }

  async function handleBootstrap() {
    setBootstrapping(true);
    try {
      const res = await runBootstrap();
      if (res.ok) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBootstrapping(false);
  }

  return (
    <div className="min-h-screen bg-[#1b251e] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-300 hover:text-white text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>

        <div className="bg-white text-stone-900 rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#2a382c] text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">Staff Sign In</h1>
              <p className="text-xs text-stone-500">The Bridges booking & property management</p>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a382c]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a382c]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2a382c] hover:bg-[#1b251e] text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="border-t border-stone-200 pt-5">
            <p className="text-xs text-stone-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2a382c]" />
              First-time setup? Provision the initial admin account once.
            </p>
            <button
              onClick={handleBootstrap}
              disabled={bootstrapping}
              className="w-full border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60"
            >
              {bootstrapping ? "Provisioning…" : "Provision Initial Admin"}
            </button>
            <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
              Uses server-side credentials. Disabled automatically after first success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
