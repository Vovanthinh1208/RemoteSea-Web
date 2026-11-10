import { act, renderHook, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { useExportMyDataBlob } from "./users.queries";
import { exportMyDataBlob } from "./users.service";

vi.mock("./users.service", async (original) => ({
  ...(await original<typeof import("./users.service")>()),
  exportMyDataBlob: vi.fn(),
}));
afterEach(() => {
  onlineManager.setOnline(true);
  vi.restoreAllMocks();
});
it("fails an offline export promptly instead of queuing it and leaving the button pending", async () => {
  onlineManager.setOnline(false);
  vi.mocked(exportMyDataBlob).mockRejectedValueOnce(
    new Error("Network unavailable")
  );
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, unmount } = renderHook(() => useExportMyDataBlob(), {
    wrapper,
  });
  try {
    await act(async () => {
      await expect(
        result.current.mutateAsync({ format: "pdf", locale: "vi" })
      ).rejects.toThrow("Network unavailable");
    });
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });
    expect(exportMyDataBlob).toHaveBeenCalledExactlyOnceWith("pdf", "vi");
  } finally {
    unmount();
    client.clear();
  }
});
