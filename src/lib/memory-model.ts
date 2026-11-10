/**
 * A small, fully deterministic C execution model for the Pointer Lab.
 *
 * It simulates one concrete program: locals in a stack frame, a heap block
 * returned by `malloc`, and one `free`. Every operation produces a new snapshot
 * with explicit addresses, so the UI can show *why* an address changes:
 *
 * - `&local` is fixed for the lifetime of the frame.
 * - `malloc` may either reuse the previously freed block or hand back a new one.
 * - `free` does not erase the bytes; it invalidates the pointer that owns them.
 *
 * The code here is the single source of truth for the lab, which is what makes
 * the visualisation testable without a browser.
 */

export const WORD_SIZE = 4;
/** Teaching addresses: a stack region and a separate heap region. */
export const STACK_BASE = 0x7ffc_1200;
export const HEAP_BASE = 0x55a0_0000;
/** A reused heap block is offset by this much to make recycling visible. */
export const HEAP_BLOCK_SIZE = 16;
export const HEAP_REUSE_OFFSET = 0x40;

export type VarName = "n" | "p" | "i";
export type StackSlot = {
  name: VarName;
  type: string;
  address: number;
  /** Stored value; for `p` this is an address or null. */
  value: number | null;
  note: string;
};
export type HeapBlock = {
  id: number;
  address: number;
  size: number;
  /** Written contents; null means uninitialized bytes (what malloc returns). */
  values: number[];
  freed: boolean;
  /** True when this block reuses an earlier, already-freed address. */
  reused: boolean;
};

export type MemoryState = {
  step: number;
  heapBlocks: HeapBlock[];
  stack: StackSlot[];
  /** The block `p` currently points at, if any. */
  pPointsTo: number | null;
  /** True between a successful free and the next malloc. */
  dangling: boolean;
  /** Number of successful malloc calls and free calls. */
  allocations: number;
  frees: number;
  highlights: { stack: VarName | null; heap: number | null };
  caption: string;
  code: string;
  /** Line number (1-based) of `code` that is executing. */
  line: number;
  done: boolean;
  /** Set when the last action deliberately demonstrated a defect. */
  warning: string | null;
  totalAllocated: number;
  liveBytes: number;
};

export type MemoryAction =
  | "declare"
  | "allocate"
  | "write"
  | "read"
  | "free"
  | "use-after-free"
  | "double-free"
  | "reset";

const SCRIPT = `int  n = 3;              /* stack */
int *p = malloc(n * sizeof *p);   /* heap */
for (int i = 0; i < n; ++i)
    p[i] = (i + 1) * 10;  /* 10 20 30 */
free(p);                  /* p is now dangling */`;

const LINE_FOR: Record<MemoryAction, number> = {
  declare: 1,
  allocate: 2,
  write: 3,
  read: 4,
  free: 5,
  "use-after-free": 5,
  "double-free": 5,
  reset: 1
};

export const LAB_ACTIONS: { action: MemoryAction; label: string; hint: string; danger?: boolean }[] = [
  { action: "declare", label: "int n = 3", hint: "Push the local n onto the stack frame." },
  { action: "allocate", label: "malloc(n * 4)", hint: "Allocate n ints on the heap and store the address in p." },
  { action: "write", label: "write p[0..n-1]", hint: "Fill the block with 10, 20, 30 through p." },
  { action: "read", label: "printf p[i]", hint: "Dereference p to read the block back." },
  { action: "free", label: "free(p)", hint: "Release the block; p keeps its old address." },
  { action: "use-after-free", label: "read p[0] after free", hint: "Dereference the released pointer — undefined behavior.", danger: true },
  { action: "double-free", label: "free(p) again", hint: "Free the same block twice — undefined behavior.", danger: true }
];

export function initialMemoryState(): MemoryState {
  return {
    step: 0,
    heapBlocks: [],
    stack: [],
    pPointsTo: null,
    dangling: false,
    allocations: 0,
    frees: 0,
    highlights: { stack: null, heap: null },
    caption: "Reset. The frame is empty. Declare n to start.",
    code: SCRIPT,
    line: 0,
    done: false,
    warning: null,
    totalAllocated: 0,
    liveBytes: 0
  };
}

const clone = (state: MemoryState): MemoryState => ({
  ...state,
  heapBlocks: state.heapBlocks.map((block) => ({ ...block, values: [...block.values] })),
  stack: state.stack.map((slot) => ({ ...slot }))
});

const stackAddress = (index: number) => STACK_BASE - index * WORD_SIZE;

function liveBlock(state: MemoryState, address: number | null) {
  if (address === null) return undefined;
  return state.heapBlocks.find((block) => block.address === address && !block.freed);
}

/**
 * Applies one action and returns the next snapshot. `total` is the number of
 * ints the program allocates, which the UI can change to show a different
 * allocation size.
 */
