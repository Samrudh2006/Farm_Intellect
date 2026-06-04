import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoadingState, ErrorState, EmptyState, SkeletonRows } from "./UIState";

describe("UIState components", () => {
  it("LoadingState announces loading status", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toHaveAttribute("data-ui-state", "loading");
  });

  it("ErrorState renders retry button and calls handler", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("EmptyState renders title", () => {
    render(<EmptyState title="No prices" />);
    expect(screen.getByText("No prices")).toBeInTheDocument();
  });

  it("SkeletonRows renders the requested number of rows", () => {
    const { container } = render(<SkeletonRows rows={4} />);
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBe(4);
  });
});
