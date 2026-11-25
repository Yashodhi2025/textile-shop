'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { LUXURY_EASE } from '@/components/motion/LuxuryReveal';

export default function LoomeAnnouncementBar() {
  const siteData = useSiteData();
  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const previewBlock = contentObject(content.announcementBarPreview);
  const rawAnnouncements = contentList(previewBlock.announcements);
  const siteTitle = contentText(common.websiteTitle) || 'LOOMÉ';
  const footerTagline = contentText(common.footerTagline) || 'The Art of Fine Textiles';
  const rawInterval = Number(previewBlock.intervalMs);
  const rotationIntervalMs =
    Number.isFinite(rawInterval) && rawInterval >= 2000 && rawInterval <= 20000
      ? rawInterval
      : 5200;

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
    }, rotationIntervalMs);
    return () => window.clearInterval(timer);
  }, [count, paused, rotationIntervalMs]);

  const pathname = usePathname() || '/';
  const isHome = pathname === '/' || pathname === '';

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'about_us', 'services', 'contact'];

  const resolveLink = (href: string) => {
    if (!href) return '#';
    if (/^https?:\/\//i.test(href)) return href;
    if (href.startsWith('#')) {
      return isHome ? href : `${withBasePath('/')}${href}`;
    }
    const clean = href.replace(/^\/+|\/+$/g, '').split(/[/?#]/)[0].replace(/-/g, '_');
    const optionalPages = [
      'shop',
      'collections',
      'wishlist',
      'cart',
      'checkout',
      'journal',
      'textile_care',
      'shipping_returns',
      'faq',
      'about_us',
      'services',
      'contact',
    ];
    if (optionalPages.includes(clean) && !requiredPages.includes(clean)) {
      return isHome ? '#categories' : `${withBasePath('/')}#categories`;
    }
    return withBasePath(href);
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-design-section="announcement-bar"
      className="relative z-40 w-full border-b border-[#C8A98B]/20 bg-[#181412] text-[#F2E9DE]"
    >
      <div className="mx-auto flex min-h-[38px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => count > 1 && setActiveIndex((prev) => (prev - 1 + count) % count)}
          aria-label="Previous announcement"
          data-preview-static="announcement-prev"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[#F2E9DE]/60 transition-colors hover:text-[#C8A98B] ${
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
                    className={item.icon ? 'text-[10px] text-[#C8A98B]' : 'inline-block'}
                  >
                    {item.icon}
                  </span>
                  <span
                    data-preview-field-path={`announcementBarPreview.announcements[${item.index}].badge`}
                    className={
                      item.badge
                        ? 'rounded-[6px] border border-[#C8A98B]/40 bg-[#3B302B]/80 px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-[#C8A98B]'
                        : 'inline-block'
                    }
                  >
                    {item.badge}
                  </span>
                  <span
                    data-preview-field-path={`announcementBarPreview.announcements[${item.index}].text`}
                    className="font-normal text-[#F2E9DE]/90"
                  >
                    {item.text}
                  </span>
                  <a
                    href={resolveLink(item.linkUrl)}
                    data-preview-field-path={`announcementBarPreview.announcements[${item.index}].linkUrl`}
                    className={
                      item.linkLabel
                        ? 'inline-flex items-center gap-1 border-b border-[#C8A98B]/70 pb-px text-[10px] font-semibold tracking-[0.18em] text-[#C8A98B] transition-colors hover:border-[#F2E9DE] hover:text-[#F2E9DE]'
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
                  className="text-[11px] uppercase tracking-[0.2em] text-[#C8A98B]/80"
                >
                  {siteTitle} — {footerTagline}
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
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[#F2E9DE]/60 transition-colors hover:text-[#C8A98B] ${
            count <= 1 ? 'pointer-events-none invisible' : ''
          }`}
        >
          <ChevronRight className="h-3.5 w-3.5 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
}
