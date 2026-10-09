import Image from "next/image";
import type { ReactNode } from "react";

interface Props {
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  image?: { src: string; alt: string; width: number; height: number };
  actions?: ReactNode;
}

/** Standard header for inner pages: gives every page a single <h1> and a consistent, nav-safe top offset. */
export default function PageHero({ label, title, lead, image, actions }: Props) {
  return (
    <section className={`page-hero${image ? " page-hero--split" : ""}`} aria-labelledby="page-title">
      <div className="container">
        <div className="page-hero__grid">
          <div className="page-hero__text" data-reveal>
            <span className="section-label">{label}</span>
            <h1 id="page-title">{title}</h1>
            {lead && <p className="page-hero__lead">{lead}</p>}
            {actions && <div className="page-hero__actions">{actions}</div>}
          </div>
          {image && (
            <div className="page-hero__image" data-reveal="right">
              <Image src={image.src} alt={image.alt} width={image.width} height={image.height} priority sizes="(max-width: 900px) 100vw, 50vw" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
