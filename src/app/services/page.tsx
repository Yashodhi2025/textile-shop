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
            data-preview-field-path="common.navLabels.services"
            className="font-semibold text-[#2C211B] dark:text-[#F5EEE6]"
          >
            {servicesNavLabel}
          </span>
        </div>
      </div>

      {/* Light Editorial Page Header */}
      <section
        data-design-section="services-heading"
        className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-8 lg:px-14 lg:pb-12 lg:pt-16"
      >
        <LuxuryReveal className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B28B65] dark:bg-[#C8A98B]" aria-hidden="true" />
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
            size="clamp(2.4rem, 4.4vw, 3.85rem)"
            weight={800}
            lineHeight={1.05}
            letterSpacing="-0.03em"
            color="heading"
            className="mt-3.5 mb-0"
          />

          <EditableText
            as="p"
            data-preview-field-path="servicesPage.intro"
            defaultValue={contentText(page.intro)}
            fontFamily="body"
            size="0.96875rem"
            lineHeight={1.8}
            color="muted"
            className="mt-4 mb-0 max-w-2xl"
          />
        </LuxuryReveal>
      </section>

      {/* Bespoke Drapery, Swatches & Consultations Grid */}
      <section
        id="services-list"
        data-design-section="services-list"
        className="loome-surface-beige w-full border-t border-[#49382D]/12 py-14 dark:border-[#C8A98B]/16 lg:py-20"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
          <div data-preview-list-path="services">
            {services.length === 0 ? (
              <div
                data-preview-static="services-empty"
                className="rounded-2xl border border-dashed border-[#49382D]/20 bg-white/70 py-16 text-center text-sm text-[#6E5B4E] dark:border-[#C8A98B]/28 dark:bg-[#28211D]/60 dark:text-[#C9B9AA]"
              >
                Add bespoke textile services in your Fivora editor.
              </div>
            ) : (
              <LuxuryStagger className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
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
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#49382D]/12 bg-white shadow-[0_3px_16px_rgba(73,56,45,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B28B65]/65 hover:shadow-[0_14px_30px_rgba(73,56,45,0.09)] dark:border-[#C8A98B]/20 dark:bg-[#28211D] dark:shadow-none dark:hover:border-[#C8A98B]/55"
                      >
                        {imageUrl && (
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E8DDD0]/60 dark:bg-[#3B302B]/50">
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

                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                          <EditableText
                            as="h2"
                            data-preview-field-path={`services[${index}].name`}
                            defaultValue={contentText(service.name)}
                            fontFamily="heading"
                            size="1.4rem"
                            weight={800}
                            lineHeight={1.2}
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
                            lineHeight={1.75}
                            color="muted"
                            className="mt-3 mb-0"
                          />

                          {features.length > 0 && (
                            <ul
                              data-preview-list-path={`services[${index}].features`}
                              className="mt-5 flex list-none flex-col gap-2.5 border-t border-[#49382D]/10 p-0 pt-5 dark:border-[#C8A98B]/16"
                            >
                              {features.map((feature, fIndex) => (
                                <li
                                  key={fIndex}
                                  data-preview-item-path={`services[${index}].features[${fIndex}]`}
                                  className="flex items-start gap-2.5 text-xs leading-relaxed text-[#6E5B4E] dark:text-[#C9B9AA]"
                                >
                                  <Check
                                    className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.9] text-[#B28B65] dark:text-[#C8A98B]"
                                    aria-hidden="true"
                                  />
                                  <span data-preview-field-path={`services[${index}].features[${fIndex}]`}>
                                    {contentText(feature)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-auto space-y-4 border-t border-[#49382D]/10 pt-5 dark:border-[#C8A98B]/16">
                            {itemShowPrice && (hasNumericPrice || priceLabel) ? (
                              <div className="flex flex-wrap items-baseline gap-2">
                                {hasNumericPrice && (
                                  <EditableText
                                    as="span"
                                    data-preview-field-path={`services[${index}].price`}
                                    defaultValue={formattedPrice}
                                    fontFamily="heading"
                                    size="1.35rem"
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
                                className="inline-block rounded-[8px] border border-[#B28B65]/40 bg-[#F7F3ED] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#49382D] dark:border-[#C8A98B]/40 dark:bg-[#3B302B] dark:text-[#F5EEE6]"
                              >
                                {quoteLabel}
                              </span>
                            ) : null}

                            <a
                              href={ctaHref}
                              target={isExternal ? '_blank' : undefined}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              data-preview-field-path={`services[${index}].ctaUrl`}
                              className="group/btn flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#49382D] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] no-underline transition-colors duration-200 hover:bg-[#B28B65] hover:text-white dark:bg-[#C8A98B] dark:text-[#201C1A] dark:hover:bg-[#D8BFA4]"
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
