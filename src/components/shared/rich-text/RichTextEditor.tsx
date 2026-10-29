import { useRef, useState } from "react";
import { Bold, Italic, Link2, List, ListOrdered } from "lucide-react";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";
import { TEXTAREA_INPUT_CLASS } from "@/components/shared/input-styles";
import { RichTextContent } from "./RichTextContent";
import { applyMarkdownAction, type MarkdownAction } from "./markdown-edit";

// PB41 AC3: rich-text editing for job descriptions. A toolbar over a plain
// textarea that writes Markdown (see markdown-edit.ts), plus a Preview tab
// rendered by the same RichTextContent the public job page uses — so what
// the employer previews is exactly what candidates see.
const ACTIONS: { action: MarkdownAction; icon: typeof Bold }[] = [
  { action: "bold", icon: Bold },
  { action: "italic", icon: Italic },
  { action: "bulletList", icon: List },
  { action: "numberedList", icon: ListOrdered },
  { action: "link", icon: Link2 },
];

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  "aria-required"?: boolean;
}

export const RichTextEditor = ({
  id,
  value,
  onChange,
  placeholder,
  rows = 8,
  "aria-required": ariaRequired,
}: RichTextEditorProps) => {
  const { t } = useTranslation("common");
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

  const run = (action: MarkdownAction) => {
    const el = ref.current;
    if (!el) return;
    const next = applyMarkdownAction(
      { value, start: el.selectionStart, end: el.selectionEnd },
      action,
      t(action === "link" ? "richText.linkText" : "richText.placeholderText")
    );
    onChange(next.value);
    // Restore focus + selection after React re-renders the new value.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(next.start, next.end);
    });
  };

  const tabClass = (active: boolean) =>
    cn(
      "rounded-6 px-2.5 py-1 text-[12.5px] font-medium transition-colors",
      active
        ? "bg-white text-neutral-900 shadow-card"
        : "text-neutral-500 hover:text-neutral-800"
    );

  return (
    <div className="rounded-10 border border-neutral-200 bg-neutral-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-2 py-1.5">
        <div
          aria-label={t("richText.toolbar")}
          className="flex items-center gap-0.5"
          role="toolbar"
        >
          {ACTIONS.map(({ action, icon: Icon }) => (
            <button
              key={action}
              aria-label={t(`richText.${action}`)}
              className="rounded-6 p-1.5 text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900 disabled:opacity-40"
              disabled={tab === "preview"}
              title={t(`richText.${action}`)}
              type="button"
              onClick={() => run(action)}
            >
              <Icon aria-hidden className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-8 bg-neutral-100 p-0.5">
          <button
            aria-pressed={tab === "write"}
            className={tabClass(tab === "write")}
            type="button"
            onClick={() => setTab("write")}
          >
            {t("richText.write")}
          </button>
          <button
            aria-pressed={tab === "preview"}
            className={tabClass(tab === "preview")}
            type="button"
            onClick={() => setTab("preview")}
          >
            {t("richText.preview")}
          </button>
        </div>
      </div>
      {tab === "write" ? (
        <textarea
          ref={ref}
          aria-required={ariaRequired}
          className={cn(
            TEXTAREA_INPUT_CLASS,
            "rounded-t-none border-0 focus:shadow-none"
          )}
          id={id}
          placeholder={placeholder}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="min-h-[120px] rounded-b-10 bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-neutral-700">
          {value.trim() ? (
            <RichTextContent text={value} />
          ) : (
            <p className="text-neutral-400">{t("richText.emptyPreview")}</p>
          )}
        </div>
      )}
      <p className="border-t border-neutral-200 px-3 py-1.5 text-[11.5px] text-neutral-500">
        {t("richText.hint")}
      </p>
    </div>
  );
};
