import { useEffect } from "react";
import { claimDocumentTitle } from "@/i18n/document-meta";

const syncMeta = (selector: string, content: string | undefined): void => {
  if (!content) return;
  document.querySelector(selector)?.setAttribute("content", content);
};

// `description` is optional so the ~20 existing call sites that only set a title
// are unaffected. When provided, it overwrites index.html's static meta
// description (and the matching og:/twitter: tags) for the lifetime of the page —
// otherwise every route shares the same site-wide copy, which is a real gap for
// pages like job postings that need distinct, indexable, shareable copy when a
// link is pasted into Slack/LinkedIn/Twitter.
//
// On cleanup the site defaults are re-applied in the *current* locale (not the
// value captured at mount, which may be in the language the user just left).
export const useDocumentTitle = (title: string, description?: string): void => {
  useEffect(() => {
    const release = claimDocumentTitle();
    const fullTitle = `${title} | RemoteSEA`;
    document.title = fullTitle;

    syncMeta('meta[name="description"]', description);
    syncMeta('meta[property="og:title"]', fullTitle);
    syncMeta('meta[property="og:description"]', description);
    syncMeta('meta[property="og:url"]', window.location.href);
    syncMeta('meta[name="twitter:title"]', fullTitle);
    syncMeta('meta[name="twitter:description"]', description);

    return release;
  }, [title, description]);
};
