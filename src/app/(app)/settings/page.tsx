"use client";

import useSWR from "swr";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Download, Monitor, Moon, Save, Sun, Trash2, UserRound } from "lucide-react";
import { apiFetch, fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

interface Me { id: string; email: string; name: string | null; theme: "system" | "light" | "dark"; editorFont: number; }

function applyTheme(theme: string) {
  localStorage.setItem("theme", theme);
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export default function SettingsPage() {
  const me = useSWR<Me>("/api/me", fetcher);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<Me["theme"]>("system");
  const [editorFont, setEditorFont] = useState(14);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");

  useEffect(() => {
    if (!me.data) return;
    setName(me.data.name ?? "");
    setTheme(me.data.theme);
    setEditorFont(me.data.editorFont);
  }, [me.data]);

  if (me.isLoading) return <div className="container-page"><LoadingState label="Loading settings" /></div>;
  if (me.error) return <div className="container-page"><ErrorState message={me.error.message} retry={() => me.mutate()} /></div>;

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      await apiFetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, editorFont, ...(name.trim() ? { name: name.trim() } : {}) })
      });
      applyTheme(theme);
      await me.mutate();
      setStatus("Settings saved.");
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function exportData() {
    setBusy(true);
    try {
      const data = await apiFetch<Record<string, unknown>>("/api/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `cforge-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Export downloaded.");
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (deletePhrase !== "DELETE") return;
    setBusy(true);
    try {
      await apiFetch("/api/delete-account", { method: "POST" });
      await signOut({ callbackUrl: "/" });
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Deletion failed.");
      setBusy(false);
    }
  }

  return (
    <div className="container-page max-w-4xl space-y-6">
      <section><p className="eyebrow">Preferences and privacy</p><h1 className="mt-2 text-4xl font-black tracking-tight">Settings</h1><p className="muted mt-3">Control your learning environment and your data.</p></section>

      <section className="card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-sky-500/10 text-sky-500"><UserRound size={19} /></span><div><h2 className="font-black">Profile</h2><p className="muted text-xs">Signed in as {me.data?.email}</p></div></div><div className="mt-5 max-w-md"><label htmlFor="name" className="mb-1.5 block text-sm font-bold">Display name</label><input id="name" className="input" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></div></section>

      <section className="card p-5 sm:p-6"><h2 className="font-black">Appearance and editor</h2><div className="mt-5"><div className="mb-2 text-sm font-bold">Theme</div><div className="grid gap-2 sm:grid-cols-3">{([{ value: "system", label: "System", icon: Monitor }, { value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => { setTheme(value); applyTheme(value); }} className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-bold transition ${theme === value ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/8 text-[rgb(var(--accent))]" : "border-[rgb(var(--border))]"}`}><Icon size={18} /> {label}</button>)}</div></div><div className="mt-5 max-w-md"><label htmlFor="font-size" className="mb-1.5 flex justify-between text-sm font-bold"><span>Editor font size</span><span className="mono text-[rgb(var(--accent))]">{editorFont}px</span></label><input id="font-size" className="w-full accent-[rgb(var(--accent))]" type="range" min={10} max={24} value={editorFont} onChange={(event) => setEditorFont(Number(event.target.value))} /></div><button type="button" onClick={save} disabled={busy} className="btn btn-primary mt-6"><Save size={16} /> {busy ? "Saving…" : "Save settings"}</button>{status && <span className="ml-3 text-sm font-semibold" role="status">{status}</span>}</section>

      <section className="card p-5 sm:p-6"><h2 className="font-black">Your data</h2><p className="muted mt-1 text-sm">Download profile, progress, snapshots, submissions, notes, projects, activity, hints, achievements, and mastery as JSON.</p><button type="button" onClick={exportData} disabled={busy} className="btn btn-secondary mt-4"><Download size={16} /> Export all data</button></section>

      <section className="card border-rose-500/30 p-5 sm:p-6"><div className="flex items-center gap-3 text-[rgb(var(--danger))]"><Trash2 size={19} /><h2 className="font-black">Delete account</h2></div><p className="muted mt-2 text-sm">This permanently deletes your account and all user-owned data. It cannot be undone.</p><label htmlFor="delete-phrase" className="mt-4 block text-xs font-bold">Type DELETE to confirm</label><div className="mt-1 flex max-w-md flex-col gap-2 sm:flex-row"><input id="delete-phrase" className="input" value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} /><button type="button" onClick={deleteAccount} disabled={busy || deletePhrase !== "DELETE"} className="btn btn-danger shrink-0">Delete forever</button></div></section>
    </div>
  );
}
