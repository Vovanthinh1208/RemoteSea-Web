// Single source of truth for compact text/select/textarea field styling, shared
// across features (post-job wizard, talent profile form, settings). Focus
// treatment intentionally matches TextField.tsx's `shadow-focus` token so every
// input in the app shares one focus affordance instead of competing ring styles.
export const TEXT_INPUT_CLASS =
  "rounded-10 w-full border border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-brand-600 focus:shadow-focus";

export const SELECT_INPUT_CLASS =
  "rounded-10 w-full border border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px] text-neutral-900 outline-none transition-all focus:border-brand-600 focus:shadow-focus";

export const TEXTAREA_INPUT_CLASS =
  "rounded-10 w-full resize-none border border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-brand-600 focus:shadow-focus";
