'use client';

import SilkVeilIntro from '@/components/home/SilkVeilIntro';

export default function SilkIntroPreviewPage() {
  return (
    <div
      data-preview-page-key="silk_intro_preview"
      className="w-full bg-[#F8F6F1] text-[#262923] dark:bg-[#171915] dark:text-[#F8F6F1]"
    >
      {/* Editorial Preview Header */}
      <section className="mx-auto max-w-[1360px] px-4 pb-8 pt-12 sm:px-8 lg:px-14 lg:pt-14">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p
              data-preview-static="silk-preview-eyebrow"
              className="m-0 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
            >
              LOOMÉ Atelier · Editor Preview
            </p>
            <h1
              data-preview-static="silk-preview-heading"
              className="mt-3 mb-0 font-serif text-4xl font-light leading-[1.06] tracking-tight sm:text-5xl"
            >
              The Silk Veil Intro
            </h1>
          </div>
          <p
            data-preview-static="silk-preview-copy"
            className="m-0 max-w-md text-sm leading-[1.8] text-[#595C52] dark:text-[#B6B8AE]"
          >
            Click the wordmark, tagline, silk backdrop, or Skip button directly below to edit. Normal visitors see this intro once per browser session on the homepage.
          </p>
        </div>
      </section>

      {/* Reusable Silk Veil Stage (paused by default, linked to home.silkIntro) */}
      <section data-design-section="silk-intro-preview" className="pb-14">
        <SilkVeilIntro mode="stage" />
      </section>
    </div>
  );
}
