import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./components/PenaltySceneCanvas", () => ({
  PenaltySceneCanvas: () => <div data-testid="penalty-scene" />
}));

describe("App", () => {
  it("renders the playable penalty interface shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "12 碼射門練習場" })).toBeInTheDocument();
    expect(screen.getByText("Opening Shot")).toBeInTheDocument();
    expect(screen.getByText("Level 1 / 5")).toBeInTheDocument();
    expect(screen.getByText("0 / 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Reset round")).toBeInTheDocument();
    expect(screen.getByTestId("penalty-scene")).toBeInTheDocument();
  });
});
