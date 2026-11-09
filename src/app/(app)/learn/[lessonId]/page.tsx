"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Circle, Clock3, Code2, Lightbulb, Play, RotateCcw, Save, Terminal } from "lucide-react";
import { apiFetch, fetcher } from "@/lib/http";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const CodeEditor = dynamic(
  () => import("@/components/CodeEditor").then((module) => module.CodeEditor),
  { ssr: false }
);

type Step = {
  id: string;
  order: number;
  kind: string;
  title: string;
  body: string;
  starterCode: string;
  expectedOutput: string | null;
  testInput: string | null;
  quizOptions: unknown;
  hints: unknown;
  xpReward: number;
};
type Lesson = { id: string; title: string; world: string; summary: string; steps: Step[] };
type Progress = { lessonId: string; stepId: string; code: string; completed: boolean; lastSavedAt: string };
type RunResult = { submissionId?: string; verdict?: string; stdout?: string; stderr?: string; compile?: string; error?: string; timeMs?: number | null; memoryKb?: number | null };

const codeKinds = new Set(["code", "debug", "build", "optimize", "trace"]);
const normalize = (value: string) => value.replace(/\r\n/g, "\n").trimEnd();

export default function LearnPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const search = useSearchParams();
  const lessonQuery = useSWR<Lesson>(`/api/lesson/${lessonId}`, fetcher);
  const progressQuery = useSWR<Progress | null>(`/api/progress?lessonId=${encodeURIComponent(lessonId)}`, fetcher);
  const [stepId, setStepId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [quizPick, setQuizPick] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<"idle" | "correct" | "incorrect">("idle");
  const [initialized, setInitialized] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const editorFontRef = useRef(14);

  const lesson = lessonQuery.data;
  const step = useMemo(
    () => lesson?.steps.find((item) => item.id === stepId) ?? null,
    [lesson, stepId]
  );
  const stepIndex = lesson && step ? lesson.steps.findIndex((item) => item.id === step.id) : -1;
  const isLast = lesson ? stepIndex === lesson.steps.length - 1 : false;

  useEffect(() => {
    fetch("/api/me").then((response) => response.json()).then((me) => {
      if (typeof me.editorFont === "number") editorFontRef.current = me.editorFont;
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!lesson || progressQuery.isLoading || initialized) return;
    const requested = search.get("step");
    const saved = progressQuery.data;
    const candidate = lesson.steps.find((item) => item.id === requested)
      ?? lesson.steps.find((item) => item.id === saved?.stepId)
      ?? lesson.steps[0];
    if (!candidate) return;
    setStepId(candidate.id);
    setCode(saved?.stepId === candidate.id ? saved.code : candidate.starterCode ?? "");
    setStdin(candidate.testInput ?? "");
    setInitialized(true);
  }, [initialized, lesson, progressQuery.data, progressQuery.isLoading, search]);

  const saveProgress = useCallback(async (
    currentStepId: string,
    currentCode: string,
    options: { completed?: boolean; answer?: string } = {}
  ) => {
    return apiFetch<{ progress: Progress; quizCorrect: boolean | null }>("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, stepId: currentStepId, code: currentCode, ...options })
    });
  }, [lessonId]);

  useEffect(() => {
    if (!initialized || !stepId) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      saveProgress(stepId, code)
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [code, initialized, saveProgress, stepId]);

  async function selectStep(next: Step) {
    if (stepId) await saveProgress(stepId, code).catch(() => undefined);
    setStepId(next.id);
    setCode(next.starterCode ?? "");
    setStdin(next.testInput ?? "");
    setRunResult(null);
    setQuizPick(null);
    setQuizState("idle");
    setHintIndex(0);
    window.history.replaceState(null, "", `/learn/${lessonId}?step=${next.id}`);
  }

  async function runCode() {
    if (!step) return;
    setBusy(true);
    setRunResult(null);
    try {
      const result = await apiFetch<RunResult>("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode: code, stdin, lessonId, stepId: step.id, mode: "guided" })
      });
      setRunResult(result);
      const outputMatches = result.verdict === "Accepted" && (
        step.expectedOutput === null || normalize(result.stdout ?? "") === normalize(step.expectedOutput)
      );
      if (outputMatches) {
        await saveProgress(step.id, code, { completed: isLast });
        setSaveState("saved");
      }
    } catch (caught) {
      setRunResult({ error: caught instanceof Error ? caught.message : "The compiler request failed." });
    } finally {
      setBusy(false);
    }
  }

  async function submitQuiz() {
    if (!step || !quizPick) return;
    setBusy(true);
    try {
      const result = await saveProgress(step.id, code, {
        answer: quizPick,
        completed: isLast
      });
      setQuizState(result.quizCorrect ? "correct" : "incorrect");
    } catch {
      setQuizState("incorrect");
    } finally {
      setBusy(false);
    }
  }

  async function goNext() {
    if (!lesson || !step || stepIndex < 0) return;
    await saveProgress(step.id, code, { completed: isLast }).catch(() => undefined);
    const next = lesson.steps[stepIndex + 1];
    if (next) await selectStep(next);
  }

  if (lessonQuery.isLoading || progressQuery.isLoading || !initialized) {
    return <div className="container-page"><LoadingState label="Opening lesson" /></div>;
  }
  if (lessonQuery.error) {
    return <div className="container-page"><ErrorState message={lessonQuery.error.message} retry={() => lessonQuery.mutate()} /></div>;
  }
  if (!lesson || !step) return <div className="container-page"><ErrorState message="This lesson has no available steps." /></div>;

  const hints = Array.isArray(step.hints) ? step.hints.filter((hint): hint is string => typeof hint === "string") : [];
  const quizOptions = Array.isArray(step.quizOptions) ? step.quizOptions.filter((option): option is string => typeof option === "string") : [];
  const codeSucceeded = Boolean(runResult && !runResult.error && runResult.verdict === "Accepted" && (step.expectedOutput === null || normalize(runResult.stdout ?? "") === normalize(step.expectedOutput)));

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1500px] xl:grid-cols-[280px_1fr]">
      <aside className="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/55 p-4 xl:border-b-0 xl:border-r xl:p-5">
        <Link href="/worlds" className="muted inline-flex items-center gap-1.5 text-xs font-bold hover:text-[rgb(var(--accent))]"><ArrowLeft size={14} /> World map</Link>
        <p className="eyebrow mt-5">{lesson.world}</p>
        <h1 className="mt-1 text-xl font-black">{lesson.title}</h1>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
          {lesson.steps.map((item, index) => {
            const active = item.id === step.id;
            return (
              <button key={item.id} type="button" onClick={() => selectStep(item)} className={`flex min-w-52 items-center gap-3 rounded-xl border p-3 text-left transition xl:min-w-0 ${active ? "border-[rgb(var(--accent))]/45 bg-[rgb(var(--accent))]/8" : "border-transparent hover:bg-[rgb(var(--card-strong))]"}`}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${active ? "bg-[rgb(var(--accent))] text-white dark:text-slate-950" : "bg-[rgb(var(--card-strong))] muted"}`}>{index + 1}</span>
                <span className="min-w-0"><span className="block truncate text-xs font-black">{item.title}</span><span className="muted block text-[10px] uppercase tracking-wider">{item.kind}</span></span>
                {active ? <ChevronRight size={14} className="ml-auto text-[rgb(var(--accent))]" /> : <Circle size={10} className="muted ml-auto" />}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div><div className="flex items-center gap-2"><span className="badge">Step {stepIndex + 1} of {lesson.steps.length}</span><span className="badge"><Clock3 size={12} /> {step.xpReward} XP</span></div><h2 className="mt-3 text-3xl font-black tracking-tight">{step.title}</h2></div>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${saveState === "error" ? "text-[rgb(var(--danger))]" : "muted"}`} aria-live="polite">
              {saveState === "saving" ? <><Save size={13} className="animate-pulse" /> Saving…</> : saveState === "saved" ? <><Check size={13} /> Autosaved</> : saveState === "error" ? "Save failed" : null}
            </div>
          </header>

          <section className="card p-5 sm:p-7"><div className="prose-cforge">{step.body}</div></section>

          {codeKinds.has(step.kind) && (
            <>
              <section className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
                <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-2.5"><div className="flex items-center gap-2 text-xs font-black"><Code2 size={15} className="text-[rgb(var(--accent))]" /> main.c</div><button type="button" onClick={() => setCode(step.starterCode ?? "")} className="muted flex items-center gap-1 text-xs font-bold hover:text-[rgb(var(--fg))]"><RotateCcw size={13} /> Reset</button></div>
                <CodeEditor value={code} onChange={setCode} height="430px" fontSize={editorFontRef.current} />
              </section>
              <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
                <section className="card p-4">
                  <label htmlFor="stdin" className="flex items-center gap-2 text-sm font-black"><Terminal size={16} className="text-[rgb(var(--accent))]" /> Standard input</label>
                  <textarea id="stdin" rows={4} value={stdin} onChange={(event) => setStdin(event.target.value)} className="input mono mt-3 resize-y text-xs" placeholder="Input supplied to stdin" />
                  <button type="button" onClick={runCode} disabled={busy || !code.trim()} className="btn btn-primary mt-3 w-full"><Play size={16} fill="currentColor" /> {busy ? "Compiling…" : "Run with GCC"}</button>
                </section>
                <section className="card min-h-48 p-4" aria-live="polite">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-black">Compiler result</h3>{runResult?.verdict && <span className={`badge ${codeSucceeded ? "text-[rgb(var(--success))]" : "text-[rgb(var(--danger))]"}`}>{runResult.verdict}</span>}</div>
                  {!runResult && <div className="muted grid min-h-28 place-items-center text-center text-xs">Run the translation unit to inspect compiler and program output.</div>}
                  {runResult?.error && <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm font-semibold text-[rgb(var(--danger))]">{runResult.error}</p>}
                  {runResult && !runResult.error && <div className="mono mt-3 space-y-3 text-xs">
                    {runResult.stdout && <div><div className="muted mb-1 font-sans text-[10px] font-black uppercase tracking-wider">stdout</div><pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-3 text-slate-100">{runResult.stdout}</pre></div>}
                    {runResult.compile && <div><div className="mb-1 font-sans text-[10px] font-black uppercase tracking-wider text-[rgb(var(--danger))]">compiler</div><pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-rose-950 p-3 text-rose-100">{runResult.compile}</pre></div>}
                    {runResult.stderr && <div><div className="mb-1 font-sans text-[10px] font-black uppercase tracking-wider text-[rgb(var(--danger))]">stderr</div><pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-rose-950 p-3 text-rose-100">{runResult.stderr}</pre></div>}
                    {(runResult.timeMs != null || runResult.memoryKb != null) && <div className="muted flex gap-4"><span>{runResult.timeMs ?? "—"} ms</span><span>{runResult.memoryKb ?? "—"} KB</span></div>}
                  </div>}
                  {step.expectedOutput && <div className="mt-3 border-t border-[rgb(var(--border))] pt-3 text-xs"><span className="muted font-bold">Expected output: </span><code className="mono">{step.expectedOutput}</code></div>}
                  {codeSucceeded && <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm font-bold text-[rgb(var(--success))]"><CheckCircle2 size={17} /> Output matches. Evidence recorded.</div>}
                </section>
              </div>
            </>
          )}

          {step.kind === "quiz" && (
            <section className="card p-5 sm:p-6">
              <div className="space-y-2">
                {quizOptions.map((option) => (
                  <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm font-semibold transition ${quizPick === option ? "border-[rgb(var(--accent))]/60 bg-[rgb(var(--accent))]/7" : "border-[rgb(var(--border))] hover:bg-[rgb(var(--card-strong))]"}`}>
                    <input type="radio" name="quiz" className="mt-0.5 accent-[rgb(var(--accent))]" checked={quizPick === option} onChange={() => { setQuizPick(option); setQuizState("idle"); }} />{option}
                  </label>
                ))}
              </div>
              <button type="button" onClick={submitQuiz} disabled={!quizPick || busy} className="btn btn-primary mt-4">Check answer</button>
              {quizState !== "idle" && <div className={`mt-4 rounded-xl p-3 text-sm font-bold ${quizState === "correct" ? "bg-emerald-500/10 text-[rgb(var(--success))]" : "bg-amber-500/10 text-[rgb(var(--warning))]"}`}>{quizState === "correct" ? "Correct. That evidence is now part of your mastery model." : "Not yet. Re-read the explanation, explain your reasoning, and try again."}</div>}
            </section>
          )}

          {hints.length > 0 && (
            <section className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-black"><Lightbulb size={17} className="text-amber-500" /> Need a nudge?</div><button type="button" className="btn btn-secondary" onClick={() => setHintIndex((value) => Math.min(hints.length, value + 1))} disabled={hintIndex >= hints.length}>Reveal hint {Math.min(hintIndex + 1, hints.length)}</button></div>
              {hintIndex > 0 && <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">{hints.slice(0, hintIndex).map((hint) => <li key={hint}>{hint}</li>)}</ol>}
            </section>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(var(--border))] pt-5">
            <button type="button" disabled={stepIndex <= 0} onClick={() => lesson.steps[stepIndex - 1] && selectStep(lesson.steps[stepIndex - 1])} className="btn btn-secondary"><ArrowLeft size={16} /> Previous</button>
            {isLast ? <Link href="/worlds" onClick={() => saveProgress(step.id, code, { completed: true })} className="btn btn-primary">Finish lesson <CheckCircle2 size={17} /></Link> : <button type="button" onClick={goNext} className="btn btn-primary">Next step <ArrowRight size={16} /></button>}
          </footer>
        </div>
      </div>
    </div>
  );
}
