'use client';

import { Check } from 'lucide-react';
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
  const shop = contentObject((siteData as Record<string, unknown>).shop);
  const page = contentObject(content.servicesPage);
  const services = useServices();
  const products = useProducts();
  const firstProductCurrency = contentText(contentObject(products[0]).currency);
  const defaultCurrency =
    contentText(shop.currency) ||
    contentText(common.currency) ||
    firstProductCurrency ||
    'LKR';
  const quoteLabel = contentText(page.quoteLabel) || 'Quote on Request';

  return (
    <div
      data-preview-page-key="services"
      className="loome-surface-espresso w-full overflow-x-clip bg-[#201C1A] text-[#F2E9DE]"
    >
      {/* Compact Editorial Page Header */}
      <section
        data-design-section="services-heading"
        className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-8 lg:px-14 lg:pb-12 lg:pt-16"
      >
        <LuxuryReveal className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#C8A98B]" aria-hidden="true" />
            <EditableText
              as="p"
              data-preview-field-path="servicesPage.eyebrow"
              defaultValue={contentText(page.eyebrow) || 'Bespoke Atelier & Collections'}
              fontFamily="body"
              size="0.6875rem"
              weight={600}
              transform="uppercase"
              letterSpacing="0.26em"
              color="#C8A98B"
              className="m-0"
            />
          </div>

          <EditableText
            as="h1"
            data-preview-field-path="servicesPage.heading"
            defaultValue={contentText(page.heading)}
            fontFamily="heading"
            size="clamp(2.5rem, 4.5vw, 4rem)"
            weight={800}
            lineHeight={1.04}
            letterSpacing="-0.03em"
            color="#F2E9DE"
            className="mt-4 mb-0"
          />

          <EditableText
            as="p"
            data-preview-field-path="servicesPage.intro"
            defaultValue={contentText(page.intro)}
            fontFamily="body"
            size="1rem"
            lineHeight={1.8}
            color="#C7B6A6"
            className="mt-4 mb-0 max-w-2xl"
          />
        </LuxuryReveal>
      </section>

      {/* Services & Bespoke Editions Grid — Adaptive Cream / Dark Espresso Surface */}
      <section
        data-design-section="services-list"
        className="loome-surface-cream w-full border-t border-[#C8A98B]/20 py-14 lg:py-20"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
          <div data-preview-list-path="services">
            <LuxuryStagger className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {services.map((rawService, index) => {
                const service = contentObject(rawService);
                const features = contentList(service.features);
                const imageUrl = contentText(service.imageUrl);

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
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#3B302B]/14 bg-[#FAF5EE] transition-all duration-500 hover:-translate-y-1 hover:border-[#C8A98B]/75 hover:shadow-[0_18px_40px_rgba(32,28,26,0.08)] dark:border-[#C8A98B]/22 dark:bg-[#2A221F]"
                    >
                      {imageUrl && (
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E6D9C9]/60 dark:bg-[#3B302B]/60">
                          <EditableImage
                            src={withBasePath(imageUrl)}
                            alt={contentText(service.name)}
                            data-preview-field-path={`services[${index}].imageUrl`}
                            aspectRatio="16/10"
                            fit="cover"
                            radius="none"
                            className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.05]"
                          />
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-6 sm:p-7">
                        <EditableText
                          as="h2"
                          data-preview-field-path={`services[${index}].name`}
                          defaultValue={contentText(service.name)}
                          fontFamily="heading"
                          size="1.5rem"
                          weight={800}
                          lineHeight={1.18}
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
                            className="mt-5 flex list-none flex-col gap-2.5 border-t border-[#3B302B]/12 p-0 pt-5 dark:border-[#C8A98B]/18"
                          >
                            {features.map((feature, fIndex) => (
                              <li
                                key={fIndex}
                                data-preview-item-path={`services[${index}].features[${fIndex}]`}
                                className="flex items-start gap-2.5 text-xs leading-relaxed text-[#5E4E45] dark:text-[#C9B9AA]"
                              >
                                <Check
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.85] text-[#8D7667] dark:text-[#C8A98B]"
                                  aria-hidden="true"
                                />
                                <span data-preview-field-path={`services[${index}].features[${fIndex}]`}>
                                  {contentText(feature)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-auto border-t border-[#3B302B]/12 pt-5 dark:border-[#C8A98B]/18">
                          {itemShowPrice && (hasNumericPrice || priceLabel) ? (
                            <div className="flex flex-wrap items-baseline gap-2">
                              {hasNumericPrice && (
                                <EditableText
                                  as="span"
                                  data-preview-field-path={`services[${index}].price`}
                                  defaultValue={formattedPrice}
                                  fontFamily="heading"
                                  size="1.5rem"
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
                              className="inline-block rounded-[10px] border border-[#C8A98B]/55 bg-[#F2E9DE] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3B302B] dark:bg-[#3B302B] dark:text-[#F5EEE6]"
                            >
                              {quoteLabel}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </LuxuryStaggerItem>
                );
              })}
            </LuxuryStagger>
          </div>
        </div>
      </section>
    </div>
  );
}
