import React, { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Staff Portal | The Bridges" },
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
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Wrong email or password. Please try again.");
      return;
    }
    navigate({ to: "/admin" });
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above, then click Forgot Password.");
      return;
    }
    setResetting(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/admin/login",
    });
    setResetting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setResetSent(true);
    toast.success("Password reset link sent.");
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
          <div className="flex flex-col items-center text-center gap-3">
            <img
              src="https://vibe.filesafe.space/1790196628861484830/assets/1d550afa-3cde-43cf-b5e7-67b08b8974ed.png"
              alt="The Bridges"
              className="h-14 w-auto"
            />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#2a382c] text-white flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h1 className="font-serif text-2xl font-bold">Staff Portal</h1>
            </div>
            <p className="text-xs text-stone-500">The Bridges booking & property management</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="flex items-start gap-2 text-sm text-[#2a382c] bg-[#2a382c]/10 border border-[#2a382c]/20 rounded-xl px-4 py-3">
              <KeyRound className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Check your email for a password reset link.</span>
            </div>
          )}

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

          <div className="border-t border-stone-200 pt-4 text-center">
            <button
              onClick={handleForgotPassword}
              disabled={resetting}
              className="text-sm text-[#2a382c] hover:underline font-medium disabled:opacity-60"
            >
              {resetting ? "Sending reset link…" : "Forgot Password?"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
