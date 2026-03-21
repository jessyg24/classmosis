"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  LayoutGrid,
  Library,
  Target,
  Users,
  School,
  Calendar,
  Coins,
  CreditCard,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/catalog", label: "Catalog", icon: LayoutGrid },
  { href: "/admin/content", label: "Content", icon: Library },
  { href: "/admin/standards", label: "Standards", icon: Target },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: School },
  { href: "/admin/schedules", label: "Schedules", icon: Calendar },
  { href: "/admin/economy", label: "Economy", icon: Coins },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-cm-white flex">
      {/* Dark sidebar */}
      <aside className="w-60 bg-[#1A1D23] flex flex-col">
        {/* Logo */}
        <div className="p-cm-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cm-coral" />
            <h1 className="text-cm-section text-white">Admin</h1>
          </div>
          <p className="text-[11px] text-white/40 mt-0.5">Classmosis Control Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-cm-3 space-y-cm-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-cm-3 px-cm-3 py-cm-2 rounded-cm-button text-cm-body transition-colors ${
                  isActive
                    ? "bg-cm-coral/20 text-cm-coral font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-cm-4 border-t border-white/10 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white/70"
          >
            ← Back to Teacher View
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-white/40 hover:text-cm-coral hover:bg-transparent px-0"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-cm-8">
          {children}
        </div>
      </main>
    </div>
  );
}
