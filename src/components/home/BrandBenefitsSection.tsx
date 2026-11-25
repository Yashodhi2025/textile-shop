'use client';

import { EditableIcon, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { LuxuryReveal, LuxuryStagger, LuxuryStaggerItem } from '@/components/motion/LuxuryReveal';

const DEFAULT_PILLAR_ICONS = ['leaf', 'award', 'sparkles', 'shield'] as const;

export default function BrandBenefitsSection() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData.content).home);
  const features = contentList(home.features);

  return (
    <section
      id="brand-benefits"
      data-design-section="home-features"
      className="loome-surface-ivory w-full border-y border-[var(--loome-border)] py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        <LuxuryReveal className="mx-auto max-w-2xl text-center">
          <EditableText
            as="p"
            data-preview-field-path="home.featuresEyebrow"
            defaultValue={contentText(home.featuresEyebrow) || 'WHY LOOMÉ'}
            fontFamily="body"
            size="0.6875rem"
            weight={600}
            transform="uppercase"
            letterSpacing="0.24em"
            color="primary"
            align="center"
            className="m-0"
          />
          <EditableText
            as="h2"
            data-preview-field-path="home.featuresHeading"
            defaultValue={contentText(home.featuresHeading) || 'Crafted to Outlast Seasons'}
            fontFamily="heading"
            size="clamp(1.85rem, 3vw, 2.4rem)"
            weight={800}
            lineHeight={1.08}
            letterSpacing="-0.025em"
            color="heading"
            align="center"
            className="mt-2 mb-0"
          />
        </LuxuryReveal>

        {/* Always-mounted list container for Fivora strict validation */}
        <div
          data-preview-list-path="home.features"
          className="mt-9"
        >
          {features.length === 0 ? (
            <div
              data-preview-static="features-empty"
              className="rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] py-12 text-center text-sm text-[var(--muted-color)]"
            >
              Add brand pillars in your Fivora editor.
            </div>
          ) : (
            <LuxuryStagger className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
              {features.map((rawFeature, index) => {
                const feature = contentObject(rawFeature);
                const iconName =
                  contentText(feature.icon) ||
                  DEFAULT_PILLAR_ICONS[index % DEFAULT_PILLAR_ICONS.length];
                return (
                  <LuxuryStaggerItem
                    key={index}
                    className="group flex flex-col items-center rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-7 text-center shadow-[0_2px_10px_rgba(73,56,44,0.04)] transition-all duration-300 hover:border-[var(--brand-accent)]/70 dark:shadow-none sm:px-7"
                  >
                    <div
                      data-preview-item-path={`home.features[${index}]`}
                      className="flex flex-col items-center"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[var(--brand-accent)]/35 bg-[var(--loome-ivory)] text-[var(--brand-accent)] transition-all duration-300 group-hover:border-[var(--brand-accent)] group-hover:bg-[var(--brand-accent)] group-hover:text-white dark:group-hover:text-[#1A1614]">
                        <span
                          data-preview-field-path={`home.features[${index}].icon`}
                          data-preview-control="icon-picker"
                          data-preview-icon-type="lucide"
                          data-preview-icon={iconName}
                          className="inline-flex items-center justify-center leading-none"
                        >
                          <EditableIcon name={iconName} size={20} />
                        </span>
                      </div>

                      <EditableText
                        as="h3"
                        data-preview-field-path={`home.features[${index}].title`}
                        defaultValue={contentText(feature.title)}
                        fontFamily="heading"
                        size="1.125rem"
                        weight={700}
                        lineHeight={1.25}
                        letterSpacing="-0.015em"
                        color="heading"
                        align="center"
                        className="mt-4 mb-0"
                      />

                      <EditableText
                        as="p"
                        data-preview-field-path={`home.features[${index}].body`}
                        defaultValue={contentText(feature.body)}
                        fontFamily="body"
                        size="0.875rem"
                        lineHeight={1.7}
                        color="muted"
                        align="center"
                        className="mt-2 mb-0 max-w-xs"
                      />
                    </div>
                  </LuxuryStaggerItem>
                );
              })}
            </LuxuryStagger>
          )}
        </div>
      </div>
    </section>
  );
}
