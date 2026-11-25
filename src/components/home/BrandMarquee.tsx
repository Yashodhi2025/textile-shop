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
      className="loome-marquee-wrap relative overflow-hidden border-y border-[#49382D]/12 bg-[#E8DDD0] py-4 dark:border-[#C8A98B]/20 dark:bg-[#241E1B]"
    >
      <div className="loome-marquee-track">
        <div className="flex shrink-0 items-center">
          <span
            data-preview-field-path="home.marqueeText"
            className="px-8 font-serif text-base font-medium uppercase tracking-[0.26em] text-[#49382D] dark:text-[#F5EEE6] sm:px-10 sm:text-lg"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-1" className="text-xs text-[#B28B65] dark:text-[#C8A98B]" aria-hidden="true">
            ✦
          </span>
          <span
            data-preview-static="marquee-repeat-1"
            className="px-8 font-serif text-base font-medium uppercase tracking-[0.26em] text-[#49382D] dark:text-[#F5EEE6] sm:px-10 sm:text-lg"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-2" className="text-xs text-[#B28B65] dark:text-[#C8A98B]" aria-hidden="true">
            ✦
          </span>
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          <span
            data-preview-static="marquee-dup-1"
            className="px-8 font-serif text-base font-medium uppercase tracking-[0.26em] text-[#49382D] dark:text-[#F5EEE6] sm:px-10 sm:text-lg"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-3" className="text-xs text-[#B28B65] dark:text-[#C8A98B]">✦</span>
          <span
            data-preview-static="marquee-dup-2"
            className="px-8 font-serif text-base font-medium uppercase tracking-[0.26em] text-[#49382D] dark:text-[#F5EEE6] sm:px-10 sm:text-lg"
          >
            {marqueeText}
          </span>
          <span data-preview-static="marquee-sep-4" className="text-xs text-[#B28B65] dark:text-[#C8A98B]">✦</span>
        </div>
      </div>
    </section>
  );
}
