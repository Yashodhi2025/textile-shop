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
      className="loome-marquee-wrap relative overflow-hidden border-y border-[#262923]/10 bg-[#E8E0D5]/55 py-5 dark:border-[#F8F6F1]/10 dark:bg-[#20231D]"
    >
      <div className="loome-marquee-track">
        <div className="flex shrink-0 items-center">
          <span
            data-preview-field-path="home.marqueeText"
            className="px-8 font-serif text-lg font-normal uppercase tracking-[0.26em] text-[#262923] dark:text-[#F8F6F1] sm:px-10 sm:text-xl"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-1" className="text-xs text-[#B59B79]" aria-hidden="true">
            ✦
          </span>
          <span
            data-preview-static="marquee-repeat-1"
            className="px-8 font-serif text-lg font-normal uppercase tracking-[0.26em] text-[#262923] dark:text-[#F8F6F1] sm:px-10 sm:text-xl"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-2" className="text-xs text-[#B59B79]" aria-hidden="true">
            ✦
          </span>
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          <span
            data-preview-static="marquee-dup-1"
            className="px-8 font-serif text-lg font-normal uppercase tracking-[0.26em] text-[#262923] dark:text-[#F8F6F1] sm:px-10 sm:text-xl"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-3" className="text-xs text-[#B59B79]">✦</span>
          <span
            data-preview-static="marquee-dup-2"
            className="px-8 font-serif text-lg font-normal uppercase tracking-[0.26em] text-[#262923] dark:text-[#F8F6F1] sm:px-10 sm:text-xl"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-4" className="text-xs text-[#B59B79]">✦</span>
        </div>
      </div>
    </section>
  );
}
