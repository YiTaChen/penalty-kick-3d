import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the penalty practice shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "12 碼射門練習場" })).toBeInTheDocument();
    expect(screen.getByLabelText("game status")).toHaveTextContent("Penalty Kick 3D");
  });
});
