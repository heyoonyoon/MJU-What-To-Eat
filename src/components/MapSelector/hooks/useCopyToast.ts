import { useRef, useCallback } from "react";
import { t } from "../../../i18n";
import type { Lang } from "../../../i18n";

export function useCopyToast(lang: Lang, showToast: (text: string) => void) {
  const lastCopyRef = useRef(0);

  const showCopyToast = useCallback(
    (text: string, label: string) => {
      const now = Date.now();
      if (now - lastCopyRef.current < 500) return;
      lastCopyRef.current = now;
      const T = t[lang];

      const fallbackCopy = () => {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.top = "-9999px";
        el.style.left = "-9999px";
        el.style.opacity = "0";
        el.setAttribute("readonly", "");
        document.body.appendChild(el);
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        el.setSelectionRange(0, text.length);
        document.execCommand("copy");
        sel?.removeAllRanges();
        document.body.removeChild(el);
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
      showToast(`"${label}" ${T.copied}`);
    },
    [lang, showToast],
  );

  return { showCopyToast };
}
