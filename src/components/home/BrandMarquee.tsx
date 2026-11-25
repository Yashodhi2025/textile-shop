'use client';

import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';

export default function BrandMarquee() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData.content).home);
  const marqueeText =
    contentText(home.marqueeText) ||
    'TIMELESS TEXTURES • THOUGHTFULLY CRAFTED • EVERYDAY LUXURY';

  return (
    <section
      data-design-section="brand-marquee"
      className="loome-marquee-wrap relative overflow-hidden border-y border-[var(--loome-border)] bg-[var(--loome-beige)] py-3.5"
    >
      <div className="loome-marquee-track">
        <div className="flex shrink-0 items-center">
          <span
            data-preview-field-path="home.marqueeText"
            className="px-8 font-heading text-xs font-semibold uppercase tracking-[0.24em] text-[var(--heading-color)] sm:px-10 sm:text-sm"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-1" className="text-xs text-[var(--brand-accent)]" aria-hidden="true">
            ✦
          </span>
          <span
            data-preview-static="marquee-repeat-1"
            className="px-8 font-heading text-xs font-semibold uppercase tracking-[0.24em] text-[var(--heading-color)] sm:px-10 sm:text-sm"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-2" className="text-xs text-[var(--brand-accent)]" aria-hidden="true">
            ✦
          </span>
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          <span
            data-preview-static="marquee-dup-1"
            className="px-8 font-heading text-xs font-semibold uppercase tracking-[0.24em] text-[var(--heading-color)] sm:px-10 sm:text-sm"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-3" className="text-xs text-[var(--brand-accent)]">✦</span>
          <span
            data-preview-static="marquee-dup-2"
            className="px-8 font-heading text-xs font-semibold uppercase tracking-[0.24em] text-[var(--heading-color)] sm:px-10 sm:text-sm"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-4" className="text-xs text-[var(--brand-accent)]">✦</span>
        </div>
      </div>
    </section>
  );
}
