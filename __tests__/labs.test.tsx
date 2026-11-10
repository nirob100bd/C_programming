/** @jest-environment jsdom */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import AlgorithmLabPage from "@/app/(app)/labs/algorithms/page";
import PointerLabPage from "@/app/(app)/labs/pointers/page";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>{children}</a>
  )
}));

describe("algorithm visualizer laboratory", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("offers the three algorithms as tabs with bubble sort selected", () => {
    render(<AlgorithmLabPage />);
    expect(screen.getByRole("heading", { name: "Algorithm visualizer" })).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      expect.stringContaining("Bubble Sort"),
      expect.stringContaining("Binary Search"),
      expect.stringContaining("Breadth-First Search")
    ]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  });

  it("steps forward and back through the trace", () => {
    render(<AlgorithmLabPage />);
    // The counter carries an accessible label so it can be asserted directly.
    expect(screen.getByLabelText("Frame position")).toHaveTextContent("1 / 20");
    fireEvent.click(screen.getByRole("button", { name: "Step forward" }));
    expect(screen.getByLabelText("Frame position")).toHaveTextContent("2 / 20");
    fireEvent.click(screen.getByRole("button", { name: "Step back" }));
    expect(screen.getByLabelText("Frame position")).toHaveTextContent("1 / 20");
  });

  it("resets the trace after stepping", () => {
    render(<AlgorithmLabPage />);
    const next = screen.getByRole("button", { name: "Step forward" });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByLabelText("Frame position")).toHaveTextContent("3 / 20");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText("Frame position")).toHaveTextContent("1 / 20");
  });

  it("plays automatically and stops at the last frame", () => {
    render(<AlgorithmLabPage />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    // Each frame schedules its own timeout, so tick one frame at a time.
    for (let tick = 0; tick < 3; tick += 1) {
      act(() => {
        jest.advanceTimersByTime(750);
      });
    }
    expect(screen.getByLabelText("Frame position")).toHaveTextContent("4 / 20");
    // Run to the end: playback stops and the button offers a replay.
    for (let tick = 0; tick < 40; tick += 1) {
      act(() => {
        jest.advanceTimersByTime(750);
      });
    }
    expect(screen.getByLabelText("Frame position")).toHaveTextContent("20 / 20");
    expect(screen.getByRole("button", { name: "Replay" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Step forward" })).toBeDisabled();
  });

  it("switches to binary search and reports the found index", () => {
    render(<AlgorithmLabPage />);
    fireEvent.click(screen.getByRole("tab", { name: /Binary Search/ }));
    expect(screen.getByText(/low = 0/)).toBeInTheDocument();
    // 11 lives at index 5 of the default sorted input.
    for (let step = 0; step < 8; step += 1) {
      const next = screen.getByRole("button", { name: "Step forward" });
      if ((next as HTMLButtonElement).disabled) break;
      fireEvent.click(next);
    }
    expect(screen.getByText("found at 5")).toBeInTheDocument();
  });

  it("switches to BFS and shows the queue and visited count", () => {
    render(<AlgorithmLabPage />);
    fireEvent.click(screen.getByRole("tab", { name: /Breadth-First/ }));
    // The start node is visited and enqueued by the very first frame.
    expect(screen.getByText("1 / 8 visited")).toBeInTheDocument();
    expect(screen.getByText("queue: A")).toBeInTheDocument();
    expect(screen.getByText(/Enqueue the start node A/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Step forward" }));
    expect(screen.getByText(/Dequeue A/)).toBeInTheDocument();
  });

  it("changes the BFS start node", () => {
    render(<AlgorithmLabPage />);
    fireEvent.click(screen.getByRole("tab", { name: /Breadth-First/ }));
    fireEvent.change(screen.getByLabelText("Start node"), { target: { value: "C" } });
    expect(screen.getByText("queue: C")).toBeInTheDocument();
  });

  it("changes the binary search target", () => {
    render(<AlgorithmLabPage />);
    fireEvent.click(screen.getByRole("tab", { name: /Binary Search/ }));
    fireEvent.change(screen.getByLabelText("Target"), { target: { value: "17" } });
    expect(screen.getByText("searching for 17")).toBeInTheDocument();
    expect(screen.getByLabelText("Frame position")).toHaveTextContent("1 / 6");
  });
});

describe("pointer laboratory", () => {
  it("walks the whole malloc lifecycle", () => {
    render(<PointerLabPage />);
    expect(screen.getByRole("heading", { name: "Pointer laboratory" })).toBeInTheDocument();
    expect(screen.getByText("No locals yet. Run int n = 3.")).toBeInTheDocument();
    expect(screen.getByText("No allocations. Run malloc to reserve a block.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^int n = 3$/ }));
    expect(screen.getByText(/Declared int n/)).toBeInTheDocument();
    expect(screen.getByText("4 bytes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^malloc\(n \* 4\)$/ }));
    expect(screen.getByText(/reserved 12 bytes/)).toBeInTheDocument();
    expect(screen.getByText("block #1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^write p\[0\.\.n-1\]$/ }));
    expect(screen.getByText(/Wrote 10, 20, 30/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^free\(p\)$/ }));
    expect(screen.getByText(/free\(p\) returned 12 bytes/)).toBeInTheDocument();
    expect(screen.getAllByText(/dangling/i).length).toBeGreaterThan(0);
    expect(screen.getByText("freed")).toBeInTheDocument();
  });

  it("warns on use-after-free and double free", () => {
    render(<PointerLabPage />);
    fireEvent.click(screen.getByRole("button", { name: /^int n = 3$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^malloc\(n \* 4\)$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^free\(p\)$/ }));

    fireEvent.click(screen.getByRole("button", { name: /^read p\[0\] after free$/ }));
    expect(screen.getByText(/undefined behavior/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^free\(p\) again$/ }));
    expect(screen.getByText(/freeing it again is undefined behavior/i)).toBeInTheDocument();
  });

  it("respects the allocation size control", () => {
    render(<PointerLabPage />);
    fireEvent.change(screen.getByLabelText("int n = 3 ints to allocate"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /^int n = 3$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^malloc\(n \* 4\)$/ }));
    expect(screen.getByText(/reserved 20 bytes/)).toBeInTheDocument();
  });

  it("resets the whole simulation", () => {
    render(<PointerLabPage />);
    fireEvent.click(screen.getByRole("button", { name: /^int n = 3$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^malloc\(n \* 4\)$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("No locals yet. Run int n = 3.")).toBeInTheDocument();
    const counters = screen.getByText("malloc calls").parentElement!;
    expect(within(counters).getByText("0")).toBeInTheDocument();
  });
});
