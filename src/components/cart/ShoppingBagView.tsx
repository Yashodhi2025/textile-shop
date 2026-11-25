'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
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
} from '@/components/motion/LuxuryReveal';

export default function ShoppingBagView() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const cart = useCart();
  const prefersReducedMotion = useReducedMotion();

  const content = contentObject(siteData.content);
  const cartPage = contentObject(content.cartPage);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'cart',
        'checkout',
        'about_us',
        'services',
        'contact',
      ];
  const hasShopPage = requiredPages.includes('shop');
  const hasServicesPage = requiredPages.includes('services');

  const catalogProducts = useMemo(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  // Dynamic merchant currency & configurable free-delivery threshold
  const storeCurrency = resolveLoomeCurrency(siteData, catalogProducts[0]?.currency);
  const freeDeliveryThreshold = resolveFreeDeliveryThreshold(siteData);
  const hasDeliveryThreshold = freeDeliveryThreshold > 0;

  // Editable page copy
  const eyebrow = contentText(cartPage.eyebrow) || 'THE ATELIER BAG';
  const heading = contentText(cartPage.heading) || 'Your Shopping Bag';
  const intro =
    contentText(cartPage.intro) ||
    'Review your curated textile selection, refine quantities, and proceed smoothly to our private WhatsApp checkout.';
  const deliveryNote =
    contentText(cartPage.deliveryNote) ||
    'Complimentary white-glove delivery on qualifying orders. Custom drapery measurements, fabric availability, and dispatch timing are confirmed personally with our atelier concierge.';
  const checkoutLabel = contentText(cartPage.checkoutLabel) || 'Proceed to Checkout';
  const emptyHeading =
    contentText(cartPage.emptyHeading) || 'Your shopping bag is currently empty';
  const emptyDescription =
    contentText(cartPage.emptyDescription) ||
    'Discover our Belgian flax drapery, stonewashed European linen bedding, and heirloom fabrics by the yard to begin curating your rooms.';

  const hasItems = cart.items.length > 0;
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

  const continueHref = withBasePath(hasShopPage ? '/shop/' : '/');

  return (
    <div
      data-preview-page-key="cart"
      className="loome-surface-cream min-h-[75vh] w-full bg-[#F2E9DE] text-[#201C1A]"
    >
      {/* Compact Editorial Breadcrumb Strip */}
      <div className="border-b border-[#201C1A]/10 bg-[#FAF5EE]/95 dark:border-[#F2E9DE]/10 dark:bg-[#201C1A]">
        <nav className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6] sm:px-8 lg:px-12">
          <a
            href={withBasePath('/')}
            data-preview-static="cart-breadcrumb-home"
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
                data-preview-static="cart-breadcrumb-shop"
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
            data-preview-static="cart-breadcrumb-current"
            className="font-medium text-[#201C1A] dark:text-[#F2E9DE]"
          >
            Shopping Bag
          </span>
        </nav>
      </div>

      {/* Editorial Ivory / Champagne Shopping Bag Header */}
      <section
        data-design-section="cart-hero"
        className="border-b border-[#201C1A]/10 bg-gradient-to-b from-[#E6D9C9]/85 via-[#F2E9DE] to-[#F2E9DE] dark:border-[#F2E9DE]/10 dark:from-[#2B2320] dark:via-[#201C1A] dark:to-[#191513]"
      >
        <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-11">
          <LuxuryReveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="cartPage.eyebrow"
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
                data-preview-field-path="cartPage.heading"
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
                data-preview-field-path="cartPage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.9rem"
                lineHeight={1.72}
                color="muted"
                className="m-0"
              />
            </div>
          </LuxuryReveal>

          {/* Compact 3-Step Atelier Flow Indicator */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#201C1A]/10 pt-4 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#5E4E45] dark:border-[#F2E9DE]/10 dark:text-[#C7B6A6]">
            <span
              data-preview-static="cart-step-1"
              className="inline-flex items-center gap-2 font-semibold text-[#201C1A] dark:text-[#F2E9DE]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#201C1A] text-[9px] text-[#F2E9DE] dark:bg-[#C8A98B] dark:text-[#201C1A]">
                1
              </span>
              Shopping Bag
            </span>
            <span aria-hidden="true" className="text-[#C8A98B]">
              /
            </span>
            <span data-preview-static="cart-step-2" className="inline-flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#201C1A]/25 text-[9px] dark:border-[#F2E9DE]/25">
                2
              </span>
              Private Checkout
            </span>
            <span aria-hidden="true" className="text-[#C8A98B]">
              /
            </span>
            <span data-preview-static="cart-step-3" className="inline-flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#201C1A]/25 text-[9px] dark:border-[#F2E9DE]/25">
                3
              </span>
              WhatsApp Concierge
            </span>
          </div>
        </div>
      </section>

      {/* Main Shopping Bag Content */}
      <section
        data-design-section="cart-main"
        className="mx-auto max-w-[1320px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
      >
        {!hasItems ? (
          /* Refined Editorial Empty-Cart State */
          <LuxuryReveal className="mx-auto max-w-xl rounded-xl border border-[#201C1A]/12 border-t-2 border-t-[#C8A98B] bg-[#FAF5EE] px-6 py-12 text-center shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F2E9DE]/12 dark:border-t-[#C8A98B] dark:bg-[#2B2320] sm:px-10 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C8A98B]/50 bg-[#F2E9DE] text-[#8D7667] dark:bg-[#191513] dark:text-[#C8A98B]">
              <ShoppingBag className="h-5 w-5 stroke-[1.4]" />
            </div>

            <div className="mt-5">
              <EditableText
                as="h2"
                data-preview-field-path="cartPage.emptyHeading"
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
                data-preview-field-path="cartPage.emptyDescription"
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
                href={continueHref}
                data-target-page={hasShopPage ? 'shop' : undefined}
                data-preview-static="cart-empty-continue-shopping"
                className="group loome-btn-primary no-underline"
              >
                Continue Shopping
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              {hasServicesPage && (
                <a
                  href={withBasePath('/services')}
                  data-target-page="services"
                  data-preview-static="cart-empty-atelier-services"
                  className="loome-btn-outline no-underline"
                >
                  Atelier Services
                </a>
              )}
            </div>
          </LuxuryReveal>
        ) : (
          /* Active Two-Column Shopping Bag Layout */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-12">
            {/* Left Column: Curated Cart Items List */}
            <div className="lg:col-span-8">
              <LuxuryReveal className="rounded-xl border border-[#201C1A]/12 bg-[#FAF5EE] p-5 shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F2E9DE]/12 dark:bg-[#2B2320] sm:p-7 lg:p-8">
                {/* Table Header */}
                <div className="flex items-center justify-between border-b border-[#201C1A]/12 pb-3.5 dark:border-[#F2E9DE]/12">
                  <div className="flex items-baseline gap-3">
                    <h2 className="m-0 font-serif text-[23px] font-medium tracking-wide text-[#201C1A] dark:text-[#F2E9DE]">
                      Selected Pieces
                    </h2>
                    <span className="rounded-full bg-[#E6D9C9] px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#5E4E45] dark:bg-[#191513] dark:text-[#C7B6A6]">
                      {cart.totalCount} {cart.totalCount === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>

                  <div className="hidden items-center gap-12 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#6B5B51] dark:text-[#C7B6A6] sm:flex">
                    <span>Quantity</span>
                    <span className="w-24 text-right">Line Total</span>
                  </div>
                </div>

                {/* Live Cart Rows */}
                <ul className="m-0 list-none divide-y divide-[#201C1A]/10 p-0 dark:divide-[#F2E9DE]/10">
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => {
                      const itemKey = `${item.id}-${item.color || ''}-${item.size || ''}`;
                      const detailHref = platformProductDetailHref(item.id);
                      const hasSavings =
                        item.showPrice !== false &&
                        typeof item.originalPrice === 'number' &&
                        item.originalPrice > item.price;

                      return (
                        <motion.li
                          key={itemKey}
                          layout={!prefersReducedMotion}
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: LUXURY_EASE }}
                          className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:gap-6"
                        >
                          {/* Product Thumbnail + Details */}
                          <div className="flex min-w-0 flex-1 gap-4">
                            <a
                              href={detailHref}
                              className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-[#201C1A]/10 bg-[#E6D9C9] dark:border-[#F2E9DE]/10 dark:bg-[#3B302B]"
                            >
                              <img
                                src={withBasePath(item.image || '/images/prod-curtain-ivory.jpg')}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-700 ease-luxury hover:scale-105"
                              />
                            </a>

                            <div className="flex min-w-0 flex-1 flex-col justify-center">
                              <a
                                href={detailHref}
                                className="font-serif text-[20px] font-medium leading-snug text-[#201C1A] no-underline transition-colors hover:text-[#8D7667] dark:text-[#F2E9DE] dark:hover:text-[#C8A98B]"
                              >
                                {item.name}
                              </a>

                              {/* Selected Color & Size */}
                              {(item.color || item.size) && (
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                  {item.color && (
                                    <span className="font-medium uppercase tracking-[0.14em] text-[#8D7667] dark:text-[#C8A98B]">
                                      Tone: {item.color}
                                    </span>
                                  )}
                                  {item.color && item.size && (
                                    <span aria-hidden="true" className="text-[#C8A98B]">
                                      ·
                                    </span>
                                  )}
                                  {item.size && (
                                    <span className="text-[#5E4E45] dark:text-[#C7B6A6]">
                                      Size: {item.size}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Unit Price */}
                              <div className="mt-1.5 flex items-baseline gap-2 text-xs">
                                <span className="font-medium tabular-nums text-[#3B302B] dark:text-[#F2E9DE]">
                                  {item.showPrice === false
                                    ? 'Price Upon Inquiry'
                                    : `${formatLoomePrice(item.price, storeCurrency)} each`}
                                </span>
                                {hasSavings && item.originalPrice && (
                                  <span className="tabular-nums text-[#6B5B51] line-through dark:text-[#C7B6A6]">
                                    {formatLoomePrice(item.originalPrice, storeCurrency)}
                                  </span>
                                )}
                              </div>

                              {/* Subtle Remove Action */}
                              <div className="mt-2.5">
                                <button
                                  type="button"
                                  onClick={() => cart.removeItem(item.id, item.size, item.color)}
                                  aria-label={`Remove ${item.name} from bag`}
                                  className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.16em] text-[#6B5B51] transition-colors hover:text-[#9E3F2E] dark:text-[#C7B6A6] dark:hover:text-[#EAA597]"
                                >
                                  <Trash2 className="h-3.5 w-3.5 stroke-[1.6]" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Stepper + Line Total */}
                          <div className="flex items-center justify-between gap-6 border-t border-[#201C1A]/8 pt-3.5 sm:justify-end sm:border-t-0 sm:pt-0 dark:border-[#F2E9DE]/8">
                            <div className="inline-flex items-center rounded-xl border border-[#201C1A]/18 bg-[#F2E9DE] dark:border-[#F2E9DE]/20 dark:bg-[#191513]">
                              <button
                                type="button"
                                onClick={() =>
                                  cart.updateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                    item.size,
                                    item.color,
                                  )
                                }
                                aria-label={`Decrease quantity for ${item.name}`}
                                className="flex h-8 w-8 items-center justify-center text-[#201C1A] transition-colors hover:bg-[#E6D9C9] dark:text-[#F2E9DE] dark:hover:bg-[#F2E9DE]/12"
                              >
                                <Minus className="h-3.5 w-3.5 stroke-[1.7]" />
                              </button>
                              <motion.span
                                key={item.quantity}
                                initial={prefersReducedMotion ? false : { scale: 0.86, opacity: 0.65 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="w-9 text-center text-sm font-semibold tabular-nums text-[#201C1A] dark:text-[#F2E9DE]"
                              >
                                {item.quantity}
                              </motion.span>
                              <button
                                type="button"
                                onClick={() =>
                                  cart.updateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                    item.size,
                                    item.color,
                                  )
                                }
                                aria-label={`Increase quantity for ${item.name}`}
                                className="flex h-8 w-8 items-center justify-center text-[#201C1A] transition-colors hover:bg-[#E6D9C9] dark:text-[#F2E9DE] dark:hover:bg-[#F2E9DE]/12"
                              >
                                <Plus className="h-3.5 w-3.5 stroke-[1.7]" />
                              </button>
                            </div>

                            <div className="w-24 text-right">
                              <span className="text-[16px] font-semibold tabular-nums text-[#201C1A] dark:text-[#F2E9DE]">
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

                {/* Bag Card Footer: Continue Shopping */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#201C1A]/10 pt-5 dark:border-[#F2E9DE]/10">
                  <a
                    href={continueHref}
                    data-target-page={hasShopPage ? 'shop' : undefined}
                    className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5E4E45] no-underline transition-colors hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:-translate-x-1" />
                    Continue Shopping
                  </a>

                  <button
                    type="button"
                    onClick={() => cart.clearCart()}
                    className="border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6B5B51] underline decoration-[#201C1A]/25 underline-offset-4 transition-colors hover:text-[#9E3F2E] dark:text-[#C7B6A6] dark:hover:text-[#EAA597]"
                  >
                    Clear Bag
                  </button>
                </div>
              </LuxuryReveal>
            </div>

            {/* Right Column: Sticky Refined Order Summary */}
            <aside className="lg:sticky lg:top-24 lg:col-span-4">
              <LuxuryReveal
                delay={0.06}
                className="rounded-xl border border-[#201C1A]/12 border-t-2 border-t-[#C8A98B] bg-[#FAF5EE] p-6 shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F2E9DE]/12 dark:border-t-[#C8A98B] dark:bg-[#2B2320] xl:p-7"
              >
                <div className="border-b border-[#201C1A]/10 pb-3.5 dark:border-[#F2E9DE]/10">
                  <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]">
                    Atelier Estimate
                  </p>
                  <h2 className="mt-1 mb-0 font-serif text-[24px] font-medium tracking-wide text-[#201C1A] dark:text-[#F2E9DE]">
                    Order Summary
                  </h2>
                </div>

                {/* Merchant-Configurable White-Glove Delivery Threshold */}
                {hasDeliveryThreshold && (
                  <div className="mt-4 rounded-xl border border-[#3B302B]/12 bg-[#F2E9DE] px-3.5 py-3">
                    <div className="flex items-center justify-between gap-2 text-[11.5px] font-medium text-[#3B302B]">
                      <span className="inline-flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 shrink-0 stroke-[1.6] text-[#8D7667]" />
                        {deliveryRemaining === 0
                          ? 'Complimentary white-glove delivery unlocked'
                          : `Add ${formatLoomePrice(deliveryRemaining, storeCurrency)} for complimentary delivery`}
                      </span>
                      <span className="tabular-nums font-semibold text-[#8D7667]">
                        {deliveryProgress}%
                      </span>
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

                {/* Subtotal Breakdown */}
                <div className="mt-4 rounded-xl bg-[#F2E9DE]/75 px-4 py-4">
                  <div className="space-y-2 text-[13px]">
                    <div className="flex items-center justify-between text-[#5E4E45]">
                      <span>Items ({cart.totalCount})</span>
                      <span className="font-semibold tabular-nums text-[#201C1A]">
                        {subtotalDisplay}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#5E4E45]">
                      <span>Atelier Delivery</span>
                      <span className="font-semibold text-[#201C1A]">
                        {hasDeliveryThreshold && deliveryRemaining === 0
                          ? 'Complimentary'
                          : 'Confirmed at Checkout'}
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

                {/* Primary Checkout CTA + Continue Shopping */}
                <div className="mt-5 space-y-2.5">
                  <motion.a
                    href={withBasePath('/checkout/')}
                    whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    className="group loome-btn-espresso flex h-[52px] w-full no-underline"
                  >
                    <span>{checkoutLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.a>

                  <a
                    href={continueHref}
                    data-target-page={hasShopPage ? 'shop' : undefined}
                    className="loome-btn-outline w-full text-center no-underline"
                  >
                    Continue Shopping
                  </a>
                </div>

                <p className="mt-4 mb-0 text-center text-[11.5px] leading-relaxed text-[#5E4E45] dark:text-[#C7B6A6]">
                  Delivery details and WhatsApp concierge handoff happen on the next step.
                </p>
              </LuxuryReveal>
            </aside>
          </div>
        )}
      </section>

      {/* Always-Mounted Atelier Delivery & Concierge Assurance Band */}
      <section className="border-t border-[#201C1A]/10 bg-[#E6D9C9]/70 py-8 dark:border-[#F2E9DE]/10 dark:bg-[#2A2320] sm:py-10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 sm:px-8 md:grid-cols-3 lg:px-12">
          <div className="md:col-span-2">
            <p
              data-preview-static="cart-assurance-eyebrow"
              className="m-0 inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]"
            >
              <ShieldCheck className="h-3.5 w-3.5 stroke-[1.6]" />
              Atelier Delivery &amp; Care Assurance
            </p>
            <div className="mt-2 max-w-2xl">
              <EditableText
                as="p"
                data-preview-field-path="cartPage.deliveryNote"
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
              data-preview-static="cart-currency-label"
              className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#3B302B] dark:text-[#F2E9DE]"
            >
              Pricing Currency · {storeCurrency}
            </p>
            <p
              data-preview-static="cart-handoff-note"
              className="m-0 text-[12.5px] leading-relaxed text-[#5E4E45] dark:text-[#C7B6A6]"
            >
              Saved automatically in your browser until you finalize via private checkout.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
