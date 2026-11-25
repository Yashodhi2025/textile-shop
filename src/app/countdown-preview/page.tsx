'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';

function parseIsoDeadline(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function CountdownPreviewPage() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData.content).home);
  const countdown = contentObject(home.countdown);

  const heading = contentText(countdown.heading) || 'Private Atelier Event ends in';
  const subtitle =
    contentText(countdown.subtitle) ||
    'Limited seasonal pricing on European flax drapery and bedding sets.';
  const deadline = contentText(countdown.deadline) || '2026-12-15T23:59:59+05:30';
  const expiryMessage =
    contentText(countdown.expiryMessage) ||
    'This seasonal edit has concluded. Explore our current atelier collection.';
  const ctaLabel = contentText(countdown.ctaLabel) || 'Explore Collection';
  const ctaUrl = contentText(countdown.ctaUrl) || '#sale-collection';

  const targetMs = parseIsoDeadline(deadline);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (targetMs === null) {
      setRemainingSeconds(null);
      return;
    }
    const tick = () => {
      const next = Math.max(0, Math.ceil((targetMs - Date.now()) / 1000));
      setRemainingSeconds(next);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [targetMs]);

  const secs = remainingSeconds ?? 0;
  const units = [
    { label: 'Days', value: remainingSeconds === null ? '--' : String(Math.floor(secs / 86400)).padStart(2, '0') },
    { label: 'Hours', value: remainingSeconds === null ? '--' : String(Math.floor(secs / 3600) % 24).padStart(2, '0') },
    { label: 'Minutes', value: remainingSeconds === null ? '--' : String(Math.floor(secs / 60) % 60).padStart(2, '0') },
    { label: 'Seconds', value: remainingSeconds === null ? '--' : String(secs % 60).padStart(2, '0') },
  ];

  const resolvedCtaUrl =
    ctaUrl.startsWith('#') || /^https?:\/\//i.test(ctaUrl)
      ? ctaUrl
      : withBasePath(ctaUrl);

  return (
    <div
      data-preview-page-key="countdown_preview"
      className="w-full bg-[#F2E9DE] text-[#201C1A] dark:bg-[#201C1A] dark:text-[#F2E9DE]"
    >
      <section
        data-design-section="flash-sale"
        className="mx-auto max-w-[1360px] px-4 py-14 sm:px-8 lg:px-14 lg:py-20"
      >
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p
              data-preview-static="sale-eyebrow"
              className="m-0 text-[11px] font-medium uppercase tracking-[0.26em] text-[#8D7667] dark:text-[#C8A98B]"
            >
              The Seasonal Edit · Limited Time
            </p>
            <h1
              data-preview-static="sale-title"
              className="mt-4 font-serif text-4xl font-light leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.5rem]"
            >
              Heirloom textiles. Private atelier pricing.
            </h1>
            <p
              data-preview-static="sale-description"
              className="mt-4 max-w-md text-sm leading-[1.85] text-[#5E4E45] dark:text-[#C7B6A6]"
            >
              Refresh your rooms with small-batch Belgian flax drapery, stonewashed duvet sets, and hand-loomed throws during our seasonal event.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-[#C8A98B]/35 bg-[#201C1A] px-6 py-10 text-center text-[#F2E9DE] sm:px-10 sm:py-12">
              <EditableText
                as="h2"
                data-preview-field-path="home.countdown.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(2rem, 3.8vw, 3rem)"
                weight={300}
                lineHeight={1.08}
                color="#F2E9DE"
                align="center"
                className="m-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="home.countdown.subtitle"
                defaultValue={subtitle}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.7}
                color="#E6D9C9"
                align="center"
                className="mx-auto mt-3 mb-0 max-w-lg"
              />

              <div className="mx-auto mt-8 grid max-w-lg grid-cols-4 gap-3 sm:gap-4">
                {units.map((unit) => (
                  <div key={unit.label} className="border border-[#F2E9DE]/15 bg-[#1C1E19] px-2 py-4">
                    <span
                      data-preview-static={`countdown-val-${unit.label}`}
                      className="block font-serif text-3xl font-light tabular-nums text-[#F2E9DE] sm:text-4xl"
                    >
                      {unit.value}
                    </span>
                    <span
                      data-preview-static={`countdown-unit-${unit.label}`}
                      className="mt-1.5 block text-[10px] uppercase tracking-[0.22em] text-[#C8A98B]"
                    >
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-6 mb-0 text-xs text-[#E6D9C9]/75">
                <span data-preview-static="countdown-ends-label">Ends </span>
                <span data-preview-field-path="home.countdown.deadline">{deadline}</span>
              </p>

              <p className="mt-2 mb-0 text-xs italic text-[#C8A98B]/90">
                <span data-preview-field-path="home.countdown.expiryMessage">{expiryMessage}</span>
              </p>

              <div className="mt-8 flex justify-center">
                <a
                  href={resolvedCtaUrl}
                  data-preview-field-path="home.countdown.ctaUrl"
                  className="group loome-btn-ivory"
                >
                  <span data-preview-field-path="home.countdown.ctaLabel">{ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <p
              data-preview-static="sale-terms"
              className="mt-4 text-center text-xs text-[#5E4E45] dark:text-[#C7B6A6]"
            >
              Selected editions only. Event concludes at the scheduled deadline above.
            </p>
          </div>
        </div>
      </section>

      <section
        id="sale-collection"
        className="border-t border-[#201C1A]/10 bg-[#E6D9C9]/38 px-4 py-12 text-center dark:border-[#F2E9DE]/10 dark:bg-[#3B302B]"
      >
        <h2
          data-preview-static="sale-collection-heading"
          className="font-serif text-3xl font-light text-[#201C1A] dark:text-[#F2E9DE]"
        >
          Considered details. Everyday luxury.
        </h2>
        <p
          data-preview-static="sale-collection-copy"
          className="mx-auto mt-2 max-w-lg text-sm text-[#5E4E45] dark:text-[#C7B6A6]"
        >
          Explore our seasonal curation of Belgian flax drapery, stonewashed bedding, and hand-loomed throws.
        </p>
      </section>
    </div>
  );
}
