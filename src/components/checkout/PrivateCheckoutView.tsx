'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
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
import {
  formatLoomePrice,
  normalizeLoomeProduct,
  resolveFreeDeliveryThreshold,
  resolveLoomeCurrency,
  SRI_LANKAN_DISTRICTS,
} from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import {
  LUXURY_EASE,
  LuxuryHairline,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

const CHECKOUT_DRAFT_STORAGE_KEY = 'loome_private_checkout_draft_v1';

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

const INPUT_BASE_CLASS =
  'mt-1.5 w-full rounded-[11px] border bg-[var(--loome-ivory)] px-3.5 py-2.5 text-[14px] text-[var(--heading-color)] placeholder-[var(--muted-color)]/70 shadow-[inset_0_1px_2px_rgba(45,39,34,0.03)] outline-none transition-all duration-300 focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/25';

export default function PrivateCheckoutView() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const cart = useCart();
  const prefersReducedMotion = useReducedMotion();

  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [blockedFallbackUrl, setBlockedFallbackUrl] = useState<string | null>(null);

  // Restore saved customer details on client mount so returning from WhatsApp keeps form intact
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<CheckoutFormState>;
      if (parsed && typeof parsed === 'object') {
        setForm({
          fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
          phone: typeof parsed.phone === 'string' ? parsed.phone : '',
          email: typeof parsed.email === 'string' ? parsed.email : '',
          address: typeof parsed.address === 'string' ? parsed.address : '',
          city: typeof parsed.city === 'string' ? parsed.city : '',
          postalCode: typeof parsed.postalCode === 'string' ? parsed.postalCode : '',
          notes: typeof parsed.notes === 'string' ? parsed.notes : '',
        });
      }
    } catch {
      // Ignore storage access errors in restricted environments
    }
  }, []);

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const contact = contentObject(content.contact);
  const cartPage = contentObject(content.cartPage);
  const checkoutPage = contentObject(content.checkoutPage);
  const shopMeta = contentObject((siteData as Record<string, unknown>).shop);
  const merchantMeta = contentObject((siteData as Record<string, unknown>).merchant);
  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const shopNavLabel = contentText(navLabels.shop) || 'Shop';
  const checkoutNavLabel = contentText(navLabels.checkout) || 'Private Checkout';
  const continueShoppingLabel =
    contentText(cartPage.continueShoppingLabel) || 'Continue Shopping';
  const summaryHeading = contentText(cartPage.summaryHeading) || 'Order Summary';
  const step1Label = contentText(checkoutPage.step1Label) || 'Review Bag';
  const step2Label = contentText(checkoutPage.step2Label) || 'Delivery Details';
  const step3Label = contentText(checkoutPage.step3Label) || 'WhatsApp Concierge';
  const emptySecondaryCtaLabel =
    contentText(checkoutPage.emptySecondaryCtaLabel) || 'Atelier Services';

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

  const storeCurrency = resolveLoomeCurrency(siteData, catalogProducts[0]?.currency);
  const freeDeliveryThreshold = resolveFreeDeliveryThreshold(siteData);
  const hasDeliveryThreshold = freeDeliveryThreshold > 0;

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
  const clientSectionHeading =
    contentText(checkoutPage.clientSectionHeading) || '01. Client Details';
  const deliverySectionHeading =
    contentText(checkoutPage.deliverySectionHeading) || '02. Delivery Destination';
  const assuranceEyebrow =
    contentText(checkoutPage.assuranceEyebrow) || 'Atelier Delivery & Concierge Policy';
  const emptyHeading =
    contentText(checkoutPage.emptyHeading) || 'Your atelier bag is currently empty';
  const emptyDescription =
    contentText(checkoutPage.emptyDescription) ||
    'Explore our Belgian flax drapery, stonewashed linen bedding, and heirloom fabrics to begin curating your order.';

  const hasItems = cart.items.length > 0;
  const hasInquiryOnlyItem = cart.items.some((item) => item.showPrice === false);
  const allInquiryOnly = hasItems && cart.items.every((item) => item.showPrice === false);
  const subtotalDisplay = allInquiryOnly
    ? 'Upon Inquiry'
    : formatLoomePrice(cart.subtotal, storeCurrency);
  const deliveryRemaining = hasDeliveryThreshold
    ? Math.max(0, freeDeliveryThreshold - cart.subtotal)
    : 0;
  const deliveryProgress = hasDeliveryThreshold
    ? Math.min(100, Math.round((cart.subtotal / freeDeliveryThreshold) * 100))
    : 0;

  const updateField = (field: keyof CheckoutFormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      try {
        window.sessionStorage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (blockedFallbackUrl) {
      setBlockedFallbackUrl(null);
    }
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.';
    }
    const phoneDigits = form.phone.replace(/[^\d]/g, '');
    if (phoneDigits.length < 9) {
      nextErrors.phone = 'Please enter a valid contact phone number (e.g. +94 77 000 0194).';
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
      nextErrors.city = 'Please enter your district or city (e.g. Colombo, Kandy, Galle).';
    }
    if (form.postalCode.trim() && !/^[A-Za-z0-9\s-]{4,10}$/.test(form.postalCode.trim())) {
      nextErrors.postalCode = 'Please enter a valid postal code (e.g. 00700).';
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
      allInquiryOnly
        ? 'Estimated Subtotal: Price Upon Inquiry'
        : `Estimated Subtotal: ${formatLoomePrice(cart.subtotal, storeCurrency)}${hasInquiryOnlyItem ? ' (plus inquiry items)' : ''}`,
    );
    lines.push(
      hasDeliveryThreshold && deliveryRemaining === 0
        ? `Delivery: Eligible for complimentary white-glove delivery (${formatLoomePrice(freeDeliveryThreshold, storeCurrency)}+ threshold)`
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

    // Persist draft before leaving for WhatsApp so returning preserves customer inputs
    try {
      window.sessionStorage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify(form));
    } catch {
      // Ignore storage write errors
    }

    const encodedMessage = encodeURIComponent(buildWhatsAppMessage());
    const url = `https://wa.me/${cleanWhatsappDigits}?text=${encodedMessage}`;

    // Direct user-initiated navigation without 'noopener' feature string so browsers
    // accurately return the WindowProxy on success (we clear win.opener immediately).
    const popup = window.open(url, '_blank');
    if (popup) {
      try {
        popup.opener = null;
      } catch {
        // Cross-origin opener clearing may be restricted in some browsers
      }
      setBlockedFallbackUrl(null);
    } else {
      // Only show compact fallback link when the browser genuinely blocked opening WhatsApp
      setBlockedFallbackUrl(url);
    }
  };

  const renderOrderItemsList = (compact = false) => (
    <ul className="m-0 list-none divide-y divide-[var(--loome-border)] p-0">
      <AnimatePresence initial={false}>
        {cart.items.map((item) => {
          const itemKey = `${item.id}-${item.color || ''}-${item.size || ''}`;
          const detailHref = platformProductDetailHref(item.id);
          return (
            <motion.li
              key={itemKey}
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: LUXURY_EASE }}
              className={`flex gap-3.5 ${compact ? 'py-3.5' : 'py-4'}`}
            >
              <a
                href={detailHref}
                className="h-[84px] w-[70px] shrink-0 overflow-hidden rounded-xl border border-[var(--loome-border)] bg-[var(--loome-beige)]"
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
                      className="font-heading text-[15px] font-bold leading-snug text-[var(--heading-color)] no-underline transition-colors hover:text-[var(--brand-accent)]"
                    >
                      {item.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => cart.removeItem(item.id, item.size, item.color)}
                      aria-label={`Remove ${item.name} from bag`}
                      className="shrink-0 rounded-full p-1 text-[var(--muted-color)] transition-colors hover:bg-[var(--loome-beige)] hover:text-[var(--heading-color)]"
                    >
                      <Trash2 className="h-3.5 w-3.5 stroke-[1.6]" />
                    </button>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                    {item.color && (
                      <span className="font-semibold uppercase tracking-[0.12em] text-[var(--brand-accent)]">
                        {item.color}
                      </span>
                    )}
                    {item.color && item.size && (
                      <span aria-hidden="true" className="text-[var(--brand-accent)]">
                        ·
                      </span>
                    )}
                    {item.size && (
                      <span className="text-[var(--muted-color)]">{item.size}</span>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-[10px] border border-[var(--loome-border)] bg-[var(--loome-ivory)]">
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(item.id, item.quantity - 1, item.size, item.color)
                      }
                      aria-label={`Decrease quantity for ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center text-[var(--heading-color)] transition-colors hover:bg-[var(--loome-beige)]"
                    >
                      <Minus className="h-3 w-3 stroke-[1.7]" />
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={prefersReducedMotion ? false : { scale: 0.86, opacity: 0.65 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-7 text-center text-xs font-semibold tabular-nums text-[var(--heading-color)]"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(item.id, item.quantity + 1, item.size, item.color)
                      }
                      aria-label={`Increase quantity for ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center text-[var(--heading-color)] transition-colors hover:bg-[var(--loome-beige)]"
                    >
                      <Plus className="h-3 w-3 stroke-[1.7]" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="block whitespace-nowrap text-[14px] font-bold tabular-nums text-[var(--heading-color)]">
                      {item.showPrice === false
                        ? 'Upon Inquiry'
                        : formatLoomePrice(item.price * item.quantity, storeCurrency)}
                    </span>
                    {item.showPrice !== false && item.quantity > 1 && (
                      <span className="block text-[11px] tabular-nums text-[var(--muted-color)]">
                        {formatLoomePrice(item.price, storeCurrency)} each
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );

  const renderTotalsBlock = () => (
    <div className="mt-4 space-y-4 border-t border-[var(--loome-border)] pt-4">
      {/* Merchant-Configurable White-Glove Delivery Progress */}
      {hasDeliveryThreshold && (
        <div
          className={`rounded-xl border px-3.5 py-3 ${deliveryRemaining === 0
            ? 'border-[var(--loome-sage-border)] bg-[var(--loome-sage-bg)]'
            : 'border-[var(--loome-border)] bg-[var(--loome-ivory)]'
            }`}
        >
          <div className="flex items-center justify-between gap-2 text-[11.5px] font-medium text-[var(--heading-color)]">
            <span className="inline-flex items-center gap-1.5">
              <Truck
                className={`h-3.5 w-3.5 shrink-0 stroke-[1.6] ${deliveryRemaining === 0 ? 'text-[var(--loome-sage-text)]' : 'text-[var(--brand-accent)]'
                  }`}
              />
              {deliveryRemaining === 0
                ? 'Complimentary white-glove delivery unlocked'
                : `Add ${formatLoomePrice(deliveryRemaining, storeCurrency)} for complimentary delivery`}
            </span>
            <span
              className={`tabular-nums font-semibold ${deliveryRemaining === 0 ? 'text-[var(--loome-sage-text)]' : 'text-[var(--brand-accent)]'
                }`}
            >
              {deliveryProgress}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--loome-beige)]">
            <motion.div
              initial={false}
              animate={{ width: `${deliveryProgress}%` }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              className={`h-full rounded-full ${deliveryRemaining === 0 ? 'bg-[var(--loome-sage-text)]' : 'bg-[var(--brand-accent)]'
                }`}
            />
          </div>
        </div>
      )}

      {/* Price Breakdown Inset */}
      <div className="rounded-xl border border-[var(--loome-border)] bg-[var(--loome-ivory)] px-4 py-4">
        <div className="space-y-2 text-[13px]">
          <div className="flex items-center justify-between text-[var(--muted-color)]">
            <span>Items ({cart.totalCount})</span>
            <span className="whitespace-nowrap font-semibold tabular-nums text-[var(--heading-color)]">
              {subtotalDisplay}
            </span>
          </div>
          <div className="flex items-center justify-between text-[var(--muted-color)]">
            <span>Delivery</span>
            <span className="font-semibold text-[var(--heading-color)]">
              {hasDeliveryThreshold && deliveryRemaining === 0
                ? 'Complimentary'
                : 'Confirmed via Concierge'}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between border-t border-[var(--loome-border)] pt-3.5">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--heading-color)]">
              Estimated Subtotal
            </span>
            <span className="mt-0.5 block text-[11px] text-[var(--muted-color)]">
              Currency: {storeCurrency}
            </span>
          </div>
          <span className="whitespace-nowrap font-heading text-2xl font-extrabold leading-none tabular-nums text-[var(--heading-color)]">
            {subtotalDisplay}
          </span>
        </div>
      </div>

      <p className="m-0 text-[12px] leading-relaxed text-[var(--muted-color)]">
        No online payment is charged here. Final availability, custom drapery sizing, and delivery timing are confirmed with our atelier concierge on WhatsApp.
      </p>
    </div>
  );

  return (
    <div
      data-preview-page-key="checkout"
      className="loome-surface-ivory min-h-[75vh] w-full font-sans"
    >
      {/* Compact Editorial Breadcrumb Strip */}
      <div className="border-b border-[var(--loome-border)] bg-[var(--loome-surface-subtle)]">
        <nav className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] transition-colors hover:text-[var(--heading-color)]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" data-preview-static="checkout-bc-sep-1" className="text-[var(--brand-accent)]">
            /
          </span>
          {hasShopPage && (
            <>
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath('/shop'))}
                data-target-page="shop"
                className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] transition-colors hover:text-[var(--heading-color)]"
              >
                <span data-preview-field-path="common.navLabels.shop">{shopNavLabel}</span>
              </button>
              <span aria-hidden="true" data-preview-static="checkout-bc-sep-2" className="text-[var(--brand-accent)]">
                /
              </span>
            </>
          )}
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.checkout"
            className="font-semibold text-[var(--heading-color)]"
          >
            {checkoutNavLabel}
          </span>
        </nav>
      </div>

      {/* Clean Warm Ivory Checkout Header */}
      <section
        data-design-section="checkout-hero"
        className="w-full border-b border-[var(--loome-border)]"
      >
        <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-8 sm:py-9 lg:px-10">
          <LuxuryReveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[var(--brand-accent)]" />
                <EditableText
                  as="p"
                  data-preview-field-path="checkoutPage.eyebrow"
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
                data-preview-field-path="checkoutPage.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(1.85rem, 3vw, 2.5rem)"
                weight={800}
                lineHeight={1.08}
                letterSpacing="-0.025em"
                color="heading"
                className="mt-2.5 mb-0"
              />
            </div>

            <div className="max-w-md lg:text-right">
              <EditableText
                as="p"
                data-preview-field-path="checkoutPage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.9rem"
                lineHeight={1.68}
                color="muted"
                className="m-0"
              />
            </div>
          </LuxuryReveal>

          {/* Compact 3-Step Private Checkout Cadence */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--loome-border)] pt-4 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-color)]">
            <span
              className="inline-flex items-center gap-2 text-[var(--heading-color)]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--brand-accent)] text-[9px] text-[var(--brand-accent)]">
                1
              </span>
              <span data-preview-field-path="checkoutPage.step1Label">{step1Label}</span>
            </span>
            <span aria-hidden="true" data-preview-static="checkout-step-sep-1" className="text-[var(--brand-accent)]">
              /
            </span>
            <span
              className="inline-flex items-center gap-2 text-[var(--heading-color)]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--brand-accent)] text-[9px] text-[var(--brand-accent)]">
                2
              </span>
              <span data-preview-field-path="checkoutPage.step2Label">{step2Label}</span>
            </span>
            <span aria-hidden="true" data-preview-static="checkout-step-sep-2" className="text-[var(--brand-accent)]">
              /
            </span>
            <span
              className="inline-flex items-center gap-2 text-[var(--brand-accent)]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--brand-accent)]/60 text-[9px]">
                3
              </span>
              <span data-preview-field-path="checkoutPage.step3Label">{step3Label}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Checkout Content */}
      <section
        data-design-section="checkout-main"
        className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10"
      >
        {!hasItems ? (
          /* Refined Empty-Cart State */
          <LuxuryReveal className="mx-auto max-w-xl rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-12 text-center shadow-[0_6px_24px_rgba(73,56,44,0.06)] dark:shadow-none sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--brand-accent)]/35 bg-[var(--loome-ivory)] text-[var(--brand-accent)]">
              <ShoppingBag className="h-5 w-5 stroke-[1.6]" />
            </div>

            <div className="mt-5">
              <EditableText
                as="h2"
                data-preview-field-path="checkoutPage.emptyHeading"
                defaultValue={emptyHeading}
                fontFamily="heading"
                size="clamp(1.45rem, 2.4vw, 1.85rem)"
                weight={800}
                lineHeight={1.18}
                color="heading"
                align="center"
                className="m-0"
              />
            </div>

            <div className="mx-auto mt-2.5 max-w-md">
              <EditableText
                as="p"
                data-preview-field-path="checkoutPage.emptyDescription"
                defaultValue={emptyDescription}
                fontFamily="body"
                size="0.9rem"
                lineHeight={1.7}
                color="muted"
                align="center"
                className="m-0"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath(hasShopPage ? '/shop/' : '/'))}
                data-target-page={hasShopPage ? 'shop' : undefined}
                data-testid="checkout-empty-continue-shopping"
                className="group loome-btn-primary cursor-pointer"
              >
                <span data-preview-field-path="cartPage.continueShoppingLabel">
                  {continueShoppingLabel}
                </span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {hasServicesPage && (
                <button
                  type="button"
                  onClick={() => window.location.assign(withBasePath('/services/'))}
                  data-target-page="services"
                  data-testid="checkout-empty-explore-atelier"
                  className="loome-btn-outline cursor-pointer"
                >
                  <span data-preview-field-path="checkoutPage.emptySecondaryCtaLabel">
                    {emptySecondaryCtaLabel}
                  </span>
                </button>
              )}
            </div>
          </LuxuryReveal>
        ) : (
          /* Active Two-Column Private Checkout */
          <div className="space-y-6">
            {/* Mobile-Friendly Collapsible Order Summary */}
            <div className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] shadow-[0_4px_18px_rgba(73,56,44,0.05)] dark:shadow-none lg:hidden">
              <button
                type="button"
                onClick={() => setMobileSummaryOpen((prev) => !prev)}
                aria-expanded={mobileSummaryOpen}
                className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-5 py-4 text-left text-[var(--heading-color)]"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 stroke-[1.6] text-[var(--brand-accent)]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {mobileSummaryOpen ? 'Hide' : 'Show'} Order Summary ({cart.totalCount})
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="whitespace-nowrap font-heading text-lg font-extrabold tabular-nums">
                    {subtotalDisplay}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 stroke-[1.6] text-[var(--brand-accent)] transition-transform duration-300 ${mobileSummaryOpen ? 'rotate-180' : ''
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
                    transition={{ duration: 0.32, ease: LUXURY_EASE }}
                    className="overflow-hidden border-t border-[var(--loome-border)]"
                  >
                    <div className="px-5 pb-5">
                      {renderOrderItemsList(true)}
                      {renderTotalsBlock()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-start lg:gap-9">
              {/* Left Column: Customer & Delivery Form */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-6 shadow-[0_4px_20px_rgba(73,56,44,0.05)] dark:shadow-none sm:p-8"
                >
                  <LuxuryStagger staggerDelay={0.06} className="space-y-6">
                    {/* Section 1: Client Details */}
                    <LuxuryStaggerItem y={12}>
                      <div className="flex items-center justify-between border-b border-[var(--loome-border)] pb-3">
                        <h2
                          data-preview-field-path="checkoutPage.clientSectionHeading"
                          className="m-0 font-heading text-lg font-extrabold tracking-tight text-[var(--heading-color)]"
                        >
                          {clientSectionHeading}
                        </h2>
                        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent)]">
                          * Required
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="checkout-fullName"
                            className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--heading-color)]"
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
                            placeholder="Ananya Perera"
                            aria-invalid={Boolean(errors.fullName)}
                            className={`${INPUT_BASE_CLASS} ${errors.fullName
                              ? 'border-[#B04A38] bg-[#FDF7F5] focus:border-[#B04A38] focus:ring-[#B04A38]/20 dark:border-[#D98272]'
                              : 'border-[#201C1A]/22 dark:border-[#F2E9DE]/22'
                              }`}
                          />
                          {errors.fullName && (
                            <p
                              role="alert"
                              className="mt-1.5 mb-0 flex items-center gap-1.5 text-xs font-medium text-[#9E3F2E] dark:text-[#EAA597]"
                            >
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-phone"
                            className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B302B] dark:text-[#F2E9DE]"
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
                            placeholder="+94 77 000 0194"
                            aria-invalid={Boolean(errors.phone)}
                            className={`${INPUT_BASE_CLASS} ${errors.phone
                              ? 'border-[#B04A38] bg-[#FDF7F5] focus:border-[#B04A38] focus:ring-[#B04A38]/20 dark:border-[#D98272]'
                              : 'border-[#201C1A]/22 dark:border-[#F2E9DE]/22'
                              }`}
                          />
                          {errors.phone && (
                            <p
                              role="alert"
                              className="mt-1.5 mb-0 flex items-center gap-1.5 text-xs font-medium text-[#9E3F2E] dark:text-[#EAA597]"
                            >
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-email"
                            className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B302B] dark:text-[#F2E9DE]"
                          >
                            Email{' '}
                            <span className="font-normal normal-case tracking-normal text-[#6B5B51] dark:text-[#C7B6A6]">
                              (Optional)
                            </span>
                          </label>
                          <input
                            id="checkout-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="client@example.lk"
                            aria-invalid={Boolean(errors.email)}
                            className={`${INPUT_BASE_CLASS} ${errors.email
                              ? 'border-[#B04A38] bg-[#FDF7F5] focus:border-[#B04A38] focus:ring-[#B04A38]/20 dark:border-[#D98272]'
                              : 'border-[#201C1A]/22 dark:border-[#F2E9DE]/22'
                              }`}
                          />
                          {errors.email && (
                            <p
                              role="alert"
                              className="mt-1.5 mb-0 flex items-center gap-1.5 text-xs font-medium text-[#9E3F2E] dark:text-[#EAA597]"
                            >
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </LuxuryStaggerItem>

                    {/* Section 2: Delivery Destination */}
                    <LuxuryStaggerItem y={12}>
                      <div className="border-b border-[var(--loome-border)] pb-3">
                        <h2
                          data-preview-field-path="checkoutPage.deliverySectionHeading"
                          className="m-0 font-heading text-lg font-extrabold tracking-tight text-[var(--heading-color)]"
                        >
                          {deliverySectionHeading}
                        </h2>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="checkout-address"
                            className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B302B] dark:text-[#F2E9DE]"
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
                            placeholder="42 Barnes Place, Colombo 07"
                            aria-invalid={Boolean(errors.address)}
                            className={`${INPUT_BASE_CLASS} ${errors.address
                              ? 'border-[#B04A38] bg-[#FDF7F5] focus:border-[#B04A38] focus:ring-[#B04A38]/20 dark:border-[#D98272]'
                              : 'border-[#201C1A]/22 dark:border-[#F2E9DE]/22'
                              }`}
                          />
                          {errors.address && (
                            <p
                              role="alert"
                              className="mt-1.5 mb-0 flex items-center gap-1.5 text-xs font-medium text-[#9E3F2E] dark:text-[#EAA597]"
                            >
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
                              {errors.address}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-city"
                            className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B302B] dark:text-[#F2E9DE]"
                          >
                            District / City *
                          </label>
                          <input
                            id="checkout-city"
                            name="city"
                            type="text"
                            list="sl-districts-list"
                            autoComplete="address-level2"
                            required
                            value={form.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            placeholder="Colombo"
                            aria-invalid={Boolean(errors.city)}
                            className={`${INPUT_BASE_CLASS} ${errors.city
                              ? 'border-[#B04A38] bg-[#FDF7F5] focus:border-[#B04A38] focus:ring-[#B04A38]/20 dark:border-[#D98272]'
                              : 'border-[#201C1A]/22 dark:border-[#F2E9DE]/22'
                              }`}
                          />
                          <datalist id="sl-districts-list">
                            {SRI_LANKAN_DISTRICTS.map((district) => (
                              <option key={district} value={district} />
                            ))}
                          </datalist>
                          {errors.city && (
                            <p
                              role="alert"
                              className="mt-1.5 mb-0 flex items-center gap-1.5 text-xs font-medium text-[#9E3F2E] dark:text-[#EAA597]"
                            >
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
                              {errors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-postalCode"
                            className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B302B] dark:text-[#F2E9DE]"
                          >
                            Postal Code{' '}
                            <span className="font-normal normal-case tracking-normal text-[#6B5B51] dark:text-[#C7B6A6]">
                              (Optional)
                            </span>
                          </label>
                          <input
                            id="checkout-postalCode"
                            name="postalCode"
                            type="text"
                            autoComplete="postal-code"
                            value={form.postalCode}
                            onChange={(e) => updateField('postalCode', e.target.value)}
                            placeholder="00700"
                            aria-invalid={Boolean(errors.postalCode)}
                            className={`${INPUT_BASE_CLASS} ${errors.postalCode
                              ? 'border-[#B04A38] bg-[#FDF7F5] focus:border-[#B04A38] focus:ring-[#B04A38]/20 dark:border-[#D98272]'
                              : 'border-[#201C1A]/22 dark:border-[#F2E9DE]/22'
                              }`}
                          />
                          {errors.postalCode && (
                            <p
                              role="alert"
                              className="mt-1.5 mb-0 flex items-center gap-1.5 text-xs font-medium text-[#9E3F2E] dark:text-[#EAA597]"
                            >
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
                              {errors.postalCode}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="checkout-notes"
                            className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B302B] dark:text-[#F2E9DE]"
                          >
                            Special Instructions{' '}
                            <span className="font-normal normal-case tracking-normal text-[#6B5B51] dark:text-[#C7B6A6]">
                              (Optional — custom drops, delivery window, notes)
                            </span>
                          </label>
                          <textarea
                            id="checkout-notes"
                            name="notes"
                            rows={3}
                            value={form.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                            placeholder="e.g., Requesting pinch-pleat header confirmation or preferred weekday delivery window."
                            className={`${INPUT_BASE_CLASS} resize-y border-[#201C1A]/22 leading-relaxed dark:border-[#F2E9DE]/22`}
                          />
                        </div>
                      </div>
                    </LuxuryStaggerItem>

                    {/* Section 3: Direct WhatsApp Concierge Handoff CTA */}
                    <LuxuryStaggerItem y={12}>
                      {!hasConfiguredWhatsapp && (
                        <div
                          role="alert"
                          className="mb-4 flex items-start gap-3 rounded-xl border border-[#B04A38]/40 bg-[#FDF7F5] p-4 text-sm text-[#7A3022] dark:border-[#D98272]/40 dark:bg-[#2A1D1A] dark:text-[#F0BDB3]"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.7]" />
                          <div>
                            <p className="m-0 font-semibold">
                              WhatsApp concierge number is not configured
                            </p>
                            <p className="mt-1 mb-0 text-xs leading-relaxed opacity-90">
                              Please add a WhatsApp or phone number under Contact settings in Fivora so orders can be handed off via WhatsApp.
                              {hasContactPage && (
                                <>
                                  {' '}
                                  You may also reach the atelier via our{' '}
                                  <a
                                    href={withBasePath('/contact')}
                                    data-target-page="contact"
                                    className="font-medium underline"
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
                          hasConfiguredWhatsapp && !prefersReducedMotion ? { y: -1 } : undefined
                        }
                        whileTap={
                          hasConfiguredWhatsapp && !prefersReducedMotion
                            ? { scale: 0.99 }
                            : undefined
                        }
                        className={`group flex h-12 w-full items-center justify-center gap-3 rounded-[11px] px-8 text-[12px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${hasConfiguredWhatsapp
                          ? 'bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)] hover:bg-[var(--loome-btn-primary-hover)]'
                          : 'cursor-not-allowed bg-[var(--loome-border)] text-[var(--muted-color)]'
                          }`}
                      >
                        <MessageCircle className="h-4 w-4 stroke-[1.6]" />
                        <span data-preview-field-path="checkoutPage.submitLabel">{submitLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-1" />
                      </motion.button>

                      <p className="mt-3 mb-0 text-center text-[12px] leading-relaxed text-[var(--muted-color)]">
                        Opens WhatsApp directly with your itemized order for {storeName}. Your bag and details remain saved here until finalized with our concierge.
                      </p>

                      {/* Compact Fallback Link — shown ONLY if the browser blocked opening WhatsApp */}
                      <AnimatePresence>
                        {blockedFallbackUrl && (
                          <motion.div
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
                            transition={{ duration: 0.25, ease: LUXURY_EASE }}
                            role="alert"
                            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--brand-accent)]/60 bg-[var(--loome-ivory)] px-4 py-3 text-xs text-[var(--heading-color)]"
                          >
                            <span>Your browser blocked opening WhatsApp automatically.</span>
                            <a
                              href={blockedFallbackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setBlockedFallbackUrl(null)}
                              className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent)] underline underline-offset-4 transition-colors hover:text-[var(--heading-color)]"
                            >
                              Open WhatsApp
                              <ExternalLink className="h-3 w-3 stroke-[1.7]" />
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </LuxuryStaggerItem>
                  </LuxuryStagger>
                </form>
              </div>

              {/* Right Column: Sticky Atelier Order Summary (Desktop) */}
              <aside className="hidden lg:sticky lg:top-24 lg:col-span-5 lg:block">
                <LuxuryReveal
                  delay={0.06}
                  className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-6 shadow-[0_4px_20px_rgba(73,56,44,0.05)] dark:shadow-none xl:p-7"
                >
                  <div className="flex items-baseline justify-between border-b border-[var(--loome-border)] pb-3.5">
                    <div>
                      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
                        Curated Selection
                      </p>
                      <h2
                        data-preview-field-path="cartPage.summaryHeading"
                        className="mt-1 mb-0 font-heading text-xl font-extrabold tracking-tight text-[var(--heading-color)]"
                      >
                        {summaryHeading}
                      </h2>
                    </div>
                    <span className="rounded-full border border-[var(--loome-border)] bg-[var(--loome-ivory)] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-color)]">
                      {cart.totalCount} {cart.totalCount === 1 ? 'Piece' : 'Pieces'}
                    </span>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto pr-1">
                    {renderOrderItemsList(false)}
                  </div>

                  {renderTotalsBlock()}

                  {hasShopPage && (
                    <div className="mt-4 text-center">
                      <a
                        href={withBasePath('/shop')}
                        data-target-page="shop"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-color)] no-underline transition-colors hover:text-[var(--heading-color)]"
                      >
                        Continue Browsing Textiles
                        <ArrowRight className="h-3 w-3 stroke-[1.6]" />
                      </a>
                    </div>
                  )}
                </LuxuryReveal>
              </aside>
            </div>
          </div>
        )}
      </section>

      {/* Compact Atelier Delivery & Concierge Assurance Band */}
      <section className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-8 sm:py-10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 sm:px-8 md:grid-cols-3 lg:px-10">
          <div className="md:col-span-2">
            <p className="m-0 inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
              <ShieldCheck className="h-3.5 w-3.5 stroke-[1.6]" />
              <span data-preview-field-path="checkoutPage.assuranceEyebrow">{assuranceEyebrow}</span>
            </p>
            <div className="mt-2 max-w-2xl">
              <EditableText
                as="p"
                data-preview-field-path="checkoutPage.deliveryNote"
                defaultValue={deliveryNote}
                fontFamily="body"
                size="0.875rem"
                lineHeight={1.7}
                color="muted"
                className="m-0"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-1.5 border-t border-[var(--loome-border)] pt-4 md:border-l md:border-t-0 md:pl-7 md:pt-0">
            <p
              data-preview-static="checkout-currency-label"
              className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[var(--heading-color)]"
            >
              Pricing Currency · {storeCurrency}
            </p>
            <p
              data-preview-static="checkout-handoff-note"
              className="m-0 text-[12.5px] leading-relaxed text-[var(--muted-color)]"
            >
              Direct WhatsApp order handoff with personal sizing and dispatch confirmation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
