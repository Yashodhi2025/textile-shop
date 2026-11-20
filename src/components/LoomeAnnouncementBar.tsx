'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { LUXURY_EASE } from '@/components/motion/LuxuryReveal';

export default function LoomeAnnouncementBar() {
  const siteData = useSiteData();
  const content = contentObject(siteData.content);
  const previewBlock = contentObject(content.announcementBarPreview);
  const rawAnnouncements = contentList(previewBlock.announcements);

  const items = rawAnnouncements.map((raw, idx) => {
    const item = contentObject(raw);
    return {
      index: idx,
      text: contentText(item.text),
      badge: contentText(item.badge),
      icon: contentText(item.icon),
      linkLabel: contentText(item.linkLabel),
      linkUrl: contentText(item.linkUrl),
    };
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const safeIndex = count > 0 ? activeIndex % count : 0;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'about_us', 'services', 'contact'];

  const resolveLink = (href: string) => {
    if (!href) return '#';
    if (href.startsWith('#') || /^https?:\/\//i.test(href)) return href;
    const clean = href.replace(/^\/+|\/+$/g, '');
    if (['about_us', 'services', 'contact'].includes(clean) && !requiredPages.includes(clean)) {
      return '#categories';
    }
    return withBasePath(href);
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-design-section="announcement-bar"
      className="relative z-40 w-full border-b border-[#B59B79]/20 bg-[#262923] text-[#F8F6F1]"
    >
      <div className="mx-auto flex min-h-[38px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => count > 1 && setActiveIndex((prev) => (prev - 1 + count) % count)}
          aria-label="Previous announcement"
          data-preview-static="announcement-prev"
          className={`flex h-7 w-7 shrink-0 items-center justify-center text-[#F8F6F1]/60 transition-colors hover:text-[#B59B79] ${
            count <= 1 ? 'pointer-events-none invisible' : ''
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5 stroke-[1.5]" />
        </button>

        {/* Horizontal smooth track: every item stays visible & mounted in static HTML */}
        <div className="relative flex-1 overflow-hidden py-2">
          <motion.div
            data-preview-list-path="announcementBarPreview.announcements"
            animate={{ x: `-${safeIndex * 100}%` }}
            transition={{ duration: 0.55, ease: LUXURY_EASE }}
            className="flex w-full"
          >
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.index}
                  data-preview-item-path={`announcementBarPreview.announcements[${item.index}]`}
                  className="flex w-full shrink-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-[11px] uppercase tracking-[0.16em]"
                >
                  <span
                    data-preview-field-path={`announcementBarPreview.announcements[${item.index}].icon`}
                    className={item.icon ? 'text-[10px] text-[#B59B79]' : 'inline-block'}
                  >
                    {item.icon}
                  </span>
                  <span
                    data-preview-field-path={`announcementBarPreview.announcements[${item.index}].badge`}
                    className={
                      item.badge
                        ? 'rounded-sm border border-[#B59B79]/40 bg-[#B59B79]/15 px-1.5 py-0.5 text-[9px] font-medium tracking-[0.2em] text-[#E8E0D5]'
                        : 'inline-block'
                    }
                  >
                    {item.badge}
                  </span>
                  <span
                    data-preview-field-path={`announcementBarPreview.announcements[${item.index}].text`}
                    className="font-normal text-[#F8F6F1]/90"
                  >
                    {item.text}
                  </span>
                  <a
                    href={resolveLink(item.linkUrl)}
                    data-preview-field-path={`announcementBarPreview.announcements[${item.index}].linkUrl`}
                    className={
                      item.linkLabel
                        ? 'inline-flex items-center gap-1 border-b border-[#B59B79]/70 pb-px text-[10px] font-medium tracking-[0.18em] text-[#E8E0D5] transition-colors hover:border-[#F8F6F1] hover:text-[#F8F6F1]'
                        : 'inline-block'
                    }
                  >
                    <span
                      data-preview-field-path={`announcementBarPreview.announcements[${item.index}].linkLabel`}
                    >
                      {item.linkLabel}
                    </span>
                  </a>
                </div>
              ))
            ) : (
              <div className="flex w-full shrink-0 items-center justify-center">
                <span
                  data-preview-static="announcement-empty"
                  className="text-[11px] uppercase tracking-[0.2em] text-[#E8E0D5]/75"
                >
                  LOOMÉ — The Art of Fine Textiles
                </span>
              </div>
            )}
          </motion.div>
        </div>

        <button
          type="button"
          onClick={() => count > 1 && setActiveIndex((prev) => (prev + 1) % count)}
          aria-label="Next announcement"
          data-preview-static="announcement-next"
          className={`flex h-7 w-7 shrink-0 items-center justify-center text-[#F8F6F1]/60 transition-colors hover:text-[#B59B79] ${
            count <= 1 ? 'pointer-events-none invisible' : ''
          }`}
        >
          <ChevronRight className="h-3.5 w-3.5 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
}
