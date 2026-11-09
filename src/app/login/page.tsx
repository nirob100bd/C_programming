"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });
    if (result?.error) {
      setError("That email and password combination was not recognized.");
      setBusy(false);
      return;
    }
    const callback = search.get("callbackUrl");
    router.push(callback?.startsWith("/") ? callback : "/dashboard");
    router.refresh();
  }

  return (
    <main id="main-content" className="grid min-h-screen lg:grid-cols-[.85fr_1.15fr]">
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 font-black"><span className="grid size-9 place-items-center rounded-xl bg-[rgb(var(--accent))] font-mono text-xs text-white dark:text-slate-950">C_</span>CForge</Link>
          <p className="eyebrow mt-10">Welcome back</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Continue the work.</h1>
          <p className="muted mt-3">Your code, lesson position, mastery evidence, and projects are waiting.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-bold">Email</label>
              <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-bold">Password</label>
              <input id="password" className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-semibold text-[rgb(var(--danger))]" role="alert">{error}</p>}
            <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : <>Log in <ArrowRight size={16} /></>}</button>
          </form>
          <p className="muted mt-5 text-sm">New to CForge? <Link href="/register" className="font-bold text-[rgb(var(--accent))] hover:underline">Create an account</Link></p>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-slate-950 p-14 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -right-24 -top-24 size-[32rem] rounded-full bg-teal-400/15 blur-3xl" />
        <div className="relative max-w-xl">
          <span className="grid size-12 place-items-center rounded-2xl bg-teal-300/10 text-teal-300"><LockKeyhole /></span>
          <blockquote className="mt-7 text-3xl font-black leading-tight">“Mastery is not completion. It is evidence that you can transfer an idea to a new problem.”</blockquote>
          <p className="mt-5 text-sm font-semibold text-slate-400">CForge learning model</p>
        </div>
      </aside>
    </main>
  );
}
