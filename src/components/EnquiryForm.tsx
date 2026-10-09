"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { FIELDS, validateEnquiry, type EnquiryErrors, type EnquiryKind, type EnquiryValues } from "@/lib/enquiry";

interface Props {
  kind: EnquiryKind;
  submitLabel: string;
  initialValues?: EnquiryValues;
  successMessage: string;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function EnquiryForm({ kind, submitLabel, initialValues = {}, successMessage }: Props) {
  const uid = useId();
  const fields = FIELDS[kind];
  const [values, setValues] = useState<EnquiryValues>(initialValues);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return; // duplicate-submit protection

    const found = validateEnquiry(kind, values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = fields.find((f) => found[f.name]);
      if (first) document.getElementById(`${uid}-${first.name}`)?.focus();
      return;
    }

    setStatus("submitting");
    setServerMessage("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, values, website: honeypot.current?.value ?? "" }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; errors?: EnquiryErrors };
      if (res.ok && data.ok) {
        setStatus("success");
        setValues({});
      } else {
        if (data.errors) setErrors(data.errors);
        setServerMessage(data.message ?? "Something went wrong sending your message. Please try again.");
        setStatus("error");
      }
    } catch {
      setServerMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  if (status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="form-status form-status--success">
        <strong>Thank you — your message is on its way.</strong>
        <p style={{ marginTop: "0.35rem" }}>{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={kind === "quote" ? "Request a quote form" : "Contact form"}>
      {status === "error" && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="form-status form-status--error">
          {serverMessage}
        </div>
      )}

      <div className="form-grid-2" style={{ marginBottom: "var(--space-6)" }}>
        {fields.map((f) => {
          const id = `${uid}-${f.name}`;
          const err = errors[f.name];
          const common = {
            id,
            name: f.name,
            value: values[f.name] ?? "",
            required: f.required,
            "aria-invalid": err ? true : undefined,
            "aria-describedby": err ? `${id}-err` : undefined,
            onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(f.name, ev.target.value),
          } as const;
          return (
            <div key={f.name} className="form-group" style={f.wide ? { gridColumn: "1 / -1" } : undefined}>
              <label className="form-label" htmlFor={id}>
                {f.label}
                {f.required ? " *" : ""}
              </label>
              {f.type === "select" ? (
                <select className="form-select" {...common}>
                  <option value="">{f.required ? "Please select" : "Select (optional)"}</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea className="form-textarea" placeholder={f.placeholder} {...common} />
              ) : (
                <input className="form-input" type={f.type} placeholder={f.placeholder} autoComplete={f.autoComplete} {...common} />
              )}
              {err && <p id={`${id}-err`} className="form-error">{err}</p>}
            </div>
          );
        })}
      </div>

      {/* Honeypot — hidden from people and assistive tech */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>Website<input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <button type="submit" className="btn btn--primary btn--lg" style={{ width: "100%", justifyContent: "center" }} disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : submitLabel} <span className="btn-arrow" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
