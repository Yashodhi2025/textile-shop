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
      className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-14 lg:py-32"
    >
      <LuxuryReveal className="mx-auto max-w-2xl text-center">
        <EditableText
          as="p"
          data-preview-field-path="home.featuresEyebrow"
          defaultValue={contentText(home.featuresEyebrow) || 'THE LOOMÉ STANDARD'}
          fontFamily="body"
          className="m-0 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
        />
        <EditableText
          as="h2"
          data-preview-field-path="home.featuresHeading"
          defaultValue={contentText(home.featuresHeading) || 'Crafted to Outlast Seasons'}
          fontFamily="heading"
          className="mt-3 font-serif text-4xl font-light leading-[1.08] tracking-tight text-[#262923] dark:text-[#F8F6F1] sm:text-5xl"
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
                      className="mt-7 font-serif text-2xl font-normal tracking-wide text-[#262923] dark:text-[#F8F6F1] sm:text-[1.75rem]"
                    />

                    <EditableText
                      as="p"
                      data-preview-field-path={`home.features[${index}].body`}
                      defaultValue={contentText(feature.body)}
                      fontFamily="body"
                      className="mt-3.5 m-0 max-w-xs text-sm leading-[1.85] text-[#65685E] dark:text-[#B6B8AE]"
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
