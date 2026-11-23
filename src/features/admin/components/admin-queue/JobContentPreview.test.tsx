import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { I18nProvider } from "@/i18n/I18nContext";
import type { AdminJob } from "@/types/admin";
import { JobContentPreview } from "./JobContentPreview";

it("shows all submitted job content for moderation while keeping stored HTML and URLs inert", () => {
  const job = {
    description:
      "Full submitted **description**\n<script>window.leaked=true</script>",
    requirements: "React experience",
    responsibilities: "Build accessible software",
    benefits: ["Health insurance"],
    applicationUrl: "javascript:alert(1)",
  } as AdminJob;
  const { container } = render(
    <I18nProvider>
      <JobContentPreview job={job} />
    </I18nProvider>
  );
  expect(screen.getByText("description", { exact: true })).toBeVisible();
  expect(screen.getByText("React experience")).toBeVisible();
  expect(screen.getByText("Build accessible software")).toBeVisible();
  expect(screen.getByText("Health insurance")).toBeVisible();
  expect(container.querySelector("script")).toBeNull();
  expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
});
