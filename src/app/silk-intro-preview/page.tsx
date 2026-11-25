'use client';

import SilkVeilIntro from '@/components/home/SilkVeilIntro';

export default function SilkIntroPreviewPage() {
  return (
    <div
      data-preview-page-key="silk_intro_preview"
      className="flex min-h-screen w-full flex-col justify-between bg-[#F7F3ED] text-[#49382D] dark:bg-[#1A1614] dark:text-[#F5EEE6]"
    >
      {/* Standalone Silk Intro Editing Header (no storefront navbar, newsletter, or footer) */}
      <header className="mx-auto w-full max-w-[1360px] px-4 pb-6 pt-8 sm:px-8 lg:px-14">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p
              data-preview-static="silk-preview-eyebrow"
              className="m-0 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B28B65] dark:text-[#C8A98B]"
            >
              Standalone Intro Preview
            </p>
            <h1
              data-preview-static="silk-preview-heading"
              className="mt-2 mb-0 font-heading text-3xl font-extrabold leading-[1.08] tracking-tight text-[#2C211B] dark:text-[#F5EEE6] sm:text-4xl"
            >
              Silk Veil Intro
            </h1>
          </div>
          <p
            data-preview-static="silk-preview-copy"
            className="m-0 max-w-md text-sm leading-relaxed text-[#6E5B4E] dark:text-[#C9B9AA]"
          >
            Edit the intro wordmark, tagline, silk image, and skip label below. First-time visitors see this intro once per session on the live storefront.
          </p>
        </div>
      </header>

      {/* Reusable Standalone Silk Veil Stage (linked to home.silkIntro) */}
      <section data-design-section="silk-intro-preview" className="flex-1 pb-8">
        <SilkVeilIntro mode="stage" />
      </section>
    </div>
  );
}
