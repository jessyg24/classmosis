"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Brain,
  Coins,
  Users,
  Target,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClassStore } from "@/stores/class-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/schedule", label: "Schedule", icon: Calendar, ready: true },
  { href: "/gradebook", label: "Gradebook", icon: BookOpen, ready: true },
  { href: "/practice", label: "Practice", icon: Brain, ready: true },
  { href: "/economy", label: "Economy", icon: Coins, ready: true },
  { href: "/students", label: "Students", icon: Users, ready: true },
  { href: "/standards", label: "Standards", icon: Target, ready: true },
  { href: "/settings", label: "Settings", icon: Settings, ready: true },
];

export default function AppShell({
  children,
  teacherName,
  classes,
}: {
  children: React.ReactNode;
  teacherName: string;
  classes: Array<{ id: string; name: string }>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeClassId, setActiveClassId } = useClassStore();

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-cm-white flex">
      {/* Sidebar */}
      <aside className="w-60 bg-cm-surface border-r border-cm-border flex flex-col">
        {/* Logo */}
        <div className="p-cm-6 border-b border-cm-border">
          <h1 className="text-cm-section text-cm-text-primary">Classmosis</h1>
        </div>

        {/* Class Switcher */}
        {classes.length > 0 && (
          <div className="p-cm-4 border-b border-cm-border">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="w-full flex items-center justify-between px-3 py-2 rounded-cm-button border border-cm-border text-cm-body text-left hover:bg-cm-white transition-colors"
              >
                <span className="truncate">{activeClass?.name || "Select class"}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52">
                {classes.map((cls) => (
                  <DropdownMenuItem
                    key={cls.id}
                    onClick={() => setActiveClassId(cls.id)}
                    className={cls.id === activeClassId ? "bg-cm-teal-light" : ""}
                  >
                    {cls.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-cm-3 space-y-cm-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.ready ? item.href : "#"}
                className={`flex items-center gap-cm-3 px-cm-3 py-cm-2 rounded-cm-button text-cm-body transition-colors ${
                  isActive
                    ? "bg-cm-teal-light text-cm-teal-dark font-medium"
                    : item.ready
                      ? "text-cm-text-secondary hover:bg-cm-white hover:text-cm-text-primary"
                      : "text-cm-text-hint cursor-default"
                }`}
                onClick={item.ready ? undefined : (e) => e.preventDefault()}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
                {!item.ready && (
                  <span className="ml-auto text-[10px] text-cm-text-hint uppercase tracking-wider">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-cm-4 border-t border-cm-border">
          <div className="flex items-center justify-between">
            <span className="text-cm-caption text-cm-text-secondary truncate">
              {teacherName}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-cm-text-hint hover:text-cm-coral"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {pathname === "/schedule" || pathname === "/gradebook" ? (
          children
        ) : (
          <div className="max-w-6xl mx-auto p-cm-8">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
