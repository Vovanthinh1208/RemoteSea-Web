import { apiClient } from "@/core/http/http-client";
export interface CompanyDocument {
  id: string;
  filename: string;
  byteLength: number;
  createdAt: string;
}
export const listCompanyDocuments = async (employerId?: string) =>
  (
    await apiClient.get<CompanyDocument[]>("/company-documents", {
      params: employerId ? { employerId } : undefined,
    })
  ).data;
export const uploadCompanyDocument = async (file: File) => {
  const data = new FormData();
  data.append("file", file);
  return (
    await apiClient.post<CompanyDocument>("/company-documents", data, {
      timeout: 30000,
    })
  ).data;
};
export const downloadCompanyDocument = async (document: CompanyDocument) => {
  const { data: blob } = await apiClient.get<Blob>(
    "/company-documents/" + document.id,
    { responseType: "blob", timeout: 30000 }
  );
  if (
    blob.type.split(";")[0] !== "application/pdf" ||
    !blob.size ||
    blob.size > 5 * 1024 * 1024 ||
    (await blob.slice(0, 5).text()) !== "%PDF-" ||
    !(await blob.slice(-1024).text()).includes("%%EOF")
  )
    throw Error("Invalid PDF response");
  const url = URL.createObjectURL(blob),
    a = window.document.createElement("a");
  a.href = url;
  a.download = document.filename;
  try {
    window.document.body.appendChild(a);
    a.click();
  } finally {
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
