// Shared helpers for downloading service / treatment PDFs.
// Used by PrivatePaySection, TreatmentCard, and TreatmentDetail so all
// downloads produce consistent, human-readable filenames.

// Strip characters that aren't legal in filenames on Windows/macOS.
const sanitizeForFilename = (s: string) => s.replace(/[/\\:*?"<>|]+/g, "").trim();

/**
 * Build a download filename like:
 *   "RSPM - {title} - {label}.pdf"
 *
 * If no label is provided, the label segment is omitted.
 * If the title is empty, falls back to "RSPM - document.pdf".
 */
export const buildDownloadFilename = (title?: string | null, label?: string | null) => {
  const parts = ["RSPM"];
  const cleanTitle = title ? sanitizeForFilename(title) : "";
  if (cleanTitle) parts.push(cleanTitle);
  if (label) parts.push(sanitizeForFilename(label));
  return parts.join(" - ") + ".pdf";
};

/**
 * Download a remote PDF, saving it with the given filename. If no filename
 * is supplied, falls back to the URL's last path segment (the auto-generated
 * Supabase storage name).
 */
export const downloadPdf = async (url: string, filename?: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || url.split("/").pop() || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
};
