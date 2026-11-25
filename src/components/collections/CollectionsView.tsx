'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import {
  contentObject,
  contentText,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import {
  buildShopCollectionHref,
  extractCuratedCollections,
  productMatchesCollection,
} from '@/lib/collectionUtils';
import { normalizeLoomeProduct, type LoomeProduct } from '@/lib/storeContext';
import { pageRoute, withBasePath } from '@/lib/utils';
import {
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

export default function CollectionsView() {
  const siteData = useSiteData();
  const rawProducts = useProducts();

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const collectionsPage = contentObject(content.collectionsPage);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'collections',
        'services',
        'journal',
        'about_us',
        'contact',
      ];
  const hasShopPage = requiredPages.includes('shop');
  const hasServicesPage = requiredPages.includes('services');

  const allProducts = useMemo<LoomeProduct[]>(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  const collections = useMemo(
    () => extractCuratedCollections(collectionsPage),
    [collectionsPage],
  );

  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const collectionsNavLabel = contentText(navLabels.collections) || 'Collections';
  const eyebrow = contentText(collectionsPage.eyebrow) || 'CURATED COLLECTIONS';
  const heading = contentText(collectionsPage.heading) || 'Signature Textile Collections';
  const intro =
    contentText(collectionsPage.intro) ||
    'Explore thoughtfully paired drapery, bedding, and woven accent edits curated for serene, tactile interiors.';

  const atelierEyebrow =
    contentText(collectionsPage.atelierEyebrow) || 'PRIVATE ATELIER';
  const atelierHeading =
    contentText(collectionsPage.atelierHeading) ||
    'Looking for Custom Drapery or Fabric Swatches?';
  const atelierDescription =
    contentText(collectionsPage.atelierDescription) ||
    'Our Colombo textile specialists tailor bespoke curtain panels, custom upholstery yardage, and complimentary swatch boxes for homes and interior projects.';
  const atelierCtaLabel =
    contentText(collectionsPage.atelierCtaLabel) || 'Explore Atelier Services';

  return (
    <div
      data-preview-page-key="collections"
      className="loome-surface-ivory min-h-[75vh] w-full overflow-x-clip"
    >
      {/* Breadcrumb Strip */}
      <div className="border-b border-[#49382D]/10 bg-white/80 dark:border-[#C8A98B]/16 dark:bg-[#1A1614]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#6E5B4E] dark:text-[#C9B9AA] sm:px-8 lg:px-14">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#6E5B4E] transition-colors hover:text-[#2C211B] dark:text-[#C9B9AA] dark:hover:text-[#F5EEE6]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" className="text-[#B28B65] dark:text-[#C8A98B]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.collections"
            className="font-semibold text-[#2C211B] dark:text-[#F5EEE6]"
          >
            {collectionsNavLabel}
          </span>
        </div>
      </div>

      {/* Editorial Hero Header */}
      <section
        data-design-section="collections-heading"
        className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-8 lg:px-14 lg:pb-14 lg:pt-16"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B28B65] dark:bg-[#C8A98B]" aria-hidden="true" />
              <EditableText
                as="p"
                data-preview-field-path="collectionsPage.eyebrow"
                defaultValue={eyebrow}
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
              data-preview-field-path="collectionsPage.heading"
              defaultValue={heading}
              fontFamily="heading"
              size="clamp(2.4rem, 4.4vw, 3.85rem)"
              weight={800}
              lineHeight={1.05}
              letterSpacing="-0.03em"
              color="heading"
              className="mt-3.5 mb-0"
            />
          </div>

          <EditableText
            as="p"
            data-preview-field-path="collectionsPage.intro"
            defaultValue={intro}
            fontFamily="body"
            size="0.96875rem"
            lineHeight={1.78}
            color="muted"
            className="m-0 max-w-md lg:text-right"
          />
        </LuxuryReveal>
      </section>

      {/* Curated Collections Editorial Grid */}
      <section
        data-design-section="collections-grid"
        className="mx-auto max-w-[1440px] px-4 pb-18 sm:px-8 lg:px-14 lg:pb-24"
      >
        <div data-preview-list-path="collectionsPage.collections">
          {collections.length === 0 ? (
            <div
              data-preview-static="collections-empty"
              className="rounded-2xl border border-dashed border-[#49382D]/20 bg-white/70 py-16 text-center text-sm text-[#6E5B4E] dark:border-[#C8A98B]/28 dark:bg-[#28211D]/60 dark:text-[#C9B9AA]"
            >
              Add curated collections in your Fivora editor to populate this page.
            </div>
          ) : (
            <LuxuryStagger className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
              {collections.map((col) => {
                const matchingCount = allProducts.filter((product) =>
                  productMatchesCollection(product, col),
                ).length;

                const isShopLink = !col.href || /^\/?shop(?:\/|\?|$)/i.test(col.href.trim());
                const targetHref =
                  !hasShopPage && isShopLink
                    ? withBasePath('/#new-arrivals')
                    : buildShopCollectionHref(col.id, col.href);
                const isExternal = /^https?:\/\//i.test(targetHref);

                return (
                  <LuxuryStaggerItem key={col.id}>
                    <article
                      data-preview-item-path={`collectionsPage.collections[${col.index}]`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#49382D]/12 bg-white shadow-[0_4px_20px_rgba(73,56,45,0.06)] transition-all duration-300 hover:border-[#B28B65]/65 hover:shadow-[0_14px_34px_rgba(73,56,45,0.1)] dark:border-[#C8A98B]/20 dark:bg-[#28211D] dark:shadow-none dark:hover:border-[#C8A98B]/55"
                    >
                      {/* Editorial 16:10 Image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E8DDD0]/60 dark:bg-[#3B302B]/50">
                        <EditableImage
                          id={`collectionsPage.collections[${col.index}].imageUrl`}
                          data-preview-field-path={`collectionsPage.collections[${col.index}].imageUrl`}
                          data-preview-style-target={`collectionsPage.collections[${col.index}].imageUrl`}
                          data-preview-style-type="image"
                          src={col.imageUrl}
                          fallbackSrc="/images/featured-collection.jpg"
                          alt={col.title}
                          fit="cover"
                          className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                        />

                        {/* Live Product Count Badge */}
                        <span
                          data-preview-static={`collection-count-${col.index}`}
                          className="pointer-events-none absolute right-4 top-4 rounded-[8px] border border-white/25 bg-[#201C1A]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F7F3ED] backdrop-blur-md"
                        >
                          {matchingCount} {matchingCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>

                      {/* Collection Copy & Explore CTA */}
                      <div className="flex flex-1 flex-col p-6 sm:p-8">
                        <EditableText
                          as="p"
                          data-preview-field-path={`collectionsPage.collections[${col.index}].tag`}
                          defaultValue={col.tag}
                          fontFamily="body"
                          size="0.6875rem"
                          weight={600}
                          transform="uppercase"
                          letterSpacing="0.22em"
                          color="primary"
                          className="m-0"
                        />

                        <EditableText
                          as="h2"
                          data-preview-field-path={`collectionsPage.collections[${col.index}].title`}
                          defaultValue={col.title}
                          fontFamily="heading"
                          size="clamp(1.5rem, 2.2vw, 1.9rem)"
                          weight={800}
                          lineHeight={1.16}
                          letterSpacing="-0.02em"
                          color="heading"
                          className="mt-2.5 mb-0"
                        />

                        <EditableText
                          as="p"
                          data-preview-field-path={`collectionsPage.collections[${col.index}].description`}
                          defaultValue={col.description}
                          fontFamily="body"
                          size="0.9375rem"
                          lineHeight={1.75}
                          color="muted"
                          className="mt-3 mb-0"
                        />

                        <div className="mt-auto pt-6">
                          <a
                            href={targetHref}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            data-preview-field-path={`collectionsPage.collections[${col.index}].href`}
                            className="group/btn inline-flex h-11 items-center justify-center gap-2.5 rounded-[11px] bg-[#49382D] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] no-underline transition-colors duration-200 hover:bg-[#B28B65] hover:text-white dark:bg-[#C8A98B] dark:text-[#201C1A] dark:hover:bg-[#D8BFA4]"
                          >
                            <span
                              data-preview-field-path={`collectionsPage.collections[${col.index}].ctaLabel`}
                            >
                              {col.ctaLabel}
                            </span>
                            <ArrowRight
                              aria-hidden="true"
                              className="h-3.5 w-3.5 stroke-[1.8] transition-transform duration-300 group-hover/btn:translate-x-1"
                            />
                          </a>
                        </div>
                      </div>
                    </article>
                  </LuxuryStaggerItem>
                );
              })}
            </LuxuryStagger>
          )}
        </div>
      </section>

      {/* Bespoke Services Cross-Link Band */}
      <section
        data-design-section="collections-atelier-cta"
        className="loome-surface-beige w-full border-t border-[#49382D]/12 py-14 dark:border-[#C8A98B]/16 sm:py-18"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 px-4 sm:px-8 lg:flex-row lg:items-center lg:px-14">
          <div className="max-w-2xl">
            <EditableText
              as="p"
              data-preview-field-path="collectionsPage.atelierEyebrow"
              defaultValue={atelierEyebrow}
              fontFamily="body"
              size="0.6875rem"
              weight={600}
              transform="uppercase"
              letterSpacing="0.24em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="collectionsPage.atelierHeading"
              defaultValue={atelierHeading}
              fontFamily="heading"
              size="clamp(1.75rem, 3vw, 2.5rem)"
              weight={800}
              lineHeight={1.12}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-2.5 mb-0"
            />
            <EditableText
              as="p"
              data-preview-field-path="collectionsPage.atelierDescription"
              defaultValue={atelierDescription}
              fontFamily="body"
              size="0.9375rem"
              lineHeight={1.75}
              color="muted"
              className="mt-3 mb-0"
            />
          </div>

          <span data-target-page="services" className="shrink-0">
            {hasServicesPage ? (
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath(pageRoute('services')))}
                className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-[11px] bg-[#49382D] px-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#F7F3ED] transition-colors duration-200 hover:bg-[#B28B65] hover:text-white dark:bg-[#C8A98B] dark:text-[#201C1A] dark:hover:bg-[#D8BFA4]"
              >
                <span data-preview-field-path="collectionsPage.atelierCtaLabel">
                  {atelierCtaLabel}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 stroke-[1.8] transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            ) : (
              <span
                data-preview-field-path="collectionsPage.atelierCtaLabel"
                className="unavailable inline-flex h-12 items-center rounded-[11px] border border-[#49382D]/20 px-7 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                {atelierCtaLabel}
              </span>
            )}
          </span>
        </div>
      </section>
    </div>
  );
}
