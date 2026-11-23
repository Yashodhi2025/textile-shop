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
      className="loome-surface-mocha w-full border-y border-[#C8A98B]/18 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
        <LuxuryReveal className="mx-auto max-w-2xl text-center">
          <EditableText
            as="p"
            data-preview-field-path="home.featuresEyebrow"
            defaultValue={contentText(home.featuresEyebrow) || 'THE LOOMÉ STANDARD'}
            fontFamily="body"
            size="0.6875rem"
            weight={600}
            transform="uppercase"
            letterSpacing="0.26em"
            color="#C8A98B"
            align="center"
            className="m-0"
          />
          <EditableText
            as="h2"
            data-preview-field-path="home.featuresHeading"
            defaultValue={contentText(home.featuresHeading) || 'Crafted to Outlast Seasons'}
            fontFamily="heading"
            size="clamp(2.25rem, 3.8vw, 3.2rem)"
            weight={800}
            lineHeight={1.06}
            letterSpacing="-0.03em"
            color="#F2E9DE"
            align="center"
            className="mt-3 mb-0"
          />
        </LuxuryReveal>

        {/* Always-mounted list container for Fivora strict validation */}
        <div
          data-preview-list-path="home.features"
          className="mt-14"
        >
          {features.length === 0 ? (
            <div
              data-preview-static="features-empty"
              className="rounded-2xl border border-dashed border-[#C8A98B]/28 py-14 text-center text-sm text-[#C7B6A6]"
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
                    className="group flex flex-col items-center rounded-2xl border border-[#C8A98B]/18 bg-[#201C1A]/75 px-7 py-11 text-center transition-all duration-500 hover:border-[#C8A98B]/55 sm:px-9"
                  >
                    <div
                      data-preview-item-path={`home.features[${index}]`}
                      className="flex flex-col items-center"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-[12px] border border-[#C8A98B]/45 bg-[#3B302B] text-[#C8A98B] transition-all duration-500 group-hover:scale-105 group-hover:border-[#C8A98B] group-hover:bg-[#C8A98B] group-hover:text-[#201C1A]">
                        <Icon className="h-5 w-5 stroke-[1.5]" />
                      </div>

                      <EditableText
                        as="h3"
                        data-preview-field-path={`home.features[${index}].title`}
                        defaultValue={contentText(feature.title)}
                        fontFamily="heading"
                        size="1.35rem"
                        weight={700}
                        lineHeight={1.25}
                        letterSpacing="-0.015em"
                        color="#F2E9DE"
                        align="center"
                        className="mt-6 mb-0"
                      />

                      <EditableText
                        as="p"
                        data-preview-field-path={`home.features[${index}].body`}
                        defaultValue={contentText(feature.body)}
                        fontFamily="body"
                        size="0.875rem"
                        lineHeight={1.8}
                        color="#C7B6A6"
                        align="center"
                        className="mt-3 mb-0 max-w-xs"
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
