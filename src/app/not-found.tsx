import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="container" style={{ textAlign: "center", minHeight: "40vh" }}>
          <span className="section-label" style={{ justifyContent: "center" }}>404</span>
          <h1>Page not found</h1>
          <p style={{ margin: "var(--space-3) 0 var(--space-4)", color: "var(--color-charcoal-soft)" }}>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <Link href="/" className="btn btn--primary">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
