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
    <div
      data-preview-page-key="about_us"
      className="loome-surface-ivory w-full overflow-x-clip"
    >
      {/* Editorial Split Introduction — Light Warm Ivory */}
      <section
        data-design-section="about"
        className="mx-auto max-w-[1440px] px-4 pb-16 pt-12 sm:px-8 lg:px-14 lg:pb-20 lg:pt-16"
      >
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <LuxuryReveal className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B28B65] dark:bg-[#C8A98B]" aria-hidden="true" />
              <EditableText
                as="p"
                data-preview-field-path="about.eyebrow"
                defaultValue={contentText(about.eyebrow) || 'Our Story'}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.24em"
                color="primary"
                className="m-0"
              />
            </div>

            <EditableText
              as="h1"
              data-preview-field-path="about.heading"
              defaultValue={contentText(about.heading)}
              fontFamily="heading"
              size="clamp(2.4rem, 4.4vw, 3.85rem)"
              weight={800}
              lineHeight={1.05}
              letterSpacing="-0.03em"
              color="heading"
              className="mt-3.5 mb-0"
            />

            <EditableText
              as="p"
              data-preview-field-path="about.body"
              defaultValue={contentText(about.body)}
              fontFamily="body"
              size="0.96875rem"
              lineHeight={1.82}
              color="muted"
              className="mt-5 mb-0 max-w-xl"
            />
          </LuxuryReveal>

          <LuxuryReveal delay={0.12} className="lg:col-span-6">
            <div className="group overflow-hidden rounded-2xl border border-[#49382D]/12 bg-[#E8DDD0]/50 shadow-[0_6px_26px_rgba(73,56,45,0.08)] dark:border-[#C8A98B]/20 dark:bg-[#28211D]">
              <EditableImage
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                src={contentText(about.imageUrl) || '/images/craftsmanship-loom.jpg'}
                alt="Textile Atelier"
                data-preview-field-path="about.imageUrl"
                radius="none"
                fit="cover"
              />
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* Atelier Philosophy & Editorial Collage — Soft Beige Surface */}
      <section
        data-design-section="about-heritage"
        className="loome-surface-beige w-full border-t border-[#49382D]/12 py-16 dark:border-[#C8A98B]/16 lg:py-20"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:px-14">
          <LuxuryReveal className="space-y-8 lg:col-span-5">
            <div>
              <EditableText
                as="h2"
                data-preview-field-path="about.collageHeading"
                defaultValue={contentText(about.collageHeading)}
                fontFamily="heading"
                size="clamp(2rem, 3.2vw, 2.75rem)"
                weight={800}
                lineHeight={1.08}
                letterSpacing="-0.025em"
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

            <div className="border-t border-[#3B302B]/14 pt-7 dark:border-[#C8A98B]/20">
              <EditableText
                as="h3"
                data-preview-field-path="about.historyHeading"
                defaultValue={contentText(about.historyHeading)}
                fontFamily="heading"
                size="1.65rem"
                weight={700}
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
                      className="group relative m-0 overflow-hidden rounded-2xl border border-[#3B302B]/14 bg-[#FAF5EE] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#C8A98B]/70 dark:border-[#C8A98B]/22 dark:bg-[#2A221F]"
                    >
                      <div className="aspect-[4/5] overflow-hidden">
                        <img
                          src={withBasePath(item.image || '/images/cat-fabrics.jpg')}
                          alt={item.caption || 'Atelier textile detail'}
                          loading="lazy"
                          data-preview-field-path={`about.collageImages[${index}].image`}
                          className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.06]"
                        />
                      </div>
                      <figcaption className="border-t border-[#3B302B]/10 px-4 py-3 text-xs font-medium tracking-wide text-[#201C1A] dark:border-[#C8A98B]/18 dark:text-[#F5EEE6]">
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
