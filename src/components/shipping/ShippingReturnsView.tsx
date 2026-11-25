'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Clock,
  CreditCard,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import {
  LuxuryHairline,
  LuxuryImageReveal,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

interface HighlightCard {
  index: number;
  id: string;
  label: string;
  title: string;
  description: string;
}

interface DeliveryMethodItem {
  index: number;
  id: string;
  name: string;
  region: string;
  timeline: string;
  charge: string;
  details: string;
}

interface ShippingFaqItem {
  index: number;
  id: string;
  tag: string;
  question: string;
  answer: string;
}

interface ReturnPillarItem {
  index: number;
  id: string;
  step: string;
  title: string;
  description: string;
}

interface DamagedStepItem {
  index: number;
  id: string;
  stepLabel: string;
  title: string;
  description: string;
}

export default function ShippingReturnsView() {
  const siteData = useSiteData();

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const contact = contentObject(content.contact);
  const page = contentObject(content.shippingReturnsPage);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'cart',
        'checkout',
        'journal',
        'textile_care',
        'shipping_returns',
        'about_us',
        'services',
        'contact',
      ];
  const hasContactPage = requiredPages.includes('contact');

  const highlights = useMemo<HighlightCard[]>(
    () =>
      contentList(page.highlights).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `highlight-${idx}`,
          label: contentText(obj.label) || 'Client Care',
          title: contentText(obj.title) || 'Atelier Support',
          description: contentText(obj.description),
        };
      }),
    [page.highlights],
  );

  const deliveryMethods = useMemo<DeliveryMethodItem[]>(
    () =>
      contentList(page.deliveryMethods).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `method-${idx}`,
          name: contentText(obj.name) || 'Courier Delivery',
          region: contentText(obj.region),
          timeline: contentText(obj.timeline),
          charge: contentText(obj.charge),
          details: contentText(obj.details),
        };
      }),
    [page.deliveryMethods],
  );

  const shippingFaqs = useMemo<ShippingFaqItem[]>(
    () =>
      contentList(page.shippingFaqs).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `faq-${idx}`,
          tag: contentText(obj.tag) || 'Shipping',
          question: contentText(obj.question) || 'Delivery question',
          answer: contentText(obj.answer),
        };
      }),
    [page.shippingFaqs],
  );

  const returnPillars = useMemo<ReturnPillarItem[]>(
    () =>
      contentList(page.returnPillars).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `return-${idx}`,
          step: contentText(obj.step) || `0${idx + 1}`,
          title: contentText(obj.title) || 'Return Policy',
          description: contentText(obj.description),
        };
      }),
    [page.returnPillars],
  );

  const damagedSteps = useMemo<DamagedStepItem[]>(
    () =>
      contentList(page.damagedSteps).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `damaged-${idx}`,
          stepLabel: contentText(obj.stepLabel) || `Step 0${idx + 1}`,
          title: contentText(obj.title) || 'Resolution Step',
          description: contentText(obj.description),
        };
      }),
    [page.damagedSteps],
  );

  // Start FAQs expanded so every editable answer is visible & clickable in Fivora's exported HTML,
  // while visitors can smoothly collapse or re-expand any question.
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({});
  const [whatsappFallbackNotice, setWhatsappFallbackNotice] = useState<string | null>(null);

  const isFaqOpen = (faq: ShippingFaqItem) => {
    if (Object.prototype.hasOwnProperty.call(openFaqIds, faq.id)) {
      return Boolean(openFaqIds[faq.id]);
    }
    return true;
  };

  const toggleFaq = (faq: ShippingFaqItem) => {
    setOpenFaqIds((prev) => {
      const current = Object.prototype.hasOwnProperty.call(prev, faq.id)
        ? Boolean(prev[faq.id])
        : true;
      return { ...prev, [faq.id]: !current };
    });
  };

  // Dynamic merchant WhatsApp configuration (never hardcoded)
  const rawWhatsapp = contentText(contact.whatsapp) || contentText(contact.phone);
  const whatsappDigits = rawWhatsapp.replace(/[^\d]/g, '');
  const ctaWhatsappMessage =
    contentText(page.ctaWhatsappMessage) ||
    'Hello, I would like assistance with shipping or returns.';
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(ctaWhatsappMessage)}`
    : '';
  const contactEmail = contentText(contact.email);

  const handleWhatsAppClick = () => {
    setWhatsappFallbackNotice(null);
    if (!whatsappHref) {
      if (hasContactPage) {
        window.location.assign(withBasePath('/contact/'));
        return;
      }
      setWhatsappFallbackNotice(
        contactEmail
          ? `WhatsApp concierge is not configured yet. Please reach us at ${contactEmail}.`
          : 'WhatsApp concierge number is not configured yet.',
      );
      return;
    }

    const popup = window.open(whatsappHref, '_blank');
    if (popup) {
      try {
        popup.opener = null;
      } catch {
        // Ignore cross-origin opener restriction
      }
      return;
    }
    // Direct fallback navigation if popups are blocked
    window.location.assign(whatsappHref);
  };

  // Editable page labels & copy
  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const shippingNavLabel = contentText(navLabels.shipping_returns) || 'Shipping & Returns';

  const eyebrow = contentText(page.eyebrow) || 'ATELIER CLIENT CARE';
  const heading = contentText(page.heading) || 'Shipping & Returns';
  const intro =
    contentText(page.intro) ||
    'Every LOOMÉ textile is carefully inspected, folded in breathable protective wrapping, and dispatched with attentive concierge support.';

  const policyNoticeHeading =
    contentText(page.policyNoticeHeading) || 'Merchant-Configured Delivery & Return Terms';
  const policyNoticeBody =
    contentText(page.policyNoticeBody) ||
    'Delivery timeframes, courier rates, and return windows depend on your destination and whether pieces are ready-to-ship or made-to-measure.';

  const shippingEyebrow = contentText(page.shippingEyebrow) || 'DELIVERY & DISPATCH';
  const shippingHeading = contentText(page.shippingHeading) || 'Shipping Information';
  const shippingIntro =
    contentText(page.shippingIntro) ||
    'Choose the delivery service that best suits your order. Timelines begin once your order is confirmed and prepared by our atelier.';
  const methodTimelineLabel = contentText(page.methodTimelineLabel) || 'Estimated Timeline';
  const methodChargeLabel = contentText(page.methodChargeLabel) || 'Shipping Charge';
  const shippingFootnote =
    contentText(page.shippingFootnote) ||
    'Note: International shipments may be subject to local import duties, customs clearance times, or taxes determined by your destination country.';

  const faqEyebrow = contentText(page.faqEyebrow) || 'SHIPPING QUESTIONS';
  const faqHeading = contentText(page.faqHeading) || 'Shipping & Delivery FAQ';
  const faqIntro =
    contentText(page.faqIntro) ||
    'Clear answers on order preparation, custom drapery lead times, tracking updates, and protective packaging.';
  const faqImageUrl = contentText(page.faqImageUrl) || '/images/cat-curtains.jpg';
  const faqImageCaption =
    contentText(page.faqImageCaption) || 'Protective Fold & Pressed Finishing Prior to Dispatch';

  const returnsEyebrow = contentText(page.returnsEyebrow) || 'RETURNS & EXCHANGES';
  const returnsHeading = contentText(page.returnsHeading) || 'Returns & Exchanges Policy';
  const returnsIntro =
    contentText(page.returnsIntro) ||
    'We want every LOOMÉ weave to harmonize effortlessly with your space. Below is how eligible returns, exchanges, and refunds are handled.';

  const damagedEyebrow = contentText(page.damagedEyebrow) || 'QUALITY ASSURANCE';
  const damagedHeading = contentText(page.damagedHeading) || 'Damaged or Incorrect Items';
  const damagedIntro =
    contentText(page.damagedIntro) ||
    'Every piece is inspected by hand before leaving LOOMÉ. If your parcel arrives damaged in transit or contains an incorrect item, we will prioritize making it right.';
  const damagedImageUrl = contentText(page.damagedImageUrl) || '/images/prod-duvet-flax.jpg';
  const damagedImageCaption =
    contentText(page.damagedImageCaption) ||
    'Hand-Inspected Finish · Stonewashed European Flax';

  const ctaEyebrow = contentText(page.ctaEyebrow) || 'ATELIER CONCIERGE';
  const ctaHeading =
    contentText(page.ctaHeading) || 'Need Personal Help With Shipping or Returns?';
  const ctaDescription =
    contentText(page.ctaDescription) ||
    'Connect directly with our textile specialists on WhatsApp for courier estimates, custom drapery scheduling, or return assistance.';
  const ctaImageUrl = contentText(page.ctaImageUrl) || '/images/featured-collection.jpg';
  const ctaButtonLabel = contentText(page.ctaButtonLabel) || 'Contact via WhatsApp';
  const ctaSecondaryLabel = contentText(page.ctaSecondaryLabel) || 'Contact Page';

  const renderHighlightIcon = (id: string, idx: number) => {
    const key = id.toLowerCase();
    if (key.includes('return') || idx === 1) {
      return <RotateCcw aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />;
    }
    if (key.includes('assist') || key.includes('concierge') || idx === 2) {
      return <MessageCircle aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />;
    }
    return <Truck aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />;
  };

  return (
    <div
      data-preview-page-key="shipping_returns"
      className="loome-surface-ivory min-h-[75vh] w-full"
    >
      {/* Editorial Breadcrumb Strip */}
      <div className="border-b border-[var(--loome-border)] bg-[var(--loome-surface-subtle)]">
        <nav className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] transition-colors hover:text-[var(--heading-color)]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" data-preview-static="shipping-bc-sep" className="text-[var(--brand-accent)]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.shipping_returns"
            className="font-semibold text-[var(--heading-color)]"
          >
            {shippingNavLabel}
          </span>
        </nav>
      </div>

      {/* 1. Editorial Hero */}
      <section
        data-design-section="shipping-hero"
        className="w-full border-b border-[var(--loome-border)]"
      >
        <div className="mx-auto max-w-[1280px] px-4 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-12">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10">
            <LuxuryReveal className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[var(--brand-accent)]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.eyebrow"
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
                data-preview-field-path="shippingReturnsPage.heading"
                defaultValue={heading}
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
                data-preview-field-path="shippingReturnsPage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.72}
                color="muted"
                className="mt-3.5 mb-0 max-w-2xl"
              />
            </LuxuryReveal>

            {/* Merchant Policy Notice Card */}
            <LuxuryReveal delay={0.1} className="lg:col-span-5">
              <div className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-5 shadow-[0_4px_18px_rgba(73,56,44,0.05)] dark:shadow-none sm:p-6">
                <div className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-accent)]/35 bg-[var(--loome-ivory)] text-[var(--brand-accent)]"
                  >
                    <ShieldCheck className="h-4 w-4 stroke-[1.6]" />
                  </span>
                  <div>
                    <EditableText
                      as="h2"
                      data-preview-field-path="shippingReturnsPage.policyNoticeHeading"
                      defaultValue={policyNoticeHeading}
                      fontFamily="heading"
                      size="1.05rem"
                      weight={700}
                      lineHeight={1.28}
                      color="heading"
                      className="m-0"
                    />
                    <EditableText
                      as="p"
                      data-preview-field-path="shippingReturnsPage.policyNoticeBody"
                      defaultValue={policyNoticeBody}
                      fontFamily="body"
                      size="0.8125rem"
                      lineHeight={1.68}
                      color="muted"
                      className="mt-1.5 mb-0"
                    />
                  </div>
                </div>
              </div>
            </LuxuryReveal>
          </div>

          {/* 2. Three Refined Overview Cards: Delivery, Returns, Order Assistance */}
          <div data-preview-list-path="shippingReturnsPage.highlights" className="mt-9">
            {highlights.length > 0 && (
              <LuxuryStagger className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
                {highlights.map((card) => (
                  <LuxuryStaggerItem key={card.id}>
                    <article
                      data-preview-item-path={`shippingReturnsPage.highlights[${card.index}]`}
                      className="flex h-full flex-col rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-6 shadow-[0_3px_14px_rgba(73,56,44,0.04)] transition-all duration-300 hover:border-[var(--brand-accent)]/70 dark:shadow-none"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <EditableText
                          as="span"
                          data-preview-field-path={`shippingReturnsPage.highlights[${card.index}].label`}
                          defaultValue={card.label}
                          fontFamily="body"
                          size="0.65625rem"
                          weight={600}
                          transform="uppercase"
                          letterSpacing="0.22em"
                          color="primary"
                          className="inline"
                        />
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--loome-border)] bg-[var(--loome-ivory)] text-[var(--brand-accent)]">
                          {renderHighlightIcon(card.id, card.index)}
                        </span>
                      </div>

                      <EditableText
                        as="h3"
                        data-preview-field-path={`shippingReturnsPage.highlights[${card.index}].title`}
                        defaultValue={card.title}
                        fontFamily="heading"
                        size="1.2rem"
                        weight={700}
                        lineHeight={1.25}
                        color="heading"
                        className="mt-3.5 mb-0"
                      />

                      <EditableText
                        as="p"
                        data-preview-field-path={`shippingReturnsPage.highlights[${card.index}].description`}
                        defaultValue={card.description}
                        fontFamily="body"
                        size="0.875rem"
                        lineHeight={1.7}
                        color="muted"
                        className="mt-2 mb-0"
                      />
                    </article>
                  </LuxuryStaggerItem>
                ))}
              </LuxuryStagger>
            )}
          </div>
        </div>
      </section>

      {/* 3. Shipping Information: Editable Delivery Methods, Timelines & Charges */}
      <section
        data-design-section="shipping-methods"
        className="mx-auto w-full max-w-[1280px] px-4 py-12 sm:px-8 lg:px-10 lg:py-14"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-4 border-b border-[var(--loome-border)] pb-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <LuxuryHairline className="h-px w-8 bg-[var(--brand-accent)]" />
              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.shippingEyebrow"
                defaultValue={shippingEyebrow}
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
              as="h2"
              data-preview-field-path="shippingReturnsPage.shippingHeading"
              defaultValue={shippingHeading}
              fontFamily="heading"
              size="clamp(1.65rem, 2.6vw, 2.2rem)"
              weight={800}
              lineHeight={1.12}
              letterSpacing="-0.02em"
              color="heading"
              className="mt-2 mb-0"
            />
          </div>

          <div className="max-w-md lg:text-right">
            <EditableText
              as="p"
              data-preview-field-path="shippingReturnsPage.shippingIntro"
              defaultValue={shippingIntro}
              fontFamily="body"
              size="0.9rem"
              lineHeight={1.7}
              color="muted"
              className="m-0"
            />
          </div>
        </LuxuryReveal>

        <div data-preview-list-path="shippingReturnsPage.deliveryMethods" className="mt-8">
          {deliveryMethods.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-12 text-center">
              <p
                data-preview-static="shipping-methods-empty"
                className="m-0 text-sm text-[var(--muted-color)]"
              >
                Add delivery methods in your Fivora editor to display shipping timelines and charges.
              </p>
              {/* Keep shared column labels mounted in empty-state */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[10.5px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                <EditableText
                  as="span"
                  data-preview-field-path="shippingReturnsPage.methodTimelineLabel"
                  defaultValue={methodTimelineLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <span aria-hidden="true">·</span>
                <EditableText
                  as="span"
                  data-preview-field-path="shippingReturnsPage.methodChargeLabel"
                  defaultValue={methodChargeLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
              </div>
            </div>
          ) : (
            <LuxuryStagger className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
              {deliveryMethods.map((method) => (
                <LuxuryStaggerItem key={method.id}>
                  <article
                    data-preview-item-path={`shippingReturnsPage.deliveryMethods[${method.index}]`}
                    className="flex h-full flex-col justify-between rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-6 shadow-[0_3px_14px_rgba(73,56,44,0.04)] dark:shadow-none"
                  >
                    <div>
                      <EditableText
                        as="p"
                        data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].region`}
                        defaultValue={method.region}
                        fontFamily="body"
                        size="0.625rem"
                        weight={600}
                        transform="uppercase"
                        letterSpacing="0.22em"
                        color="primary"
                        className="m-0"
                      />

                      <EditableText
                        as="h3"
                        data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].name`}
                        defaultValue={method.name}
                        fontFamily="heading"
                        size="1.25rem"
                        weight={700}
                        lineHeight={1.25}
                        color="heading"
                        className="mt-2 mb-0"
                      />

                      <EditableText
                        as="p"
                        data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].details`}
                        defaultValue={method.details}
                        fontFamily="body"
                        size="0.8625rem"
                        lineHeight={1.7}
                        color="muted"
                        className="mt-2.5 mb-0"
                      />
                    </div>

                    <div className="mt-6 space-y-3.5 border-t border-[var(--loome-border)] pt-4">
                      <div className="flex items-start gap-2.5">
                        <Clock
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[var(--brand-accent)]"
                        />
                        <div>
                          <EditableText
                            as="span"
                            data-preview-field-path="shippingReturnsPage.methodTimelineLabel"
                            defaultValue={methodTimelineLabel}
                            fontFamily="body"
                            size="0.625rem"
                            weight={600}
                            transform="uppercase"
                            letterSpacing="0.18em"
                            color="muted"
                            className="block"
                          />
                          <EditableText
                            as="p"
                            data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].timeline`}
                            defaultValue={method.timeline}
                            fontFamily="body"
                            size="0.875rem"
                            weight={600}
                            lineHeight={1.45}
                            color="heading"
                            className="mt-0.5 mb-0"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <CreditCard
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[var(--brand-accent)]"
                        />
                        <div>
                          <EditableText
                            as="span"
                            data-preview-field-path="shippingReturnsPage.methodChargeLabel"
                            defaultValue={methodChargeLabel}
                            fontFamily="body"
                            size="0.625rem"
                            weight={600}
                            transform="uppercase"
                            letterSpacing="0.18em"
                            color="muted"
                            className="block"
                          />
                          <EditableText
                            as="p"
                            data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].charge`}
                            defaultValue={method.charge}
                            fontFamily="body"
                            size="0.875rem"
                            weight={600}
                            lineHeight={1.45}
                            color="heading"
                            className="mt-0.5 mb-0"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                </LuxuryStaggerItem>
              ))}
            </LuxuryStagger>
          )}
        </div>

        <LuxuryReveal delay={0.08} className="mt-6 rounded-xl border border-[var(--loome-border)] border-l-2 border-l-[var(--brand-accent)] bg-[var(--card-bg)] px-5 py-4">
          <EditableText
            as="p"
            data-preview-field-path="shippingReturnsPage.shippingFootnote"
            defaultValue={shippingFootnote}
            fontFamily="body"
            size="0.8125rem"
            lineHeight={1.68}
            color="muted"
            className="m-0"
          />
        </LuxuryReveal>
      </section>

      {/* 4. Interactive Shipping FAQ Accordions */}
      <section
        data-design-section="shipping-faq"
        className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Sticky Editorial Header + Textile Imagery */}
            <LuxuryReveal className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[var(--brand-accent)]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.faqEyebrow"
                  defaultValue={faqEyebrow}
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
                as="h2"
                data-preview-field-path="shippingReturnsPage.faqHeading"
                defaultValue={faqHeading}
                fontFamily="heading"
                size="clamp(1.65rem, 2.6vw, 2.2rem)"
                weight={800}
                lineHeight={1.12}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-2.5 mb-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.faqIntro"
                defaultValue={faqIntro}
                fontFamily="body"
                size="0.9rem"
                lineHeight={1.72}
                color="muted"
                className="mt-3 mb-0"
              />

              <div className="mt-6">
                <LuxuryImageReveal tone="ivory" className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--loome-ivory)]">
                  <img
                    src={withBasePath(faqImageUrl)}
                    alt={faqHeading}
                    loading="lazy"
                    data-preview-field-path="shippingReturnsPage.faqImageUrl"
                    className="h-full w-full object-cover"
                  />
                </LuxuryImageReveal>
                <div className="mt-3 flex items-center gap-2.5">
                  <span aria-hidden="true" className="h-px w-7 bg-[var(--brand-accent)]" />
                  <EditableText
                    as="p"
                    data-preview-field-path="shippingReturnsPage.faqImageCaption"
                    defaultValue={faqImageCaption}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.16em"
                    color="muted"
                    className="m-0"
                  />
                </div>
              </div>
            </LuxuryReveal>

            {/* Right Interactive FAQ Accordions */}
            <div className="lg:col-span-7">
              <div
                data-preview-list-path="shippingReturnsPage.shippingFaqs"
                className="divide-y divide-[var(--loome-border)] rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6"
              >
                {shippingFaqs.length === 0 ? (
                  <p
                    data-preview-static="shipping-faqs-empty"
                    className="py-12 text-center text-sm text-[var(--muted-color)]"
                  >
                    Add shipping FAQs in your Fivora editor.
                  </p>
                ) : (
                  shippingFaqs.map((faq) => {
                    const open = isFaqOpen(faq);
                    const panelId = `shipping-faq-panel-${faq.id}`;
                    const triggerId = `shipping-faq-trigger-${faq.id}`;
                    return (
                      <div
                        key={faq.id}
                        data-preview-item-path={`shippingReturnsPage.shippingFaqs[${faq.index}]`}
                        className="py-5"
                      >
                        <button
                          id={triggerId}
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => toggleFaq(faq)}
                          className="group flex w-full cursor-pointer items-start justify-between gap-4 border-0 bg-transparent p-0 text-left"
                        >
                          <div className="space-y-1">
                            <EditableText
                              as="span"
                              data-preview-field-path={`shippingReturnsPage.shippingFaqs[${faq.index}].tag`}
                              defaultValue={faq.tag}
                              fontFamily="body"
                              size="0.625rem"
                              weight={600}
                              transform="uppercase"
                              letterSpacing="0.22em"
                              color="primary"
                              className="inline-block"
                            />
                            <EditableText
                              as="h3"
                              data-preview-field-path={`shippingReturnsPage.shippingFaqs[${faq.index}].question`}
                              defaultValue={faq.question}
                              fontFamily="heading"
                              size="1.1rem"
                              weight={700}
                              lineHeight={1.3}
                              color="heading"
                              className="m-0 transition-colors group-hover:text-[var(--brand-accent)]"
                            />
                          </div>

                          <span
                            aria-hidden="true"
                            className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--loome-border)] text-[var(--heading-color)] transition-all duration-300 motion-reduce:transition-none group-hover:border-[var(--brand-accent)] ${
                              open
                                ? 'rotate-180 bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                                : ''
                            }`}
                          >
                            <ChevronDown className="h-4 w-4 stroke-[1.6]" />
                          </span>
                        </button>

                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={triggerId}
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <EditableText
                              as="p"
                              data-preview-field-path={`shippingReturnsPage.shippingFaqs[${faq.index}].answer`}
                              defaultValue={faq.answer}
                              fontFamily="body"
                              size="0.9rem"
                              lineHeight={1.74}
                              color="muted"
                              className="mt-3 mb-0 max-w-2xl pb-1"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Returns & Exchanges Policy */}
      <section
        data-design-section="shipping-returns-policy"
        className="loome-surface-ivory w-full border-t border-[var(--loome-border)] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <LuxuryReveal className="flex flex-col justify-between gap-4 border-b border-[var(--loome-border)] pb-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[var(--brand-accent)]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.returnsEyebrow"
                  defaultValue={returnsEyebrow}
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
                as="h2"
                data-preview-field-path="shippingReturnsPage.returnsHeading"
                defaultValue={returnsHeading}
                fontFamily="heading"
                size="clamp(1.65rem, 2.6vw, 2.2rem)"
                weight={800}
                lineHeight={1.12}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-2.5 mb-0"
              />
            </div>

            <div className="max-w-md lg:text-right">
              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.returnsIntro"
                defaultValue={returnsIntro}
                fontFamily="body"
                size="0.9rem"
                lineHeight={1.7}
                color="muted"
                className="m-0"
              />
            </div>
          </LuxuryReveal>

          <div data-preview-list-path="shippingReturnsPage.returnPillars" className="mt-8">
            {returnPillars.length > 0 && (
              <LuxuryStagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
                {returnPillars.map((pillar) => (
                  <LuxuryStaggerItem key={pillar.id}>
                    <article
                      data-preview-item-path={`shippingReturnsPage.returnPillars[${pillar.index}]`}
                      className="flex h-full flex-col rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-6 shadow-[0_3px_14px_rgba(73,56,44,0.04)] dark:shadow-none sm:p-7"
                    >
                      <EditableText
                        as="span"
                        data-preview-field-path={`shippingReturnsPage.returnPillars[${pillar.index}].step`}
                        defaultValue={pillar.step}
                        fontFamily="body"
                        size="0.65625rem"
                        weight={600}
                        transform="uppercase"
                        letterSpacing="0.22em"
                        color="primary"
                        className="inline-block"
                      />

                      <EditableText
                        as="h3"
                        data-preview-field-path={`shippingReturnsPage.returnPillars[${pillar.index}].title`}
                        defaultValue={pillar.title}
                        fontFamily="heading"
                        size="1.2rem"
                        weight={700}
                        lineHeight={1.25}
                        color="heading"
                        className="mt-2.5 mb-0"
                      />

                      <div className="my-3.5 h-px w-10 bg-[var(--brand-accent)]/70" aria-hidden="true" />

                      <EditableText
                        as="p"
                        data-preview-field-path={`shippingReturnsPage.returnPillars[${pillar.index}].description`}
                        defaultValue={pillar.description}
                        fontFamily="body"
                        size="0.875rem"
                        lineHeight={1.72}
                        color="muted"
                        className="m-0"
                      />
                    </article>
                  </LuxuryStaggerItem>
                ))}
              </LuxuryStagger>
            )}
          </div>
        </div>
      </section>

      {/* 6. Damaged or Incorrect Items Guidance */}
      <section
        data-design-section="shipping-damaged-items"
        className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <LuxuryReveal className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[var(--brand-accent)]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.damagedEyebrow"
                  defaultValue={damagedEyebrow}
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
                as="h2"
                data-preview-field-path="shippingReturnsPage.damagedHeading"
                defaultValue={damagedHeading}
                fontFamily="heading"
                size="clamp(1.65rem, 2.6vw, 2.2rem)"
                weight={800}
                lineHeight={1.12}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-2.5 mb-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.damagedIntro"
                defaultValue={damagedIntro}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.72}
                color="muted"
                className="mt-3.5 mb-0 max-w-2xl"
              />

              <div
                data-preview-list-path="shippingReturnsPage.damagedSteps"
                className="mt-7 space-y-3.5"
              >
                {damagedSteps.map((step) => (
                  <div
                    key={step.id}
                    data-preview-item-path={`shippingReturnsPage.damagedSteps[${step.index}]`}
                    className="flex items-start gap-4 rounded-xl border border-[var(--loome-border)] border-l-2 border-l-[var(--brand-accent)] bg-[var(--card-bg)] p-5"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--loome-ivory)] text-[var(--brand-accent)]"
                    >
                      <PackageCheck className="h-4 w-4 stroke-[1.6]" />
                    </span>
                    <div>
                      <EditableText
                        as="span"
                        data-preview-field-path={`shippingReturnsPage.damagedSteps[${step.index}].stepLabel`}
                        defaultValue={step.stepLabel}
                        fontFamily="body"
                        size="0.625rem"
                        weight={600}
                        transform="uppercase"
                        letterSpacing="0.22em"
                        color="primary"
                        className="inline-block"
                      />
                      <EditableText
                        as="h3"
                        data-preview-field-path={`shippingReturnsPage.damagedSteps[${step.index}].title`}
                        defaultValue={step.title}
                        fontFamily="heading"
                        size="1.1rem"
                        weight={700}
                        lineHeight={1.25}
                        color="heading"
                        className="mt-1 mb-0"
                      />
                      <EditableText
                        as="p"
                        data-preview-field-path={`shippingReturnsPage.damagedSteps[${step.index}].description`}
                        defaultValue={step.description}
                        fontFamily="body"
                        size="0.8625rem"
                        lineHeight={1.68}
                        color="muted"
                        className="mt-1 mb-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </LuxuryReveal>

            <div className="lg:col-span-5">
              <LuxuryImageReveal tone="beige" className="aspect-[4/4] w-full overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--loome-ivory)]">
                <img
                  src={withBasePath(damagedImageUrl)}
                  alt={damagedHeading}
                  loading="lazy"
                  data-preview-field-path="shippingReturnsPage.damagedImageUrl"
                  className="h-full w-full object-cover"
                />
              </LuxuryImageReveal>
              <div className="mt-3 flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-8 bg-[var(--brand-accent)]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.damagedImageCaption"
                  defaultValue={damagedImageCaption}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.18em"
                  color="muted"
                  className="m-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Full-Width Editorial Textile CTA Section with WhatsApp Concierge */}
      <section
        data-design-section="shipping-whatsapp-cta"
        className="loome-surface-espresso relative overflow-hidden bg-[#2D2722] text-[#F7F4EF]"
      >
        <div className="absolute inset-0 h-full w-full">
          <img
            src={withBasePath(ctaImageUrl)}
            alt={ctaHeading}
            loading="lazy"
            data-preview-field-path="shippingReturnsPage.ctaImageUrl"
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-[#2D2722]/74" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-14 sm:px-8 lg:px-10 lg:py-16">
          <LuxuryReveal className="max-w-2xl">
            <div className="flex items-center gap-3">
              <LuxuryHairline className="h-px w-8 bg-[#C7A684]" />
              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.ctaEyebrow"
                defaultValue={ctaEyebrow}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.24em"
                color="#C7A684"
                className="m-0"
              />
            </div>

            <EditableText
              as="h2"
              data-preview-field-path="shippingReturnsPage.ctaHeading"
              defaultValue={ctaHeading}
              fontFamily="heading"
              size="clamp(1.85rem, 3vw, 2.55rem)"
              weight={800}
              lineHeight={1.1}
              letterSpacing="-0.025em"
              color="#F7F4EF"
              className="mt-3 mb-0"
            />

            <EditableText
              as="p"
              data-preview-field-path="shippingReturnsPage.ctaDescription"
              defaultValue={ctaDescription}
              fontFamily="body"
              size="0.9375rem"
              lineHeight={1.74}
              color="rgba(247, 244, 239, 0.9)"
              className="mt-3.5 mb-0 max-w-xl"
            />

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="group loome-btn-ivory h-12 cursor-pointer px-7"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                <EditableText
                  as="span"
                  data-preview-field-path="shippingReturnsPage.ctaButtonLabel"
                  defaultValue={ctaButtonLabel}
                  fontFamily="body"
                  size="0.75rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.16em"
                  color="inherit"
                  className="inline"
                />
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              {hasContactPage ? (
                <button
                  type="button"
                  onClick={() => window.location.assign(withBasePath('/contact/'))}
                  data-target-page="contact"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[11px] border border-[#F7F4EF]/50 bg-[#2D2722]/40 px-6 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#F7F4EF] backdrop-blur-sm transition-all duration-300 hover:border-[#F7F4EF] hover:bg-[#F7F4EF]/16"
                >
                  <EditableText
                    as="span"
                    data-preview-field-path="shippingReturnsPage.ctaSecondaryLabel"
                    defaultValue={ctaSecondaryLabel}
                    fontFamily="body"
                    size="0.71875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.16em"
                    color="inherit"
                    className="inline"
                  />
                </button>
              ) : (
                <span
                  data-target-page="contact"
                  data-preview-field-path="shippingReturnsPage.ctaSecondaryLabel"
                  className="unavailable inline-flex h-12 items-center rounded-[11px] border border-[#F7F4EF]/30 px-6 text-[11.5px] uppercase tracking-[0.16em] text-[#F7F4EF]"
                >
                  {ctaSecondaryLabel}
                </span>
              )}
            </div>

            {whatsappFallbackNotice && (
              <div
                role="status"
                aria-live="polite"
                className="mt-5 inline-flex items-start gap-2.5 border border-[#C8A98B]/45 bg-[#2A2320]/80 px-4 py-3 text-xs text-[#F2E9DE]"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A98B]" />
                <span>{whatsappFallbackNotice}</span>
              </div>
            )}
          </LuxuryReveal>
        </div>
      </section>
    </div>
  );
}
