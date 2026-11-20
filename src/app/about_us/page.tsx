'use client';

import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { LuxuryReveal, LuxuryStagger, LuxuryStaggerItem } from '@/components/motion/LuxuryReveal';

export default function AboutPage() {
  const siteData = useSiteData();
  const about = contentObject(contentObject(siteData.content).about);
  const collageImages = contentList(about.collageImages) as Array<{
    id?: string;
    image?: string;
    caption?: string;
  }>;

  return (
    <div data-preview-page-key="about_us" className="w-full overflow-x-clip">
      {/* Editorial Split Introduction — Compact, Balanced Spacing */}
      <section
        data-design-section="about"
        className="mx-auto max-w-[1440px] px-4 pb-16 pt-12 sm:px-8 lg:px-14 lg:pb-20 lg:pt-16"
      >
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <LuxuryReveal className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B59B79]" aria-hidden="true" />
              <p
                data-preview-static="about-eyebrow"
                className="m-0 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
              >
                Maison &amp; Heritage
              </p>
            </div>

            <EditableText
              as="h1"
              data-preview-field-path="about.heading"
              defaultValue={contentText(about.heading)}
              fontFamily="heading"
              size="clamp(2.6rem, 4.6vw, 4.15rem)"
              weight={300}
              lineHeight={1.04}
              letterSpacing="-0.02em"
              color="heading"
              className="mt-4 mb-0"
            />

            <EditableText
              as="p"
              data-preview-field-path="about.body"
              defaultValue={contentText(about.body)}
              fontFamily="body"
              size="1rem"
              lineHeight={1.85}
              color="muted"
              className="mt-6 mb-0 max-w-xl"
            />
          </LuxuryReveal>

          <LuxuryReveal delay={0.12} className="lg:col-span-6">
            <div className="group overflow-hidden border border-[#262923]/10 bg-[#E8E0D5]/45 dark:border-[#F8F6F1]/10">
              <EditableImage
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                src={withBasePath(contentText(about.imageUrl) || '/images/craftsmanship-loom.jpg')}
                alt="LOOMÉ Textile Atelier"
                data-preview-field-path="about.imageUrl"
                radius="none"
                fit="cover"
              />
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* Atelier Philosophy & Editorial Collage */}
      <section
        data-design-section="about-heritage"
        className="w-full border-t border-[#262923]/8 bg-[#E8E0D5]/38 py-16 dark:border-[#F8F6F1]/8 dark:bg-[#20231D] lg:py-20"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:px-14">
          <LuxuryReveal className="space-y-8 lg:col-span-5">
            <div>
              <EditableText
                as="h2"
                data-preview-field-path="about.collageHeading"
                defaultValue={contentText(about.collageHeading)}
                fontFamily="heading"
                size="clamp(2rem, 3.2vw, 2.85rem)"
                weight={300}
                lineHeight={1.1}
                letterSpacing="-0.015em"
                color="heading"
                className="m-0"
              />
              <EditableText
                as="p"
                data-preview-field-path="about.collageDescription"
                defaultValue={contentText(about.collageDescription)}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.8}
                color="muted"
                className="mt-3 mb-0"
              />
            </div>

            <div className="border-t border-[#262923]/12 pt-7 dark:border-[#F8F6F1]/12">
              <EditableText
                as="h3"
                data-preview-field-path="about.historyHeading"
                defaultValue={contentText(about.historyHeading)}
                fontFamily="heading"
                size="1.75rem"
                weight={400}
                lineHeight={1.2}
                color="heading"
                className="m-0"
              />
              <EditableText
                as="p"
                data-preview-field-path="about.history"
                defaultValue={contentText(about.history)}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.85}
                color="muted"
                className="mt-3 mb-0"
              />
            </div>
          </LuxuryReveal>

          <div className="lg:col-span-7">
            <LuxuryStagger
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              staggerDelay={0.08}
            >
              <div
                data-preview-list-path="about.collageImages"
                className="contents"
              >
                {collageImages.map((item, index) => (
                  <LuxuryStaggerItem key={item.id || index}>
                    <figure
                      data-preview-item-path={`about.collageImages[${index}]`}
                      className="group relative m-0 overflow-hidden border border-[#262923]/10 bg-[#FCFBF8] dark:border-[#F8F6F1]/10 dark:bg-[#171915]"
                    >
                      <div className="aspect-[4/5] overflow-hidden">
                        <img
                          src={withBasePath(item.image || '/images/cat-fabrics.jpg')}
                          alt={item.caption || 'LOOMÉ atelier detail'}
                          loading="lazy"
                          data-preview-field-path={`about.collageImages[${index}].image`}
                          className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.06]"
                        />
                      </div>
                      <figcaption className="border-t border-[#262923]/8 px-4 py-3 text-xs tracking-wide text-[#262923] dark:border-[#F8F6F1]/10 dark:text-[#F8F6F1]">
                        <span data-preview-field-path={`about.collageImages[${index}].caption`}>
                          {item.caption || ''}
                        </span>
                      </figcaption>
                    </figure>
                  </LuxuryStaggerItem>
                ))}
              </div>
            </LuxuryStagger>
          </div>
        </div>
      </section>
    </div>
  );
}
