"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, Layers, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic_link" | "password">("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "magic_link") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "magic link enviado para o seu e-mail! verifique sua caixa de entrada.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          if (signUpError) throw signUpError;
          setMessage({
            type: "success",
            text: "conta criada com sucesso! você já pode navegar ou confirmar pelo e-mail.",
          });
          router.push("/");
          router.refresh();
          return;
        }
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "erro ao realizar autenticação.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2C2A] flex items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#D3D1C7] rounded-[10px] p-8 shadow-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[8px] bg-[#712B13]/10 border border-[#712B13]/20 mb-3">
            <Layers className="w-6 h-6 text-[#712B13]" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-[#2C2C2A]">
            trackr
          </h1>
          <p className="text-xs text-[#5F5E5A] mt-1.5 font-sans">
            registro diário de atividades potencializado por ia
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#FAF9F6] p-1 rounded-[8px] mb-6 border border-[#D3D1C7]">
          <button
            type="button"
            onClick={() => { setMode("password"); setMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-[6px] transition-all ${
              mode === "password"
                ? "bg-[#712B13] text-white shadow-sm"
                : "text-[#5F5E5A] hover:text-[#2C2C2A]"
            }`}
          >
            email & senha
          </button>
          <button
            type="button"
            onClick={() => { setMode("magic_link"); setMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-[6px] transition-all ${
              mode === "magic_link"
                ? "bg-[#712B13] text-white shadow-sm"
                : "text-[#5F5E5A] hover:text-[#2C2C2A]"
            }`}
          >
            magic link
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-[6px] mb-6 text-xs flex items-start gap-2 border ${
              message.type === "success"
                ? "bg-[#C0DD97]/30 border-[#97C459] text-[#173404]"
                : "bg-[#F5C4B3]/30 border-[#F0997B] text-[#4A1B0C]"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#2C2C2A] mb-1.5">
              e-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#888780] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] py-2 pl-9 pr-4 text-xs sm:text-sm text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#712B13]"
              />
            </div>
          </div>

          {mode === "password" && (
            <div>
              <label className="block text-xs font-medium text-[#2C2C2A] mb-1.5">
                senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#888780] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FFFFFF] border border-[#D3D1C7] rounded-[6px] py-2 pl-9 pr-4 text-xs sm:text-sm text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#712B13]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[#712B13] text-[#712B13] hover:bg-[#712B13]/10 font-medium py-2.5 rounded-[6px] text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-[#712B13] border-t-transparent" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{mode === "magic_link" ? "enviar link mágico" : "entrar / cadastrar"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
