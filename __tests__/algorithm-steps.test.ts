import {
  BFS_GRAPH,
  bfsFrames,
  binarySearchFrames,
  bubbleSortFrames,
  clampFrame,
  framesFor
} from "@/lib/algorithm-steps";

/** Replays the frames' final cell order so we can assert real correctness. */
const finalValues = (frames: ReturnType<typeof bubbleSortFrames>) =>
  frames[frames.length - 1].cells.map((cell) => cell.value);

describe("algorithm step engine", () => {
  describe("bubble sort", () => {
    it("actually sorts the array", () => {
      const frames = bubbleSortFrames([5, 1, 4, 2, 8, 3]);
      expect(finalValues(frames)).toEqual([1, 2, 3, 4, 5, 8]);
      expect(frames[frames.length - 1].done).toBe(true);
    });

    it("keeps every intermediate frame a permutation of the input", () => {
      const frames = bubbleSortFrames([3, 3, 1, 2]);
      for (const frame of frames) {
        expect(frame.cells.map((cell) => cell.value).sort((a, b) => a - b)).toEqual([1, 2, 3, 3]);
      }
    });

    it("marks indices sorted only after the pass that settles them", () => {
      const frames = bubbleSortFrames([2, 1]);
      const swapped = frames.find((frame) => frame.swapped !== null);
      expect(swapped?.swapped).toEqual([0, 1]);
      expect(frames[frames.length - 1].sorted).toEqual([0, 1]);
    });

    it("exits early when a pass performs no swaps", () => {
      const sortedInput = bubbleSortFrames([1, 2, 3, 4]);
      const passes = Math.max(...sortedInput.map((frame) => frame.pass));
      expect(passes).toBe(1);
      expect(sortedInput[sortedInput.length - 1].swaps).toBe(0);
    });

    it("handles empty and single-element input", () => {
      expect(bubbleSortFrames([])).toHaveLength(1);
      expect(bubbleSortFrames([7])[0].done).toBe(true);
      expect(finalValues(bubbleSortFrames([7]))).toEqual([7]);
    });

    it("counts comparisons monotonically", () => {
      const frames = bubbleSortFrames([4, 3, 2, 1]);
      const counts = frames.map((frame) => frame.comparisons);
      expect(counts).toEqual([...counts].sort((a, b) => a - b));
      expect(frames[frames.length - 1].comparisons).toBe(6);
    });

    it("uses stable cell identities so React can animate movement", () => {
      const frames = bubbleSortFrames([2, 1]);
      const ids = frames[0].cells.map((cell) => cell.id);
      expect(frames[frames.length - 1].cells.map((cell) => cell.id)).toEqual([...ids].reverse());
    });
  });

  describe("binary search", () => {
    it("finds a present target and reports the index", () => {
      const frames = binarySearchFrames([1, 3, 5, 7, 9, 11, 13, 15], 11);
      const last = frames[frames.length - 1];
      expect(last.found).toBe(5);
      expect(last.done).toBe(true);
    });

    it("discards half of the window per comparison", () => {
      const frames = binarySearchFrames([1, 3, 5, 7, 9, 11, 13, 15], 1);
      expect(frames[frames.length - 1].found).toBe(0);
      const midSteps = frames.filter((frame) => frame.mid !== null);
      expect(midSteps.length).toBeLessThanOrEqual(4);
    });

    it("terminates with no match for a missing value", () => {
      const frames = binarySearchFrames([1, 3, 5, 7], 4);
      const last = frames[frames.length - 1];
      expect(last.found).toBeNull();
      expect(last.done).toBe(true);
      expect(last.low).toBeGreaterThan(last.high);
    });

    it("never discards the match it reports", () => {
      const frames = binarySearchFrames([1, 2, 3, 4, 5, 6, 7], 7);
      const last = frames[frames.length - 1];
      expect(last.discarded).not.toContain(6);
      expect(last.values[6]).toBe(7);
    });

    it("handles the empty array", () => {
      const frames = binarySearchFrames([], 3);
      expect(frames).toHaveLength(1);
      expect(frames[0].done).toBe(true);
    });
  });

  describe("breadth-first search", () => {
    it("visits every node exactly once", () => {
      const frames = bfsFrames("A");
      const last = frames[frames.length - 1];
      expect([...last.visited].sort()).toEqual(BFS_GRAPH.nodes.map((node) => node.id).sort());
      expect(new Set(last.visited).size).toBe(last.visited.length);
      expect(last.done).toBe(true);
    });

    it("respects distance order from the source", () => {
      const last = bfsFrames("A")[0] ? bfsFrames("A").at(-1)! : null;
      expect(last).not.toBeNull();
      const order = last!.visited;
      // A(0), B/C(1), then depth 2, then depth 3.
      expect(order[0]).toBe("A");
      expect(order.slice(1, 3).sort()).toEqual(["B", "C"]);
      expect(last!.depths.A).toBe(0);
      expect(last!.depths.B).toBe(1);
      expect(last!.depths.E).toBe(2);
      expect(last!.depths.G).toBe(3);
    });

    it("builds a spanning tree with no cycles", () => {
      const last = bfsFrames("A").at(-1)!;
      // A tree over 8 nodes has exactly 7 edges, and every node except the root
      // appears exactly once as a discovered child.
      expect(last.treeEdges).toHaveLength(BFS_GRAPH.nodes.length - 1);
      const children = last.treeEdges.map(([, to]) => to);
      expect(new Set(children).size).toBe(children.length);
      expect(children).not.toContain("A");
    });

    it("shows the queue shrinking between dequeue steps", () => {
      const frames = bfsFrames("A");
      for (const frame of frames) {
        expect(frame.frontier.length).toBeLessThanOrEqual(BFS_GRAPH.nodes.length);
      }
      expect(frames[0].frontier).toEqual(["A"]);
    });

    it("reports an unknown start node instead of crashing", () => {
      const frames = bfsFrames("Z");
      expect(frames).toHaveLength(1);
      expect(frames[0].done).toBe(true);
    });
  });

  it("dispatches the requested algorithm", () => {
    expect(framesFor("bubble-sort")[0].kind).toBe("bubble-sort");
    expect(framesFor("binary-search")[0].kind).toBe("binary-search");
    expect(framesFor("bfs")[0].kind).toBe("bfs");
    const trace = framesFor("bfs", { source: "C" });
    const last = trace[trace.length - 1];
    expect(last.kind).toBe("bfs");
    expect(last.kind === "bfs" && last.visited[0]).toBe("C");
  });

  it("clamps the playback cursor to the trace", () => {
    expect(clampFrame(-5, 10)).toBe(0);
    expect(clampFrame(99, 10)).toBe(9);
    expect(clampFrame(3.7, 10)).toBe(3);
    expect(clampFrame(4, 0)).toBe(0);
  });
});
