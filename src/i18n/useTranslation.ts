import { useCallback } from "react";
import { useI18n } from "@/i18n/useI18n";
import type { TranslationParams } from "@/i18n/types";

export const useTranslation = (namespace?: string) => {
  const i18n = useI18n();
  const { t: translate } = i18n;

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      if (!namespace) return translate(key, params);

      // Scope to the namespace first (supports nested keys like "login.submit"),
      // then fall back to the unscoped key (e.g. "common.save" or "auth.login.x").
      const scopedKey = `${namespace}.${key}`;
      const scoped = translate(scopedKey, params);
      return scoped !== scopedKey ? scoped : translate(key, params);
    },
    [translate, namespace]
  );

  return {
    ...i18n,
    t,
  };
};
