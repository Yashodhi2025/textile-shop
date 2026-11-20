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
      className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 sm:py-20 lg:px-14 lg:py-24"
    >
      <LuxuryReveal className="mx-auto max-w-2xl text-center">
        <EditableText
          as="p"
          data-preview-field-path="home.featuresEyebrow"
          defaultValue={contentText(home.featuresEyebrow) || 'THE LOOMÉ STANDARD'}
          fontFamily="body"
          size="0.6875rem"
          weight={500}
          transform="uppercase"
          letterSpacing="0.26em"
          color="primary"
          align="center"
          className="m-0"
        />
        <EditableText
          as="h2"
          data-preview-field-path="home.featuresHeading"
          defaultValue={contentText(home.featuresHeading) || 'Crafted to Outlast Seasons'}
          fontFamily="heading"
          size="clamp(2.35rem, 4vw, 3.25rem)"
          weight={300}
          lineHeight={1.08}
          letterSpacing="-0.02em"
          color="heading"
          align="center"
          className="mt-3 mb-0"
        />
      </LuxuryReveal>

      {/* Always-mounted list container for Fivora strict validation */}
      <div
        data-preview-list-path="home.features"
        className="mt-16"
      >
        {features.length === 0 ? (
          <div
            data-preview-static="features-empty"
            className="border border-dashed border-[#262923]/20 py-14 text-center text-sm text-[#65685E]"
          >
            Add brand pillars in your Fivora editor.
          </div>
        ) : (
          <LuxuryStagger className="grid grid-cols-1 divide-y divide-[#262923]/10 border-y border-[#262923]/10 dark:divide-[#F8F6F1]/10 dark:border-[#F8F6F1]/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {features.map((rawFeature, index) => {
              const feature = contentObject(rawFeature);
              const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
              return (
                <LuxuryStaggerItem
                  key={index}
                  className="group flex flex-col items-center px-6 py-12 text-center sm:px-10 lg:py-16"
                >
                  <div
                    data-preview-item-path={`home.features[${index}]`}
                    className="flex flex-col items-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#B59B79]/50 bg-[#FCFBF8] text-[#747B65] transition-all duration-500 group-hover:scale-105 group-hover:border-[#747B65] group-hover:bg-[#262923] group-hover:text-[#F8F6F1] dark:bg-[#20231D] dark:text-[#B59B79]">
                      <Icon className="h-5 w-5 stroke-[1.35]" />
                    </div>

                    <EditableText
                      as="h3"
                      data-preview-field-path={`home.features[${index}].title`}
                      defaultValue={contentText(feature.title)}
                      fontFamily="heading"
                      size="1.65rem"
                      weight={400}
                      lineHeight={1.2}
                      color="heading"
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
                      color="muted"
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
    </section>
  );
}
