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

  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/", label: "nova entrada", icon: PenSquare },
    { href: "/timeline", label: "timeline", icon: Clock },
    { href: "/summaries", label: "resumos & ia", icon: Sparkles },
    { href: "/admin", label: "admin", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#D3D1C7]">
      <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[6px] bg-[#712B13]/10 border border-[#712B13]/20 flex items-center justify-center text-[#712B13] group-hover:bg-[#712B13]/15 transition-all">
            <Layers className="w-4 h-4 text-[#712B13]" />
          </div>
          <div>
            <span className="font-serif text-lg font-medium text-[#2C2C2A] tracking-tight">
              trackr
            </span>
            <span className="hidden sm:inline-block text-[10px] lowercase font-sans text-[#5F5E5A] bg-[#EFECE6] px-2 py-0.5 rounded-[6px] border border-[#D3D1C7] ml-2">
              log de atividades
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="flex items-center gap-1 sm:gap-1.5 font-sans">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#712B13]/10 text-[#712B13] border border-[#712B13]/30"
                    : "text-[#5F5E5A] hover:text-[#2C2C2A] hover:bg-[#EFECE6]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#712B13]" : "text-[#5F5E5A]"}`} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}

          <div className="w-px h-4 bg-[#D3D1C7] my-auto mx-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="sair da conta"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-[#5F5E5A] hover:text-[#712B13] hover:bg-[#712B13]/10 border border-transparent hover:border-[#712B13]/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">sair</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
