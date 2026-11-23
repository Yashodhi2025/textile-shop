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
import { formatLoomePrice, normalizeLoomeProduct } from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import {
  LUXURY_EASE,
  LuxuryHairline,
  LuxuryReveal,
} from '@/components/motion/LuxuryReveal';

const FREE_DELIVERY_THRESHOLD = 250;

export default function ShoppingBagView() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const cart = useCart();
  const prefersReducedMotion = useReducedMotion();

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const cartPage = contentObject(content.cartPage);
  const shopMeta = contentObject((siteData as Record<string, unknown>).shop);
  const merchantMeta = contentObject((siteData as Record<string, unknown>).merchant);

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

  // Dynamic merchant currency resolution (never hardcoded when merchant currency is set)
  const storeCurrency =
    contentText(shopMeta.currency) ||
    contentText(common.currency) ||
    contentText(merchantMeta.currency) ||
    catalogProducts[0]?.currency ||
    'USD';

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
  const deliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - cart.subtotal);
  const deliveryProgress = Math.min(
    100,
    Math.round((cart.subtotal / FREE_DELIVERY_THRESHOLD) * 100),
  );

  const continueHref = withBasePath(hasShopPage ? '/shop/' : '/');

  return (
    <div
      data-preview-page-key="cart"
      className="min-h-[75vh] w-full bg-[#F6F3EC] text-[#22251F] dark:bg-[#151713] dark:text-[#F8F6F1]"
    >
      {/* Compact Editorial Breadcrumb Strip */}
      <div className="border-b border-[#262923]/10 bg-[#FAF8F4]/95 dark:border-[#F8F6F1]/10 dark:bg-[#171915]">
        <nav className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#55594F] dark:text-[#B6B8AE] sm:px-8 lg:px-12">
          <a
            href={withBasePath('/')}
            data-preview-static="cart-breadcrumb-home"
            className="text-[#55594F] no-underline transition-colors hover:text-[#22251F] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
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
                data-preview-static="cart-breadcrumb-shop"
                className="text-[#55594F] no-underline transition-colors hover:text-[#22251F] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
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
            data-preview-static="cart-breadcrumb-current"
            className="font-medium text-[#22251F] dark:text-[#F8F6F1]"
          >
            Shopping Bag
          </span>
        </nav>
      </div>

      {/* Editorial Ivory / Champagne Shopping Bag Header */}
      <section
        data-design-section="cart-hero"
        className="border-b border-[#262923]/10 bg-gradient-to-b from-[#F1EBE0]/85 via-[#F7F4ED] to-[#F6F3EC] dark:border-[#F8F6F1]/10 dark:from-[#1E211B] dark:via-[#171915] dark:to-[#151713]"
      >
        <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-11">
          <LuxuryReveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[#B59B79]" />
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
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#262923]/10 pt-4 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#4F5349] dark:border-[#F8F6F1]/10 dark:text-[#C5C7BE]">
            <span
              data-preview-static="cart-step-1"
              className="inline-flex items-center gap-2 font-semibold text-[#22251F] dark:text-[#F8F6F1]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#262923] text-[9px] text-[#F8F6F1] dark:bg-[#B59B79] dark:text-[#171915]">
                1
              </span>
              Shopping Bag
            </span>
            <span aria-hidden="true" className="text-[#B59B79]">
              /
            </span>
            <span data-preview-static="cart-step-2" className="inline-flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#262923]/25 text-[9px] dark:border-[#F8F6F1]/25">
                2
              </span>
              Private Checkout
            </span>
            <span aria-hidden="true" className="text-[#B59B79]">
              /
            </span>
            <span data-preview-static="cart-step-3" className="inline-flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#262923]/25 text-[9px] dark:border-[#F8F6F1]/25">
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
          <LuxuryReveal className="mx-auto max-w-xl rounded-[2px] border border-[#262923]/12 border-t-2 border-t-[#B59B79] bg-[#FEFDFB] px-6 py-12 text-center shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F8F6F1]/12 dark:border-t-[#B59B79] dark:bg-[#1E211B] sm:px-10 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#B59B79]/50 bg-[#F6F3EC] text-[#9E825E] dark:bg-[#151713] dark:text-[#C9B292]">
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
              <LuxuryReveal className="rounded-[2px] border border-[#262923]/12 bg-[#FEFDFB] p-5 shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F8F6F1]/12 dark:bg-[#1E211B] sm:p-7 lg:p-8">
                {/* Table Header */}
                <div className="flex items-center justify-between border-b border-[#262923]/12 pb-3.5 dark:border-[#F8F6F1]/12">
                  <div className="flex items-baseline gap-3">
                    <h2 className="m-0 font-serif text-[23px] font-medium tracking-wide text-[#22251F] dark:text-[#F8F6F1]">
                      Selected Pieces
                    </h2>
                    <span className="rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#4F5349] dark:bg-[#151713] dark:text-[#C5C7BE]">
                      {cart.totalCount} {cart.totalCount === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>

                  <div className="hidden items-center gap-12 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#5E6257] dark:text-[#A9ACA2] sm:flex">
                    <span>Quantity</span>
                    <span className="w-24 text-right">Line Total</span>
                  </div>
                </div>

                {/* Live Cart Rows */}
                <ul className="m-0 list-none divide-y divide-[#262923]/10 p-0 dark:divide-[#F8F6F1]/10">
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
                              className="h-28 w-24 shrink-0 overflow-hidden rounded-[2px] border border-[#262923]/10 bg-[#F0ECE3] dark:border-[#F8F6F1]/10 dark:bg-[#242721]"
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
                                className="font-serif text-[20px] font-medium leading-snug text-[#22251F] no-underline transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#C9B292]"
                              >
                                {item.name}
                              </a>

                              {/* Selected Color & Size */}
                              {(item.color || item.size) && (
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                  {item.color && (
                                    <span className="font-medium uppercase tracking-[0.14em] text-[#5C634E] dark:text-[#C9B292]">
                                      Tone: {item.color}
                                    </span>
                                  )}
                                  {item.color && item.size && (
                                    <span aria-hidden="true" className="text-[#B59B79]">
                                      ·
                                    </span>
                                  )}
                                  {item.size && (
                                    <span className="text-[#4F5349] dark:text-[#C5C7BE]">
                                      Size: {item.size}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Unit Price */}
                              <div className="mt-1.5 flex items-baseline gap-2 text-xs">
                                <span className="font-medium tabular-nums text-[#363A32] dark:text-[#D9DBD3]">
                                  {item.showPrice === false
                                    ? 'Price Upon Inquiry'
                                    : `${formatLoomePrice(item.price, storeCurrency)} each`}
                                </span>
                                {hasSavings && item.originalPrice && (
                                  <span className="tabular-nums text-[#767A6E] line-through dark:text-[#9EA196]">
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
                                  className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.16em] text-[#6E7166] transition-colors hover:text-[#9E3F2E] dark:text-[#A9ACA2] dark:hover:text-[#EAA597]"
                                >
                                  <Trash2 className="h-3.5 w-3.5 stroke-[1.6]" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Stepper + Line Total */}
                          <div className="flex items-center justify-between gap-6 border-t border-[#262923]/8 pt-3.5 sm:justify-end sm:border-t-0 sm:pt-0 dark:border-[#F8F6F1]/8">
                            <div className="inline-flex items-center rounded-[2px] border border-[#262923]/18 bg-[#F6F3EC] dark:border-[#F8F6F1]/20 dark:bg-[#151713]">
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
                                className="flex h-8 w-8 items-center justify-center text-[#22251F] transition-colors hover:bg-[#E8E0D5] dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/12"
                              >
                                <Minus className="h-3.5 w-3.5 stroke-[1.7]" />
                              </button>
                              <motion.span
                                key={item.quantity}
                                initial={prefersReducedMotion ? false : { scale: 0.86, opacity: 0.65 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="w-9 text-center text-sm font-semibold tabular-nums text-[#22251F] dark:text-[#F8F6F1]"
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
                                className="flex h-8 w-8 items-center justify-center text-[#22251F] transition-colors hover:bg-[#E8E0D5] dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/12"
                              >
                                <Plus className="h-3.5 w-3.5 stroke-[1.7]" />
                              </button>
                            </div>

                            <div className="w-24 text-right">
                              <span className="text-[16px] font-semibold tabular-nums text-[#22251F] dark:text-[#F8F6F1]">
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
                <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#262923]/10 pt-5 dark:border-[#F8F6F1]/10">
                  <a
                    href={continueHref}
                    data-target-page={hasShopPage ? 'shop' : undefined}
                    className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F5349] no-underline transition-colors hover:text-[#22251F] dark:text-[#C5C7BE] dark:hover:text-[#F8F6F1]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:-translate-x-1" />
                    Continue Shopping
                  </a>

                  <button
                    type="button"
                    onClick={() => cart.clearCart()}
                    className="border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6E7166] underline decoration-[#262923]/25 underline-offset-4 transition-colors hover:text-[#9E3F2E] dark:text-[#A9ACA2] dark:hover:text-[#EAA597]"
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
                className="rounded-[2px] border border-[#262923]/12 border-t-2 border-t-[#B59B79] bg-[#FEFDFB] p-6 shadow-[0_14px_42px_rgba(38,41,35,0.045)] dark:border-[#F8F6F1]/12 dark:border-t-[#B59B79] dark:bg-[#1E211B] xl:p-7"
              >
                <div className="border-b border-[#262923]/10 pb-3.5 dark:border-[#F8F6F1]/10">
                  <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#5C634E] dark:text-[#C9B292]">
                    Atelier Estimate
                  </p>
                  <h2 className="mt-1 mb-0 font-serif text-[24px] font-medium tracking-wide text-[#22251F] dark:text-[#F8F6F1]">
                    Order Summary
                  </h2>
                </div>

                {/* White-Glove Delivery Threshold */}
                <div className="mt-4 rounded-[2px] border border-[#262923]/10 bg-[#F7F4EE] px-3.5 py-3 dark:border-[#F8F6F1]/10 dark:bg-[#151713]">
                  <div className="flex items-center justify-between gap-2 text-[11.5px] font-medium text-[#3F433A] dark:text-[#D1D3CA]">
                    <span className="inline-flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 shrink-0 stroke-[1.6] text-[#666D57] dark:text-[#C9B292]" />
                      {deliveryRemaining === 0
                        ? 'Complimentary white-glove delivery unlocked'
                        : `Add ${formatLoomePrice(deliveryRemaining, storeCurrency)} for complimentary delivery`}
                    </span>
                    <span className="tabular-nums text-[#5C634E] dark:text-[#C9B292]">
                      {deliveryProgress}%
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E4DACB] dark:bg-[#2A2D26]">
                    <motion.div
                      initial={false}
                      animate={{ width: `${deliveryProgress}%` }}
                      transition={{ duration: 0.45, ease: LUXURY_EASE }}
                      className="h-full bg-[#B59B79]"
                    />
                  </div>
                </div>

                {/* Subtotal Breakdown */}
                <div className="mt-4 rounded-[2px] bg-[#FAF8F3] px-4 py-4 dark:bg-[#171915]">
                  <div className="space-y-2 text-[13px]">
                    <div className="flex items-center justify-between text-[#4F5349] dark:text-[#C5C7BE]">
                      <span>Items ({cart.totalCount})</span>
                      <span className="font-medium tabular-nums text-[#22251F] dark:text-[#F8F6F1]">
                        {formatLoomePrice(cart.subtotal, storeCurrency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#4F5349] dark:text-[#C5C7BE]">
                      <span>Atelier Delivery</span>
                      <span className="font-medium text-[#22251F] dark:text-[#F8F6F1]">
                        {deliveryRemaining === 0 ? 'Complimentary' : 'Confirmed at Checkout'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-baseline justify-between border-t border-[#262923]/12 pt-3.5 dark:border-[#F8F6F1]/12">
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#22251F] dark:text-[#F8F6F1]">
                        Estimated Subtotal
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#5E6257] dark:text-[#A9ACA2]">
                        Currency: {storeCurrency}
                      </span>
                    </div>
                    <span className="font-serif text-[30px] font-medium leading-none tabular-nums text-[#22251F] dark:text-[#F8F6F1]">
                      {formatLoomePrice(cart.subtotal, storeCurrency)}
                    </span>
                  </div>
                </div>

                {/* Primary Checkout CTA + Continue Shopping */}
                <div className="mt-5 space-y-2.5">
                  <motion.a
                    href={withBasePath('/checkout/')}
                    whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    className="group flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[2px] bg-[#262923] px-6 text-[12px] font-medium uppercase tracking-[0.22em] text-[#F8F6F1] no-underline shadow-[0_8px_22px_rgba(38,41,35,0.12)] transition-all duration-400 hover:bg-[#747B65] dark:bg-[#F8F6F1] dark:text-[#22251F] dark:hover:bg-[#E8E0D5]"
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

                <p className="mt-4 mb-0 text-center text-[11.5px] leading-relaxed text-[#55594F] dark:text-[#B6B8AE]">
                  Delivery details and WhatsApp concierge handoff happen on the next step.
                </p>
              </LuxuryReveal>
            </aside>
          </div>
        )}
      </section>

      {/* Always-Mounted Atelier Delivery & Concierge Assurance Band */}
      <section className="border-t border-[#262923]/10 bg-[#EFEAE0]/70 py-8 dark:border-[#F8F6F1]/10 dark:bg-[#1B1E18] sm:py-10">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 sm:px-8 md:grid-cols-3 lg:px-12">
          <div className="md:col-span-2">
            <p
              data-preview-static="cart-assurance-eyebrow"
              className="m-0 inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#5C634E] dark:text-[#C9B292]"
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

          <div className="flex flex-col justify-center gap-1.5 border-t border-[#262923]/12 pt-4 md:border-l md:border-t-0 md:pl-7 md:pt-0 dark:border-[#F8F6F1]/12">
            <p
              data-preview-static="cart-currency-label"
              className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#363A32] dark:text-[#D9DBD3]"
            >
              Pricing Currency · {storeCurrency}
            </p>
            <p
              data-preview-static="cart-handoff-note"
              className="m-0 text-[12.5px] leading-relaxed text-[#4F5349] dark:text-[#C5C7BE]"
            >
              Saved automatically in your browser until you finalize via private checkout.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
