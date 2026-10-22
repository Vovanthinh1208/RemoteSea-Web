import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: {
    data: ["google"] as string[] | undefined,
    isPending: false,
    isError: false,
  },
  oauthUrl: vi.fn((provider: string) => `/auth/${provider}`),
}));

vi.mock("@/features/auth/auth.queries", () => ({
  useOAuthProviders: () => mocks.query,
}));
vi.mock("@/features/auth/auth.service", () => ({
  oauthUrl: mocks.oauthUrl,
}));
vi.mock("@/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { OAuthButtons } from "./OAuthButtons";

describe("OAuthButtons", () => {
  beforeEach(() => {
    mocks.query.data = ["google"];
    mocks.query.isPending = false;
    mocks.query.isError = false;
    mocks.oauthUrl.mockClear();
  });

  it("renders only providers reported as configured by the API", () => {
    render(<OAuthButtons />);

    expect(
      screen.getByRole("link", { name: /auth\.oauth\.google/ })
    ).toHaveAttribute("href", "/auth/google");
    expect(
      screen.queryByRole("link", { name: /auth\.oauth\.github/ })
    ).toBeNull();
    expect(
      screen.queryByRole("link", { name: /auth\.oauth\.linkedin/ })
    ).toBeNull();
  });

  it("explains when no provider is configured", () => {
    mocks.query.data = [];
    render(<OAuthButtons />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "auth.oauth.noneAvailable"
    );
  });

  it("explains when provider configuration cannot be loaded", () => {
    mocks.query.isError = true;
    render(<OAuthButtons />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "auth.oauth.loadFailed"
    );
  });
});
