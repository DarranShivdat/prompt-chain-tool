"use client";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-sm text-center">
        <div className="text-3xl font-bold text-white mb-1">⛓️ Prompt Chain</div>
        <div className="text-gray-400 text-sm mb-8">almostcrackd.ai</div>
        {error === "unauthorized" && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg p-3 mb-6">
            Access denied. Admins only.
          </div>
        )}
        <button
          onClick={handleLogin}
          className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
