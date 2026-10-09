"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="container" style={{ textAlign: "center", minHeight: "40vh" }}>
          <h1>Something went wrong</h1>
          <p style={{ margin: "var(--space-3) 0 var(--space-4)", color: "var(--color-charcoal-soft)" }}>
            We couldn&apos;t load this page. Please try again.
          </p>
          <button type="button" className="btn btn--primary" onClick={reset}>Try again</button>
        </div>
      </section>
    </main>
  );
}
