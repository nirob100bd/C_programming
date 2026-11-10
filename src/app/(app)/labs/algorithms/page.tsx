"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  Binary,
  ChevronLeft,
  CircleSlash,
  Gauge,
  GitBranch,
  Pause,
  Play,
  RotateCcw,
  Search,
  SkipForward
} from "lucide-react";
import {
  BFS_GRAPH,
  type AlgorithmKey,
  type Frame,
  clampFrame,
  framesFor
} from "@/lib/algorithm-steps";

const ALGORITHMS: {
  key: AlgorithmKey;
  name: string;
  blurb: string;
  icon: typeof Binary;
  complexity: string;
}[] = [
  {
    key: "bubble-sort",
    name: "Bubble Sort",
    blurb: "Compare adjacent pairs and push the largest remaining value to the end of each pass.",
    icon: ArrowDownUp,
    complexity: "O(n²) time, O(1) space"
  },
  {
    key: "binary-search",
    name: "Binary Search",
    blurb: "Halve the sorted window on every comparison; watch the discarded half grey out.",
    icon: Binary,
    complexity: "O(log n) time, O(1) space"
  },
  {
    key: "bfs",
    name: "Breadth-First Search",
    blurb: "Explore every neighbour at the current depth before going deeper, using a FIFO queue.",
    icon: GitBranch,
    complexity: "O(V + E) time, O(V) space"
  }
];

const PLAYBACK_MS = 750;

function sortBarHeight(value: number, max: number) {
  return `${Math.max(12, Math.round((value / Math.max(1, max)) * 100))}%`;
}

