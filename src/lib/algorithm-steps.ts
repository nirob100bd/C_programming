/**
 * Deterministic step generators for the algorithm visualizer lab.
 *
 * The UI never runs the algorithms itself: each generator returns the complete,
 * ordered list of frames up front so Play, Step Forward, and Back can move
 * through a fixed trace. That keeps the visualisation honest (the animation can
 * only show states the algorithm really visits) and makes every frame testable
 * without a browser.
 */

export type Cell = {
  /** Stable identity so React can animate a move instead of a re-create. */
  id: number;
  value: number;
};

export type SortFrame = {
  kind: "bubble-sort";
  index: number;
  cells: Cell[];
  /** Indices currently being compared. */
  comparing: [number, number] | null;
  /** Indices swapped on this step (empty when the pair was already ordered). */
  swapped: [number, number] | null;
  /** Indices confirmed to be in their final position. */
  sorted: number[];
  comparisons: number;
  swaps: number;
  pass: number;
  caption: string;
  done: boolean;
};

export type SearchFrame = {
  kind: "binary-search";
  index: number;
  values: number[];
  target: number;
  low: number;
  high: number;
  mid: number | null;
  /** Index that matches the target once found. */
  found: number | null;
  /** Indices permanently discarded by a comparison. */
  discarded: number[];
  caption: string;
  done: boolean;
};

export type BfsNode = { id: string; label: string; x: number; y: number };

export type BfsFrame = {
  kind: "bfs";
  index: number;
  visited: string[];
  frontier: string[];
  current: string | null;
  /** Edges that discovered a new node, drawn as the BFS tree. */
  treeEdges: [string, string][];
  inspected: [string, string] | null;
  depths: Record<string, number>;
  caption: string;
  done: boolean;
};

export type Frame = SortFrame | SearchFrame | BfsFrame;

export type AlgorithmKey = "bubble-sort" | "binary-search" | "bfs";

/** Bubble sort with early exit when a pass performs no swaps. */
export function bubbleSortFrames(input: number[]): SortFrame[] {
  const cells: Cell[] = input.map((value, id) => ({ id, value }));
  const sorted = new Set<number>();
  const frames: SortFrame[] = [];

  let comparisons = 0;
  let swaps = 0;
  let pass = 0;

  const snapshot = (
    comparing: [number, number] | null,
    swapped: [number, number] | null,
    caption: string,
    done = false
  ): SortFrame => ({
    kind: "bubble-sort",
    index: frames.length,
    cells: cells.map((cell) => ({ ...cell })),
    comparing,
    swapped,
    sorted: [...sorted].sort((a, b) => a - b),
    comparisons,
    swaps,
    pass,
    caption,
    done
  });

  frames.push(snapshot(null, null, `Start with ${cells.length} values. Bubble sort compares adjacent pairs.`, cells.length <= 1));
  // A trivially sorted input is already finished: do not emit a duplicate frame.
  if (frames[0].done) return frames;

  for (let end = cells.length - 1; end > 0 && !frames[frames.length - 1].done; end -= 1) {
    pass += 1;
    let swappedThisPass = false;
    for (let i = 0; i < end; i += 1) {
      comparisons += 1;
      if (cells[i].value > cells[i + 1].value) {
        swaps += 1;
        swappedThisPass = true;
        const left = cells[i];
        cells[i] = cells[i + 1];
        cells[i + 1] = left;
        frames.push(snapshot([i, i + 1], [i, i + 1], `Pass ${pass}: ${cells[i + 1].value} > ${cells[i].value}, so swap them.`, false));
      } else {
        frames.push(snapshot([i, i + 1], null, `Pass ${pass}: ${cells[i].value} ≤ ${cells[i + 1].value}, keep the order.`, false));
      }
    }
    sorted.add(end);
    frames.push(snapshot(null, null, `Pass ${pass} finished; index ${end} now holds its final value.`, false));
    if (!swappedThisPass) {
      for (let i = 0; i < end; i += 1) sorted.add(i);
      frames.push(snapshot(null, null, "No swaps in that pass, so the array is already sorted.", true));
      return frames;
    }
  }

  for (let i = 0; i < cells.length; i += 1) sorted.add(i);
  frames.push(snapshot(null, null, `Sorted after ${comparisons} comparisons and ${swaps} swaps.`, true));
  return frames;
}

