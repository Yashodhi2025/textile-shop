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
  'mt-1.5 w-full rounded-[11px] border bg-[#FAF5EE] px-3.5 py-2.5 text-[14px] text-[#201C1A] placeholder-[#8D7667] shadow-[inset_0_1px_2px_rgba(32,28,26,0.03)] outline-none transition-all duration-300 focus:border-[#C8A98B] focus:ring-2 focus:ring-[#C8A98B]/30 dark:bg-[#201C1A] dark:text-[#F2E9DE] dark:placeholder-[#C7B6A6]/70 dark:focus:border-[#C8A98B] dark:focus:ring-[#C8A98B]/25';

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
    <ul className="m-0 list-none divide-y divide-[#201C1A]/10 p-0 dark:divide-[#F2E9DE]/10">
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
                className="h-[88px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-[#201C1A]/8 bg-[#E6D9C9] dark:border-[#F2E9DE]/10 dark:bg-[#3B302B]"
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
                      className="font-serif text-[17px] font-medium leading-snug text-[#201C1A] no-underline transition-colors hover:text-[#8D7667] dark:text-[#F2E9DE] dark:hover:text-[#C8A98B]"
                    >
                      {item.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => cart.removeItem(item.id, item.size, item.color)}
                      aria-label={`Remove ${item.name} from bag`}
                      className="shrink-0 rounded-full p-1 text-[#6B5B51] transition-colors hover:bg-[#201C1A]/6 hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:bg-[#F2E9DE]/10 dark:hover:text-[#F2E9DE]"
                    >
                      <Trash2 className="h-3.5 w-3.5 stroke-[1.6]" />
                    </button>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px]">
                    {item.color && (
                      <span className="font-medium uppercase tracking-[0.14em] text-[#8D7667] dark:text-[#C8A98B]">
                        {item.color}
                      </span>
                    )}
                    {item.color && item.size && (
                      <span aria-hidden="true" className="text-[#C8A98B]">
                        ·
                      </span>
                    )}
                    {item.size && (
                      <span className="text-[#5E4E45] dark:text-[#C7B6A6]">{item.size}</span>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-xl border border-[#201C1A]/18 bg-[#F2E9DE] dark:border-[#F2E9DE]/20 dark:bg-[#191513]">
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(item.id, item.quantity - 1, item.size, item.color)
                      }
                      aria-label={`Decrease quantity for ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center text-[#201C1A] transition-colors hover:bg-[#E6D9C9] dark:text-[#F2E9DE] dark:hover:bg-[#F2E9DE]/12"
                    >
                      <Minus className="h-3 w-3 stroke-[1.7]" />
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={prefersReducedMotion ? false : { scale: 0.86, opacity: 0.65 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-7 text-center text-xs font-semibold tabular-nums text-[#201C1A] dark:text-[#F2E9DE]"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(item.id, item.quantity + 1, item.size, item.color)
                      }
                      aria-label={`Increase quantity for ${item.name}`}
                      className="flex h-7 w-7 items-center justify-center text-[#201C1A] transition-colors hover:bg-[#E6D9C9] dark:text-[#F2E9DE] dark:hover:bg-[#F2E9DE]/12"
                    >
                      <Plus className="h-3 w-3 stroke-[1.7]" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="block text-[14px] font-semibold tabular-nums text-[#201C1A] dark:text-[#F2E9DE]">
                      {item.showPrice === false
                        ? 'Upon Inquiry'
                        : formatLoomePrice(item.price * item.quantity, storeCurrency)}
                    </span>
                    {item.showPrice !== false && item.quantity > 1 && (
                      <span className="block text-[11px] tabular-nums text-[#6B5B51] dark:text-[#C7B6A6]">
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
    <div className="mt-4 space-y-4 border-t border-[#3B302B]/14 pt-4">
      {/* Merchant-Configurable White-Glove Delivery Progress */}
      {hasDeliveryThreshold && (
        <div className="rounded-xl border border-[#3B302B]/12 bg-[#F2E9DE] px-3.5 py-3">
          <div className="flex items-center justify-between gap-2 text-[11.5px] font-medium text-[#3B302B]">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 shrink-0 stroke-[1.6] text-[#8D7667]" />
              {deliveryRemaining === 0
                ? 'Complimentary white-glove delivery unlocked'
                : `Add ${formatLoomePrice(deliveryRemaining, storeCurrency)} for complimentary delivery`}
            </span>
            <span className="tabular-nums font-semibold text-[#8D7667]">{deliveryProgress}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E6D9C9]">
            <motion.div
              initial={false}
              animate={{ width: `${deliveryProgress}%` }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              className="h-full rounded-full bg-[#C8A98B]"
            />
          </div>
        </div>
      )}

      {/* Price Breakdown Inset */}
      <div className="rounded-xl bg-[#F2E9DE]/75 px-4 py-4">
        <div className="space-y-2 text-[13px]">
          <div className="flex items-center justify-between text-[#5E4E45]">
            <span>
              Items ({cart.totalCount})
            </span>
            <span className="font-semibold tabular-nums text-[#201C1A]">
              {subtotalDisplay}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#5E4E45]">
            <span>Atelier Delivery</span>
            <span className="font-semibold text-[#201C1A]">
              {hasDeliveryThreshold && deliveryRemaining === 0
                ? 'Complimentary'
                : 'Confirmed via Concierge'}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between border-t border-[#3B302B]/14 pt-3.5">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#201C1A]">
              Estimated Subtotal
            </span>
            <span className="mt-0.5 block text-[11px] text-[#5E4E45]">
              Currency: {storeCurrency}
            </span>
          </div>
          <span className="font-heading text-[28px] font-extrabold leading-none tabular-nums text-[#201C1A]">
            {subtotalDisplay}
          </span>
        </div>
      </div>

      <p className="m-0 text-[12px] leading-relaxed text-[#5E4E45]">
        No online payment is charged here. Final availability, custom drapery sizing, and delivery timing are confirmed with our atelier concierge on WhatsApp.
      </p>
    </div>
  );

  return (
    <div
      data-preview-page-key="checkout"
      className="loome-surface-cream min-h-[75vh] w-full bg-[#F2E9DE] text-[#201C1A]"
    >
      {/* Compact Editorial Breadcrumb Strip */}
      <div className="border-b border-[#201C1A]/10 bg-[#FAF5EE]/95 dark:border-[#F2E9DE]/10 dark:bg-[#201C1A]">
        <nav className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6] sm:px-8 lg:px-12">
          <a
            href={withBasePath('/')}
            data-preview-static="checkout-breadcrumb-home"
            className="text-[#5E4E45] no-underline transition-colors hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]"
          >
            Home
          </a>
          <span aria-hidden="true" className="text-[#C8A98B]">
            /
          </span>
          {hasShopPage && (
            <>
              <a
                href={withBasePath('/shop')}
                data-target-page="shop"
                data-preview-static="checkout-breadcrumb-shop"
                className="text-[#5E4E45] no-underline transition-colors hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]"
              >
                Shop
              </a>
              <span aria-hidden="true" className="text-[#C8A98B]">
                /
              </span>
            </>
          )}
          <span
            aria-current="page"
            data-preview-static="checkout-breadcrumb-current"
            className="font-medium text-[#201C1A] dark:text-[#F2E9DE]"
          >
            Private Checkout
          </span>
        </nav>
      </div>

      {/* Balanced Editorial Ivory / Champagne Checkout Header */}
      <section
        data-design-section="checkout-hero"
        className="border-b border-[#201C1A]/10 bg-gradient-to-b from-[#E6D9C9]/85 via-[#F2E9DE] to-[#F2E9DE] dark:border-[#F2E9DE]/10 dark:from-[#2B2320] dark:via-[#201C1A] dark:to-[#191513]"
      >
        <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-11">
          <LuxuryReveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="checkoutPage.eyebrow"
                  defaultValue={eyebrow}
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
                as="h1"
                data-preview-field-path="checkoutPage.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(2.2rem, 3.9vw, 3.35rem)"
                weight={300}
                lineHeight={1.06}
                letterSpacing="-0.02em"
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
                lineHeight={1.72}
                color="muted"
                className="m-0"
              />
            </div>
          </LuxuryReveal>

          {/* Compact 3-Step Private Checkout Cadence */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#201C1A]/10 pt-4 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#5E4E45] dark:border-[#F2E9DE]/10 dark:text-[#C7B6A6]">
            <span
              data-preview-static="checkout-step-1"
              className="inline-flex items-center gap-2 text-[#201C1A] dark:text-[#F2E9DE]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#C8A98B] text-[9px] text-[#8D7667] dark:text-[#C8A98B]">
                1
              </span>
              Review Bag
            </span>
            <span aria-hidden="true" className="text-[#C8A98B]">
              /
            </span>
            <span
              data-preview-static="checkout-step-2"
              className="inline-flex items-center gap-2 text-[#201C1A] dark:text-[#F2E9DE]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#C8A98B] text-[9px] text-[#8D7667] dark:text-[#C8A98B]">
                2
              </span>
              Delivery Details
            </span>
            <span aria-hidden="true" className="text-[#C8A98B]">
              /
            </span>
            <span
              data-preview-static="checkout-step-3"
              className="inline-flex items-center gap-2 text-[#8D7667] dark:text-[#C8A98B]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#8D7667]/50 text-[9px]">
                3
              </span>
              WhatsApp Concierge
            </span>
          </div>
        </div>
      </section>

      {/* Main Checkout Content */}
      <section
        data-design-section="checkout-main"
        className="mx-auto max-w-[1320px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
      >
        {!hasItems ? (
          /* Refined Empty-Cart State */
          <LuxuryReveal className="mx-auto max-w-xl rounded-xl border border-[#201C1A]/12 border-t-2 border-t-[#C8A98B] bg-[#FAF5EE] px-6 py-12 text-center shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F2E9DE]/12 dark:border-t-[#C8A98B] dark:bg-[#2B2320] sm:px-10 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C8A98B]/50 bg-[#F2E9DE] text-[#8D7667] dark:bg-[#191513] dark:text-[#C8A98B]">
              <ShoppingBag className="h-5 w-5 stroke-[1.4]" />
            </div>

            <div className="mt-5">
              <EditableText
                as="h2"
                data-preview-field-path="checkoutPage.emptyHeading"
                defaultValue={emptyHeading}
                fontFamily="heading"
                size="clamp(1.75rem, 3vw, 2.35rem)"
                weight={300}
                lineHeight={1.15}
                color="heading"
                align="center"
                className="m-0"
              />
            </div>

            <div className="mx-auto mt-3 max-w-md">
              <EditableText
                as="p"
                data-preview-field-path="checkoutPage.emptyDescription"
                defaultValue={emptyDescription}
                fontFamily="body"
                size="0.9rem"
                lineHeight={1.75}
                color="muted"
                align="center"
                className="m-0"
              />
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
          <div className="space-y-6">
            {/* Mobile-Friendly Collapsible Order Summary */}
            <div className="rounded-xl border border-[#201C1A]/14 border-t-2 border-t-[#C8A98B] bg-[#FAF5EE] shadow-[0_8px_24px_rgba(38,41,35,0.04)] dark:border-[#F2E9DE]/14 dark:border-t-[#C8A98B] dark:bg-[#2B2320] lg:hidden">
              <button
                type="button"
                onClick={() => setMobileSummaryOpen((prev) => !prev)}
                aria-expanded={mobileSummaryOpen}
                className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-5 py-4 text-left text-[#201C1A] dark:text-[#F2E9DE]"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 stroke-[1.6] text-[#8D7667] dark:text-[#C8A98B]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                    {mobileSummaryOpen ? 'Hide' : 'Show'} Order Summary ({cart.totalCount})
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-serif text-xl font-medium tabular-nums">
                    {subtotalDisplay}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 stroke-[1.6] text-[#8D7667] transition-transform duration-300 dark:text-[#C8A98B] ${
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
                    transition={{ duration: 0.32, ease: LUXURY_EASE }}
                    className="overflow-hidden border-t border-[#201C1A]/10 dark:border-[#F2E9DE]/10"
                  >
                    <div className="px-5 pb-5">
                      {renderOrderItemsList(true)}
                      {renderTotalsBlock()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-12">
              {/* Left Column: Customer & Delivery Form */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="rounded-xl border border-[#201C1A]/12 bg-[#FAF5EE] p-6 shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F2E9DE]/12 dark:bg-[#2B2320] sm:p-8 lg:p-9"
                >
                  <LuxuryStagger staggerDelay={0.06} className="space-y-7">
                    {/* Section 1: Client Details */}
                    <LuxuryStaggerItem y={12}>
                      <div className="flex items-center justify-between border-b border-[#201C1A]/10 pb-3 dark:border-[#F2E9DE]/10">
                        <h2 className="m-0 font-serif text-[23px] font-medium tracking-wide text-[#201C1A] dark:text-[#F2E9DE]">
                          01. Client Details
                        </h2>
                        <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#8D7667] dark:text-[#C8A98B]">
                          * Required
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="checkout-fullName"
                            className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3B302B] dark:text-[#F2E9DE]"
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
                            className={`${INPUT_BASE_CLASS} ${
                              errors.fullName
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
                            placeholder="+1 (212) 555-0194"
                            aria-invalid={Boolean(errors.phone)}
                            className={`${INPUT_BASE_CLASS} ${
                              errors.phone
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
                            placeholder="client@example.com"
                            aria-invalid={Boolean(errors.email)}
                            className={`${INPUT_BASE_CLASS} ${
                              errors.email
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
                      <div className="border-b border-[#201C1A]/10 pb-3 dark:border-[#F2E9DE]/10">
                        <h2 className="m-0 font-serif text-[23px] font-medium tracking-wide text-[#201C1A] dark:text-[#F2E9DE]">
                          02. Delivery Destination
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
                            placeholder="48 Mercer Street, Apartment 4B"
                            aria-invalid={Boolean(errors.address)}
                            className={`${INPUT_BASE_CLASS} ${
                              errors.address
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
                            className={`${INPUT_BASE_CLASS} ${
                              errors.city
                                ? 'border-[#B04A38] bg-[#FDF7F5] focus:border-[#B04A38] focus:ring-[#B04A38]/20 dark:border-[#D98272]'
                                : 'border-[#201C1A]/22 dark:border-[#F2E9DE]/22'
                            }`}
                          />
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
                            placeholder="10013"
                            className={`${INPUT_BASE_CLASS} border-[#201C1A]/22 dark:border-[#F2E9DE]/22`}
                          />
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
                        className={`group flex h-[54px] w-full items-center justify-center gap-3 rounded-[11px] px-8 text-[12px] font-semibold uppercase tracking-[0.2em] shadow-[0_10px_26px_rgba(32,28,26,0.16)] transition-all duration-300 ${
                          hasConfiguredWhatsapp
                            ? 'bg-[#201C1A] text-[#F2E9DE] hover:bg-[#3B302B] hover:shadow-[0_12px_28px_rgba(32,28,26,0.24)]'
                            : 'cursor-not-allowed bg-[#201C1A]/25 text-[#201C1A]/55 shadow-none'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4 stroke-[1.6]" />
                        <span>{submitLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-1" />
                      </motion.button>

                      <p className="mt-3 mb-0 text-center text-[12px] leading-relaxed text-[#5E4E45] dark:text-[#C7B6A6]">
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
                            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#C8A98B]/60 bg-[#F2E9DE] px-4 py-3 text-xs text-[#201C1A] dark:border-[#C8A98B]/40 dark:bg-[#201C1A] dark:text-[#F2E9DE]"
                          >
                            <span>Your browser blocked opening WhatsApp automatically.</span>
                            <a
                              href={blockedFallbackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setBlockedFallbackUrl(null)}
                              className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.16em] text-[#8D7667] underline decoration-[#C8A98B] underline-offset-4 transition-colors hover:text-[#201C1A] dark:text-[#C8A98B] dark:hover:text-[#F2E9DE]"
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
                  className="rounded-xl border border-[#201C1A]/12 border-t-2 border-t-[#C8A98B] bg-[#FAF5EE] p-6 shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F2E9DE]/12 dark:border-t-[#C8A98B] dark:bg-[#2B2320] xl:p-7"
                >
                  <div className="flex items-baseline justify-between border-b border-[#201C1A]/10 pb-3.5 dark:border-[#F2E9DE]/10">
                    <div>
                      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]">
                        Curated Selection
                      </p>
                      <h2 className="mt-1 mb-0 font-serif text-[24px] font-medium tracking-wide text-[#201C1A] dark:text-[#F2E9DE]">
                        Order Summary
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#E6D9C9] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#5E4E45] dark:bg-[#191513] dark:text-[#C7B6A6]">
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
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5E4E45] no-underline transition-colors hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]"
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
      <section className="border-t border-[#201C1A]/10 bg-[#E6D9C9]/70 py-8 dark:border-[#F2E9DE]/10 dark:bg-[#2A2320] sm:py-10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 sm:px-8 md:grid-cols-3 lg:px-12">
          <div className="md:col-span-2">
            <p
              data-preview-static="checkout-assurance-eyebrow"
              className="m-0 inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]"
            >
              <ShieldCheck className="h-3.5 w-3.5 stroke-[1.6]" />
              Atelier Delivery &amp; Concierge Policy
            </p>
            <div className="mt-2 max-w-2xl">
              <EditableText
                as="p"
                data-preview-field-path="checkoutPage.deliveryNote"
                defaultValue={deliveryNote}
                fontFamily="body"
                size="0.875rem"
                lineHeight={1.75}
                color="muted"
                className="m-0"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-1.5 border-t border-[#201C1A]/12 pt-4 md:border-l md:border-t-0 md:pl-7 md:pt-0 dark:border-[#F2E9DE]/12">
            <p
              data-preview-static="checkout-currency-label"
              className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#3B302B] dark:text-[#F2E9DE]"
            >
              Pricing Currency · {storeCurrency}
            </p>
            <p
              data-preview-static="checkout-handoff-note"
              className="m-0 text-[12.5px] leading-relaxed text-[#5E4E45] dark:text-[#C7B6A6]"
            >
              Direct WhatsApp order handoff with personal sizing and dispatch confirmation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
