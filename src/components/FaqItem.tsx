"use client";

import { useId, useState, type ReactNode } from "react";

export default function FaqItem({ question, defaultOpen = false, children }: { question: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <h3 style={{ margin: 0, font: "inherit" }}>
        <button type="button" className="faq-item__question" aria-expanded={open} aria-controls={`${id}-a`} onClick={() => setOpen((o) => !o)}>
          <span>{question}</span>
          <span className="faq-item__icon" aria-hidden="true">+</span>
        </button>
      </h3>
      <div id={`${id}-a`} className="faq-item__answer" style={open ? undefined : { visibility: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
