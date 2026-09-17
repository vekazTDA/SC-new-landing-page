/** Shown instead of the admin until the Supabase environment variables are present. */
export default function SetupNotice() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#171010] px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1
          className="text-2xl text-[#F1D9C1]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          Supabase is not connected yet
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          The catalogue is still being served from the files bundled with the site, so the
          public pages work normally. To switch the admin on, follow{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 text-[#C5A880]">
            supabase/README.md
          </code>{" "}
          and set these in <code className="rounded bg-black/40 px-1.5 py-0.5">.env.local</code>:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 text-xs leading-relaxed text-[#C5A880]">
{`NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…`}
        </pre>
        <p className="mt-4 text-sm text-white/55">Then restart the dev server.</p>
      </div>
    </main>
  );
}
