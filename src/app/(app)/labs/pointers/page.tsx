"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, Binary, MousePointer2, RotateCcw, Wand2 } from "lucide-react";

type Target = 0 | 1 | null;
const addresses = [0x1000, 0x1004];
const hex = (value: number) => `0x${value.toString(16).toUpperCase()}`;

export default function PointerLabPage() {
  const [values, setValues] = useState<[number, number]>([42, 99]);
  const [target, setTarget] = useState<Target>(0);
  const [writeValue, setWriteValue] = useState(7);
  const cells = useMemo(() => [
    { name: "x", address: addresses[0], value: values[0] },
    { name: "y", address: addresses[1], value: values[1] }
  ], [values]);

  function writeThroughPointer() {
    if (target === null) return;
    setValues((current) => target === 0 ? [writeValue, current[1]] : [current[0], writeValue]);
  }

  return (
    <div className="container-page max-w-6xl space-y-7">
      <section className="max-w-3xl"><p className="eyebrow">Interactive memory model</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Pointer laboratory</h1><p className="muted mt-4 text-lg leading-8">Treat addresses and values as different things. Retarget <code className="mono">p</code>, dereference it, and write through it while the memory diagram updates.</p></section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between"><h2 className="font-black">Controls</h2><button type="button" onClick={() => { setValues([42, 99]); setTarget(0); setWriteValue(7); }} className="muted flex items-center gap-1 text-xs font-bold hover:text-[rgb(var(--fg))]"><RotateCcw size={13} /> Reset</button></div>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3"><div><label htmlFor="x-value" className="mb-1.5 block text-xs font-bold">int x</label><input id="x-value" type="number" className="input mono" value={values[0]} onChange={(event) => setValues([Number(event.target.value), values[1]])} /></div><div><label htmlFor="y-value" className="mb-1.5 block text-xs font-bold">int y</label><input id="y-value" type="number" className="input mono" value={values[1]} onChange={(event) => setValues([values[0], Number(event.target.value)])} /></div></div>
            <div><label htmlFor="target" className="mb-1.5 block text-xs font-bold">int *p points to</label><select id="target" className="input mono" value={target === null ? "null" : target} onChange={(event) => setTarget(event.target.value === "null" ? null : Number(event.target.value) as 0 | 1)}><option value={0}>&amp;x</option><option value={1}>&amp;y</option><option value="null">NULL</option></select></div>
            <div className="border-t border-[rgb(var(--border))] pt-4"><label htmlFor="write-value" className="mb-1.5 block text-xs font-bold">Value for *p =</label><div className="flex gap-2"><input id="write-value" type="number" className="input mono" value={writeValue} onChange={(event) => setWriteValue(Number(event.target.value))} /><button type="button" onClick={writeThroughPointer} disabled={target === null} className="btn btn-primary shrink-0"><Wand2 size={15} /> Write</button></div></div>
          </div>

          <div className={`mt-5 rounded-xl p-4 ${target === null ? "bg-rose-500/10" : "bg-[rgb(var(--accent))]/8"}`}>
            <div className="mono text-sm font-black">p = {target === null ? "NULL" : hex(cells[target].address)}</div>
            <div className={`mono mt-1 text-sm font-black ${target === null ? "text-[rgb(var(--danger))]" : "text-[rgb(var(--accent))]"}`}>*p = {target === null ? "invalid" : cells[target].value}</div>
            <p className="muted mt-2 text-xs leading-5">{target === null ? "Dereferencing NULL is undefined behavior. The write control is disabled rather than pretending it is safe." : `p stores the address of ${cells[target].name}; *p accesses the integer at that address.`}</p>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-4"><h2 className="flex items-center gap-2 font-black"><Binary size={18} className="text-[rgb(var(--accent))]" /> Simplified stack frame</h2><span className="badge">4-byte int model</span></div>
          <div className="p-5 sm:p-8">
            <div className="mx-auto max-w-2xl space-y-3">
              <div className={`relative rounded-2xl border-2 p-5 transition ${target !== null ? "border-[rgb(var(--accent))]/60 bg-[rgb(var(--accent))]/5" : "border-rose-500/50 bg-rose-500/5"}`}>
                <div className="flex items-start justify-between gap-4"><div><div className="mono text-xs font-black text-[rgb(var(--accent))]">int *p</div><div className="mono mt-2 text-2xl font-black">{target === null ? "NULL" : hex(cells[target].address)}</div></div><div className="text-right"><div className="muted text-[10px] font-black uppercase tracking-wider">p itself lives at</div><div className="mono mt-1 text-sm">0x2000</div></div></div>
                {target === null && <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[rgb(var(--danger))]"><AlertTriangle size={14} /> No valid destination</div>}
              </div>
              <div className="flex justify-center"><ArrowDown size={25} className={target === null ? "text-rose-500" : "text-[rgb(var(--accent))]"} /></div>
              <div className="grid gap-3 sm:grid-cols-2">{cells.map((cell, index) => <div key={cell.name} className={`relative rounded-2xl border-2 p-5 transition ${target === index ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/8 shadow-glow" : "border-[rgb(var(--border))]"}`}><div className="flex justify-between"><span className="mono text-xs font-black">int {cell.name}</span><span className="mono muted text-xs">{hex(cell.address)}</span></div><div className="mono mt-5 text-center text-4xl font-black">{cell.value}</div>{target === index && <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-[rgb(var(--accent))] text-white dark:text-slate-950"><MousePointer2 size={14} /></span>}</div>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3"><article className="card p-5"><div className="mono text-sm font-black">&amp;x</div><p className="muted mt-2 text-sm leading-6">The address-of operator produces where <code className="mono">x</code> lives: {hex(addresses[0])} in this model.</p></article><article className="card p-5"><div className="mono text-sm font-black">p = &amp;x</div><p className="muted mt-2 text-sm leading-6">Assignment copies that address into <code className="mono">p</code>. It does not copy the value of <code className="mono">x</code>.</p></article><article className="card p-5"><div className="mono text-sm font-black">*p = 7</div><p className="muted mt-2 text-sm leading-6">Dereference follows the stored address and writes into the selected destination cell.</p></article></section>
    </div>
  );
}
