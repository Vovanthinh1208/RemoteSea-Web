/**
 * Triggers a browser download of an already-fetched Blob — the same
 * temporary-`<a>`-click pattern PrivacyDataSection.tsx uses inline for its
 * JSON export, generalized for any Blob (a server-returned CSV/ICS file,
 * not just a client-built JSON one). `apiClient` sends the auth token as a
 * Bearer header, not a cookie, so a plain `<a href="/api/...">` can't
 * authenticate — the caller must fetch the Blob itself first (responseType:
 * "blob") and pass it in here just to trigger the save.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
