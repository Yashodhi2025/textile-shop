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
      <div className="border-b border-[var(--loome-border)] bg-[var(--loome-surface-subtle)]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] transition-colors hover:text-[var(--heading-color)]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" data-preview-static="collections-bc-sep" className="text-[var(--brand-accent)]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.collections"
            className="font-semibold text-[var(--heading-color)]"
          >
            {collectionsNavLabel}
          </span>
        </div>
      </div>

      {/* Compact Editorial Hero Header */}
      <section
        data-design-section="collections-heading"
        className="mx-auto w-full max-w-[1280px] px-4 pb-5 pt-6 sm:px-8 sm:pt-7 lg:px-10 lg:pb-6"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-2.5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="h-px w-7 bg-[var(--brand-accent)]" aria-hidden="true" />
              <EditableText
                as="p"
                data-preview-field-path="collectionsPage.eyebrow"
                defaultValue={eyebrow}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.22em"
                color="primary"
                className="m-0"
              />
            </div>

            <EditableText
              as="h1"
              data-preview-field-path="collectionsPage.heading"
              defaultValue={heading}
              fontFamily="heading"
              size="clamp(1.75rem, 2.6vw, 2.25rem)"
              weight={800}
              lineHeight={1.1}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-1.5 mb-0"
            />
          </div>

          <EditableText
            as="p"
            data-preview-field-path="collectionsPage.intro"
            defaultValue={intro}
            fontFamily="body"
            size="0.875rem"
            lineHeight={1.6}
            color="muted"
            className="m-0 max-w-md lg:text-right"
          />
        </LuxuryReveal>
      </section>

      {/* Curated Collections Balanced Two-Column Grid */}
      <section
        data-design-section="collections-grid"
        className="mx-auto w-full max-w-[1280px] px-4 pb-10 sm:px-8 lg:px-10 lg:pb-14"
      >
        <div data-preview-list-path="collectionsPage.collections">
          {collections.length === 0 ? (
            <div
              data-preview-static="collections-empty"
              className="rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] py-14 text-center text-sm text-[var(--muted-color)]"
            >
              Add curated collections in your Fivora editor to populate this page.
            </div>
          ) : (
            <LuxuryStagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7">
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
                      data-testid="collection-card"
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] shadow-[0_3px_14px_rgba(73,56,44,0.05)] transition-all duration-300 hover:border-[var(--brand-accent)]/70 hover:shadow-[0_10px_24px_rgba(73,56,44,0.09)] dark:shadow-none"
                    >
                      {/* Compact Editorial Image (260–300px on desktop) */}
                      <div
                        data-testid="collection-card-media"
                        className="relative h-[220px] w-full overflow-hidden bg-[var(--loome-beige)] sm:h-[250px] lg:h-[280px]"
                      >
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
                          className="pointer-events-none absolute right-3.5 top-3.5 rounded-[8px] border border-white/25 bg-[#2D2722]/82 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F7F4EF] backdrop-blur-md"
                        >
                          {matchingCount} {matchingCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>

                      {/* Collection Copy & Compact Explore CTA */}
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <EditableText
                          as="p"
                          data-preview-field-path={`collectionsPage.collections[${col.index}].tag`}
                          defaultValue={col.tag}
                          fontFamily="body"
                          size="0.65625rem"
                          weight={600}
                          transform="uppercase"
                          letterSpacing="0.2em"
                          color="primary"
                          className="m-0"
                        />

                        <EditableText
                          as="h2"
                          data-testid="collection-card-title"
                          data-preview-field-path={`collectionsPage.collections[${col.index}].title`}
                          defaultValue={col.title}
                          fontFamily="heading"
                          size="clamp(1.5rem, 1.9vw, 1.6875rem)"
                          weight={800}
                          lineHeight={1.2}
                          letterSpacing="-0.02em"
                          color="heading"
                          className="mt-1.5 mb-0"
                        />

                        <EditableText
                          as="p"
                          data-preview-field-path={`collectionsPage.collections[${col.index}].description`}
                          defaultValue={col.description}
                          fontFamily="body"
                          size="0.875rem"
                          lineHeight={1.62}
                          color="muted"
                          className="mt-2 mb-0"
                        />

                        <div className="mt-auto pt-4">
                          <a
                            href={targetHref}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            data-testid={`collection-cta-${col.id}`}
                            data-preview-field-path={`collectionsPage.collections[${col.index}].href`}
                            className="group/btn inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[var(--loome-btn-primary-bg)] px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--loome-btn-primary-text)] no-underline transition-colors duration-200 hover:bg-[var(--loome-btn-primary-hover)]"
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
        className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-12 lg:py-14"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 sm:px-8 lg:flex-row lg:items-center lg:px-10">
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
              size="clamp(1.6rem, 2.5vw, 2.15rem)"
              weight={800}
              lineHeight={1.14}
              letterSpacing="-0.02em"
              color="heading"
              className="mt-2 mb-0"
            />
            <EditableText
              as="p"
              data-preview-field-path="collectionsPage.atelierDescription"
              defaultValue={atelierDescription}
              fontFamily="body"
              size="0.9375rem"
              lineHeight={1.7}
              color="muted"
              className="mt-2.5 mb-0"
            />
          </div>

          <span data-target-page="services" className="shrink-0">
            {hasServicesPage ? (
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath(pageRoute('services')))}
                className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-[11px] bg-[var(--loome-btn-primary-bg)] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loome-btn-primary-text)] transition-colors duration-200 hover:bg-[var(--loome-btn-primary-hover)]"
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
                className="unavailable inline-flex h-11 items-center rounded-[11px] border border-[var(--loome-border)] px-6 text-xs font-semibold uppercase tracking-[0.16em]"
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
