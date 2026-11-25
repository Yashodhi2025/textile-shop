'use client';

import { Compass, Feather, Layers, ShieldCheck } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { LuxuryReveal, LuxuryStagger, LuxuryStaggerItem } from '@/components/motion/LuxuryReveal';

const PILLAR_ICONS = [Feather, Layers, Compass, ShieldCheck];

export default function BrandBenefitsSection() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData.content).home);
  const features = contentList(home.features);

  return (
    <section
      id="brand-benefits"
      data-design-section="home-features"
      className="loome-surface-ivory w-full border-y border-[#49382D]/10 py-16 dark:border-[#C8A98B]/16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
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
            size="clamp(2.2rem, 3.8vw, 3.15rem)"
            weight={800}
            lineHeight={1.06}
            letterSpacing="-0.03em"
            color="heading"
            align="center"
            className="mt-2.5 mb-0"
          />
        </LuxuryReveal>

        {/* Always-mounted list container for Fivora strict validation */}
        <div
          data-preview-list-path="home.features"
          className="mt-12"
        >
          {features.length === 0 ? (
            <div
              data-preview-static="features-empty"
              className="rounded-2xl border border-dashed border-[#49382D]/20 bg-white/70 py-14 text-center text-sm text-[#6E5B4E] dark:border-[#C8A98B]/28 dark:bg-[#28211D]/50 dark:text-[#C9B9AA]"
            >
              Add brand pillars in your Fivora editor.
            </div>
          ) : (
            <LuxuryStagger className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-7">
              {features.map((rawFeature, index) => {
                const feature = contentObject(rawFeature);
                const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
                return (
                  <LuxuryStaggerItem
                    key={index}
                    className="group flex flex-col items-center rounded-2xl border border-[#49382D]/12 bg-white px-7 py-10 text-center shadow-[0_2px_12px_rgba(73,56,45,0.04)] transition-all duration-300 hover:border-[#B28B65]/60 dark:border-[#C8A98B]/18 dark:bg-[#28211D] dark:shadow-none dark:hover:border-[#C8A98B]/50 sm:px-9"
                  >
                    <div
                      data-preview-item-path={`home.features[${index}]`}
                      className="flex flex-col items-center"
                    >
                      <div className="flex h-13 w-13 items-center justify-center rounded-[12px] border border-[#B28B65]/30 bg-[#F7F3ED] text-[#B28B65] transition-all duration-300 group-hover:border-[#B28B65] group-hover:bg-[#B28B65] group-hover:text-white dark:border-[#C8A98B]/35 dark:bg-[#3B302B] dark:text-[#C8A98B] dark:group-hover:bg-[#C8A98B] dark:group-hover:text-[#201C1A]">
                        <Icon className="h-5 w-5 stroke-[1.6]" />
                      </div>

                      <EditableText
                        as="h3"
                        data-preview-field-path={`home.features[${index}].title`}
                        defaultValue={contentText(feature.title)}
                        fontFamily="heading"
                        size="1.25rem"
                        weight={700}
                        lineHeight={1.25}
                        letterSpacing="-0.015em"
                        color="heading"
                        align="center"
                        className="mt-5 mb-0"
                      />

                      <EditableText
                        as="p"
                        data-preview-field-path={`home.features[${index}].body`}
                        defaultValue={contentText(feature.body)}
                        fontFamily="body"
                        size="0.875rem"
                        lineHeight={1.75}
                        color="muted"
                        align="center"
                        className="mt-2.5 mb-0 max-w-xs"
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