export function applyAction(state: MemoryState, action: MemoryAction, total = 3): MemoryState {
  const next = clone(state);
  next.step = state.step + 1;
  next.warning = null;
  next.highlights = { stack: null, heap: null };
  next.line = LINE_FOR[action] ?? 0;
  next.done = false;

  switch (action) {
    case "declare": {
      if (state.stack.some((slot) => slot.name === "n")) {
        next.caption = "n is already declared in this frame; the model does not redeclare it.";
        return next;
      }
      next.stack = [
        ...state.stack,
        { name: "n", type: "int", address: stackAddress(0), value: total, note: "number of ints to allocate" }
      ];
      next.highlights = { stack: "n", heap: null };
      next.caption = `Declared int n. The compiler reserved ${WORD_SIZE} bytes at ${hex(stackAddress(0))} inside the frame.`;
      return next;
    }

    case "allocate": {
      if (state.stack.some((slot) => slot.name === "p")) {
        next.caption = "p already exists. Reset the lab before allocating again.";
        return next;
      }
      const size = total * WORD_SIZE;
      const freedBlocks = state.heapBlocks.filter((block) => block.freed);
      const reuse = freedBlocks.length > 0 ? freedBlocks[freedBlocks.length - 1] : null;
      const address = reuse ? reuse.address + HEAP_REUSE_OFFSET : HEAP_BASE + state.allocations * HEAP_BLOCK_SIZE;
      const block: HeapBlock = {
        id: state.heapBlocks.length + 1,
        address,
        size,
        values: Array.from({ length: total }, () => 0),
        freed: false,
        reused: Boolean(reuse)
      };
      // malloc returns uninitialized storage: the model shows zeros but marks
      // them as not-yet-written by keeping the caption explicit about it.
      next.heapBlocks = [...state.heapBlocks, block];
      next.stack = [
        ...state.stack,
        {
          name: "p",
          type: "int *",
          address: stackAddress(state.stack.length),
          value: address,
          note: "owner of the heap block"
        }
      ];
      next.pPointsTo = address;
      next.dangling = false;
      next.allocations = state.allocations + 1;
      next.totalAllocated = state.totalAllocated + size;
      next.liveBytes = state.liveBytes + size;
      next.highlights = { stack: "p", heap: address };
      next.caption = reuse
        ? `malloc returned ${hex(address)} — the allocator recycled the earlier freed block (offset by ${HEAP_REUSE_OFFSET} bytes, so you can see it moved).`
        : `malloc(${total} * sizeof(int)) reserved ${size} bytes at ${hex(address)}. p now stores that address.`;
      return next;
    }

    case "write": {
      const block = liveBlock(next, state.pPointsTo);
      if (!block) {
        next.caption = state.pPointsTo === null
          ? "p does not point anywhere yet. Run malloc first."
          : "The block p points at has been freed; the model refuses to write through it.";
        return next;
      }
      block.values = block.values.map((_, index) => (index + 1) * 10);
      const i = state.stack.find((slot) => slot.name === "i");
      if (!i) {
        next.stack = [...next.stack, { name: "i", type: "int", address: stackAddress(next.stack.length), value: 0, note: "loop counter" }];
      } else {
        i.value = block.values.length - 1;
      }
      next.highlights = { stack: "p", heap: block.address };
      next.caption = `Wrote ${block.values.join(", ")} into ${hex(block.address)} through p. Notice the stack itself did not change size.`;
      return next;
    }

    case "read": {
      const block = liveBlock(next, state.pPointsTo);
      if (!block) {
        next.caption = "There is nothing valid to read through p.";
        return next;
      }
      next.highlights = { stack: "p", heap: block.address };
      next.caption = `Reading *p yields ${block.values.join(", ")} — the same bytes the writes stored.`;
      return next;
    }

    case "free": {
      const block = liveBlock(next, state.pPointsTo);
      if (!block) {
        next.caption = "There is no live allocation to free.";
        return next;
      }
      block.freed = true;
      next.frees = state.frees + 1;
      next.liveBytes = Math.max(0, state.liveBytes - block.size);
      next.dangling = true;
      next.highlights = { stack: "p", heap: block.address };
      next.caption = `free(p) returned ${block.size} bytes at ${hex(block.address)} to the allocator. p still holds that address, so it is now a dangling pointer — the block no longer belongs to you.`;
      return next;
    }

    case "use-after-free": {
      const block = findLiveOrFreed(next, state.pPointsTo);
      next.highlights = { stack: "p", heap: block?.address ?? null };
      next.warning = "use-after-free";
      next.caption = block
        ? `*p reads ${hex(block.address)} after free. The bytes may still look intact, but reading them is undefined behavior: another allocation could already own them.`
        : "p points nowhere, so there is nothing to misuse.";
      return next;
    }

    case "double-free": {
      const block = findLiveOrFreed(next, state.pPointsTo);
      if (block && block.freed) {
        next.warning = "double-free";
        next.highlights = { stack: "p", heap: block.address };
        next.caption = `free(p) called twice on ${hex(block.address)}. The allocator already took that block back; freeing it again is undefined behavior and often corrupts the heap.`;
        return next;
      }
      next.caption = "There is no already-freed block to free twice.";
      return next;
    }

    case "reset":
    default:
      return initialMemoryState();
  }
}

function findLiveOrFreed(state: MemoryState, address: number | null) {
  if (address === null) return undefined;
  return state.heapBlocks.find((block) => block.address === address);
}

export function hex(value: number): string {
  return `0x${value.toString(16).toUpperCase()}`;
}

/** The stack frame is drawn top-down: first declared slot is the lowest address. */
export function stackFrameSize(state: MemoryState): number {
  return state.stack.length * WORD_SIZE;
}
