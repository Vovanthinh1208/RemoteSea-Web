import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "@/i18n";
import { SprintBoardPage } from "./SprintBoardPage";
import { ALL_SPRINTS } from "../sprints.data";

const renderBoard = (visible?: string, sprints = ALL_SPRINTS) =>
  render(
    <I18nProvider>
      <SprintBoardPage sprints={sprints} visible={visible} />
    </I18nProvider>
  );

describe("SprintBoardPage", () => {
  it("shows Sprint 1 with its 22 PBIs and hides the others", () => {
    renderBoard("1");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/1/);
    expect(screen.getByText("PB01")).toBeTruthy();
    expect(screen.getByText("PB22")).toBeTruthy();
    expect(screen.queryByText("PB23")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(22);
    expect(screen.getByRole("status").textContent).toMatch(/3/);
  });

  it("shows every sprint and no hidden-sprint banner when restored with 'all'", () => {
    renderBoard("all");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(4);
    expect(screen.getByText("PB96")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders an empty state when nothing matches the configured sprint", () => {
    renderBoard("9");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.queryByText("PB01")).toBeNull();
  });

  it("does not invent dates when the docs have none", () => {
    renderBoard("1", [{ ...ALL_SPRINTS[0], startDate: null, dueDate: null }]);
    expect(screen.getAllByText(/./).length).toBeGreaterThan(0);
    expect(screen.queryByText(/2026/)).toBeNull();
  });
});
