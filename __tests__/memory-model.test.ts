import {
  HEAP_BASE,
  HEAP_REUSE_OFFSET,
  STACK_BASE,
  applyAction,
  hex,
  initialMemoryState,
  stackFrameSize,
  type MemoryAction,
  type MemoryState
} from "@/lib/memory-model";

/** Runs a sequence of actions, returning every snapshot. */
function play(actions: MemoryAction[], total = 3): MemoryState[] {
  const states: MemoryState[] = [initialMemoryState()];
  for (const action of actions) {
    states.push(applyAction(states[states.length - 1], action, total));
  }
  return states;
}

describe("pointer lab memory model", () => {
  it("starts empty", () => {
    const state = initialMemoryState();
    expect(state.stack).toEqual([]);
    expect(state.heapBlocks).toEqual([]);
    expect(state.allocations).toBe(0);
    expect(state.pPointsTo).toBeNull();
    expect(stackFrameSize(state)).toBe(0);
  });

  it("declares n on the stack at a fixed address", () => {
    const [initial, after] = play(["declare"], 4);
    expect(initial.stack).toHaveLength(0);
    expect(after.stack).toHaveLength(1);
    expect(after.stack[0]).toMatchObject({ name: "n", type: "int", value: 4, address: STACK_BASE });
    expect(after.highlights.stack).toBe("n");
    expect(stackFrameSize(after)).toBe(4);
  });

  it("does not redeclare an existing local", () => {
    const states = play(["declare", "declare"]);
    expect(states[2].stack).toHaveLength(1);
    expect(states[2].stack).toEqual(states[1].stack);
  });

  it("allocates the requested bytes and points p at them", () => {
    const states = play(["declare", "allocate"], 3);
    const after = states[2];
    const block = after.heapBlocks[0];
    expect(block).toMatchObject({ address: HEAP_BASE, size: 12, freed: false, reused: false });
    expect(block.values).toHaveLength(3);
    const p = after.stack.find((slot) => slot.name === "p");
    expect(p?.value).toBe(HEAP_BASE);
    expect(p?.address).toBe(STACK_BASE - 4);
    expect(after.pPointsTo).toBe(HEAP_BASE);
    expect(after.liveBytes).toBe(12);
    expect(after.totalAllocated).toBe(12);
  });

  it("keeps stack addresses stable when the heap changes", () => {
    const states = play(["declare", "allocate", "write", "free"]);
    const nAddresses = states.slice(1).map((state) => state.stack.find((slot) => slot.name === "n")!.address);
    expect(new Set(nAddresses).size).toBe(1);
    expect(nAddresses[0]).toBe(STACK_BASE);
  });

  it("writes values through the pointer", () => {
    const states = play(["declare", "allocate", "write"]);
    expect(states[3].heapBlocks[0].values).toEqual([10, 20, 30]);
    expect(states[3].heapBlocks[0].freed).toBe(false);
  });

  it("refuses to write before allocating", () => {
    const states = play(["declare", "write"]);
    expect(states[2].heapBlocks).toHaveLength(0);
    expect(states[2].caption).toMatch(/malloc/i);
  });

  it("marks the pointer dangling after free without erasing the address", () => {
    const states = play(["declare", "allocate", "write", "free"]);
    const after = states[4];
    expect(after.heapBlocks[0].freed).toBe(true);
    expect(after.dangling).toBe(true);
    expect(after.frees).toBe(1);
    expect(after.liveBytes).toBe(0);
    expect(after.pPointsTo).toBe(HEAP_BASE);
    expect(after.stack.find((slot) => slot.name === "p")?.value).toBe(HEAP_BASE);
    expect(after.caption).toMatch(/dangling/i);
  });

  it("recycles a freed block at a visibly different address", () => {
    const states = play(["declare", "allocate", "free"]);
    const freedAddress = states[3].heapBlocks[0].address;
    // Reset p by starting a fresh sequence is not allowed, so reuse the state
    // directly: drop p, then allocate again the way a second scope would.
    const withoutP: MemoryState = {
      ...states[3],
      stack: states[3].stack.filter((slot) => slot.name !== "p"),
      pPointsTo: null
    };
    const reused = applyAction(withoutP, "allocate", 3);
    expect(reused.heapBlocks).toHaveLength(2);
    expect(reused.heapBlocks[1].reused).toBe(true);
    expect(reused.heapBlocks[1].address).toBe(freedAddress + HEAP_REUSE_OFFSET);
    expect(reused.heapBlocks[1].address).not.toBe(freedAddress);
  });

  it("flags use-after-free as a warning instead of pretending it is safe", () => {
    const states = play(["declare", "allocate", "free", "use-after-free"]);
    const after = states[4];
    expect(after.warning).toBe("use-after-free");
    expect(after.caption).toMatch(/undefined behavior/i);
  });

  it("flags a double free", () => {
    const states = play(["declare", "allocate", "free", "double-free"]);
    expect(states[4].warning).toBe("double-free");
    expect(states[4].frees).toBe(1);
  });

  it("does not report a double free for a block that is still owned", () => {
    const states = play(["declare", "allocate", "double-free"]);
    expect(states[3].warning).toBeNull();
  });

  it("refuses to free when nothing is owned", () => {
    const states = play(["declare", "free"]);
    expect(states[2].frees).toBe(0);
    expect(states[2].liveBytes).toBe(0);
  });

  it("resets to the initial state", () => {
    const states = play(["declare", "allocate", "write"]);
    expect(applyAction(states[3], "reset")).toEqual(initialMemoryState());
  });

  it("never mutates the previous snapshot", () => {
    const states = play(["declare", "allocate", "write"]);
    expect(states[2].heapBlocks[0].values).toEqual([0, 0, 0]);
    expect(states[2].stack.find((slot) => slot.name === "n")?.value).toBe(3);
  });

  it("advances the code line with the action", () => {
    const states = play(["declare", "allocate", "write", "free"]);
    expect(states.map((state) => state.line)).toEqual([0, 1, 2, 3, 5]);
  });

  it("formats addresses as upper-case hexadecimal", () => {
    expect(hex(0x55a00000)).toBe("0x55A00000");
    expect(hex(STACK_BASE)).toBe(`0x${STACK_BASE.toString(16).toUpperCase()}`);
  });
});
