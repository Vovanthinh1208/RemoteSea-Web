/// <reference types="node" />
import { afterEach, describe, expect, it, vi } from "vitest";
import { Blob as NodeBlob } from "node:buffer";
import {
  downloadPersonalData,
  validatePersonalDataBlob,
} from "./personal-data-download";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe("PB17 download resource lifecycle", () => {
  it("releases the private URL after the download has started", async () => {
    vi.useFakeTimers();
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:private-test"),
      revokeObjectURL: vi.fn(),
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toMatch(
          /^remotesea-personal-data-\d{4}-\d{2}-\d{2}\.pdf$/
        );
      });
    await downloadPersonalData(
      new NodeBlob(["%PDF-1.7\n%%EOF"], {
        type: "application/pdf",
      }) as unknown as Blob,
      "pdf"
    );
    expect(click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:private-test");
  });
  it("rejects an HTML response mislabeled as PDF and a malformed JSON archive", async () => {
    await expect(
      validatePersonalDataBlob(
        new NodeBlob(["<html>error</html>"], {
          type: "application/pdf",
        }) as unknown as Blob,
        "pdf"
      )
    ).rejects.toThrow();
    await expect(
      validatePersonalDataBlob(
        new NodeBlob(['{"error":"bad"}'], {
          type: "application/json",
        }) as unknown as Blob,
        "json"
      )
    ).rejects.toThrow();
  });
});
