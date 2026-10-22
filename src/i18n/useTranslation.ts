import { useCallback } from "react";
import { useI18n } from "@/i18n/useI18n";
import { hasTranslation } from "@/i18n/translate";
import type { TranslationParams } from "@/i18n/types";

export const useTranslation = (namespace?: string) => {
  const i18n = useI18n();
  const { t: translate } = i18n;

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      if (!namespace) return translate(key, params);

      // Scope to the namespace first (supports nested keys like "login.submit"),
      // then fall back to the unscoped key (e.g. "common.save" or "auth.login.x").
      // English defines every key, so it decides which of the two is meant.
      const scopedKey = `${namespace}.${key}`;
      return translate(
        hasTranslation("en", scopedKey) ? scopedKey : key,
        params
      );
    },
    [translate, namespace]
  );

  return {
    ...i18n,
    t,
  };
};
