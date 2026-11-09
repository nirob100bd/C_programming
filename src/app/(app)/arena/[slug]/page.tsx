"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { ArrowLeft, CheckCircle2, Clock3, Code2, Lightbulb, MemoryStick, RotateCcw, Send, Tags, TriangleAlert } from "lucide-react";
import { apiFetch, fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const CodeEditor = dynamic(
  () => import("@/components/CodeEditor").then((module) => module.CodeEditor),
  { ssr: false }
);

type PublicTest = { id: string; input: string; expected: string; order: number };
type Example = { input?: string; output?: string };
type Problem = {
  id: string; slug: string; title: string; difficulty: string; tags: string[];
  description: string; inputSpec: string; outputSpec: string; constraints: string;
  examples: unknown; starterCode: string; expectedComplexity: string;
  timeLimitMs: number; memoryLimitKb: number; tests: PublicTest[];
};
type Result = { submissionId?: string; verdict?: string; compile?: string; stderr?: string; stdout?: string; timeMs?: number | null; memoryKb?: number | null; error?: string };
type Hint = { level: number; content: string; editorial?: string; final: boolean };

export default function ProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const problemQuery = useSWR<Problem>(`/api/problems/${slug}`, fetcher);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [hint, setHint] = useState<Hint | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hintBusy, setHintBusy] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!problemQuery.data || initialized) return;
    const saved = localStorage.getItem(`cforge:problem:${slug}`);
    setCode(saved ?? problemQuery.data.starterCode);
    setInitialized(true);
  }, [initialized, problemQuery.data, slug]);

  useEffect(() => {
    if (!initialized) return;
    const timer = window.setTimeout(() => localStorage.setItem(`cforge:problem:${slug}`, code), 500);
    return () => window.clearTimeout(timer);
  }, [code, initialized, slug]);

  async function requestHint() {
    const level = Math.min(5, hintsUsed + 1);
    setHintBusy(true);
    try {
      const next = await apiFetch<Hint>(`/api/problems/${slug}/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level })
      });
      setHint(next);
      setHintsUsed(level);
    } catch (caught) {
      setHint({ level, content: caught instanceof Error ? caught.message : "Could not unlock the hint.", final: false });
    } finally {
      setHintBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setResult(null);
    try {
      const judged = await apiFetch<Result>(`/api/problems/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode: code, mode: "independent", hintsUsed })
      });
      setResult(judged);
    } catch (caught) {
      setResult({ error: caught instanceof Error ? caught.message : "Submission failed." });
    } finally {
      setBusy(false);
    }
  }

  if (problemQuery.isLoading || !initialized) return <div className="container-page"><LoadingState label="Opening challenge" /></div>;
  if (problemQuery.error) return <div className="container-page"><ErrorState message={problemQuery.error.message} retry={() => problemQuery.mutate()} /></div>;
  const problem = problemQuery.data;
  if (!problem) return null;
  const examples = Array.isArray(problem.examples) ? problem.examples.filter((item): item is Example => typeof item === "object" && item !== null) : [];
  const accepted = result?.verdict === "Accepted";

  return (
    <div className="mx-auto max-w-[1550px] p-3 sm:p-5">
      <Link href="/arena" className="muted mb-4 inline-flex items-center gap-1.5 text-xs font-bold hover:text-[rgb(var(--accent))]"><ArrowLeft size={14} /> Back to arena</Link>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,.9fr)_minmax(520px,1.1fr)]">
        <section className="min-w-0 space-y-4">
          <header className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">{problem.difficulty} challenge</p><h1 className="mt-2 text-3xl font-black tracking-tight">{problem.title}</h1></div><span className="badge"><Clock3 size={13} /> {problem.timeLimitMs} ms</span></div>
            <div className="muted mt-4 flex flex-wrap gap-3 text-xs"><span className="flex items-center gap-1"><Tags size={13} /> {problem.tags.join(" · ")}</span><span className="flex items-center gap-1"><MemoryStick size={13} /> {Math.round(problem.memoryLimitKb / 1000)} MB</span></div>
          </header>
          <article className="card p-5 sm:p-6"><h2 className="text-sm font-black uppercase tracking-wider">Problem</h2><div className="prose-cforge mt-3">{problem.description}</div></article>
          <div className="grid gap-4 sm:grid-cols-2"><section className="card p-5"><h2 className="text-sm font-black">Input</h2><pre className="prose-cforge mono mt-2 text-xs">{problem.inputSpec}</pre></section><section className="card p-5"><h2 className="text-sm font-black">Output</h2><pre className="prose-cforge mono mt-2 text-xs">{problem.outputSpec}</pre></section></div>
          <section className="card p-5"><h2 className="text-sm font-black">Constraints</h2><pre className="prose-cforge mono mt-2 text-xs">{problem.constraints}</pre>{problem.expectedComplexity && <div className="mt-3 border-t border-[rgb(var(--border))] pt-3 text-xs"><span className="muted font-bold">Target: </span><code className="mono font-bold">{problem.expectedComplexity}</code></div>}</section>
          {examples.map((example, index) => <section key={index} className="card overflow-hidden"><h2 className="border-b border-[rgb(var(--border))] px-4 py-3 text-xs font-black uppercase tracking-wider">Example {index + 1}</h2><div className="grid sm:grid-cols-2"><div className="border-b border-[rgb(var(--border))] p-4 sm:border-b-0 sm:border-r"><div className="muted text-[10px] font-black uppercase tracking-wider">Input</div><pre className="mono mt-2 whitespace-pre-wrap text-xs">{example.input}</pre></div><div className="p-4"><div className="muted text-[10px] font-black uppercase tracking-wider">Output</div><pre className="mono mt-2 whitespace-pre-wrap text-xs">{example.output}</pre></div></div></section>)}
          <section className="card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-sm font-black"><Lightbulb size={17} className="text-amber-500" /> Progressive hints</h2><p className="muted mt-1 text-xs">Hints reduce independent XP. Level 5 reveals the reference solution.</p></div><button type="button" onClick={requestHint} disabled={hintBusy || hintsUsed >= 5} className="btn btn-secondary">{hintBusy ? "Unlocking…" : hintsUsed >= 5 ? "All hints used" : `Unlock hint ${hintsUsed + 1}`}</button></div>{hint && <div className="mt-4 rounded-xl bg-amber-500/10 p-4 text-sm leading-6"><div className="mb-2 text-xs font-black uppercase tracking-wider text-[rgb(var(--warning))]">Hint level {hint.level}</div>{hint.final ? <pre className="mono overflow-x-auto whitespace-pre text-xs">{hint.content}</pre> : <p>{hint.content}</p>}{hint.editorial && <p className="mt-3 border-t border-amber-500/20 pt-3">{hint.editorial}</p>}</div>}</section>
        </section>

        <section className="min-w-0 xl:sticky xl:top-20 xl:self-start">
          <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3"><div className="flex items-center gap-2 text-xs font-black"><Code2 size={15} className="text-[rgb(var(--accent))]" /> solution.c</div><button type="button" onClick={() => { setCode(problem.starterCode); setResult(null); }} className="muted flex items-center gap-1 text-xs font-bold hover:text-[rgb(var(--fg))]"><RotateCcw size={13} /> Reset</button></div>
            <CodeEditor value={code} onChange={setCode} height="540px" />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(var(--border))] p-4"><p className="muted text-xs">Draft saved in this browser.</p><button type="button" onClick={submit} disabled={busy || !code.trim()} className="btn btn-primary"><Send size={16} /> {busy ? "Running hidden tests…" : "Submit solution"}</button></div>
          </div>

          {result && <div className={`card mt-4 border-l-4 p-5 ${accepted ? "border-l-emerald-500" : "border-l-rose-500"}`} aria-live="polite">
            {result.error ? <div className="flex items-start gap-3 text-[rgb(var(--danger))]"><TriangleAlert className="mt-0.5 shrink-0" size={19} /><div><h2 className="font-black">Judge unavailable</h2><p className="mt-1 text-sm">{result.error}</p></div></div> : <><div className="flex items-center gap-3">{accepted ? <CheckCircle2 size={24} className="text-[rgb(var(--success))]" /> : <TriangleAlert size={24} className="text-[rgb(var(--danger))]" />}<div><p className="muted text-xs font-black uppercase tracking-wider">Verdict</p><h2 className={`text-xl font-black ${accepted ? "text-[rgb(var(--success))]" : "text-[rgb(var(--danger))]"}`}>{result.verdict}</h2></div></div><div className="muted mt-3 flex gap-4 text-xs"><span>{result.timeMs ?? "—"} ms</span><span>{result.memoryKb ?? "—"} KB</span></div>{result.compile && <pre className="mono mt-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-rose-950 p-3 text-xs text-rose-100">{result.compile}</pre>}{result.stderr && <pre className="mono mt-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-rose-950 p-3 text-xs text-rose-100">{result.stderr}</pre>}</>}
          </div>}
        </section>
      </div>
    </div>
  );
}
