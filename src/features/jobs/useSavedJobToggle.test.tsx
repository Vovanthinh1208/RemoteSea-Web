import { beforeEach, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSavedJobToggle } from "./useSavedJobToggle";

const mocks = vi.hoisted(() => ({
  user: { id: "talent-1" } as { id: string } | null,
  saved: false,
  save: vi.fn(),
  unsave: vi.fn(),
  toast: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mocks.user }),
}));
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: mocks.toast }),
}));
vi.mock("@/services/monitoring", () => ({ reportError: vi.fn() }));
vi.mock("@/features/saved/saved.queries", () => ({
  useIsJobSaved: () => ({ data: mocks.saved, isLoading: false }),
  useSaveJob: () => ({ mutateAsync: mocks.save }),
  useUnsaveJob: () => ({ mutateAsync: mocks.unsave }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { id: "talent-1" };
  mocks.saved = false;
});
it("S3-PB49-UI01 anonymous save redirects to login with a return URL", async () => {
  mocks.user = null;
  const { result } = renderHook(() =>
    useSavedJobToggle("job-1", "/jobs/job-1")
  );
  await act(async () => {
    await result.current.toggle();
  });
  expect(mocks.navigate).toHaveBeenCalledWith(
    "/login?callbackUrl=%2Fjobs%2Fjob-1"
  );
  expect(mocks.save).not.toHaveBeenCalled();
});
it("S3-PB49-UI02 rapid double-click sends only one save", async () => {
  let resolve!: () => void;
  mocks.save.mockImplementation(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      })
  );
  const { result } = renderHook(() =>
    useSavedJobToggle("job-1", "/jobs/job-1")
  );
  await act(async () => {
    const pending = result.current.toggle();
    await result.current.toggle();
    resolve();
    await pending;
  });
  expect(mocks.save).toHaveBeenCalledTimes(1);
});
it("S3-PB49-UI03 failed save reports an error without success feedback", async () => {
  mocks.save.mockRejectedValue(new Error("Unavailable"));
  const { result } = renderHook(() =>
    useSavedJobToggle("job-1", "/jobs/job-1")
  );
  await act(async () => {
    await result.current.toggle();
  });
  expect(mocks.toast).toHaveBeenCalledTimes(1);
  expect(mocks.toast).toHaveBeenCalledWith(
    expect.objectContaining({ variant: "error" })
  );
});
it("S3-PB49-UI04 clicking a saved job calls unsave", async () => {
  mocks.saved = true;
  mocks.unsave.mockResolvedValue({});
  const { result } = renderHook(() =>
    useSavedJobToggle("job-1", "/jobs/job-1")
  );
  await act(async () => {
    await result.current.toggle();
  });
  expect(mocks.unsave).toHaveBeenCalledWith("job-1");
  expect(mocks.save).not.toHaveBeenCalled();
});