export default function AlgorithmLabPage() {
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("bubble-sort");
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  const sortInput = useMemo(() => [5, 1, 4, 2, 8, 3], []);
  const searchInput = useMemo(() => [1, 3, 5, 7, 9, 11, 13, 15], []);
  const [searchTarget, setSearchTarget] = useState(11);
  const [bfsSource, setBfsSource] = useState("A");

  const frames = useMemo(
    () => framesFor(algorithm, { values: algorithm === "bubble-sort" ? sortInput : searchInput, target: searchTarget, source: bfsSource }),
    [algorithm, bfsSource, searchInput, searchTarget, sortInput]
  );

  const current = frames[clampFrame(cursor, frames.length)] as Frame;
  const total = frames.length;
  const atEnd = cursor >= total - 1;

  const stepForward = useCallback(() => {
    setCursor((value) => clampFrame(value + 1, frames.length));
  }, [frames.length]);

  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (cursor >= frames.length - 1) {
      setCursor(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  }, [cursor, frames.length]);

  // Playback advances one frame at a time; it stops itself at the last frame.
  useEffect(() => {
    if (!playing) return;
    if (cursor >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setCursor((value) => clampFrame(value + 1, frames.length)), PLAYBACK_MS);
    return () => window.clearTimeout(timer);
  }, [cursor, frames.length, playing]);

  // Keyboard control: arrows step, space plays or pauses.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "ArrowRight") { event.preventDefault(); setPlaying(false); stepForward(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setPlaying(false); setCursor((value) => clampFrame(value - 1, frames.length)); }
      if (event.key === " ") { event.preventDefault(); togglePlay(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [frames.length, stepForward, togglePlay]);

  function switchAlgorithm(key: AlgorithmKey) {
    setAlgorithm(key);
    setPlaying(false);
    setCursor(0);
  }

  return (
    <div className="container-page max-w-6xl space-y-7">
      <section className="max-w-3xl">
        <p className="eyebrow">Step-through algorithm laboratory</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Algorithm visualizer</h1>
        <p className="muted mt-4 text-lg leading-8">
          Every frame below is a state the algorithm really visits. Press play, or step one comparison at
          a time and read the caption to see exactly why the data moves.
        </p>
      </section>

      <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Algorithm">
        {ALGORITHMS.map((item) => {
          const Icon = item.icon;
          const active = item.key === algorithm;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchAlgorithm(item.key)}
              className={`card p-4 text-left transition ${active ? "border-[rgb(var(--accent))]/60 bg-[rgb(var(--accent))]/6" : "hover:border-[rgb(var(--accent))]/35"}`}
            >
              <span className={`inline-flex items-center gap-2 text-sm font-black ${active ? "text-[rgb(var(--accent))]" : ""}`}>
                <Icon size={16} /> {item.name}
              </span>
              <p className="muted mt-2 text-xs leading-5">{item.blurb}</p>
              <p className="mono muted mt-3 text-[10px] uppercase tracking-wider">{item.complexity}</p>
            </button>
          );
        })}
      </div>

      <section className="card overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgb(var(--border))] p-4">
          <button
            type="button"
            onClick={togglePlay}
            className="btn btn-primary"
            aria-label={playing ? "Pause" : atEnd ? "Replay" : "Play"}
          >
            {playing ? <Pause size={16} /> : atEnd ? <RotateCcw size={16} /> : <Play size={16} fill="currentColor" />}
            <span aria-hidden="true">{playing ? "Pause" : atEnd ? "Replay" : "Play"}</span>
          </button>
          <button
            type="button"
            onClick={() => { setPlaying(false); stepForward(); }}
            disabled={atEnd}
            className="btn btn-secondary"
          >
            <SkipForward size={16} /> Step forward
          </button>
          <button
            type="button"
            onClick={() => { setPlaying(false); setCursor((value) => clampFrame(value - 1, frames.length)); }}
            disabled={cursor === 0}
            className="btn btn-secondary"
            aria-label="Step back"
          >
            <ChevronLeft size={16} aria-hidden="true" /> Back
          </button>
          <button type="button" onClick={reset} className="btn btn-secondary">
            <RotateCcw size={16} /> Reset
          </button>

          <div className="ml-auto flex min-w-56 flex-1 items-center gap-3">
            <input
              type="range"
              min={0}
              max={Math.max(0, total - 1)}
              value={cursor}
              onChange={(event) => { setPlaying(false); setCursor(clampFrame(Number(event.target.value), frames.length)); }}
              aria-label="Timeline"
              className="w-full accent-[rgb(var(--accent))]"
            />
            <span
              className="mono muted shrink-0 text-xs font-bold"
              aria-live="polite"
              aria-label="Frame position"
              role="status"
            >
              <span aria-hidden="true">{cursor + 1} / {total}</span>
              <span className="sr-only">frame {cursor + 1} of {total}</span>
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {algorithm === "bubble-sort" && current.kind === "bubble-sort" && (
            <BubbleSortView frame={current} />
          )}
          {algorithm === "binary-search" && current.kind === "binary-search" && (
            <BinarySearchView frame={current} values={searchInput} target={searchTarget} onTarget={setSearchTarget} />
          )}
          {algorithm === "bfs" && current.kind === "bfs" && (
            <BfsView frame={current} source={bfsSource} onSource={setBfsSource} />
          )}
        </div>

        <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--card-strong))]/50 p-4" aria-live="polite">
          <p className="flex items-start gap-2 text-sm font-semibold">
            {current.done ? <CircleSlash size={16} className="mt-0.5 shrink-0 text-[rgb(var(--success))]" /> : <Gauge size={16} className="mt-0.5 shrink-0 text-[rgb(var(--accent))]" />}
            {current.caption}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card p-5"><h2 className="text-sm font-black">Legend</h2><ul className="muted mt-3 space-y-2 text-xs leading-5"><li><span className="mr-2 inline-block size-3 rounded bg-[rgb(var(--accent))]" /> active comparison</li><li><span className="mr-2 inline-block size-3 rounded bg-emerald-500" /> settled / visited</li><li><span className="mr-2 inline-block size-3 rounded bg-[rgb(var(--card-strong))] ring-1 ring-[rgb(var(--border))]" /> discarded / untouched</li></ul></article>
        <article className="card p-5"><h2 className="text-sm font-black">Keyboard</h2><p className="muted mt-3 text-xs leading-6"><kbd className="mono rounded border border-[rgb(var(--border))] px-1.5">→</kbd> step forward, <kbd className="mono rounded border border-[rgb(var(--border))] px-1.5">←</kbd> step back, <kbd className="mono rounded border border-[rgb(var(--border))] px-1.5">space</kbd> play or pause.</p></article>
        <article className="card p-5"><h2 className="text-sm font-black">Related practice</h2><p className="muted mt-3 text-xs leading-5">Trace what the algorithm inspects, then prove it in code.</p><div className="mt-3 flex flex-wrap gap-2"><Link href="/arena" className="badge hover:border-[rgb(var(--accent))]/60">Arena <Search size={11} /></Link><Link href="/labs/pointers" className="badge hover:border-[rgb(var(--accent))]/60">Pointer lab</Link></div></article>
      </section>
    </div>
  );
}

function BubbleSortView({ frame }: { frame: Extract<Frame, { kind: "bubble-sort" }> }) {
  const max = Math.max(...frame.cells.map((cell) => cell.value), 1);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
        <span className="badge">pass {frame.pass}</span>
        <span className="badge">{frame.comparisons} comparisons</span>
        <span className="badge">{frame.swaps} swaps</span>
        {frame.done && <span className="badge border-emerald-500/40 bg-emerald-500/10 text-[rgb(var(--success))]">sorted</span>}
      </div>
      <div className="flex h-56 items-end gap-2 sm:gap-3" aria-hidden="true">
        {frame.cells.map((cell, index) => {
          const comparing = frame.comparing?.includes(index);
          const swapped = frame.swapped?.includes(index);
          const sorted = frame.sorted.includes(index);
          return (
            <div key={cell.id} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <span className="mono text-xs font-black">{cell.value}</span>
              <div
                className={`w-full rounded-t-xl border-2 transition-all duration-500 ease-out ${
                  swapped
                    ? "border-rose-500 bg-rose-500/70"
                    : comparing
                      ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/70"
                      : sorted
                        ? "border-emerald-500/60 bg-emerald-500/50"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--card-strong))]"
                }`}
                style={{ height: sortBarHeight(cell.value, max) }}
              />
            </div>
          );
        })}
      </div>
      <ol className="flex flex-wrap gap-1 text-[11px] font-bold">
        {frame.cells.map((cell, index) => (
          <li key={cell.id} className={`mono rounded px-1.5 py-0.5 ${frame.comparing?.includes(index) ? "bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent))]" : "muted"}`}>{index}</li>
        ))}
      </ol>
    </div>
  );
}

