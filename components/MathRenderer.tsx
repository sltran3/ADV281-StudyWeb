"use client";

import * as React from "react";

declare global {
  interface Window {
    renderMathInElement?: (element: HTMLElement, options?: unknown) => void;
  }
}

export function MathRenderer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const rawText = React.useMemo(() => {
    if (typeof children === "string") return children;
    // Most usage in this app is string; fall back to a best-effort text join.
    return React.Children.toArray(children).join("");
  }, [children]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    let attempts = 0;
    const run = () => {
      if (!ref.current) return;
      if (!window.renderMathInElement) {
        attempts += 1;
        if (attempts <= 15) window.setTimeout(run, 200);
        return;
      }

      // Critical: React should NOT own the text nodes in this container.
      // We always set textContent here, then KaTeX transforms it in-place.
      // This prevents duplicate "raw" formulas appearing under the KaTeX output.
      ref.current.textContent = rawText;

      // KaTeX auto-render will convert \( ... \) and \[ ... \] into formulas.
      window.renderMathInElement(ref.current, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    };
    run();
  }, [rawText]);

  // Intentionally render no children: the DOM is managed by the effect above.
  return <div ref={ref} className={`overflow-x-auto ${className ?? ""}`} />;
}

