export type PersonalDataFormat = "pdf" | "json";

export async function validatePersonalDataBlob(
  blob: Blob,
  format: PersonalDataFormat
): Promise<void> {
  const mime = blob.type.toLowerCase().split(";")[0];
  const expected = format === "pdf" ? "application/pdf" : "application/json";
  if (!blob.size || blob.size > 16 * 1024 * 1024 || mime !== expected)
    throw new Error("Invalid data export response");
  if (format === "pdf") {
    const signature = await blob.slice(0, 5).text();
    const end = await blob.slice(Math.max(0, blob.size - 100)).text();
    if (signature !== "%PDF-" || !end.includes("%%EOF"))
      throw new Error("Invalid PDF export");
  } else {
    const data: unknown = JSON.parse(await blob.text());
    if (
      !data ||
      typeof data !== "object" ||
      !("exportedAt" in data) ||
      !("account" in data) ||
      !data.account ||
      typeof data.account !== "object"
    )
      throw new Error("Invalid JSON export");
  }
}

export async function downloadPersonalData(
  blob: Blob,
  format: PersonalDataFormat
): Promise<void> {
  await validatePersonalDataBlob(blob, format);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `remotesea-personal-data-${new Date().toISOString().slice(0, 10)}.${format}`;
  try {
    document.body.appendChild(link);
    link.click();
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("Download could not be started");
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
