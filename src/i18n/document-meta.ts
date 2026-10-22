import { translate } from "@/i18n/runtime";

// index.html ships English defaults for <title> and the description/social
// meta tags. Pages that set their own title (useDocumentTitle) override them;
// every other page shows these defaults, which must follow the active locale.
let pageTitleOwners = 0;

const setMeta = (selector: string, content: string): void => {
  document.querySelector(selector)?.setAttribute("content", content);
};

// The site-wide og:url from index.html (pages overwrite it with their own URL).
const defaultOgUrl =
  typeof document === "undefined"
    ? null
    : document
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content");

/** Applies the localized site defaults unless a page currently owns the title. */
export const applyDefaultDocumentMeta = (): void => {
  if (typeof document === "undefined" || pageTitleOwners > 0) return;
  const title = translate("common.meta.defaultTitle");
  const description = translate("common.meta.defaultDescription");
  document.title = title;
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);
  if (defaultOgUrl) setMeta('meta[property="og:url"]', defaultOgUrl);
};

/** Called by useDocumentTitle; returns the release function for cleanup. */
export const claimDocumentTitle = (): (() => void) => {
  pageTitleOwners += 1;
  return () => {
    pageTitleOwners = Math.max(0, pageTitleOwners - 1);
    applyDefaultDocumentMeta();
  };
};
