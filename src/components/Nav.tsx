"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Boxes,
  Braces,
  ChevronDown,
  FlaskConical,
  History,
  LayoutDashboard,
  LogOut,
  Map,
  Settings,
  Swords,
  Trophy
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/worlds", label: "Worlds", icon: Map },
  { href: "/arena", label: "Arena", icon: Swords },
  { href: "/ide", label: "IDE", icon: Braces },
  { href: "/labs/pointers", label: "Labs", icon: FlaskConical },
  { href: "/mastery", label: "Mastery", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/reference", label: "Reference", icon: BookOpen },
  { href: "/projects", label: "Projects", icon: Boxes },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex" aria-label="Primary navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition",
                  active
                    ? "bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]"
                    : "muted hover:bg-[rgb(var(--card-strong))] hover:text-[rgb(var(--fg))]"
                )}
              >
                <Icon size={15} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm font-bold marker:hidden">
              <span className="grid size-6 place-items-center rounded-lg bg-[rgb(var(--accent))]/12 text-xs text-[rgb(var(--accent))]">
                {(session?.user?.name || session?.user?.email || "C").charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-28 truncate sm:block">{session?.user?.name || "Learner"}</span>
              <ChevronDown size={14} className="transition group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 shadow-xl">
              <div className="border-b border-[rgb(var(--border))] px-2 py-2">
                <div className="truncate text-xs font-bold">{session?.user?.email}</div>
              </div>
              <Link href="/settings" className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-[rgb(var(--card-strong))]">
                <Settings size={16} /> Account settings
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold text-[rgb(var(--danger))] hover:bg-rose-500/10"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </details>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold", active ? "bg-[rgb(var(--accent))] text-white dark:text-slate-950" : "muted")}>
              <Icon size={14} /> {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
