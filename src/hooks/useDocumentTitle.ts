import { useEffect } from "react";

const syncMeta = (
  selector: string,
  content: string | undefined
): (() => void) => {
  if (!content) return () => {};
  const tag = document.querySelector(selector);
  if (!tag) return () => {};
  const previous = tag.getAttribute("content");
  tag.setAttribute("content", content);
  return () => {
    if (previous !== null) tag.setAttribute("content", previous);
  };
};

// `description` is optional so the ~20 existing call sites that only set a title
// are unaffected. When provided, it overwrites index.html's static meta
// description (and the matching og:/twitter: tags) for the lifetime of the page —
// otherwise every route shares the same site-wide copy, which is a real gap for
// pages like job postings that need distinct, indexable, shareable copy when a
// link is pasted into Slack/LinkedIn/Twitter.
export const useDocumentTitle = (title: string, description?: string): void => {
  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = `${title} | RemoteSEA`;
    document.title = fullTitle;

    const restoreFns = [
      syncMeta('meta[name="description"]', description),
      syncMeta('meta[property="og:title"]', fullTitle),
      syncMeta('meta[property="og:description"]', description),
      syncMeta('meta[property="og:url"]', window.location.href),
      syncMeta('meta[name="twitter:title"]', fullTitle),
      syncMeta('meta[name="twitter:description"]', description),
    ];

    return () => {
      document.title = previousTitle;
      restoreFns.forEach((restore) => restore());
    };
  }, [title, description]);
};
