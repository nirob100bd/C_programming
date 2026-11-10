/** @jest-environment jsdom */

import { render, screen, within } from "@testing-library/react";
import { Nav } from "@/components/Nav";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>{children}</a>
  )
}));

jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: () => ({ data: { user: { name: "Ada", email: "ada@example.com" } } }),
  signOut: jest.fn()
}));

const mockPathname = jest.fn();
jest.mock("next/navigation", () => ({
  __esModule: true,
  usePathname: () => mockPathname()
}));

describe("navigation", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/dashboard");
  });

  it("groups both laboratories under a Labs dropdown", () => {
    render(<Nav />);
    const primary = screen.getByRole("navigation", { name: "Primary navigation" });
    const labs = within(primary).getByText("Labs").closest("details");
    expect(labs).not.toBeNull();
    const links = within(labs as HTMLElement).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/labs/pointers",
      "/labs/algorithms"
    ]);
    expect(within(labs as HTMLElement).getByText("Algorithms")).toBeInTheDocument();
  });

  it("exposes the labs on mobile as a dedicated row", () => {
    mockPathname.mockReturnValue("/labs/algorithms");
    render(<Nav />);
    const mobile = screen.getByRole("navigation", { name: "Laboratory navigation" });
    const links = within(mobile).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/labs/pointers",
      "/labs/algorithms"
    ]);
    expect(links[1]).toHaveAttribute("aria-current", "page");
  });

  it("marks the active top-level link", () => {
    render(<Nav />);
    const primary = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(primary).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });
});
