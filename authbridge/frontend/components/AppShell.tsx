"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Notification, Role } from "@/lib/types";
import { clearSession, getSession } from "@/lib/session";
import { timeAgo } from "@/lib/ui";
import { Logo } from "./Logo";
import {
  IconBell,
  IconChart,
  IconDashboard,
  IconDoc,
  IconInbox,
  IconLogout,
  IconPlus,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: (p: any) => JSX.Element;
}

const PROVIDER_NAV: NavItem[] = [
  { href: "/provider", label: "Dashboard", icon: IconDashboard },
  { href: "/provider/requests", label: "My Requests", icon: IconDoc },
  { href: "/provider/requests/new", label: "New Request", icon: IconPlus },
];

const PAYER_NAV: NavItem[] = [
  { href: "/payer", label: "Dashboard", icon: IconDashboard },
  { href: "/payer/queue", label: "Review Queue", icon: IconInbox },
  { href: "/payer/reports", label: "Reports", icon: IconChart },
];

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = role === "PROVIDER" ? PROVIDER_NAV : PAYER_NAV;
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== role) {
      router.replace("/login");
      return;
    }
    setName(s.name);
    setOrg(s.org);
  }, [role, router]);

  async function loadNotifs() {
    const res = await fetch(`/api/notifications?role=${role}`);
    const json = await res.json();
    setNotifs(json.data ?? []);
  }

  useEffect(() => {
    loadNotifs();
    const t = setInterval(loadNotifs, 8000); // light polling; WebSocket/SSE in prod
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function markAll() {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "markAllRead", role }),
    });
    const json = await res.json();
    setNotifs(json.data ?? []);
  }

  function logout() {
    clearSession();
    router.push("/login");
  }

  const isActive = (href: string) =>
    href === `/${role.toLowerCase()}` ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 md:flex">
        <div className="px-2 pb-4">
          <Link href={`/${role.toLowerCase()}`}>
            <Logo />
          </Link>
        </div>
        <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {role === "PROVIDER" ? "Provider Portal" : "Payer Portal"}
          </p>
          <p className="truncate text-sm font-medium text-slate-700">{org}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={active ? "text-brand-600" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
        >
          <IconLogout className="text-slate-400" />
          Sign out
        </button>
      </aside>

      {/* Click-outside backdrop for the header dropdowns */}
      {(open || menuOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setOpen(false); setMenuOpen(false); }}
          aria-hidden
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Logo mark />
            <span className="font-bold">AuthBridge</span>
          </div>
          <div className="hidden text-sm text-slate-400 md:block">
            {role === "PROVIDER" ? "Prior Authorization Workspace" : "Utilization Review Workspace"}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => { setOpen((v) => !v); setMenuOpen(false); }}
                className="relative grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Notifications"
              >
                <IconBell />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {open && (
                <div className="absolute right-0 top-12 z-30 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                    <span className="text-sm font-semibold text-slate-700">Notifications</span>
                    <button onClick={markAll} className="text-xs font-medium text-brand-600 hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifs.length === 0 && (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications</p>
                    )}
                    {notifs.map((n) => (
                      <Link
                        key={n.id}
                        href={
                          n.requestId
                            ? role === "PROVIDER"
                              ? `/provider/requests/${n.requestId}`
                              : `/payer/review/${n.requestId}`
                            : "#"
                        }
                        onClick={() => setOpen(false)}
                        className={`block border-b border-slate-50 px-4 py-3 hover:bg-slate-50 ${
                          n.read ? "" : "bg-brand-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                          <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>
                        {n.referenceNo && (
                          <p className="mt-1 text-[11px] font-medium text-brand-600">{n.referenceNo}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative border-l border-slate-200 pl-3">
              <button
                onClick={() => { setMenuOpen((v) => !v); setOpen(false); }}
                className="flex items-center gap-2.5 rounded-lg p-1 transition hover:bg-slate-100"
                aria-label="Account menu"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <span className="hidden leading-tight sm:block">
                  <span className="block text-sm font-semibold text-slate-800">{name}</span>
                  <span className="block text-xs text-slate-400">{role === "PROVIDER" ? "Provider" : "Reviewer"}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden text-slate-400 sm:block">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-14 z-30 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="truncate text-xs text-slate-400">{org}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <IconLogout width={16} height={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
