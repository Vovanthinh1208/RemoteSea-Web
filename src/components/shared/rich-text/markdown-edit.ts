// Pure text transforms behind RichTextEditor's toolbar. The editor stores
// Markdown — never HTML — so a description can carry formatting while staying
// inert text in the database (rendered by RichTextContent through
// react-markdown, which doesn't execute raw HTML).

export interface TextSelection {
  value: string;
  start: number;
  end: number;
}

export type MarkdownAction =
  "bold" | "italic" | "bulletList" | "numberedList" | "link";

const WRAPS: Record<"bold" | "italic", string> = { bold: "**", italic: "_" };

const wrap = (
  { value, start, end }: TextSelection,
  marker: string,
  placeholder: string
): TextSelection => {
  const selected = value.slice(start, end) || placeholder;
  const before = value.slice(0, start);
  const after = value.slice(end);
  // Toggle off when the selection is already wrapped in this marker.
  if (before.endsWith(marker) && after.startsWith(marker)) {
    const next =
      before.slice(0, -marker.length) + selected + after.slice(marker.length);
    const s = start - marker.length;
    return { value: next, start: s, end: s + selected.length };
  }
  const s = start + marker.length;
  return {
    value: before + marker + selected + marker + after,
    start: s,
    end: s + selected.length,
  };
};

const BULLET = /^- /;
const NUMBERED = /^\d+\. /;

const prefixLines = (
  { value, start, end }: TextSelection,
  kind: "bulletList" | "numberedList"
): TextSelection => {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const marker = kind === "bulletList" ? BULLET : NUMBERED;
  // Toggle off when every selected line already has this list marker.
  const allMarked = lines.every((line) => marker.test(line));
  const nextLines = lines.map((line, i) => {
    const bare = line.replace(BULLET, "").replace(NUMBERED, "");
    if (allMarked) return bare;
    return kind === "bulletList" ? `- ${bare}` : `${i + 1}. ${bare}`;
  });
  const block = nextLines.join("\n");
  return {
    value: value.slice(0, lineStart) + block + value.slice(lineEnd),
    start: lineStart,
    end: lineStart + block.length,
  };
};

const link = (
  { value, start, end }: TextSelection,
  placeholder: string
): TextSelection => {
  const text = value.slice(start, end) || placeholder;
  const url = "https://";
  const inserted = `[${text}](${url})`;
  // Leave the URL selected so the user can type over it straight away.
  const urlStart = start + text.length + 3;
  return {
    value: value.slice(0, start) + inserted + value.slice(end),
    start: urlStart,
    end: urlStart + url.length,
  };
};

export const applyMarkdownAction = (
  selection: TextSelection,
  action: MarkdownAction,
  placeholder: string
): TextSelection => {
  switch (action) {
    case "bold":
    case "italic":
      return wrap(selection, WRAPS[action], placeholder);
    case "bulletList":
    case "numberedList":
      return prefixLines(selection, action);
    case "link":
      return link(selection, placeholder);
  }
};
