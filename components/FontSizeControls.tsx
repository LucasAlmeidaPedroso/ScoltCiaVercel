"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "scoltcia-font-scale";
const MIN_SCALE = 0.9;
const MAX_SCALE = 1.25;
const STEP = 0.05;

const textSelector = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "p",
  "span",
  "small",
  "strong",
  "b",
  "em",
  "li",
  "dt",
  "dd",
  "td",
  "th",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6"
].join(",");

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))));
}

function scaleLabel(scale: number) {
  return `${Math.round(scale * 100)}%`;
}

function applyFontScale(scale: number) {
  document.documentElement.dataset.fontScale = String(scale);
  document.documentElement.style.setProperty("--access-font-scale", String(scale));

  document.querySelectorAll<HTMLElement>(textSelector).forEach((element) => {
    if (element.closest(".font-size-controls")) return;
    if (element.closest("svg")) return;

    if (!element.dataset.baseFontSize) {
      const computedSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
      if (Number.isFinite(computedSize)) element.dataset.baseFontSize = String(computedSize);
    }

    const baseSize = Number.parseFloat(element.dataset.baseFontSize || "");
    if (!Number.isFinite(baseSize)) return;
    element.style.fontSize = `${baseSize * scale}px`;
  });
}

export function FontSizeControls() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const stored = Number.parseFloat(window.localStorage.getItem(STORAGE_KEY) || "1");
    const initialScale = clampScale(Number.isFinite(stored) ? stored : 1);
    setScale(initialScale);
    applyFontScale(initialScale);
  }, []);

  useEffect(() => {
    applyFontScale(scale);
    window.localStorage.setItem(STORAGE_KEY, String(scale));

    let timeout: number | undefined;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => applyFontScale(scale), 60);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, [scale]);

  const canDecrease = scale > MIN_SCALE;
  const canIncrease = scale < MAX_SCALE;
  const label = useMemo(() => scaleLabel(scale), [scale]);

  return (
    <div className="font-size-controls" aria-label="Controle de tamanho da fonte">
      <button
        type="button"
        onClick={() => setScale((current) => clampScale(current - STEP))}
        disabled={!canDecrease}
        aria-label="Diminuir fonte"
        title="Diminuir fonte"
      >
        A-
      </button>
      <span aria-live="polite">{label}</span>
      <button
        type="button"
        onClick={() => setScale((current) => clampScale(current + STEP))}
        disabled={!canIncrease}
        aria-label="Aumentar fonte"
        title="Aumentar fonte"
      >
        A+
      </button>
    </div>
  );
}