function BinarySearchView({
  frame,
  values,
  target,
  onTarget
}: {
  frame: Extract<Frame, { kind: "binary-search" }>;
  values: number[];
  target: number;
  onTarget: (value: number) => void;
}) {
  const choices = useMemo(() => [...new Set([...values, Math.max(...values) + 2])], [values]);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="target" className="text-xs font-bold">Target</label>
        <select id="target" className="input mono w-24" value={target} onChange={(event) => onTarget(Number(event.target.value))}>
          {choices.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <span className="badge">low = {frame.low}</span>
        <span className="badge">high = {frame.high}</span>
        {frame.mid !== null && <span className="badge border-[rgb(var(--accent))]/40 text-[rgb(var(--accent))]">mid = {frame.mid}</span>}
        {frame.found !== null && <span className="badge border-emerald-500/40 bg-emerald-500/10 text-[rgb(var(--success))]">found at {frame.found}</span>}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {frame.values.map((value, index) => {
          const discarded = frame.discarded.includes(index);
          const isFound = frame.found === index;
          const isMid = frame.mid === index;
          return (
            <div
              key={index}
              className={`rounded-xl border-2 p-2 text-center transition-all duration-300 ${
                isFound
                  ? "scale-105 border-emerald-500 bg-emerald-500/20"
                  : isMid
                    ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/15"
                    : discarded
                      ? "border-[rgb(var(--border))] bg-[rgb(var(--card-strong))] opacity-35"
                      : "border-[rgb(var(--border))]"
              }`}
            >
              <div className="mono text-lg font-black">{value}</div>
              <div className="mono muted text-[10px]">{index}</div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
        <span className="badge">searching for {frame.target}</span>
        <span className="badge">{frame.discarded.length} indices discarded</span>
        <span className="badge">{frame.values.length} values</span>
      </div>
    </div>
  );
}

function BfsView({
  frame,
  source,
  onSource
}: {
  frame: Extract<Frame, { kind: "bfs" }>;
  source: string;
  onSource: (value: string) => void;
}) {
  const nodeById = new Map(BFS_GRAPH.nodes.map((node) => [node.id, node]));
  const inTree = new Set(frame.treeEdges.flat());
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="source" className="text-xs font-bold">Start node</label>
        <select id="source" className="input mono w-20" value={source} onChange={(event) => onSource(event.target.value)}>
          {BFS_GRAPH.nodes.map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}
        </select>
        <span className="badge">{frame.visited.length} / {BFS_GRAPH.nodes.length} visited</span>
        <span className="badge">queue: {frame.frontier.length ? frame.frontier.join(" → ") : "empty"}</span>
      </div>

      <div className="relative mx-auto aspect-[16/9] w-full max-w-3xl rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card-strong))]/40">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
          {BFS_GRAPH.edges.map(([a, b]) => {
            const from = nodeById.get(a)!;
            const to = nodeById.get(b)!;
            const isTree = frame.treeEdges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
            const inspected = frame.inspected && ((frame.inspected[0] === a && frame.inspected[1] === b) || (frame.inspected[0] === b && frame.inspected[1] === a));
            return (
              <line
                key={`${a}-${b}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                vectorEffect="non-scaling-stroke"
                strokeWidth={inspected ? 3 : 1.5}
                className={`transition-all duration-300 ${inspected ? "stroke-[rgb(var(--accent))]" : isTree ? "stroke-emerald-500" : "stroke-[rgb(var(--border))]"}`}
              />
            );
          })}
        </svg>
        {BFS_GRAPH.nodes.map((node) => {
          const visited = frame.visited.includes(node.id);
          const queued = frame.frontier.includes(node.id);
          const current = frame.current === node.id;
          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className={`mono grid size-11 place-items-center rounded-full border-2 text-sm font-black transition-all duration-300 ${
                  current
                    ? "scale-110 border-[rgb(var(--accent))] bg-[rgb(var(--accent))] text-white dark:text-slate-950"
                    : queued
                      ? "border-amber-500 bg-amber-500/25 text-amber-700 dark:text-amber-200"
                      : visited
                        ? "border-emerald-500 bg-emerald-500/25"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--card))] opacity-60"
                }`}
              >
                {node.label}
              </div>
              {frame.depths[node.id] !== undefined && (
                <div className="mono muted mt-1 text-[10px]">d{frame.depths[node.id]}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
        <span className="badge border-amber-500/40 bg-amber-500/10">queued</span>
        <span className="badge border-emerald-500/40 bg-emerald-500/10">visited</span>
        <span className="badge">{inTree.size} nodes have a tree edge</span>
      </div>
    </div>
  );
}
