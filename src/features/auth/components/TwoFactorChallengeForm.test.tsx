import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n";
import { ToastProvider } from "@/components/ui/toast";
import { TwoFactorChallengeForm } from "./TwoFactorChallengeForm";

const completeTwoFactorChallenge = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ completeTwoFactorChallenge }),
}));

const renderForm = () =>
  render(
    <I18nProvider>
      <ToastProvider>
        <TwoFactorChallengeForm
          challengeToken="t"
          remember
          onBack={vi.fn()}
          onSuccess={vi.fn()}
        />
      </ToastProvider>
    </I18nProvider>
  );

const boxes = () => screen.getAllByRole("textbox") as HTMLInputElement[];

describe("TwoFactorChallengeForm retry after a wrong code", () => {
  it("clears the rejected digits and puts focus back on the first box", async () => {
    completeTwoFactorChallenge.mockRejectedValueOnce(new Error("bad code"));
    renderForm();

    "000000".split("").forEach((digit, i) => {
      fireEvent.change(boxes()[i], { target: { value: digit } });
    });

    await waitFor(() => expect(completeTwoFactorChallenge).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        boxes()
          .map((b) => b.value)
          .join("")
      ).toBe("")
    );
    await waitFor(() => expect(document.activeElement).toBe(boxes()[0]));
  });
});
