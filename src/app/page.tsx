import Link from "next/link";
import {
  ArrowRight,
  Binary,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Cpu,
  Gauge,
  ShieldCheck,
  Sparkles,
  TerminalSquare
} from "lucide-react";

const features = [
  { icon: TerminalSquare, title: "Compile real C", body: "Run code through an isolated Judge0 GCC service and inspect stdout, diagnostics, time, and memory." },
  { icon: BrainCircuit, title: "Prove mastery", body: "Skill states come from weighted evidence—prediction, tracing, debugging, and independent solutions." },
  { icon: Binary, title: "See memory", body: "Build pointer intuition with live address, dereference, null, and memory-cell visualizations." },
  { icon: Gauge, title: "Train for constraints", body: "Move from first loops to complexity analysis, data structures, competitive patterns, and systems C." }
];

const curriculum = ["Computational thinking", "C fundamentals", "Arrays & strings", "Pointers & memory", "Data structures", "Algorithms", "Competitive C", "Systems engineering"];

export default function HomePage() {
  return (
    <main id="main-content" className="overflow-hidden">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="CForge home">
          <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent))] font-mono text-sm font-black text-white shadow-lg dark:text-slate-950">C_</span>
          <span className="text-xl font-black tracking-tight">CForge</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-secondary">Log in</Link>
          <Link href="/register" className="btn btn-primary hidden sm:inline-flex">Start learning <ArrowRight size={16} /></Link>
        </div>
      </header>

      <section className="container-page relative grid min-h-[680px] items-center gap-12 pb-20 pt-12 lg:grid-cols-[1.08fr_.92fr] lg:pt-16">
        <div className="relative z-10">
          <div className="badge border-[rgb(var(--accent))]/25 bg-[rgb(var(--accent))]/8 text-[rgb(var(--accent))]">
            <Sparkles size={14} /> A deliberate-practice path to C mastery
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-[5.25rem]">
            Understand the machine. <span className="text-[rgb(var(--accent))]">Forge the skill.</span>
          </h1>
          <p className="muted mt-7 max-w-2xl text-lg leading-8 sm:text-xl">
            One rigorous path from your first program to algorithms, competitive problem solving, dynamic memory, and systems-level C.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn btn-primary min-h-12 px-6 text-base">Create a free account <ArrowRight size={18} /></Link>
            <Link href="/login" className="btn btn-secondary min-h-12 px-6 text-base">Continue your progress</Link>
          </div>
          <div className="muted mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[rgb(var(--success))]" /> Persistent progress</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[rgb(var(--success))]" /> Hidden test judging</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[rgb(var(--success))]" /> No simulated compiler</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-12 rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />
          <div className="card relative overflow-hidden border-[rgb(var(--accent))]/25 shadow-glow">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3">
              <div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-rose-400" /><span className="size-2.5 rounded-full bg-amber-400" /><span className="size-2.5 rounded-full bg-emerald-400" /></div>
              <span className="mono muted text-[11px]">elephant.c</span>
              <Code2 size={15} className="muted" />
            </div>
            <pre className="overflow-x-auto bg-slate-950 p-6 text-[13px] leading-7 text-slate-200 sm:p-8 sm:text-sm"><code><span className="text-cyan-300">#include</span> <span className="text-amber-200">&lt;stdio.h&gt;</span>{"\n\n"}<span className="text-violet-300">int</span> <span className="text-sky-300">main</span>(<span className="text-violet-300">void</span>) {`{`}{"\n"}    <span className="text-violet-300">int</span> x;{"\n"}    <span className="text-sky-300">scanf</span>(<span className="text-amber-200">&quot;%d&quot;</span>, &amp;x);{"\n"}    <span className="text-sky-300">printf</span>(<span className="text-amber-200">&quot;%d\\n&quot;</span>, (x + <span className="text-emerald-300">4</span>) / <span className="text-emerald-300">5</span>);{"\n"}    <span className="text-violet-300">return</span> <span className="text-emerald-300">0</span>;{"\n"}{`}`}</code></pre>
            <div className="grid grid-cols-3 gap-px bg-[rgb(var(--border))]">
              <div className="bg-[rgb(var(--card))] p-4"><div className="muted text-[10px] font-black uppercase tracking-widest">Verdict</div><div className="mt-1 text-sm font-black text-[rgb(var(--success))]">Accepted</div></div>
              <div className="bg-[rgb(var(--card))] p-4"><div className="muted text-[10px] font-black uppercase tracking-widest">Time</div><div className="mono mt-1 text-sm font-black">O(1)</div></div>
              <div className="bg-[rgb(var(--card))] p-4"><div className="muted text-[10px] font-black uppercase tracking-widest">Skill</div><div className="mt-1 text-sm font-black">Independent</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[rgb(var(--border))] bg-[rgb(var(--card))]/55">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Built for understanding</p>
            <h2 className="section-title mt-3">Not another syntax playlist.</h2>
            <p className="muted mt-3 leading-7">Read less, reason more. Every concept moves through explanation, prediction, tracing, implementation, debugging, and transfer.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="card p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]"><Icon size={20} /></span>
                <h3 className="mt-4 font-black">{title}</h3>
                <p className="muted mt-2 text-sm leading-6">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">A complete mental model</p>
            <h2 className="section-title mt-3">From instructions to operating systems.</h2>
            <p className="muted mt-4 max-w-xl leading-7">The map makes prerequisites explicit. You always know what you are learning, why it matters, and which evidence proves you can use it independently.</p>
            <Link href="/register" className="btn btn-primary mt-7">Begin at World 0 <ArrowRight size={17} /></Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {curriculum.map((item, index) => (
              <div key={item} className="card flex items-center gap-3 p-4">
                <span className="mono grid size-8 shrink-0 place-items-center rounded-lg bg-[rgb(var(--accent))]/10 text-xs font-black text-[rgb(var(--accent))]">{String(index).padStart(2, "0")}</span>
                <span className="text-sm font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="absolute right-0 top-0 size-80 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <ShieldCheck className="text-teal-300" size={30} />
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Real feedback. Durable skill.</h2>
            <p className="mt-3 text-slate-300">Your code is judged by a separately deployed sandbox. If PostgreSQL or Judge0 is missing, CForge says so—nothing is silently simulated.</p>
            <Link href="/register" className="btn mt-7 bg-teal-300 text-slate-950 hover:bg-teal-200">Start forging <ArrowRight size={17} /></Link>
          </div>
          <Cpu className="absolute -bottom-12 right-8 hidden text-white/5 lg:block" size={250} strokeWidth={1} />
        </div>
      </section>

      <footer className="border-t border-[rgb(var(--border))] py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-black">CForge</span>
          <span className="muted">C, from first principles to systems thinking.</span>
        </div>
      </footer>
    </main>
  );
}
