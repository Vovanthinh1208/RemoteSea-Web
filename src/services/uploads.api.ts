import { apiClient } from "@/core/http/http-client";

export type UploadType = "avatar" | "logo" | "resume";

type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

// Mirrors remotesea-api's src/modules/uploads/constants.ts exactly, so the client
// rejects an invalid file with a specific message before it ever reaches the
// network — the server-side allowlist is still the real enforcement boundary.
const CONTENT_TYPES: Record<UploadType, readonly string[]> = {
  avatar: ["image/jpeg", "image/png", "image/webp"],
  logo: ["image/jpeg", "image/png", "image/webp"],
  resume: ["application/pdf"],
};

const BYTES_PER_MB = 1024 * 1024;

export const MAX_FILE_SIZE_BYTES: Record<UploadType, number> = {
  avatar: 5 * BYTES_PER_MB,
  logo: 5 * BYTES_PER_MB,
  resume: 10 * BYTES_PER_MB,
};

export const validateFile = (file: File, type: UploadType): string | null => {
  if (!CONTENT_TYPES[type].includes(file.type)) {
    return type === "resume"
      ? "Must be a PDF file."
      : "Must be a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES[type]) {
    return `File too large — max ${MAX_FILE_SIZE_BYTES[type] / BYTES_PER_MB}MB.`;
  }
  return null;
};

const UPLOAD_TIMEOUT_MS = 60_000;
const PERCENT = 100;

// XMLHttpRequest, not fetch — fetch has no cross-browser-supported way to
// observe upload progress (only download progress, via the response body
// stream), while XHR's upload.onprogress is exactly what a resume-sized PUT
// needs to show real percentage feedback instead of just "Uploading…".
const putViaXhr = (
  uploadUrl: string,
  file: File,
  options: { signal?: AbortSignal; onProgress?: (percent: number) => void }
): Promise<void> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Mirrors the previous fetch-based timeout/external-abort chaining: a
    // stalled upload can't hang forever, and unmounting the caller (or an
    // explicit Cancel click) aborts the same in-flight request either way.
    const timeoutId = setTimeout(() => {
      xhr.abort();
    }, UPLOAD_TIMEOUT_MS);
    const onExternalAbort = () => xhr.abort();
    options.signal?.addEventListener("abort", onExternalAbort);
    const cleanup = () => {
      clearTimeout(timeoutId);
      options.signal?.removeEventListener("abort", onExternalAbort);
    };

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(
          Math.round((event.loaded / event.total) * PERCENT)
        );
      }
    };
    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Upload failed"));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Upload cancelled", "AbortError"));
    };

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });

export const uploadViaPresign = async (
  file: File,
  type: UploadType,
  options?: { signal?: AbortSignal; onProgress?: (percent: number) => void }
): Promise<string> => {
  const { data } = await apiClient.post<PresignResponse>(
    "/uploads/presign",
    {
      type,
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    },
    { signal: options?.signal }
  );

  await putViaXhr(data.uploadUrl, file, options ?? {});
  return data.publicUrl;
};
