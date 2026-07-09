import { useEffect } from "react";

// `description` is optional so the ~20 existing call sites that only set a title
// are unaffected. When provided, it overwrites index.html's static meta
// description for the lifetime of the page — otherwise every route shares the
// same site-wide description, which is a real gap for pages like job postings
// that need distinct, indexable, shareable copy.
export const useDocumentTitle = (title: string, description?: string): void => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | RemoteSEA`;

    const metaTag = description ? document.querySelector('meta[name="description"]') : null;
    const previousDescription = metaTag?.getAttribute("content") ?? null;
    if (metaTag && description) metaTag.setAttribute("content", description);

    return () => {
      document.title = previousTitle;
      if (metaTag && previousDescription !== null) metaTag.setAttribute("content", previousDescription);
    };
  }, [title, description]);
};
