import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { LoadingState, ErrorState, EmptyState, SkeletonRows } from "./UIState";

describe("UIState components", () => {
  it("LoadingState announces loading status", () => {
    const { container } = render(<LoadingState />);
    expect(container.querySelector('[data-ui-state="loading"]')).not.toBeNull();
  });

  it("ErrorState renders retry button and calls handler", () => {
    const onRetry = vi.fn();
    const { container } = render(<ErrorState onRetry={onRetry} />);
    const btn = container.querySelector("button");
    expect(btn).not.toBeNull();
    btn!.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("EmptyState renders title", () => {
    const { getByText } = render(<EmptyState title="No prices" />);
    expect(getByText("No prices")).toBeTruthy();
  });

  it("SkeletonRows renders the requested number of rows", () => {
    const { container } = render(<SkeletonRows rows={4} />);
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBe(4);
  });
});
