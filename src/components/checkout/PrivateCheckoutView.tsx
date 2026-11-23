'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from 'lucide-react';
import { EditableText, useCart } from '@deneb-ui/ui';
import {
  contentObject,
  contentText,
  platformProductDetailHref,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import { formatLoomePrice, normalizeLoomeProduct } from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import {
  LUXURY_EASE,
  LuxuryHairline,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

const FREE_DELIVERY_THRESHOLD = 250;

interface CheckoutFormState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof CheckoutFormState, string>>;

const INITIAL_FORM: CheckoutFormState = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
};

export default function PrivateCheckoutView() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const cart = useCart();
  const prefersReducedMotion = useReducedMotion();

  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const [handoffBlockedNotice, setHandoffBlockedNotice] = useState(false);

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const checkoutPage = contentObject(content.checkoutPage);
  const shopMeta = contentObject((siteData as Record<string, unknown>).shop);
  const merchantMeta = contentObject((siteData as Record<string, unknown>).merchant);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'checkout',
        'about_us',
        'services',
        'contact',
      ];
  const hasShopPage = requiredPages.includes('shop');
  const hasServicesPage = requiredPages.includes('services');
  const hasContactPage = requiredPages.includes('contact');

  const catalogProducts = useMemo(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  // Dynamic merchant identity, currency & WhatsApp resolution (never hardcoded)
  const storeName =
    contentText(common.websiteTitle) ||
    contentText(shopMeta.businessName) ||
    contentText(merchantMeta.businessName) ||
    'LOOMÉ';

  const storeCurrency =
    contentText(shopMeta.currency) ||
    contentText(common.currency) ||
    contentText(merchantMeta.currency) ||
    catalogProducts[0]?.currency ||
    'USD';

  const rawWhatsappNumber =
    contentText(contact.whatsapp) ||
    contentText(common.whatsapp) ||
    contentText(common.whatsappNumber) ||
    contentText(shopMeta.businessWhatsapp) ||
    contentText(shopMeta.whatsapp) ||
    contentText(contact.phone) ||
    contentText(common.contactNumber);

  const cleanWhatsappDigits = rawWhatsappNumber.replace(/[^\d]/g, '');
  const hasConfiguredWhatsapp = cleanWhatsappDigits.length >= 7;

  // Editable page copy
  const eyebrow = contentText(checkoutPage.eyebrow) || 'THE PRIVATE CHECKOUT';
  const heading = contentText(checkoutPage.heading) || 'Complete Your Atelier Order';
  const intro =
    contentText(checkoutPage.intro) ||
    'Review your curated textile pieces and share your delivery details below to send your order directly to our concierge via WhatsApp.';
  const deliveryNote =
    contentText(checkoutPage.deliveryNote) ||
    'Complimentary white-glove delivery on qualifying orders. Availability, bespoke sizing, shipping, and payment are confirmed personally with our atelier concierge via WhatsApp.';
  const submitLabel = contentText(checkoutPage.submitLabel) || 'Place Order via WhatsApp';
  const emptyHeading =
    contentText(checkoutPage.emptyHeading) || 'Your atelier bag is currently empty';
  const emptyDescription =
    contentText(checkoutPage.emptyDescription) ||
    'Explore our Belgian flax drapery, stonewashed linen bedding, and heirloom fabrics to begin curating your order.';

  const hasItems = cart.items.length > 0;
  const hasInquiryOnlyItem = cart.items.some((item) => item.showPrice === false);
  const deliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - cart.subtotal);
  const deliveryProgress = Math.min(
    100,
    Math.round((cart.subtotal / FREE_DELIVERY_THRESHOLD) * 100),
  );

  const updateField = (field: keyof CheckoutFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (handoffUrl) {
      setHandoffUrl(null);
      setHandoffBlockedNotice(false);
    }
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.';
    }
    const phoneDigits = form.phone.replace(/[^\d]/g, '');
    if (phoneDigits.length < 7) {
      nextErrors.phone = 'Please enter a valid contact phone number.';
    }
    if (form.email.trim()) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
      if (!emailOk) {
        nextErrors.email = 'Please enter a valid email address or leave this field blank.';
      }
    }
    if (form.address.trim().length < 5) {
      nextErrors.address = 'Please enter your street address for delivery.';
    }
    if (form.city.trim().length < 2) {
      nextErrors.city = 'Please enter your city.';
    }
    return nextErrors;
  };

  const buildWhatsAppMessage = (): string => {
    const lines: string[] = [
      `*${storeName} — Private Order Request*`,
      '',
      '*Client Details*',
      `Name: ${form.fullName.trim()}`,
      `Phone: ${form.phone.trim()}`,
    ];

    if (form.email.trim()) {
      lines.push(`Email: ${form.email.trim()}`);
    }

    lines.push(
      '',
      '*Delivery Destination*',
      `Address: ${form.address.trim()}`,
      `City: ${form.city.trim()}${form.postalCode.trim() ? `, ${form.postalCode.trim()}` : ''}`,
      '',
      `*Curated Pieces (${cart.totalCount} ${cart.totalCount === 1 ? 'item' : 'items'})*`,
    );

    cart.items.forEach((item, index) => {
      const variants = [
        item.color ? `Tone: ${item.color}` : null,
        item.size ? `Size: ${item.size}` : null,
      ]
        .filter(Boolean)
        .join(' · ');

      const priceDisplay =
        item.showPrice === false
          ? 'Price Upon Inquiry'
          : `${formatLoomePrice(item.price, storeCurrency)} × ${item.quantity} = ${formatLoomePrice(item.price * item.quantity, storeCurrency)}`;

      lines.push(
        `${index + 1}. ${item.name}${variants ? ` (${variants})` : ''} — Qty: ${item.quantity} · ${priceDisplay}`,
      );
    });

    lines.push('');
    lines.push(
      `Estimated Subtotal: ${formatLoomePrice(cart.subtotal, storeCurrency)}${hasInquiryOnlyItem ? ' (plus inquiry items)' : ''}`,
    );
    lines.push(
      deliveryRemaining === 0
        ? `Delivery: Eligible for complimentary white-glove delivery (${formatLoomePrice(FREE_DELIVERY_THRESHOLD, storeCurrency)}+ threshold)`
        : 'Delivery: To be confirmed with atelier concierge',
    );

    if (form.notes.trim()) {
      lines.push('', '*Special Instructions*', form.notes.trim());
    }

    lines.push(
      '',
      'Please confirm availability, delivery schedule, and payment instructions.',
    );

    return lines.join('\n');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasItems || !hasConfiguredWhatsapp) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(`checkout-${firstErrorKey}`);
      el?.focus();
      return;
    }

    const encodedMessage = encodeURIComponent(buildWhatsAppMessage());
    const url = `https://wa.me/${cleanWhatsappDigits}?text=${encodedMessage}`;
    setHandoffUrl(url);

    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    setHandoffBlockedNotice(!opened);
  };

  const renderOrderItemsList = (compact = false) => (
    <ul className="m-0 list-none divide-y divide-[#262923]/10 p-0 dark:divide-[#F8F6F1]/10">
      <AnimatePresence initial={false}>
        {cart.items.map((item) => {
          const itemKey = `${item.id}-${item.color || ''}-${item.size || ''}`;
          const detailHref = platformProductDetailHref(item.id);
          return (
            <motion.li
              key={itemKey}
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: LUXURY_EASE }}
              className={`flex gap-4 ${compact ? 'py-4' : 'py-5'}`}
            >
              <a
                href={detailHref}
                className="h-24 w-20 shrink-0 overflow-hidden bg-[#E8E0D5]/55 dark:bg-[#20231D]"
              >
                <img
                  src={withBasePath(item.image || '/images/prod-curtain-ivory.jpg')}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-luxury hover:scale-105"
                />
              </a>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={detailHref}
                      className="font-serif text-lg leading-snug text-[#262923] no-underline transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
                    >
                      {item.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => cart.removeItem(item.id, item.size, item.color)}
                      aria-label={`Remove ${item.name} from bag`}
                      className="shrink-0 p-1 text-[#65685E] transition-colors hover:text-[#262923] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
                    >
                      <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                    </button>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#65685E] dark:text-[#B6B8AE]">
                    {item.color && (
                      <span className="uppercase tracking-[0.15em] text-[#747B65] dark:text-[#B59B79]">
                        Tone: {item.color}
                      </span>
                    )}
                    {item.size && <span>Size: {item.size}</span>}
                  </div>

                  {item.showPrice !== false && (
                    <p className="mt-1 mb-0 text-[11px] text-[#65685E] dark:text-[#B6B8AE]">
                      {formatLoomePrice(item.price, storeCurrency)} each
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center border border-[#262923]/18 bg-[#F8F6F1] dark:border-[#F8F6F1]/20 dark:bg-[#171915]">
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(item.id, item.quantity - 1, item.size, item.color)
                      }
                      aria-label={`Decrease quantity for ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center text-[#262923] transition-colors hover:bg-[#262923]/6 dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/10"
                    >
                      <Minus className="h-3 w-3 stroke-[1.6]" />
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={prefersReducedMotion ? false : { scale: 0.85, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-7 text-center text-xs font-medium tabular-nums"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(item.id, item.quantity + 1, item.size, item.color)
                      }
                      aria-label={`Increase quantity for ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center text-[#262923] transition-colors hover:bg-[#262923]/6 dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/10"
                    >
                      <Plus className="h-3 w-3 stroke-[1.6]" />
                    </button>
                  </div>

                  <span className="text-sm font-medium tabular-nums text-[#262923] dark:text-[#F8F6F1]">
                    {item.showPrice === false
                      ? 'Upon Inquiry'
                      : formatLoomePrice(item.price * item.quantity, storeCurrency)}
                  </span>
                </div>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );

  const renderTotalsBlock = () => (
    <div className="border-t border-[#262923]/10 pt-5 dark:border-[#F8F6F1]/12">
      {/* White-Glove Delivery Progress */}
      <div className="mb-5 border border-[#262923]/8 bg-[#F8F6F1]/80 p-3.5 dark:border-[#F8F6F1]/10 dark:bg-[#171915]/70">
        <div className="flex items-center justify-between text-[11px] tracking-wide text-[#595C52] dark:text-[#C8CAC1]">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 stroke-[1.5] text-[#747B65] dark:text-[#B59B79]" />
            {deliveryRemaining === 0
              ? 'Complimentary white-glove delivery unlocked'
              : `Add ${formatLoomePrice(deliveryRemaining, storeCurrency)} for complimentary delivery`}
          </span>
          <span className="font-medium tabular-nums">{deliveryProgress}%</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden bg-[#E8E0D5] dark:bg-[#2A2D26]">
          <motion.div
            initial={false}
            animate={{ width: `${deliveryProgress}%` }}
            transition={{ duration: 0.45, ease: LUXURY_EASE }}
            className="h-full bg-[#B59B79]"
          />
        </div>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-[#595C52] dark:text-[#B6B8AE]">
          <span>
            Items ({cart.totalCount})
          </span>
          <span className="tabular-nums">
            {formatLoomePrice(cart.subtotal, storeCurrency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#595C52] dark:text-[#B6B8AE]">
          <span>Atelier Delivery</span>
          <span>
            {deliveryRemaining === 0 ? 'Complimentary' : 'Confirmed via Concierge'}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-[#262923]/10 pt-3.5 dark:border-[#F8F6F1]/12">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#262923] dark:text-[#F8F6F1]">
            Estimated Subtotal
          </span>
          <span className="font-serif text-3xl font-normal tabular-nums text-[#262923] dark:text-[#F8F6F1]">
            {formatLoomePrice(cart.subtotal, storeCurrency)}
          </span>
        </div>
      </div>

      <p className="mt-3 mb-0 text-xs leading-relaxed text-[#65685E] dark:text-[#B6B8AE]">
        No online payment is charged here. Sending via WhatsApp connects you directly with our atelier concierge to finalize shipping, custom measurements, and payment.
      </p>
    </div>
  );

  return (
    <div
      data-preview-page-key="checkout"
      className="min-h-[75vh] w-full bg-[#F8F6F1] text-[#262923] dark:bg-[#171915] dark:text-[#F8F6F1]"
    >
      {/* Breadcrumb Strip */}
      <div className="border-b border-[#262923]/8 bg-[#F8F6F1]/90 dark:border-[#F8F6F1]/10 dark:bg-[#171915]">
        <nav className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-2 px-4 py-4 text-[11px] uppercase tracking-[0.2em] text-[#65685E] dark:text-[#B6B8AE] sm:px-8 lg:px-14">
          <a
            href={withBasePath('/')}
            data-preview-static="checkout-breadcrumb-home"
            className="text-[#65685E] no-underline transition-colors hover:text-[#262923] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
          >
            Home
          </a>
          <span aria-hidden="true" className="text-[#B59B79]">
            /
          </span>
          {hasShopPage && (
            <>
              <a
                href={withBasePath('/shop')}
                data-target-page="shop"
                data-preview-static="checkout-breadcrumb-shop"
                className="text-[#65685E] no-underline transition-colors hover:text-[#262923] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
              >
                Shop
              </a>
              <span aria-hidden="true" className="text-[#B59B79]">
                /
              </span>
            </>
          )}
          <span
            aria-current="page"
            data-preview-static="checkout-breadcrumb-current"
            className="text-[#262923] dark:text-[#F8F6F1]"
          >
            Private Checkout
          </span>
        </nav>
      </div>

      {/* Editorial Ivory / Champagne Checkout Header */}
      <section
        data-design-section="checkout-hero"
        className="border-b border-[#262923]/8 bg-gradient-to-b from-[#F4EFE6]/80 via-[#F8F6F1] to-[#F8F6F1] dark:border-[#F8F6F1]/10 dark:from-[#20231D]/70 dark:via-[#171915] dark:to-[#171915]"
      >
        <div className="mx-auto max-w-[1360px] px-4 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
          <LuxuryReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-9 bg-[#B59B79]" />
                <EditableText
                  as="p"
                  data-preview-field-path="checkoutPage.eyebrow"
                  defaultValue={eyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.28em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h1"
                data-preview-field-path="checkoutPage.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(2.45rem, 4.6vw, 4rem)"
                weight={300}
                lineHeight={1.04}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-4 mb-0"
              />
            </div>

            <div className="max-w-md lg:text-right">
              <EditableText
                as="p"
                data-preview-field-path="checkoutPage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.8}
                color="muted"
                className="m-0"
              />
            </div>
          </LuxuryReveal>

          {/* Subtle 3-Step Private Checkout Cadence */}
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#262923]/10 pt-5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#65685E] dark:border-[#F8F6F1]/10 dark:text-[#B6B8AE]">
            <span data-preview-static="checkout-step-1" className="text-[#262923] dark:text-[#F8F6F1]">
              01 · Review Curated Bag
            </span>
            <span aria-hidden="true" className="text-[#B59B79]">
              —
            </span>
            <span data-preview-static="checkout-step-2" className="text-[#262923] dark:text-[#F8F6F1]">
              02 · Delivery Details
            </span>
            <span aria-hidden="true" className="text-[#B59B79]">
              —
            </span>
            <span data-preview-static="checkout-step-3" className="text-[#747B65] dark:text-[#B59B79]">
              03 · WhatsApp Concierge Handoff
            </span>
          </div>
        </div>
      </section>

      {/* Main Checkout Content */}
      <section
        data-design-section="checkout-main"
        className="mx-auto max-w-[1360px] px-4 py-12 sm:px-8 lg:px-14 lg:py-16"
      >
        {!hasItems ? (
          /* Beautiful Empty-Cart State */
          <LuxuryReveal className="mx-auto max-w-2xl border border-[#262923]/10 bg-[#FCFBF8] px-6 py-16 text-center shadow-[0_20px_60px_rgba(38,41,35,0.04)] dark:border-[#F8F6F1]/12 dark:bg-[#20231D] sm:px-12 sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#B59B79]/45 bg-[#F8F6F1] text-[#B59B79] dark:bg-[#171915]">
              <ShoppingBag className="h-6 w-6 stroke-[1.3]" />
            </div>

            <div className="mt-6">
              <EditableText
                as="h2"
                data-preview-field-path="checkoutPage.emptyHeading"
                defaultValue={emptyHeading}
                fontFamily="heading"
                size="clamp(1.85rem, 3.2vw, 2.5rem)"
                weight={300}
                lineHeight={1.15}
                color="heading"
                align="center"
                className="m-0"
              />
            </div>

            <div className="mx-auto mt-3.5 max-w-md">
              <EditableText
                as="p"
                data-preview-field-path="checkoutPage.emptyDescription"
                defaultValue={emptyDescription}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.8}
                color="muted"
                align="center"
                className="m-0"
              />
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href={withBasePath(hasShopPage ? '/shop' : '/')}
                data-target-page={hasShopPage ? 'shop' : undefined}
                data-preview-static="checkout-empty-continue-shopping"
                className="group loome-btn-primary no-underline"
              >
                Continue Shopping
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              {hasServicesPage && (
                <a
                  href={withBasePath('/services')}
                  data-target-page="services"
                  data-preview-static="checkout-empty-explore-atelier"
                  className="loome-btn-outline no-underline"
                >
                  Atelier Services
                </a>
              )}
            </div>
          </LuxuryReveal>
        ) : (
          /* Active Two-Column Private Checkout */
          <div className="space-y-8">
            {/* Mobile-Friendly Collapsible Order Summary */}
            <div className="border border-[#262923]/12 bg-[#FCFBF8] dark:border-[#F8F6F1]/14 dark:bg-[#20231D] lg:hidden">
              <button
                type="button"
                onClick={() => setMobileSummaryOpen((prev) => !prev)}
                aria-expanded={mobileSummaryOpen}
                className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-5 py-4 text-left text-[#262923] dark:text-[#F8F6F1]"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 stroke-[1.5] text-[#747B65] dark:text-[#B59B79]" />
                  <span className="text-xs font-medium uppercase tracking-[0.2em]">
                    {mobileSummaryOpen ? 'Hide' : 'Show'} Order Summary ({cart.totalCount})
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-serif text-xl tabular-nums">
                    {formatLoomePrice(cart.subtotal, storeCurrency)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 stroke-[1.5] text-[#747B65] transition-transform duration-300 dark:text-[#B59B79] ${
                      mobileSummaryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {mobileSummaryOpen && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: LUXURY_EASE }}
                    className="overflow-hidden border-t border-[#262923]/10 dark:border-[#F8F6F1]/10"
                  >
                    <div className="px-5 pb-5">
                      {renderOrderItemsList(true)}
                      {renderTotalsBlock()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12 xl:gap-16">
              {/* Left Column: Customer & Delivery Form */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="border border-[#262923]/10 bg-[#FCFBF8] p-6 shadow-[0_18px_50px_rgba(38,41,35,0.035)] dark:border-[#F8F6F1]/12 dark:bg-[#20231D] sm:p-9 lg:p-10"
                >
                  <LuxuryStagger staggerDelay={0.07} className="space-y-8">
                    {/* Section 1: Client Details */}
                    <LuxuryStaggerItem y={14}>
                      <div className="flex items-center justify-between border-b border-[#262923]/10 pb-3.5 dark:border-[#F8F6F1]/10">
                        <h2 className="m-0 font-serif text-2xl font-normal tracking-wide text-[#262923] dark:text-[#F8F6F1]">
                          01. Client Details
                        </h2>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#747B65] dark:text-[#B59B79]">
                          * Required
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="checkout-fullName"
                            className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE]"
                          >
                            Full Name *
                          </label>
                          <input
                            id="checkout-fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            required
                            value={form.fullName}
                            onChange={(e) => updateField('fullName', e.target.value)}
                            placeholder="Camille Laurent"
                            aria-invalid={Boolean(errors.fullName)}
                            className={`mt-2 w-full border bg-[#F8F6F1] px-4 py-3 text-sm text-[#262923] placeholder-[#65685E]/55 outline-none transition-all duration-300 focus:border-[#B59B79] focus:bg-white focus:ring-1 focus:ring-[#B59B79]/35 dark:bg-[#171915] dark:text-[#F8F6F1] dark:placeholder-[#B6B8AE]/45 dark:focus:bg-[#171915] ${
                              errors.fullName
                                ? 'border-[#A1685A]'
                                : 'border-[#262923]/16 dark:border-[#F8F6F1]/18'
                            }`}
                          />
                          {errors.fullName && (
                            <p role="alert" className="mt-1.5 mb-0 text-xs text-[#9E4F40] dark:text-[#E2A89B]">
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-phone"
                            className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE]"
                          >
                            Phone / WhatsApp *
                          </label>
                          <input
                            id="checkout-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            required
                            value={form.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="+1 (212) 555-0194"
                            aria-invalid={Boolean(errors.phone)}
                            className={`mt-2 w-full border bg-[#F8F6F1] px-4 py-3 text-sm text-[#262923] placeholder-[#65685E]/55 outline-none transition-all duration-300 focus:border-[#B59B79] focus:bg-white focus:ring-1 focus:ring-[#B59B79]/35 dark:bg-[#171915] dark:text-[#F8F6F1] dark:placeholder-[#B6B8AE]/45 dark:focus:bg-[#171915] ${
                              errors.phone
                                ? 'border-[#A1685A]'
                                : 'border-[#262923]/16 dark:border-[#F8F6F1]/18'
                            }`}
                          />
                          {errors.phone && (
                            <p role="alert" className="mt-1.5 mb-0 text-xs text-[#9E4F40] dark:text-[#E2A89B]">
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-email"
                            className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE]"
                          >
                            Email <span className="opacity-65">(Optional)</span>
                          </label>
                          <input
                            id="checkout-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="client@example.com"
                            aria-invalid={Boolean(errors.email)}
                            className={`mt-2 w-full border bg-[#F8F6F1] px-4 py-3 text-sm text-[#262923] placeholder-[#65685E]/55 outline-none transition-all duration-300 focus:border-[#B59B79] focus:bg-white focus:ring-1 focus:ring-[#B59B79]/35 dark:bg-[#171915] dark:text-[#F8F6F1] dark:placeholder-[#B6B8AE]/45 dark:focus:bg-[#171915] ${
                              errors.email
                                ? 'border-[#A1685A]'
                                : 'border-[#262923]/16 dark:border-[#F8F6F1]/18'
                            }`}
                          />
                          {errors.email && (
                            <p role="alert" className="mt-1.5 mb-0 text-xs text-[#9E4F40] dark:text-[#E2A89B]">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </LuxuryStaggerItem>

                    {/* Section 2: Delivery Destination */}
                    <LuxuryStaggerItem y={14}>
                      <div className="border-b border-[#262923]/10 pb-3.5 dark:border-[#F8F6F1]/10">
                        <h2 className="m-0 font-serif text-2xl font-normal tracking-wide text-[#262923] dark:text-[#F8F6F1]">
                          02. Delivery Destination
                        </h2>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="checkout-address"
                            className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE]"
                          >
                            Delivery Address *
                          </label>
                          <input
                            id="checkout-address"
                            name="address"
                            type="text"
                            autoComplete="street-address"
                            required
                            value={form.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            placeholder="48 Mercer Street, Apartment 4B"
                            aria-invalid={Boolean(errors.address)}
                            className={`mt-2 w-full border bg-[#F8F6F1] px-4 py-3 text-sm text-[#262923] placeholder-[#65685E]/55 outline-none transition-all duration-300 focus:border-[#B59B79] focus:bg-white focus:ring-1 focus:ring-[#B59B79]/35 dark:bg-[#171915] dark:text-[#F8F6F1] dark:placeholder-[#B6B8AE]/45 dark:focus:bg-[#171915] ${
                              errors.address
                                ? 'border-[#A1685A]'
                                : 'border-[#262923]/16 dark:border-[#F8F6F1]/18'
                            }`}
                          />
                          {errors.address && (
                            <p role="alert" className="mt-1.5 mb-0 text-xs text-[#9E4F40] dark:text-[#E2A89B]">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-city"
                            className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE]"
                          >
                            City *
                          </label>
                          <input
                            id="checkout-city"
                            name="city"
                            type="text"
                            autoComplete="address-level2"
                            required
                            value={form.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            placeholder="New York"
                            aria-invalid={Boolean(errors.city)}
                            className={`mt-2 w-full border bg-[#F8F6F1] px-4 py-3 text-sm text-[#262923] placeholder-[#65685E]/55 outline-none transition-all duration-300 focus:border-[#B59B79] focus:bg-white focus:ring-1 focus:ring-[#B59B79]/35 dark:bg-[#171915] dark:text-[#F8F6F1] dark:placeholder-[#B6B8AE]/45 dark:focus:bg-[#171915] ${
                              errors.city
                                ? 'border-[#A1685A]'
                                : 'border-[#262923]/16 dark:border-[#F8F6F1]/18'
                            }`}
                          />
                          {errors.city && (
                            <p role="alert" className="mt-1.5 mb-0 text-xs text-[#9E4F40] dark:text-[#E2A89B]">
                              {errors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-postalCode"
                            className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE]"
                          >
                            Postal Code <span className="opacity-65">(Optional)</span>
                          </label>
                          <input
                            id="checkout-postalCode"
                            name="postalCode"
                            type="text"
                            autoComplete="postal-code"
                            value={form.postalCode}
                            onChange={(e) => updateField('postalCode', e.target.value)}
                            placeholder="10013"
                            className="mt-2 w-full border border-[#262923]/16 bg-[#F8F6F1] px-4 py-3 text-sm text-[#262923] placeholder-[#65685E]/55 outline-none transition-all duration-300 focus:border-[#B59B79] focus:bg-white focus:ring-1 focus:ring-[#B59B79]/35 dark:border-[#F8F6F1]/18 dark:bg-[#171915] dark:text-[#F8F6F1] dark:placeholder-[#B6B8AE]/45 dark:focus:bg-[#171915]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="checkout-notes"
                            className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE]"
                          >
                            Special Instructions{' '}
                            <span className="opacity-65">(Custom drops, delivery window, notes)</span>
                          </label>
                          <textarea
                            id="checkout-notes"
                            name="notes"
                            rows={3}
                            value={form.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                            placeholder="e.g., Requesting pinch-pleat header confirmation or preferred weekday delivery window."
                            className="mt-2 w-full resize-y border border-[#262923]/16 bg-[#F8F6F1] px-4 py-3 text-sm leading-relaxed text-[#262923] placeholder-[#65685E]/55 outline-none transition-all duration-300 focus:border-[#B59B79] focus:bg-white focus:ring-1 focus:ring-[#B59B79]/35 dark:border-[#F8F6F1]/18 dark:bg-[#171915] dark:text-[#F8F6F1] dark:placeholder-[#B6B8AE]/45 dark:focus:bg-[#171915]"
                          />
                        </div>
                      </div>
                    </LuxuryStaggerItem>

                    {/* Section 3: WhatsApp Concierge Handoff CTA */}
                    <LuxuryStaggerItem y={14}>
                      {!hasConfiguredWhatsapp && (
                        <div
                          role="alert"
                          className="mb-5 flex items-start gap-3 border border-[#A1685A]/45 bg-[#A1685A]/10 p-4 text-sm text-[#6E362B] dark:text-[#E8B8AD]"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6]" />
                          <div>
                            <p className="m-0 font-medium">
                              WhatsApp concierge number is not configured
                            </p>
                            <p className="mt-1 mb-0 text-xs leading-relaxed opacity-90">
                              Please add a WhatsApp or phone number under Contact settings in Fivora so orders can be handed off via WhatsApp.
                              {hasContactPage && (
                                <>
                                  {' '}
                                  Or reach the atelier via our{' '}
                                  <a
                                    href={withBasePath('/contact')}
                                    data-target-page="contact"
                                    className="underline"
                                  >
                                    Contact page
                                  </a>
                                  .
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={!hasConfiguredWhatsapp}
                        whileHover={
                          hasConfiguredWhatsapp && !prefersReducedMotion
                            ? { y: -1 }
                            : undefined
                        }
                        whileTap={
                          hasConfiguredWhatsapp && !prefersReducedMotion
                            ? { scale: 0.99 }
                            : undefined
                        }
                        className={`group flex h-[54px] w-full items-center justify-center gap-3 px-8 text-[12px] font-medium uppercase tracking-[0.22em] transition-all duration-400 ${
                          hasConfiguredWhatsapp
                            ? 'bg-[#262923] text-[#F8F6F1] hover:bg-[#747B65] dark:bg-[#F8F6F1] dark:text-[#262923] dark:hover:bg-[#E8E0D5]'
                            : 'cursor-not-allowed bg-[#262923]/25 text-[#262923]/55 dark:bg-[#F8F6F1]/15 dark:text-[#F8F6F1]/45'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4 stroke-[1.6]" />
                        <span>{submitLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
                      </motion.button>

                      <p className="mt-3.5 mb-0 text-center text-xs leading-relaxed text-[#65685E] dark:text-[#B6B8AE]">
                        Opens a pre-filled WhatsApp message to {storeName}. Your bag stays saved here until your order is finalized directly with our concierge.
                      </p>

                      {/* Honest WhatsApp Handoff Confirmation Panel */}
                      <AnimatePresence>
                        {handoffUrl && (
                          <motion.div
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                            transition={{ duration: 0.35, ease: LUXURY_EASE }}
                            role="status"
                            className="mt-6 border border-[#B59B79]/50 bg-[#F4EFE6] p-5 text-left dark:border-[#B59B79]/35 dark:bg-[#171915]"
                          >
                            <div className="flex items-start gap-3">
                              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#747B65] dark:text-[#B59B79]" />
                              <div className="flex-1">
                                <p className="m-0 text-xs font-medium uppercase tracking-[0.2em] text-[#262923] dark:text-[#F8F6F1]">
                                  WhatsApp Order Draft Prepared
                                </p>
                                <p className="mt-1.5 mb-0 text-xs leading-relaxed text-[#595C52] dark:text-[#C8CAC1]">
                                  {handoffBlockedNotice
                                    ? 'Your browser prevented opening WhatsApp automatically. Use the button below to launch your prepared order message.'
                                    : 'WhatsApp has been opened in a new window with your order summary. Your order is not paid or confirmed until our atelier concierge replies and confirms it with you.'}
                                </p>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                  <a
                                    href={handoffUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 border border-[#262923] bg-[#262923] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#F8F6F1] no-underline transition-colors hover:border-[#747B65] hover:bg-[#747B65] dark:border-[#F8F6F1] dark:bg-[#F8F6F1] dark:text-[#262923]"
                                  >
                                    Open WhatsApp Message
                                    <ExternalLink className="h-3 w-3 stroke-[1.6]" />
                                  </a>
                                  <span className="text-[11px] text-[#65685E] dark:text-[#B6B8AE]">
                                    Bag contents kept intact for reference.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </LuxuryStaggerItem>
                  </LuxuryStagger>
                </form>
              </div>

              {/* Right Column: Sticky Atelier Order Summary (Desktop) */}
              <aside className="hidden lg:sticky lg:top-28 lg:col-span-5 lg:block">
                <LuxuryReveal
                  delay={0.08}
                  className="border border-[#262923]/10 bg-[#FCFBF8] p-7 shadow-[0_18px_50px_rgba(38,41,35,0.035)] dark:border-[#F8F6F1]/12 dark:bg-[#20231D] xl:p-8"
                >
                  <div className="flex items-baseline justify-between border-b border-[#262923]/10 pb-4 dark:border-[#F8F6F1]/10">
                    <div>
                      <p className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]">
                        Curated Selection
                      </p>
                      <h2 className="mt-1 mb-0 font-serif text-2xl font-normal tracking-wide text-[#262923] dark:text-[#F8F6F1]">
                        Order Summary
                      </h2>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-[#65685E] dark:text-[#B6B8AE]">
                      {cart.totalCount} {cart.totalCount === 1 ? 'Piece' : 'Pieces'}
                    </span>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto pr-1">
                    {renderOrderItemsList(false)}
                  </div>

                  {renderTotalsBlock()}

                  {hasShopPage && (
                    <div className="mt-5 text-center">
                      <a
                        href={withBasePath('/shop')}
                        data-target-page="shop"
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#595C52] no-underline transition-colors hover:text-[#262923] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
                      >
                        Continue Browsing Textiles
                        <ArrowRight className="h-3 w-3 stroke-[1.5]" />
                      </a>
                    </div>
                  )}
                </LuxuryReveal>
              </aside>
            </div>
          </div>
        )}
      </section>

      {/* Always-Mounted Atelier Delivery & Concierge Assurance Band */}
      <section className="border-t border-[#262923]/8 bg-[#F4F0E8]/60 py-12 dark:border-[#F8F6F1]/10 dark:bg-[#1B1E18]">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-8 px-4 sm:px-8 md:grid-cols-3 lg:px-14">
          <div className="md:col-span-2">
            <p
              data-preview-static="checkout-assurance-eyebrow"
              className="m-0 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]"
            >
              <ShieldCheck className="h-3.5 w-3.5 stroke-[1.5]" />
              Atelier Delivery &amp; Concierge Policy
            </p>
            <div className="mt-2.5 max-w-2xl">
              <EditableText
                as="p"
                data-preview-field-path="checkoutPage.deliveryNote"
                defaultValue={deliveryNote}
                fontFamily="body"
                size="0.875rem"
                lineHeight={1.8}
                color="muted"
                className="m-0"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2 border-t border-[#262923]/10 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0 dark:border-[#F8F6F1]/10">
            <p
              data-preview-static="checkout-currency-label"
              className="m-0 text-[10px] uppercase tracking-[0.22em] text-[#65685E] dark:text-[#B6B8AE]"
            >
              Pricing Currency · {storeCurrency}
            </p>
            <p
              data-preview-static="checkout-handoff-note"
              className="m-0 text-xs leading-relaxed text-[#595C52] dark:text-[#C8CAC1]"
            >
              Direct WhatsApp order handoff with personal sizing and dispatch confirmation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
