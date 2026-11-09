/** @jest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { Logo } from "@/components/Logo";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

describe("shared interface components", () => {
  it("renders an accessible CForge home link", () => {
    render(<Logo />);
    expect(screen.getByRole("link", { name: "CForge dashboard" })).toHaveAttribute("href", "/dashboard");
  });

  it("renders empty and loading states", () => {
    const { rerender } = render(<EmptyState title="Nothing yet" description="Create an item." />);
    expect(screen.getByRole("heading", { name: "Nothing yet" })).toBeInTheDocument();
    rerender(<LoadingState label="Loading lessons" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading lessons");
  });

  it("lets the user retry an error", () => {
    const retry = jest.fn();
    render(<ErrorState message="Network failed" retry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
