"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Sign up with resend (magic link)
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/?welcome=true",
      });

      if (result?.error) {
        setError("Gagal mengirim link. Silakan coba lagi.");
      } else {
        setSuccessMessage("Link verifikasi sudah dikirim! Cek email kamu untuk melanjutkan.");
        setName("");
        setEmail("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Daftar Finn</h1>
          <p className="text-muted mt-2">Mulai lacak keuanganmu hari ini</p>
        </div>

        {/* Card */}
        <div className="bg-secondary rounded-2xl border border-border p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {successMessage ? (
            <div className="text-center">
              <div className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-success font-medium"> Cek Email Kamu!</p>
                <p className="text-success/80 text-sm mt-1">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-accent hover:text-accent-hover text-sm"
              >
                Kirim ulang
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
                  Nama
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border border-border bg-primary text-text",
                    "placeholder:text-muted",
                    "focus:outline-none focus:ring-2 focus:ring-accent/50",
                    "transition-colors"
                  )}
                />
              </div>

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
                    Mendaftar...
                  </span>
                ) : (
                  "Daftar Sekarang"
                )}
              </button>

              <p className="text-xs text-muted text-center">
                Dengan mendaftar, kamu menyetujui{" "}
                <a href="#" className="text-accent hover:underline">Syarat & Ketentuan</a>
                {" "}dan{" "}
                <a href="#" className="text-accent hover:underline">Kebijakan Privasi</a>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-muted text-sm mt-6">
          Sudah punya akun?{" "}
          <Link href="/signin" className="text-accent hover:text-accent-hover font-medium">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}