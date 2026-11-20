'use client';

import { Check } from 'lucide-react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import {
  contentList,
  contentObject,
  contentText,
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
  const page = contentObject(content.servicesPage);
  const services = useServices();
  const defaultCurrency = contentText(common.currency) || 'USD';

  return (
    <div data-preview-page-key="services" className="w-full overflow-x-clip">
      {/* Compact Editorial Page Header */}
      <section
        data-design-section="services-heading"
        className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 sm:px-8 lg:px-14 lg:pb-10 lg:pt-16"
      >
        <LuxuryReveal className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B59B79]" aria-hidden="true" />
            <p
              data-preview-static="services-eyebrow"
              className="m-0 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
            >
              Bespoke Atelier &amp; Collections
            </p>
          </div>

          <EditableText
            as="h1"
            data-preview-field-path="servicesPage.heading"
            defaultValue={contentText(page.heading)}
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
            data-preview-field-path="servicesPage.intro"
            defaultValue={contentText(page.intro)}
            fontFamily="body"
            size="1rem"
            lineHeight={1.8}
            color="muted"
            className="mt-4 mb-0 max-w-2xl"
          />
        </LuxuryReveal>
      </section>

      {/* Services & Bespoke Editions Grid — Flowing Directly Beneath Header */}
      <section
        data-design-section="services-list"
        className="w-full border-t border-[#262923]/8 bg-[#E8E0D5]/32 py-12 dark:border-[#F8F6F1]/8 dark:bg-[#20231D] lg:py-16"
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
                      className="group flex h-full flex-col border border-[#262923]/10 bg-[#FCFBF8] transition-all duration-500 hover:-translate-y-1 hover:border-[#B59B79]/60 hover:shadow-[0_18px_40px_rgba(38,41,35,0.06)] dark:border-[#F8F6F1]/10 dark:bg-[#171915]"
                    >
                      {imageUrl && (
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E8E0D5]/50">
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
                          size="1.75rem"
                          weight={400}
                          lineHeight={1.18}
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
                            className="mt-5 flex list-none flex-col gap-2.5 border-t border-[#262923]/10 p-0 pt-5 dark:border-[#F8F6F1]/10"
                          >
                            {features.map((feature, fIndex) => (
                              <li
                                key={fIndex}
                                data-preview-item-path={`services[${index}].features[${fIndex}]`}
                                className="flex items-start gap-2.5 text-xs leading-relaxed text-[#595C52] dark:text-[#B6B8AE]"
                              >
                                <Check
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.75] text-[#747B65] dark:text-[#B59B79]"
                                  aria-hidden="true"
                                />
                                <span data-preview-field-path={`services[${index}].features[${fIndex}]`}>
                                  {contentText(feature)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-auto border-t border-[#262923]/10 pt-5 dark:border-[#F8F6F1]/10">
                          {itemShowPrice && (hasNumericPrice || priceLabel) ? (
                            <div className="flex flex-wrap items-baseline gap-2">
                              {hasNumericPrice && (
                                <EditableText
                                  as="span"
                                  data-preview-field-path={`services[${index}].price`}
                                  defaultValue={formattedPrice}
                                  fontFamily="heading"
                                  size="1.5rem"
                                  weight={500}
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
                              data-preview-static="service-quote-label"
                              className="inline-block border border-[#B59B79]/45 bg-[#E8E0D5]/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#747B65] dark:text-[#B59B79]"
                            >
                              Quote on Request
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
