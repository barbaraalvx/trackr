"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  PenSquare,
  Clock,
  Sparkles,
  Settings,
  LogOut,
  Layers,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Don't render Navbar on login page
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/", label: "Nova Entrada", icon: PenSquare },
    { href: "/timeline", label: "Timeline", icon: Clock },
    { href: "/summaries", label: "Resumos & IA", icon: Sparkles },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="font-bold text-base bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Trackr
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold bg-indigo-950/80 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-800/50 ml-2">
              Log de Atividades
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}

          <div className="w-px h-5 bg-slate-800 my-auto mx-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sair</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
