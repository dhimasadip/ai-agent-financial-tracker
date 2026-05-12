"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
      } else {
        setSuccessMessage("Link masuk sudah dikirim ke email kamu! Cek inbox atau spam.");
        setEmail("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-secondary rounded-2xl border border-border p-6">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          Gagal masuk. Silakan coba lagi.
        </div>
      )}

      {successMessage ? (
        <div className="text-center">
          <div className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-success font-medium"> Cek Email Kamu</p>
            <p className="text-success/80 text-sm mt-1">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-accent hover:text-accent-hover text-sm"
          >
            Kirim ulang link
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className={cn(
                "w-full px-4 py-3 rounded-xl border border-border bg-primary text-text",
                "placeholder:text-muted",
                "focus:outline-none focus:ring-2 focus:ring-accent/50",
                "transition-colors"
              )}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-white transition-colors",
              "bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengirim...
              </span>
            ) : (
              "Kirim Link Masuk"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Masuk ke Finn</h1>
          <p className="text-muted mt-2">Assisten keuangan AI kamu</p>
        </div>

        {/* Form wrapped in Suspense */}
        <Suspense fallback={<div className="bg-secondary rounded-2xl border border-border p-6 animate-pulse"><div className="h-64 bg-tertiary rounded" /></div>}>
          <SignInForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-muted text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-hover font-medium">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}