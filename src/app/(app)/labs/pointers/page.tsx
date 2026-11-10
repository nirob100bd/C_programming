"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Braces,
  Boxes,
  Eraser,
  MemoryStick,
  Play,
  RotateCcw,
  ShieldAlert,
  Trash2
} from "lucide-react";
import {
  LAB_ACTIONS,
  type MemoryAction,
  type MemoryState,
  applyAction,
  hex,
  initialMemoryState,
  stackFrameSize
} from "@/lib/memory-model";

const DANGER_ACTIONS = new Set<MemoryAction>(["use-after-free", "double-free"]);

export default function PointerLabPage() {
  const [state, setState] = useState<MemoryState>(initialMemoryState);
  const [total, setTotal] = useState(3);

  const run = (action: MemoryAction) => {
    setState((current) => (action === "reset" ? initialMemoryState() : applyAction(current, action, total)));
  };

  const pSlot = useMemo(() => state.stack.find((slot) => slot.name === "p") ?? null, [state.stack]);
  const liveBlock = useMemo(
    () => state.heapBlocks.find((block) => block.address === state.pPointsTo),
    [state.heapBlocks, state.pPointsTo]
  );
  const frameBytes = stackFrameSize(state);
  const codeLines = state.code.split("\n");

  return (
    <div className="container-page max-w-6xl space-y-7">
      <section className="max-w-3xl">
        <p className="eyebrow">Simulated stack frame and heap</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Pointer laboratory</h1>
        <p className="muted mt-4 text-lg leading-8">
          Step through a real allocation lifecycle: a local counter on the stack, a{" "}
          <code className="mono">malloc</code> block on the heap, stores through the pointer, then{" "}
          <code className="mono">free</code>. Watch which addresses are stable, which one moves when a
          block is recycled, and what makes a pointer dangle.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Run the program</h2>
              <button type="button" onClick={() => run("reset")} aria-label="Reset" className="muted flex items-center gap-1 text-xs font-bold hover:text-[rgb(var(--fg))]">
                <RotateCcw size={13} /> Reset
              </button>
            </div>
            <label htmlFor="count" className="mt-4 block text-xs font-bold">
              int n = <span className="mono">{total}</span> ints to allocate
            </label>
            <input
              id="count"
              type="range"
              min={1}
              max={5}
              value={total}
              onChange={(event) => setTotal(Number(event.target.value))}
              className="mt-2 w-full accent-[rgb(var(--accent))]"
            />
            <p className="muted mt-1 text-[11px] font-semibold">
              {total * 4} bytes requested ({total} × sizeof(int))
            </p>

            <div className="mt-4 space-y-2">
              {LAB_ACTIONS.map((item) => (
                <button
                  key={item.action}
                  type="button"
                  onClick={() => run(item.action)}
                  title={item.hint}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                    DANGER_ACTIONS.has(item.action)
                      ? "border-rose-500/35 text-[rgb(var(--danger))] hover:bg-rose-500/10"
                      : "border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]/55 hover:bg-[rgb(var(--accent))]/6"
                  }`}
                >
                  <span className="mono truncate">{item.label}</span>
                  {DANGER_ACTIONS.has(item.action) ? <ShieldAlert size={13} /> : <Play size={12} />}
                </button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-black"><Braces size={16} className="text-[rgb(var(--accent))]" /> Program</h2>
            <ol className="mono mt-3 space-y-1 text-[11px] leading-5">
              {codeLines.map((line, index) => (
                <li
                  key={line}
                  className={`rounded px-2 py-0.5 transition ${
                    state.line === index + 1 ? "bg-[rgb(var(--accent))]/15 font-black text-[rgb(var(--accent))]" : "muted"
                  }`}
                >
                  <span className="mr-2 inline-block w-3 text-right opacity-60">{index + 1}</span>
                  {line}
                </li>
              ))}
            </ol>
          </section>

          <section className="card grid grid-cols-2 gap-3 p-5 text-xs font-bold">
            <Stat label="malloc calls" value={state.allocations} />
            <Stat label="free calls" value={state.frees} />
            <Stat label="bytes requested" value={state.totalAllocated} />
            <Stat label="bytes still owned" value={state.liveBytes} />
          </section>
        </div>

        <div className="space-y-4">
          <section aria-live="polite" className={`card p-4 ${state.warning ? "border-rose-500/45 bg-rose-500/5" : ""}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${state.warning ? "bg-rose-500/15 text-[rgb(var(--danger))]" : "bg-[rgb(var(--accent))]/12 text-[rgb(var(--accent))]"}`}>
                {state.warning ? <AlertTriangle size={16} /> : <ArrowRight size={16} />}
              </span>
              <p className="text-sm font-semibold leading-6">{state.caption}</p>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-black"><MemoryStick size={15} className="text-[rgb(var(--accent))]" /> Stack frame</h2>
                <span className="badge">{frameBytes} bytes</span>
              </header>
              <div className="space-y-2 p-4">
                {state.stack.length === 0 && <EmptyHint text="No locals yet. Run int n = 3." />}
                {state.stack.map((slot) => {
                  const active = state.highlights.stack === slot.name;
                  const isPointer = slot.type.includes("*");
                  const target = isPointer && slot.value !== null ? state.heapBlocks.find((block) => block.address === slot.value) : undefined;
                  return (
                    <div
                      key={slot.name}
                      className={`rounded-xl border-2 p-3 transition-all duration-300 ${active ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/8" : "border-[rgb(var(--border))]"}`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="mono text-xs font-black">{slot.type} {slot.name}</span>
                        <span className="mono muted text-[11px]">{hex(slot.address)}</span>
                      </div>
                      <div className="mono mt-2 text-xl font-black">
                        {slot.value === null ? "NULL" : isPointer ? hex(slot.value) : slot.value}
                      </div>
                      <div className="muted mt-1 text-[10px] font-semibold">
                        {isPointer
                          ? target
                            ? target.freed
                              ? `dangling → freed block at ${hex(target.address)}`
                              : `owns block at ${hex(target.address)}`
                            : "not pointing at a live block"
                          : slot.note}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-black"><Boxes size={15} className="text-amber-500" /> Heap</h2>
                <span className="badge">{state.heapBlocks.length} block{state.heapBlocks.length === 1 ? "" : "s"}</span>
              </header>
              <div className="space-y-2 p-4">
                {state.heapBlocks.length === 0 && <EmptyHint text="No allocations. Run malloc to reserve a block." />}
                {state.heapBlocks.map((block) => {
                  const active = state.highlights.heap === block.address;
                  return (
                    <div
                      key={block.id}
                      className={`rounded-xl border-2 p-3 transition-all duration-300 ${
                        block.freed
                          ? "border-dashed border-rose-500/50 bg-rose-500/5 opacity-80"
                          : active
                            ? "border-amber-500 bg-amber-500/8"
                            : "border-[rgb(var(--border))]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="mono text-xs font-black">block #{block.id}</span>
                        <span className="flex items-center gap-1.5">
                          {block.reused && <span className="badge border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300">reused</span>}
                          {block.freed
                            ? <span className="badge border-rose-500/40 bg-rose-500/10 text-[rgb(var(--danger))]"><Trash2 size={10} /> freed</span>
                            : <span className="badge border-emerald-500/40 bg-emerald-500/10 text-[rgb(var(--success))]">owned</span>}
                        </span>
                      </div>
                      <div className="mono muted mt-1 text-[11px]">
                        {hex(block.address)} · {block.size} bytes
                      </div>
                      <div className="mt-2 grid grid-cols-5 gap-1">
                        {block.values.map((value, index) => (
                          <div key={index} className={`rounded-lg border px-1 py-1.5 text-center ${block.freed ? "border-rose-500/30" : "border-[rgb(var(--border))]"}`}>
                            <div className="mono text-xs font-black">{value}</div>
                            <div className="mono muted text-[9px]">{hex(block.address + index * 4)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="card p-5">
            <h2 className="text-sm font-black">What the model is telling you</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Note
                icon={MemoryStick}
                title="Stack addresses are stable"
                body={`n lives at a fixed ${hex(0x7ffc_1200)}-style address for the whole frame. Adding a heap block never moves it.`}
              />
              <Note
                icon={Boxes}
                title="malloc hands back an address"
                body={pSlot?.value
                  ? `p currently stores ${hex(pSlot.value)}. That value is an address, not the data itself.`
                  : "p stores the address malloc returns. The data lives far away, in the heap region."}
              />
              <Note
                icon={ShieldAlert}
                title="free invalidates ownership"
                body={liveBlock?.freed
                  ? `The block at ${hex(liveBlock.address)} is freed but p still holds its address — that is a dangling pointer.`
                  : "After free the bytes may still look intact, but they belong to the allocator. Reading them is undefined behavior."}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/labs/algorithms" className="btn btn-secondary"><Eraser size={15} /> Algorithm visualizer</Link>
              <Link href="/reference/malloc" className="btn btn-secondary">malloc reference</Link>
              <Link href="/reference/free" className="btn btn-secondary">free reference</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-subtle p-3">
      <div className="text-lg font-black">{value}</div>
      <div className="muted text-[10px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="muted rounded-xl border border-dashed border-[rgb(var(--border))] p-4 text-center text-xs font-semibold">{text}</p>;
}

function Note({ icon: Icon, title, body }: { icon: typeof MemoryStick; title: string; body: string }) {
  return (
    <article className="card-subtle p-3">
      <div className="flex items-center gap-1.5 text-xs font-black"><Icon size={13} className="text-[rgb(var(--accent))]" /> {title}</div>
      <p className="muted mt-1.5 text-[11px] leading-5">{body}</p>
    </article>
  );
}
