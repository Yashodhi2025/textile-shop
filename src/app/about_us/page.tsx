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
        className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-10 sm:px-8 lg:px-10 lg:pb-14 lg:pt-12"
      >
        <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-12 lg:gap-12">
          <LuxuryReveal className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--brand-accent)]" aria-hidden="true" />
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
              size="clamp(1.9rem, 3.1vw, 2.65rem)"
              weight={800}
              lineHeight={1.08}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-2.5 mb-0"
            />

            <EditableText
              as="p"
              data-preview-field-path="about.body"
              defaultValue={contentText(about.body)}
              fontFamily="body"
              size="0.9375rem"
              lineHeight={1.75}
              color="muted"
              className="mt-4 mb-0 max-w-xl"
            />
          </LuxuryReveal>

          <LuxuryReveal delay={0.12} className="lg:col-span-6">
            <div className="group overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--loome-beige)] shadow-[0_6px_22px_rgba(73,56,44,0.06)] dark:shadow-none">
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

      {/* Atelier Philosophy & Editorial Collage — Oat Beige Surface */}
      <section
        data-design-section="about-heritage"
        className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-12 lg:py-16"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-10 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-10">
          <LuxuryReveal className="space-y-6 lg:col-span-5">
            <div>
              <EditableText
                as="h2"
                data-preview-field-path="about.collageHeading"
                defaultValue={contentText(about.collageHeading)}
                fontFamily="heading"
                size="clamp(1.65rem, 2.6vw, 2.2rem)"
                weight={800}
                lineHeight={1.12}
                letterSpacing="-0.02em"
                color="heading"
                className="m-0"
              />
              <EditableText
                as="p"
                data-preview-field-path="about.collageDescription"
                defaultValue={contentText(about.collageDescription)}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.72}
                color="muted"
                className="mt-2.5 mb-0"
              />
            </div>

            <div className="border-t border-[var(--loome-border)] pt-6">
              <EditableText
                as="h3"
                data-preview-field-path="about.historyHeading"
                defaultValue={contentText(about.historyHeading)}
                fontFamily="heading"
                size="1.35rem"
                weight={700}
                lineHeight={1.25}
                color="heading"
                className="m-0"
              />
              <EditableText
                as="p"
                data-preview-field-path="about.history"
                defaultValue={contentText(about.history)}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.75}
                color="muted"
                className="mt-2.5 mb-0"
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
                      className="group relative m-0 overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] shadow-[0_2px_10px_rgba(73,56,44,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-accent)]/70 dark:shadow-none"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-[var(--loome-beige)]">
                        <img
                          src={withBasePath(item.image || '/images/cat-fabrics.jpg')}
                          alt={item.caption || 'Atelier textile detail'}
                          loading="lazy"
                          data-preview-field-path={`about.collageImages[${index}].image`}
                          data-preview-style-target={`about.collageImages[${index}].image`}
                          data-preview-style-type="image"
                          className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.05]"
                        />
                      </div>
                      <figcaption className="border-t border-[var(--loome-border)] px-4 py-3 text-xs font-medium tracking-wide text-[var(--heading-color)]">
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