/** Binary search over a sorted array, returning the complete comparison trace. */
export function binarySearchFrames(values: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = [];
  const discarded = new Set<number>();
  let low = 0;
  let high = values.length - 1;
  let found: number | null = null;

  const snapshot = (mid: number | null, caption: string, done: boolean): SearchFrame => ({
    kind: "binary-search",
    index: frames.length,
    values: [...values],
    target,
    low,
    high,
    mid,
    found,
    discarded: [...discarded].sort((a, b) => a - b),
    caption,
    done
  });

  frames.push(snapshot(null, `Search ${values.length} sorted values for ${target}. The window is [${low}, ${high}].`, values.length === 0));
  // Nothing to search: the single opening frame is the whole trace.
  if (frames[0].done) return frames;

  while (low <= high && found === null) {
    const mid = low + Math.floor((high - low) / 2);
    if (values[mid] === target) {
      found = mid;
      frames.push(snapshot(mid, `values[${mid}] = ${target}. Found it at index ${mid}.`, true));
      break;
    }
    if (values[mid] < target) {
      for (let i = low; i <= mid; i += 1) discarded.add(i);
      frames.push(snapshot(mid, `values[${mid}] = ${values[mid]} < ${target}, so discard everything at or left of ${mid}.`, false));
      low = mid + 1;
    } else {
      for (let i = mid; i <= high; i += 1) discarded.add(i);
      frames.push(snapshot(mid, `values[${mid}] = ${values[mid]} > ${target}, so discard everything at or right of ${mid}.`, false));
      high = mid - 1;
    }
  }

  if (found === null) {
    frames.push(snapshot(null, `The window is empty and ${target} is not present.`, true));
  }
  return frames;
}

/** An undirected teaching graph laid out by hand so the picture is stable. */
export const BFS_GRAPH: { nodes: BfsNode[]; edges: [string, string][] } = {
  nodes: [
    { id: "A", label: "A", x: 12, y: 46 },
    { id: "B", label: "B", x: 36, y: 18 },
    { id: "C", label: "C", x: 36, y: 74 },
    { id: "D", label: "D", x: 62, y: 12 },
    { id: "E", label: "E", x: 62, y: 50 },
    { id: "F", label: "F", x: 62, y: 86 },
    { id: "G", label: "G", x: 88, y: 34 },
    { id: "H", label: "H", x: 88, y: 68 }
  ],
  edges: [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["B", "E"],
    ["C", "E"],
    ["C", "F"],
    ["D", "G"],
    ["E", "G"],
    ["E", "H"],
    ["F", "H"]
  ]
};

/**
 * Breadth-first search from a source node. The queue is shown explicitly, so the
 * frame captures both the FIFO frontier and every node it has ever held.
 */
export function bfsFrames(source = "A", graph = BFS_GRAPH): BfsFrame[] {
  const adjacency = new Map<string, string[]>(graph.nodes.map((node) => [node.id, []]));
  for (const [a, b] of graph.edges) {
    adjacency.get(a)?.push(b);
    adjacency.get(b)?.push(a);
  }
  for (const neighbours of adjacency.values()) neighbours.sort();

  const frames: BfsFrame[] = [];
  const visited = new Set<string>();
  const queued = new Set<string>();
  const treeEdges: [string, string][] = [];
  const depths: Record<string, number> = {};
  let frontier: string[] = [];
  let current: string | null = null;
  let inspected: [string, string] | null = null;

  const snapshot = (caption: string, done: boolean): BfsFrame => ({
    kind: "bfs",
    index: frames.length,
    visited: [...visited],
    frontier: [...frontier],
    current,
    treeEdges: treeEdges.map((edge) => [...edge] as [string, string]),
    inspected,
    depths: { ...depths },
    caption,
    done
  });

  if (!adjacency.has(source)) {
    frames.push(snapshot(`Start node ${source} is not in the graph.`, true));
    return frames;
  }

  visited.add(source);
  queued.add(source);
  depths[source] = 0;
  frontier.push(source);
  frames.push(snapshot(`Enqueue the start node ${source} and mark it visited.`, false));

  while (frontier.length > 0) {
    const node = frontier[0];
    frontier = frontier.slice(1);
    current = node;
    inspected = null;
    frames.push(snapshot(`Dequeue ${node} (depth ${depths[node]}) and inspect its neighbours.`, false));

    for (const neighbour of adjacency.get(node) ?? []) {
      inspected = [node, neighbour];
      if (visited.has(neighbour)) {
        frames.push(snapshot(`${neighbour} is already visited, so skip that edge.`, false));
        continue;
      }
      visited.add(neighbour);
      depths[neighbour] = depths[node] + 1;
      treeEdges.push([node, neighbour]);
      frontier.push(neighbour);
      frames.push(snapshot(`${neighbour} is new: enqueue it at depth ${depths[neighbour]}.`, false));
    }
  }

  inspected = null;
  current = null;
  frames.push(snapshot(`The queue is empty. Reached ${visited.size} of ${graph.nodes.length} nodes; BFS order respects distance from ${source}.`, true));
  return frames;
}

export function framesFor(algorithm: AlgorithmKey, options: { values?: number[]; target?: number; source?: string } = {}): Frame[] {
  switch (algorithm) {
    case "bubble-sort":
      return bubbleSortFrames(options.values ?? [5, 1, 4, 2, 8, 3]);
    case "binary-search":
      return binarySearchFrames(options.values ?? [1, 3, 5, 7, 9, 11, 13, 15], options.target ?? 11);
    case "bfs":
      return bfsFrames(options.source ?? "A");
  }
}

/** Clamp so the caller can never index past the trace. */
export function clampFrame(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, Math.trunc(index)), total - 1);
}
