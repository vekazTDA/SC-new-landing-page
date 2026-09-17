import Link from "next/link";
import { signOutAction } from "../actions";

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-[#171010] text-white">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-[#171010]/95 px-5 py-3 backdrop-blur">
        <Link
          href="/admin-product"
          className="text-lg text-[#F1D9C1]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          Product admin
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" target="_blank" className="text-xs text-white/55 hover:text-white">
            View site ↗
          </Link>
          <span className="hidden text-xs text-white/40 sm:inline">{email}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/75 transition-colors hover:border-white/40 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
