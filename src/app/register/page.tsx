"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { apiFetch, ClientApiError } from "@/lib/http";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(name.trim() ? { name } : {}) })
      });
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Account created, but automatic sign-in failed. Please log in.");
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ClientApiError || caught instanceof Error ? caught.message : "Registration failed.");
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="relative inline-flex items-center gap-2 font-black"><span className="grid size-9 place-items-center rounded-xl bg-teal-300 font-mono text-xs text-slate-950">C_</span>CForge</Link>
        <div className="absolute -left-20 top-32 size-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative max-w-xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-teal-300">Your path starts here</p>
          <h2 className="mt-4 text-5xl font-black leading-[1.02] tracking-tight">Learn what C is really doing.</h2>
          <div className="mt-8 space-y-3 text-sm font-semibold text-slate-300">
            {["Start with zero assumed knowledge", "Write and judge real C programs", "Resume every lesson exactly", "Build evidence-based mastery"].map((item) => <div key={item} className="flex items-center gap-2"><CheckCircle2 size={17} className="text-teal-300" />{item}</div>)}
          </div>
        </div>
      </aside>
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 font-black lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-[rgb(var(--accent))] font-mono text-xs text-white dark:text-slate-950">C_</span>CForge</Link>
          <p className="eyebrow mt-10 lg:mt-0">Create your account</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Begin at first principles.</h1>
          <p className="muted mt-3">No prior programming experience required.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div><label htmlFor="name" className="mb-1.5 block text-sm font-bold">Name <span className="muted font-normal">(optional)</span></label><input id="name" className="input" autoComplete="name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></div>
            <div><label htmlFor="email" className="mb-1.5 block text-sm font-bold">Email</label><input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div><label htmlFor="password" className="mb-1.5 block text-sm font-bold">Password</label><input id="password" className="input" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required /><p className="muted mt-1.5 text-xs">Use 8–72 characters.</p></div>
            {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-semibold text-[rgb(var(--danger))]" role="alert">{error}</p>}
            <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Creating account…" : <>Create account <ArrowRight size={16} /></>}</button>
          </form>
          <p className="muted mt-5 text-sm">Already learning? <Link href="/login" className="font-bold text-[rgb(var(--accent))] hover:underline">Log in</Link></p>
        </div>
      </section>
    </main>
  );
}
