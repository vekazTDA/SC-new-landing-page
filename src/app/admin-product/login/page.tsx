import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession } from "@/lib/admin/auth";
import LoginForm from "../_components/LoginForm";
import SetupNotice from "../_components/SetupNotice";

export const metadata = { title: "Sign in · Product admin", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  if (await getAdminSession()) redirect("/admin-product");

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#171010] px-6 py-16">
      <div className="w-full max-w-sm">
        <h1
          className="text-center text-3xl text-[#F1D9C1]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          Product admin
        </h1>
        <p className="mt-2 text-center text-sm text-white/55">
          Sign in to manage the catalogue.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
