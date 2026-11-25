'use client';

import { ArrowRight, Check } from 'lucide-react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import {
  contentList,
  contentObject,
  contentText,
  useProducts,
  useServices,
  useSiteData,
} from '@/lib/siteDataContext';
import { formatLoomePrice } from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import { LuxuryReveal, LuxuryStagger, LuxuryStaggerItem } from '@/components/motion/LuxuryReveal';

export default function ServicesPage() {
  const siteData = useSiteData();
  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const shop = contentObject((siteData as Record<string, unknown>).shop);
  const page = contentObject(content.servicesPage);
  const services = useServices();
  const products = useProducts();

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'shop', 'collections', 'services', 'contact'];
  const hasContactPage = requiredPages.includes('contact');

  const firstProductCurrency = contentText(contentObject(products[0]).currency);
  const defaultCurrency =
    contentText(shop.currency) ||
    contentText(common.currency) ||
    firstProductCurrency ||
    'LKR';
  const quoteLabel = contentText(page.quoteLabel) || 'Quote on Request';
  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const servicesNavLabel = contentText(navLabels.services) || 'Services';

  const resolveServiceHref = (rawUrl: string) => {
    const clean = rawUrl.trim();
    if (!clean) {
      return hasContactPage ? withBasePath('/contact/') : '#services-list';
    }
    if (clean.startsWith('#') || /^(?:https?:|mailto:|tel:)/i.test(clean)) {
      return clean;
    }
    const normalized = clean.replace(/^\/+|\/+$/g, '');
    if (normalized === 'contact' && !hasContactPage) {
      return '#services-list';
    }
    return withBasePath(clean);
  };

  return (
    <div
      data-preview-page-key="services"
      className="loome-surface-ivory w-full overflow-x-clip"
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
          <span aria-hidden="true" data-preview-static="services-bc-sep" className="text-[var(--brand-accent)]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.services"
            className="font-semibold text-[var(--heading-color)]"
          >
            {servicesNavLabel}
          </span>
        </div>
      </div>

      {/* Light Editorial Page Header */}
      <section
        data-design-section="services-heading"
        className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-9 sm:px-8 lg:px-10 lg:pb-10 lg:pt-12"
      >
        <LuxuryReveal className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--brand-accent)]" aria-hidden="true" />
            <EditableText
              as="p"
              data-preview-field-path="servicesPage.eyebrow"
              defaultValue={contentText(page.eyebrow) || 'Private Atelier'}
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
            data-preview-field-path="servicesPage.heading"
            defaultValue={contentText(page.heading) || 'Bespoke Textile Services'}
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
            data-preview-field-path="servicesPage.intro"
            defaultValue={contentText(page.intro)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.72}
            color="muted"
            className="mt-3.5 mb-0 max-w-2xl"
          />
        </LuxuryReveal>
      </section>

      {/* Bespoke Drapery, Swatches & Consultations Grid */}
      <section
        id="services-list"
        data-design-section="services-list"
        className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div data-preview-list-path="services">
            {services.length === 0 ? (
              <div
                data-preview-static="services-empty"
                className="rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] py-14 text-center text-sm text-[var(--muted-color)]"
              >
                Add bespoke textile services in your Fivora editor.
              </div>
            ) : (
              <LuxuryStagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((rawService, index) => {
                  const service = contentObject(rawService);
                  const features = contentList(service.features);
                  const imageUrl = contentText(service.imageUrl);
                  const ctaLabel = contentText(service.ctaLabel) || 'Inquire Now';
                  const ctaHref = resolveServiceHref(contentText(service.ctaUrl) || '/contact');
                  const isExternal = /^https?:\/\//i.test(ctaHref);

                  const itemShowPrice =
                    (service as any)?.showPrice !== undefined
                      ? Boolean((service as any).showPrice)
                      : (service as any)?.customData?.showPrice !== undefined
                        ? Boolean((service as any).customData.showPrice)
                        : true;

                  const price = (service as any).price;
                  const priceLabel = contentText((service as any).priceLabel);
                  const hasNumericPrice =
                    price !== undefined && price !== null && String(price).trim() !== '';
                  const numericPrice =
                    typeof price === 'number' ? price : Number.parseFloat(String(price ?? 0));
                  const formattedPrice = hasNumericPrice
                    ? Number.isFinite(numericPrice)
                      ? formatLoomePrice(numericPrice, defaultCurrency)
                      : String(price)
                    : '';

                  return (
                    <LuxuryStaggerItem key={contentText(service.id) || index}>
                      <article
                        data-preview-item-path={`services[${index}]`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] shadow-[0_3px_14px_rgba(73,56,44,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-accent)]/70 hover:shadow-[0_12px_26px_rgba(73,56,44,0.09)] dark:shadow-none"
                      >
                        {imageUrl && (
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--loome-beige)]">
                            <EditableImage
                              id={`services[${index}].imageUrl`}
                              src={imageUrl}
                              alt={contentText(service.name)}
                              data-preview-field-path={`services[${index}].imageUrl`}
                              data-preview-style-target={`services[${index}].imageUrl`}
                              data-preview-style-type="image"
                              aspectRatio="16/10"
                              fit="cover"
                              radius="none"
                              className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                            />
                          </div>
                        )}

                        <div className="flex flex-1 flex-col p-6">
                          <EditableText
                            as="h2"
                            data-preview-field-path={`services[${index}].name`}
                            defaultValue={contentText(service.name)}
                            fontFamily="heading"
                            size="1.25rem"
                            weight={800}
                            lineHeight={1.22}
                            letterSpacing="-0.02em"
                            color="heading"
                            className="m-0"
                          />

                          <EditableText
                            as="p"
                            data-preview-field-path={`services[${index}].description`}
                            defaultValue={contentText(service.description)}
                            fontFamily="body"
                            size="0.875rem"
                            lineHeight={1.7}
                            color="muted"
                            className="mt-2.5 mb-0"
                          />

                          {features.length > 0 && (
                            <ul
                              data-preview-list-path={`services[${index}].features`}
                              className="mt-4 flex list-none flex-col gap-2 border-t border-[var(--loome-border)] p-0 pt-4"
                            >
                              {features.map((feature, fIndex) => (
                                <li
                                  key={fIndex}
                                  data-preview-item-path={`services[${index}].features[${fIndex}]`}
                                  className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--muted-color)]"
                                >
                                  <Check
                                    className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.9] text-[var(--brand-accent)]"
                                    aria-hidden="true"
                                  />
                                  <span data-preview-field-path={`services[${index}].features[${fIndex}]`}>
                                    {contentText(feature)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-auto space-y-3.5 border-t border-[var(--loome-border)] pt-4">
                            {itemShowPrice && (hasNumericPrice || priceLabel) ? (
                              <div className="flex flex-wrap items-baseline gap-2">
                                {hasNumericPrice && (
                                  <EditableText
                                    as="span"
                                    data-preview-field-path={`services[${index}].price`}
                                    defaultValue={formattedPrice}
                                    fontFamily="heading"
                                    size="1.25rem"
                                    weight={800}
                                    color="heading"
                                  />
                                )}
                                {priceLabel && (
                                  <EditableText
                                    as="span"
                                    data-preview-field-path={`services[${index}].priceLabel`}
                                    defaultValue={priceLabel}
                                    fontFamily="body"
                                    size="0.75rem"
                                    color="muted"
                                  />
                                )}
                              </div>
                            ) : !itemShowPrice ? (
                              <span
                                data-preview-field-path="servicesPage.quoteLabel"
                                className="inline-block rounded-[8px] border border-[var(--brand-accent)]/40 bg-[var(--loome-ivory)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--heading-color)]"
                              >
                                {quoteLabel}
                              </span>
                            ) : null}

                            <a
                              href={ctaHref}
                              target={isExternal ? '_blank' : undefined}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              data-preview-field-path={`services[${index}].ctaUrl`}
                              className="group/btn flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[var(--loome-btn-primary-bg)] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loome-btn-primary-text)] no-underline transition-colors duration-200 hover:bg-[var(--loome-btn-primary-hover)]"
                            >
                              <span data-preview-field-path={`services[${index}].ctaLabel`}>
                                {ctaLabel}
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
        </div>
      </section>
    </div>
  );
}
