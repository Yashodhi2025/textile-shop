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
      className="loome-surface-cream min-h-[75vh] w-full bg-[#F2E9DE] text-[#201C1A]"
    >
      {/* Editorial Breadcrumb Strip */}
      <div className="border-b border-[#201C1A]/8 bg-[#FAF5EE]/95 dark:border-[#F2E9DE]/10 dark:bg-[#201C1A]">
        <nav className="mx-auto flex max-w-[1380px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6] sm:px-8 lg:px-14">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] transition-colors hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" className="text-[#C8A98B]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.shipping_returns"
            className="font-medium text-[#201C1A] dark:text-[#F2E9DE]"
          >
            {shippingNavLabel}
          </span>
        </nav>
      </div>

      {/* 1. Editorial Hero */}
      <section
        data-design-section="shipping-hero"
        className="border-b border-[#201C1A]/8 bg-gradient-to-b from-[#E6D9C9]/90 via-[#F2E9DE] to-[#F2E9DE] dark:border-[#F2E9DE]/10 dark:from-[#2B2320] dark:via-[#201C1A] dark:to-[#201C1A]"
      >
        <div className="mx-auto max-w-[1380px] px-4 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
            <LuxuryReveal className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-9 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.eyebrow"
                  defaultValue={eyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.28em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h1"
                data-preview-field-path="shippingReturnsPage.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(2.65rem, 5vw, 4.35rem)"
                weight={300}
                lineHeight={1.04}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-4 mb-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.975rem"
                lineHeight={1.82}
                color="muted"
                className="mt-5 mb-0 max-w-2xl"
              />
            </LuxuryReveal>

            {/* Merchant Policy Notice Card */}
            <LuxuryReveal delay={0.1} className="lg:col-span-5">
              <div className="border border-[#C8A98B]/35 bg-[#FAF5EE]/95 p-6 shadow-[0_14px_38px_rgba(38,41,35,0.04)] dark:border-[#C8A98B]/30 dark:bg-[#3B302B]/90 sm:p-7">
                <div className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[#C8A98B]/40 bg-[#E6D9C9]/75 text-[#8D7667] dark:bg-[#201C1A] dark:text-[#C8A98B]"
                  >
                    <ShieldCheck className="h-4 w-4 stroke-[1.6]" />
                  </span>
                  <div>
                    <EditableText
                      as="h2"
                      data-preview-field-path="shippingReturnsPage.policyNoticeHeading"
                      defaultValue={policyNoticeHeading}
                      fontFamily="heading"
                      size="1.25rem"
                      weight={500}
                      lineHeight={1.25}
                      color="heading"
                      className="m-0"
                    />
                    <EditableText
                      as="p"
                      data-preview-field-path="shippingReturnsPage.policyNoticeBody"
                      defaultValue={policyNoticeBody}
                      fontFamily="body"
                      size="0.8125rem"
                      lineHeight={1.72}
                      color="muted"
                      className="mt-2 mb-0"
                    />
                  </div>
                </div>
              </div>
            </LuxuryReveal>
          </div>

          {/* 2. Three Refined Overview Cards: Delivery, Returns, Order Assistance */}
          <div data-preview-list-path="shippingReturnsPage.highlights" className="mt-12 lg:mt-14">
            {highlights.length > 0 && (
              <LuxuryStagger className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                {highlights.map((card) => (
                  <LuxuryStaggerItem key={card.id}>
                    <article
                      data-preview-item-path={`shippingReturnsPage.highlights[${card.index}]`}
                      className="flex h-full flex-col rounded-2xl border border-[#3B302B]/14 border-t-2 border-t-[#C8A98B] bg-[#FAF5EE] p-7 shadow-[0_12px_34px_rgba(32,28,26,0.04)] transition-all duration-300 hover:border-[#C8A98B] hover:shadow-[0_16px_42px_rgba(32,28,26,0.07)]"
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
                          letterSpacing="0.24em"
                          color="primary"
                          className="inline"
                        />
                        <span className="flex h-8 w-8 items-center justify-center border border-[#201C1A]/10 bg-[#F2E9DE] text-[#8D7667] dark:border-[#F2E9DE]/12 dark:bg-[#201C1A] dark:text-[#C8A98B]">
                          {renderHighlightIcon(card.id, card.index)}
                        </span>
                      </div>

                      <EditableText
                        as="h3"
                        data-preview-field-path={`shippingReturnsPage.highlights[${card.index}].title`}
                        defaultValue={card.title}
                        fontFamily="heading"
                        size="1.55rem"
                        weight={400}
                        lineHeight={1.2}
                        color="heading"
                        className="mt-4 mb-0"
                      />

                      <EditableText
                        as="p"
                        data-preview-field-path={`shippingReturnsPage.highlights[${card.index}].description`}
                        defaultValue={card.description}
                        fontFamily="body"
                        size="0.875rem"
                        lineHeight={1.76}
                        color="muted"
                        className="mt-3 mb-0"
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
        className="mx-auto max-w-[1380px] px-4 py-16 sm:px-8 sm:py-20 lg:px-14 lg:py-24"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-5 border-b border-[#201C1A]/10 pb-8 dark:border-[#F2E9DE]/10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <LuxuryHairline className="h-px w-8 bg-[#C8A98B]" />
              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.shippingEyebrow"
                defaultValue={shippingEyebrow}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.26em"
                color="primary"
                className="m-0"
              />
            </div>
            <EditableText
              as="h2"
              data-preview-field-path="shippingReturnsPage.shippingHeading"
              defaultValue={shippingHeading}
              fontFamily="heading"
              size="clamp(2.15rem, 3.6vw, 3.2rem)"
              weight={300}
              lineHeight={1.08}
              letterSpacing="-0.015em"
              color="heading"
              className="mt-3 mb-0"
            />
          </div>

          <div className="max-w-md lg:text-right">
            <EditableText
              as="p"
              data-preview-field-path="shippingReturnsPage.shippingIntro"
              defaultValue={shippingIntro}
              fontFamily="body"
              size="0.9125rem"
              lineHeight={1.78}
              color="muted"
              className="m-0"
            />
          </div>
        </LuxuryReveal>

        <div data-preview-list-path="shippingReturnsPage.deliveryMethods" className="mt-10">
          {deliveryMethods.length === 0 ? (
            <div className="border border-dashed border-[#201C1A]/20 px-6 py-14 text-center dark:border-[#F2E9DE]/20">
              <p
                data-preview-static="shipping-methods-empty"
                className="m-0 text-sm text-[#65685E] dark:text-[#C7B6A6]"
              >
                Add delivery methods in your Fivora editor to display shipping timelines and charges.
              </p>
              {/* Keep shared column labels mounted in empty-state */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[10.5px] uppercase tracking-[0.2em] text-[#8D7667] dark:text-[#C8A98B]">
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
            <LuxuryStagger className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {deliveryMethods.map((method) => (
                <LuxuryStaggerItem key={method.id}>
                  <article
                    data-preview-item-path={`shippingReturnsPage.deliveryMethods[${method.index}]`}
                    className="flex h-full flex-col justify-between border border-[#201C1A]/10 bg-[#FAF5EE] p-7 shadow-[0_14px_40px_rgba(38,41,35,0.035)] dark:border-[#F2E9DE]/12 dark:bg-[#3B302B]"
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
                        letterSpacing="0.24em"
                        color="primary"
                        className="m-0"
                      />

                      <EditableText
                        as="h3"
                        data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].name`}
                        defaultValue={method.name}
                        fontFamily="heading"
                        size="1.65rem"
                        weight={400}
                        lineHeight={1.18}
                        color="heading"
                        className="mt-2.5 mb-0"
                      />

                      <EditableText
                        as="p"
                        data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].details`}
                        defaultValue={method.details}
                        fontFamily="body"
                        size="0.8625rem"
                        lineHeight={1.76}
                        color="muted"
                        className="mt-3.5 mb-0"
                      />
                    </div>

                    <div className="mt-7 space-y-4 border-t border-[#201C1A]/10 pt-5 dark:border-[#F2E9DE]/10">
                      <div className="flex items-start gap-2.5">
                        <Clock
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#C8A98B]"
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
                            letterSpacing="0.2em"
                            color="muted"
                            className="block"
                          />
                          <EditableText
                            as="p"
                            data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].timeline`}
                            defaultValue={method.timeline}
                            fontFamily="body"
                            size="0.875rem"
                            weight={500}
                            lineHeight={1.5}
                            color="heading"
                            className="mt-1 mb-0"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <CreditCard
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#C8A98B]"
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
                            letterSpacing="0.2em"
                            color="muted"
                            className="block"
                          />
                          <EditableText
                            as="p"
                            data-preview-field-path={`shippingReturnsPage.deliveryMethods[${method.index}].charge`}
                            defaultValue={method.charge}
                            fontFamily="body"
                            size="0.875rem"
                            weight={500}
                            lineHeight={1.5}
                            color="heading"
                            className="mt-1 mb-0"
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

        <LuxuryReveal delay={0.08} className="mt-8 border-l-2 border-l-[#C8A98B] bg-[#FAF5EE] px-5 py-4 dark:bg-[#1D201A]">
          <EditableText
            as="p"
            data-preview-field-path="shippingReturnsPage.shippingFootnote"
            defaultValue={shippingFootnote}
            fontFamily="body"
            size="0.8125rem"
            lineHeight={1.72}
            color="muted"
            className="m-0"
          />
        </LuxuryReveal>
      </section>

      {/* 4. Interactive Shipping FAQ Accordions */}
      <section
        data-design-section="shipping-faq"
        className="border-t border-[#201C1A]/8 bg-[#FAF5EE] py-16 dark:border-[#F2E9DE]/10 dark:bg-[#191C17] sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1380px] px-4 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Sticky Editorial Header + Textile Imagery */}
            <LuxuryReveal className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.faqEyebrow"
                  defaultValue={faqEyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.26em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h2"
                data-preview-field-path="shippingReturnsPage.faqHeading"
                defaultValue={faqHeading}
                fontFamily="heading"
                size="clamp(2.1rem, 3.3vw, 2.95rem)"
                weight={300}
                lineHeight={1.08}
                letterSpacing="-0.015em"
                color="heading"
                className="mt-3 mb-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.faqIntro"
                defaultValue={faqIntro}
                fontFamily="body"
                size="0.9125rem"
                lineHeight={1.8}
                color="muted"
                className="mt-4 mb-0"
              />

              <div className="mt-8">
                <LuxuryImageReveal tone="ivory" className="aspect-[4/3] w-full bg-[#E6D9C9]/60">
                  <img
                    src={withBasePath(faqImageUrl)}
                    alt={faqHeading}
                    loading="lazy"
                    data-preview-field-path="shippingReturnsPage.faqImageUrl"
                    className="h-full w-full object-cover"
                  />
                </LuxuryImageReveal>
                <div className="mt-3 flex items-center gap-2.5">
                  <span aria-hidden="true" className="h-px w-7 bg-[#C8A98B]" />
                  <EditableText
                    as="p"
                    data-preview-field-path="shippingReturnsPage.faqImageCaption"
                    defaultValue={faqImageCaption}
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
            </LuxuryReveal>

            {/* Right Interactive FAQ Accordions */}
            <div className="lg:col-span-7">
              <div
                data-preview-list-path="shippingReturnsPage.shippingFaqs"
                className="divide-y divide-[#201C1A]/12 border-y border-[#201C1A]/12 dark:divide-[#F2E9DE]/12 dark:border-[#F2E9DE]/12"
              >
                {shippingFaqs.length === 0 ? (
                  <p
                    data-preview-static="shipping-faqs-empty"
                    className="py-12 text-center text-sm text-[#65685E] dark:text-[#C7B6A6]"
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
                        className="py-5 sm:py-6"
                      >
                        <button
                          id={triggerId}
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => toggleFaq(faq)}
                          className="group flex w-full cursor-pointer items-start justify-between gap-4 border-0 bg-transparent p-0 text-left"
                        >
                          <div className="space-y-1.5">
                            <EditableText
                              as="span"
                              data-preview-field-path={`shippingReturnsPage.shippingFaqs[${faq.index}].tag`}
                              defaultValue={faq.tag}
                              fontFamily="body"
                              size="0.625rem"
                              weight={600}
                              transform="uppercase"
                              letterSpacing="0.24em"
                              color="primary"
                              className="inline-block"
                            />
                            <EditableText
                              as="h3"
                              data-preview-field-path={`shippingReturnsPage.shippingFaqs[${faq.index}].question`}
                              defaultValue={faq.question}
                              fontFamily="heading"
                              size="clamp(1.28rem, 2vw, 1.6rem)"
                              weight={400}
                              lineHeight={1.25}
                              color="heading"
                              className="m-0 transition-colors group-hover:text-[#8D7667] dark:group-hover:text-[#C8A98B]"
                            />
                          </div>

                          <span
                            aria-hidden="true"
                            className={`mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#201C1A]/15 text-[#201C1A] transition-all duration-300 motion-reduce:transition-none group-hover:border-[#C8A98B] dark:border-[#F2E9DE]/18 dark:text-[#F2E9DE] ${
                              open
                                ? 'rotate-180 bg-[#201C1A] text-[#F2E9DE] dark:bg-[#C8A98B] dark:text-[#201C1A]'
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
                              size="0.9375rem"
                              lineHeight={1.82}
                              color="muted"
                              className="mt-4 mb-0 max-w-2xl pb-1"
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
        className="border-t border-[#201C1A]/8 bg-[#E6D9C9]/68 py-16 dark:border-[#F2E9DE]/10 dark:bg-[#1C1F19] sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1380px] px-4 sm:px-8 lg:px-14">
          <LuxuryReveal className="flex flex-col justify-between gap-5 border-b border-[#201C1A]/12 pb-8 dark:border-[#F2E9DE]/12 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.returnsEyebrow"
                  defaultValue={returnsEyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.26em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h2"
                data-preview-field-path="shippingReturnsPage.returnsHeading"
                defaultValue={returnsHeading}
                fontFamily="heading"
                size="clamp(2.15rem, 3.6vw, 3.25rem)"
                weight={300}
                lineHeight={1.08}
                letterSpacing="-0.015em"
                color="heading"
                className="mt-3 mb-0"
              />
            </div>

            <div className="max-w-md lg:text-right">
              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.returnsIntro"
                defaultValue={returnsIntro}
                fontFamily="body"
                size="0.9125rem"
                lineHeight={1.78}
                color="muted"
                className="m-0"
              />
            </div>
          </LuxuryReveal>

          <div data-preview-list-path="shippingReturnsPage.returnPillars" className="mt-10">
            {returnPillars.length > 0 && (
              <LuxuryStagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                {returnPillars.map((pillar) => (
                  <LuxuryStaggerItem key={pillar.id}>
                    <article
                      data-preview-item-path={`shippingReturnsPage.returnPillars[${pillar.index}]`}
                      className="flex h-full flex-col border border-[#201C1A]/10 bg-[#FAF5EE] p-7 shadow-[0_14px_38px_rgba(38,41,35,0.03)] dark:border-[#F2E9DE]/12 dark:bg-[#3B302B] sm:p-8"
                    >
                      <EditableText
                        as="span"
                        data-preview-field-path={`shippingReturnsPage.returnPillars[${pillar.index}].step`}
                        defaultValue={pillar.step}
                        fontFamily="body"
                        size="0.65625rem"
                        weight={600}
                        transform="uppercase"
                        letterSpacing="0.24em"
                        color="primary"
                        className="inline-block"
                      />

                      <EditableText
                        as="h3"
                        data-preview-field-path={`shippingReturnsPage.returnPillars[${pillar.index}].title`}
                        defaultValue={pillar.title}
                        fontFamily="heading"
                        size="1.65rem"
                        weight={400}
                        lineHeight={1.2}
                        color="heading"
                        className="mt-3 mb-0"
                      />

                      <div className="my-4 h-px w-10 bg-[#C8A98B]/70" aria-hidden="true" />

                      <EditableText
                        as="p"
                        data-preview-field-path={`shippingReturnsPage.returnPillars[${pillar.index}].description`}
                        defaultValue={pillar.description}
                        fontFamily="body"
                        size="0.9rem"
                        lineHeight={1.8}
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
        className="border-t border-[#201C1A]/8 bg-[#F2E9DE] py-16 dark:border-[#F2E9DE]/10 dark:bg-[#201C1A] sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1380px] px-4 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <LuxuryReveal className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.damagedEyebrow"
                  defaultValue={damagedEyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.26em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h2"
                data-preview-field-path="shippingReturnsPage.damagedHeading"
                defaultValue={damagedHeading}
                fontFamily="heading"
                size="clamp(2.15rem, 3.6vw, 3.15rem)"
                weight={300}
                lineHeight={1.08}
                letterSpacing="-0.015em"
                color="heading"
                className="mt-3 mb-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.damagedIntro"
                defaultValue={damagedIntro}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.82}
                color="muted"
                className="mt-4 mb-0 max-w-2xl"
              />

              <div
                data-preview-list-path="shippingReturnsPage.damagedSteps"
                className="mt-8 space-y-4"
              >
                {damagedSteps.map((step) => (
                  <div
                    key={step.id}
                    data-preview-item-path={`shippingReturnsPage.damagedSteps[${step.index}]`}
                    className="flex items-start gap-4 border border-[#201C1A]/10 border-l-2 border-l-[#C8A98B] bg-[#FAF5EE] p-5 dark:border-[#F2E9DE]/12 dark:border-l-[#C8A98B] dark:bg-[#3B302B]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-[#E6D9C9] text-[#8D7667] dark:bg-[#201C1A] dark:text-[#C8A98B]"
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
                        letterSpacing="0.24em"
                        color="primary"
                        className="inline-block"
                      />
                      <EditableText
                        as="h3"
                        data-preview-field-path={`shippingReturnsPage.damagedSteps[${step.index}].title`}
                        defaultValue={step.title}
                        fontFamily="heading"
                        size="1.35rem"
                        weight={400}
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
                        lineHeight={1.74}
                        color="muted"
                        className="mt-1.5 mb-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </LuxuryReveal>

            <div className="lg:col-span-5">
              <LuxuryImageReveal tone="beige" className="aspect-[4/5] w-full bg-[#E6D9C9]/60">
                <img
                  src={withBasePath(damagedImageUrl)}
                  alt={damagedHeading}
                  loading="lazy"
                  data-preview-field-path="shippingReturnsPage.damagedImageUrl"
                  className="h-full w-full object-cover"
                />
              </LuxuryImageReveal>
              <div className="mt-3.5 flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-8 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="shippingReturnsPage.damagedImageCaption"
                  defaultValue={damagedImageCaption}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
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
        className="relative overflow-hidden bg-[#201C1A] text-[#F2E9DE]"
      >
        <div className="absolute inset-0 h-full w-full">
          <img
            src={withBasePath(ctaImageUrl)}
            alt={ctaHeading}
            loading="lazy"
            data-preview-field-path="shippingReturnsPage.ctaImageUrl"
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#2A2320]/90 via-[#2A2320]/78 to-[#2A2320]/62" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1380px] px-4 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28">
          <LuxuryReveal className="max-w-2xl">
            <div className="flex items-center gap-3">
              <LuxuryHairline className="h-px w-9 bg-[#C8A98B]" />
              <EditableText
                as="p"
                data-preview-field-path="shippingReturnsPage.ctaEyebrow"
                defaultValue={ctaEyebrow}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.28em"
                color="#C8A98B"
                className="m-0"
              />
            </div>

            <EditableText
              as="h2"
              data-preview-field-path="shippingReturnsPage.ctaHeading"
              defaultValue={ctaHeading}
              fontFamily="heading"
              size="clamp(2.25rem, 4.2vw, 3.65rem)"
              weight={300}
              lineHeight={1.06}
              letterSpacing="-0.02em"
              color="#F2E9DE"
              className="mt-4 mb-0"
            />

            <EditableText
              as="p"
              data-preview-field-path="shippingReturnsPage.ctaDescription"
              defaultValue={ctaDescription}
              fontFamily="body"
              size="0.975rem"
              lineHeight={1.82}
              color="rgba(248, 246, 241, 0.88)"
              className="mt-5 mb-0 max-w-xl"
            />

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="group loome-btn-ivory h-[52px] cursor-pointer px-8"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                <EditableText
                  as="span"
                  data-preview-field-path="shippingReturnsPage.ctaButtonLabel"
                  defaultValue={ctaButtonLabel}
                  fontFamily="body"
                  size="0.75rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              {hasContactPage ? (
                <button
                  type="button"
                  onClick={() => window.location.assign(withBasePath('/contact/'))}
                  data-target-page="contact"
                  className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 border border-[#F2E9DE]/50 bg-[#201C1A]/35 px-7 text-[11.5px] font-medium uppercase tracking-[0.2em] text-[#F2E9DE] backdrop-blur-sm transition-all duration-300 hover:border-[#F2E9DE] hover:bg-[#F2E9DE]/16"
                >
                  <EditableText
                    as="span"
                    data-preview-field-path="shippingReturnsPage.ctaSecondaryLabel"
                    defaultValue={ctaSecondaryLabel}
                    fontFamily="body"
                    size="0.71875rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.2em"
                    color="inherit"
                    className="inline"
                  />
                </button>
              ) : (
                <span
                  data-target-page="contact"
                  data-preview-field-path="shippingReturnsPage.ctaSecondaryLabel"
                  className="unavailable inline-flex h-[52px] items-center border border-[#F2E9DE]/30 px-7 text-[11.5px] uppercase tracking-[0.2em] text-[#F2E9DE]"
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
