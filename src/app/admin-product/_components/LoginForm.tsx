"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      // Deliberately generic: distinguishing "no such user" from "wrong password" tells
      // an attacker which addresses are real.
      setError("Those details did not work. Please check and try again.");
      setBusy(false);
      return;
    }

    // refresh() so the server re-reads the freshly written auth cookie before we navigate.
    router.refresh();
    router.replace("/admin-product");
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
          Email
        </span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-[#C5A880]"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
          Password
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-[#C5A880]"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-[#E8B4A0]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-2 h-11 rounded-lg bg-[#C5A880] text-sm font-semibold uppercase tracking-[0.12em] text-[#140D0A] transition-colors hover:bg-[#d4b992] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
