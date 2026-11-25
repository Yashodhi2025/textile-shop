'use client';

import type { CSSProperties } from 'react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';

export default function BrandMarquee() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData.content).home);
  const marqueeText =
    contentText(home.marqueeText) ||
    'TIMELESS TEXTURES • THOUGHTFULLY CRAFTED • EVERYDAY LUXURY';
  const marqueeSeparator = contentText(home.marqueeSeparator) || '✦';
  const marqueeEnabled = home.marqueeEnabled !== false;
  const marqueePauseOnHover = home.marqueePauseOnHover !== false;
  const rawSpeed =
    typeof home.marqueeSpeedSeconds === 'number'
      ? home.marqueeSpeedSeconds
      : Number.parseFloat(String(home.marqueeSpeedSeconds ?? '36'));
  const marqueeSpeedSeconds = Number.isFinite(rawSpeed)
    ? Math.min(120, Math.max(8, rawSpeed))
    : 36;

  const trackStyle = {
    '--loome-marquee-duration': `${marqueeSpeedSeconds}s`,
    animationDuration: `${marqueeSpeedSeconds}s`,
  } as CSSProperties;

  return (
    <section
      data-design-section="brand-marquee"
      data-marquee-enabled={marqueeEnabled ? 'true' : 'false'}
      data-marquee-speed={String(marqueeSpeedSeconds)}
      data-marquee-pause-hover={marqueePauseOnHover ? 'true' : 'false'}
      className={`loome-marquee-wrap relative overflow-hidden border-y border-[var(--loome-border)] bg-[var(--loome-beige)] py-3.5 ${
        marqueeEnabled && marqueePauseOnHover ? 'loome-marquee-pause-hover' : ''
      }`}
    >
      {marqueeEnabled ? (
        <div className="loome-marquee-track" style={trackStyle}>
          <div className="flex shrink-0 items-center">
            <EditableText
              as="span"
              data-preview-field-path="home.marqueeText"
              defaultValue={marqueeText}
              fontFamily="heading"
              weight={600}
              transform="uppercase"
              letterSpacing="0.24em"
              color="heading"
              className="px-8 text-xs sm:px-10 sm:text-sm"
            />
            <EditableText
              as="span"
              data-preview-field-path="home.marqueeSeparator"
              defaultValue={marqueeSeparator}
              color="accent"
              size="0.75rem"
              weight={600}
              className="inline-flex items-center justify-center px-1"
            />
            <span
              data-preview-static="marquee-repeat-1"
              className="px-8 font-heading text-xs font-semibold uppercase tracking-[0.24em] text-[var(--heading-color)] sm:px-10 sm:text-sm"
            >
              {marqueeText}
            </span>
            <span
              data-preview-static="marquee-sep-2"
              className="px-1 text-xs text-[var(--brand-accent)]"
              aria-hidden="true"
            >
              {marqueeSeparator}
            </span>
          </div>
          <div className="flex shrink-0 items-center" aria-hidden="true">
            <span
              data-preview-static="marquee-dup-1"
              className="px-8 font-heading text-xs font-semibold uppercase tracking-[0.24em] text-[var(--heading-color)] sm:px-10 sm:text-sm"
            >
              {marqueeText}
            </span>
            <span data-preview-static="marquee-sep-3" className="px-1 text-xs text-[var(--brand-accent)]">
              {marqueeSeparator}
            </span>
            <span
              data-preview-static="marquee-dup-2"
              className="px-8 font-heading text-xs font-semibold uppercase tracking-[0.24em] text-[var(--heading-color)] sm:px-10 sm:text-sm"
            >
              {marqueeText}
            </span>
            <span data-preview-static="marquee-sep-4" className="px-1 text-xs text-[var(--brand-accent)]">
              {marqueeSeparator}
            </span>
          </div>
        </div>
      ) : (
        <div className="loome-marquee-static px-4 text-center">
          <EditableText
            as="span"
            data-preview-field-path="home.marqueeSeparator"
            defaultValue={marqueeSeparator}
            color="accent"
            size="0.75rem"
            weight={600}
            className="inline-flex items-center justify-center px-1"
          />
          <EditableText
            as="span"
            data-preview-field-path="home.marqueeText"
            defaultValue={marqueeText}
            fontFamily="heading"
            weight={600}
            transform="uppercase"
            letterSpacing="0.24em"
            color="heading"
            className="px-3 text-xs sm:text-sm"
          />
          <span
            data-preview-static="marquee-sep-static-end"
            className="px-1 text-xs text-[var(--brand-accent)]"
            aria-hidden="true"
          >
            {marqueeSeparator}
          </span>
        </div>
      )}
    </section>
  );
}
