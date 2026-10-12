import { useCallback } from "react";
import { useI18n } from "@/i18n/useI18n";
import type { TranslationParams } from "@/i18n/types";

export const useTranslation = (namespace?: string) => {
  const i18n = useI18n();

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const fullKey =
        namespace && !key.includes(".") ? `${namespace}.${key}` : key;
      return i18n.t(fullKey, params);
    },
    [i18n, namespace]
  );

  return {
    ...i18n,
    t,
  };
};
