'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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
import { LUXURY_EASE, LuxuryReveal } from '@/components/motion/LuxuryReveal';

export default function ShoppingBagView() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const cart = useCart();
  const prefersReducedMotion = useReducedMotion();

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const cartPage = contentObject(content.cartPage);
  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const shopNavLabel = contentText(navLabels.shop) || 'Shop';

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
      'home',
      'shop',
      'collections',
      'wishlist',
      'cart',
      'checkout',
      'about_us',
      'services',
      'contact',
    ];
  const hasShopPage = requiredPages.includes('shop');

  const catalogProducts = useMemo(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  // Dynamic merchant currency & configurable free-delivery threshold
  const storeCurrency = resolveLoomeCurrency(siteData, catalogProducts[0]?.currency);
  const freeDeliveryThreshold = resolveFreeDeliveryThreshold(siteData);
  const hasDeliveryThreshold = freeDeliveryThreshold > 0;

  // Merchant-editable page copy
  const eyebrow = contentText(cartPage.eyebrow) || 'SHOPPING CART';
  const heading = contentText(cartPage.heading) || 'Your Shopping Bag';
  const intro =
    contentText(cartPage.intro) ||
    'Review your selected textiles, adjust quantities, and proceed to checkout.';
  const deliveryNote =
    contentText(cartPage.deliveryNote) ||
    'Free island-wide delivery on qualifying orders. Delivery timing and custom sizing are confirmed directly at checkout.';
  const checkoutLabel = contentText(cartPage.checkoutLabel) || 'Proceed to Checkout';
  const continueShoppingLabel =
    contentText(cartPage.continueShoppingLabel) || 'Continue Shopping';
  const assuranceEyebrow =
    contentText(cartPage.assuranceEyebrow) || 'Delivery & Order Assurance';
  const emptyHeading =
    contentText(cartPage.emptyHeading) || 'Your shopping bag is empty';
  const emptyDescription =
    contentText(cartPage.emptyDescription) ||
    'Browse our linen curtains, stonewashed bedding, and woven cushions to add items to your bag.';

  const hasItems = cart.items.length > 0;
  const allInquiryOnly = hasItems && cart.items.every((item) => item.showPrice === false);
  const subtotalDisplay = allInquiryOnly
    ? 'Price on Request'
    : formatLoomePrice(cart.subtotal, storeCurrency);
  const deliveryRemaining = hasDeliveryThreshold
    ? Math.max(0, freeDeliveryThreshold - cart.subtotal)
    : 0;
  const deliveryUnlocked = hasDeliveryThreshold && deliveryRemaining === 0;
  const deliveryProgress = hasDeliveryThreshold
    ? Math.min(100, Math.round((cart.subtotal / freeDeliveryThreshold) * 100))
    : 0;

  const continueHref = withBasePath(hasShopPage ? '/shop/' : '/');

  return (
    <div
      data-preview-page-key="cart"
      className="loome-surface-commerce min-h-[75vh] w-full font-sans"
    >
      {/* Compact Breadcrumb Bar */}
      <div className="border-b border-[var(--loome-border)] bg-[var(--loome-surface-subtle)]">
        <nav className="mx-auto flex max-w-[1260px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-text)] sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-text)] transition-colors hover:text-[var(--heading-color)]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" data-preview-static="cart-bc-sep-1" className="text-[var(--brand-accent)]">
            /
          </span>
          {hasShopPage && (
            <>
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath('/shop/'))}
                data-target-page="shop"
                className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-text)] transition-colors hover:text-[var(--heading-color)]"
              >
                <span data-preview-field-path="common.navLabels.shop">{shopNavLabel}</span>
              </button>
              <span aria-hidden="true" data-preview-static="cart-bc-sep-2" className="text-[var(--brand-accent)]">
                /
              </span>
            </>
          )}
          <span
            aria-current="page"
            data-preview-static="cart-breadcrumb-current"
            className="font-semibold text-[var(--heading-color)]"
          >
            Cart
          </span>
        </nav>
      </div>

      {/* Left-Aligned Cart Header (Aligned with Content Container Left Edge, Description Below Heading) */}
      <section
        data-design-section="cart-hero"
        className="mx-auto w-full max-w-[1260px] px-4 pb-6 pt-7 sm:px-8 sm:pt-9 lg:px-10"
      >
        <div className="max-w-2xl">
          <EditableText
            as="p"
            data-preview-field-path="cartPage.eyebrow"
            defaultValue={eyebrow}
            fontFamily="body"
            size="0.6875rem"
            weight={600}
            transform="uppercase"
            letterSpacing="0.22em"
            color="primary"
            className="m-0"
          />
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            <EditableText
              as="h1"
              data-preview-field-path="cartPage.heading"
              defaultValue={heading}
              fontFamily="heading"
              size="clamp(1.75rem, 3vw, 2.35rem)"
              weight={800}
              lineHeight={1.12}
              letterSpacing="-0.025em"
              color="heading"
              className="m-0"
            />
            {hasItems && (
              <span
                data-preview-static="cart-item-count-badge"
                className="rounded-full border border-[var(--loome-border)] bg-[var(--card-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--page-text)]"
              >
                {cart.totalCount} {cart.totalCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <div className="mt-2">
            <EditableText
              as="p"
              data-preview-field-path="cartPage.intro"
              defaultValue={intro}
              fontFamily="body"
              size="0.875rem"
              lineHeight={1.6}
              color="muted"
              className="m-0"
            />
          </div>
        </div>
      </section>

      {/* Main Shopping Cart Content */}
      <section
        data-design-section="cart-main"
        className="mx-auto w-full max-w-[1260px] px-4 pb-12 sm:px-8 lg:px-10 lg:pb-14"
      >
        {!hasItems ? (
          /* Clean White Empty-Cart Card */
          <LuxuryReveal className="mx-auto max-w-lg rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-12 text-center shadow-[0_6px_24px_rgba(73,56,45,0.06)] sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--brand-accent)]/30 bg-[var(--loome-surface-muted)] text-[var(--brand-accent)]">
              <ShoppingBag className="h-6 w-6 stroke-[1.6]" />
            </div>

            <div className="mt-5">
              <EditableText
                as="h2"
                data-preview-field-path="cartPage.emptyHeading"
                defaultValue={emptyHeading}
                fontFamily="heading"
                size="clamp(1.35rem, 2.4vw, 1.75rem)"
                weight={800}
                lineHeight={1.2}
                letterSpacing="-0.02em"
                color="heading"
                align="center"
                className="m-0"
              />
            </div>

            <div className="mx-auto mt-2.5 max-w-sm">
              <EditableText
                as="p"
                data-preview-field-path="cartPage.emptyDescription"
                defaultValue={emptyDescription}
                fontFamily="body"
                size="0.875rem"
                lineHeight={1.65}
                color="muted"
                align="center"
                className="m-0"
              />
            </div>

            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => window.location.assign(continueHref)}
                data-target-page={hasShopPage ? 'shop' : undefined}
                data-testid="cart-empty-continue-shopping"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border-0 bg-[var(--loome-btn-primary-bg)] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loome-btn-primary-text)] transition-colors hover:bg-[var(--loome-btn-primary-hover)] hover:text-white dark:hover:text-[#201C1A]"
              >
                <span data-preview-field-path="cartPage.continueShoppingLabel">
                  {continueShoppingLabel}
                </span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.7] transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          </LuxuryReveal>
        ) : (
          /* Balanced Two-Column Cart Layout with White Cards on Warm Ivory Background */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
            {/* Left Column: Cart Items Card */}
            <div className="lg:col-span-8">
              <div
                data-testid="cart-items-card"
                className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-5 shadow-[0_6px_24px_rgba(73,56,45,0.05)] sm:p-6"
              >
                {/* Compact Column Header */}
                <div className="flex items-center justify-between border-b border-[var(--loome-border)] pb-3.5">
                  <h2 className="m-0 font-heading text-base font-bold tracking-tight text-[var(--heading-color)]">
                    Items in Your Bag
                  </h2>
                  <div className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)] sm:flex">
                    <span className="w-[104px] text-center">Qty</span>
                    <span className="min-w-[116px] text-right">Total</span>
                  </div>
                </div>

                {/* Live Cart Rows */}
                <ul className="m-0 list-none divide-y divide-[var(--loome-border)] p-0">
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
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: LUXURY_EASE }}
                          className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:gap-5"
                        >
                          {/* Thumbnail + Product Info */}
                          <div className="flex min-w-0 flex-1 gap-4">
                            <a
                              href={detailHref}
                              className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--loome-border)] bg-[var(--loome-surface-muted)]"
                            >
                              <img
                                src={withBasePath(item.image || '/images/prod-curtain-ivory.jpg')}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                            </a>

                            <div className="flex min-w-0 flex-1 flex-col justify-center">
                              <a
                                href={detailHref}
                                className="font-heading text-[15px] font-bold leading-snug text-[var(--heading-color)] no-underline transition-colors hover:text-[var(--brand-accent)]"
                              >
                                {item.name}
                              </a>

                              {/* Selected Color & Size */}
                              {(item.color || item.size) && (
                                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[var(--muted-text)]">
                                  {item.color && <span>Color: {item.color}</span>}
                                  {item.color && item.size && (
                                    <span aria-hidden="true" className="text-[var(--brand-accent)]">
                                      ·
                                    </span>
                                  )}
                                  {item.size && <span>Size: {item.size}</span>}
                                </div>
                              )}

                              {/* Unit Price + Remove */}
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <span className="whitespace-nowrap font-semibold tabular-nums text-[var(--page-text)]">
                                  {item.showPrice === false
                                    ? 'Price on Request'
                                    : formatLoomePrice(item.price, storeCurrency)}
                                </span>
                                {hasSavings && item.originalPrice && (
                                  <span className="whitespace-nowrap tabular-nums text-[var(--muted-text)]/80 line-through">
                                    {formatLoomePrice(item.originalPrice, storeCurrency)}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => cart.removeItem(item.id, item.size, item.color)}
                                  aria-label={`Remove ${item.name} from bag`}
                                  className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-medium text-[var(--muted-text)] transition-colors hover:text-[var(--loome-danger-text)]"
                                >
                                  <Trash2 className="h-3.5 w-3.5 stroke-[1.6]" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Stepper + Single-Line LKR Line Total */}
                          <div className="flex items-center justify-between gap-4 border-t border-[var(--loome-border)] pt-3 sm:justify-end sm:gap-8 sm:border-t-0 sm:pt-0">
                            <div className="inline-flex w-[104px] items-center justify-between overflow-hidden rounded-[10px] border border-[var(--loome-border)] bg-[var(--loome-surface-muted)]">
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
                                className="flex h-8 w-8 items-center justify-center text-[var(--heading-color)] transition-colors hover:bg-[var(--brand-accent)]/15"
                              >
                                <Minus className="h-3.5 w-3.5 stroke-[1.8]" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold tabular-nums text-[var(--heading-color)]">
                                {item.quantity}
                              </span>
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
                                className="flex h-8 w-8 items-center justify-center text-[var(--heading-color)] transition-colors hover:bg-[var(--brand-accent)]/15"
                              >
                                <Plus className="h-3.5 w-3.5 stroke-[1.8]" />
                              </button>
                            </div>

                            <div className="min-w-[116px] shrink-0 text-right">
                              <span
                                data-preview-static="cart-line-total"
                                className="whitespace-nowrap font-heading text-[15px] font-extrabold tabular-nums text-[var(--heading-color)]"
                              >
                                {item.showPrice === false
                                  ? 'Price on Request'
                                  : formatLoomePrice(item.price * item.quantity, storeCurrency)}
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                {/* Single Continue Shopping Link + Clear Cart */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--loome-border)] pt-4">
                  <button
                    type="button"
                    onClick={() => window.location.assign(continueHref)}
                    data-target-page={hasShopPage ? 'shop' : undefined}
                    data-testid="cart-continue-shopping"
                    className="group inline-flex items-center gap-2 border-0 bg-transparent p-0 text-xs font-semibold text-[var(--page-text)] transition-colors hover:text-[var(--brand-accent)]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 stroke-[1.8] transition-transform duration-300 group-hover:-translate-x-0.5" />
                    <span data-preview-field-path="cartPage.continueShoppingLabel">
                      {continueShoppingLabel}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cart.clearCart()}
                    data-preview-static="cart-clear-btn"
                    className="border-0 bg-transparent p-0 text-xs font-medium text-[var(--muted-text)] underline decoration-[var(--loome-border)] underline-offset-4 transition-colors hover:text-[var(--loome-danger-text)]"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Prominent Sticky Order Summary Card */}
            <aside className="lg:sticky lg:top-24 lg:col-span-4">
              <div
                data-testid="cart-summary-card"
                className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-6 shadow-[0_10px_30px_rgba(73,56,45,0.07)]"
              >
                <h2 className="m-0 border-b border-[var(--loome-border)] pb-3.5 font-heading text-lg font-extrabold tracking-tight text-[var(--heading-color)]">
                  Order Summary
                </h2>

                {/* Free Delivery Progress Bar — Subtle Sage Green when Unlocked */}
                {hasDeliveryThreshold && (
                  <div
                    data-testid="cart-delivery-banner"
                    className={`mt-4 rounded-xl border px-3.5 py-3 transition-colors ${deliveryUnlocked
                      ? 'border-[var(--loome-sage-border)] bg-[var(--loome-sage-bg)]'
                      : 'border-[var(--brand-accent)]/28 bg-[var(--loome-surface-muted)]'
                      }`}
                  >
                    <div
                      className={`flex items-center justify-between gap-2 text-xs font-medium ${deliveryUnlocked
                        ? 'text-[var(--loome-sage-text)]'
                        : 'text-[var(--page-text)]'
                        }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {deliveryUnlocked ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 stroke-[1.9] text-[var(--loome-sage-accent)]" />
                        ) : (
                          <Truck className="h-3.5 w-3.5 shrink-0 stroke-[1.7] text-[var(--brand-accent)]" />
                        )}
                        {deliveryUnlocked
                          ? 'Free delivery unlocked'
                          : `Add ${formatLoomePrice(deliveryRemaining, storeCurrency)} for free delivery`}
                      </span>
                      <span
                        className={`shrink-0 tabular-nums font-bold ${deliveryUnlocked
                          ? 'text-[var(--loome-sage-text)]'
                          : 'text-[var(--brand-accent)]'
                          }`}
                      >
                        {deliveryProgress}%
                      </span>
                    </div>
                    <div
                      className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${deliveryUnlocked
                        ? 'bg-[var(--loome-sage-accent)]/20'
                        : 'bg-[var(--loome-border)]'
                        }`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ width: `${deliveryProgress}%` }}
                        transition={{ duration: 0.4, ease: LUXURY_EASE }}
                        className={`h-full rounded-full ${deliveryUnlocked
                          ? 'bg-[var(--loome-sage-accent)]'
                          : 'bg-[var(--brand-accent)]'
                          }`}
                      />
                    </div>
                  </div>
                )}

                {/* Price Breakdown — Strictly Single-Line Totals */}
                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3 text-[var(--muted-text)]">
                    <span>Items ({cart.totalCount})</span>
                    <span className="whitespace-nowrap font-semibold tabular-nums text-[var(--heading-color)]">
                      {subtotalDisplay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[var(--muted-text)]">
                    <span>Delivery</span>
                    <span
                      className={`whitespace-nowrap font-semibold ${deliveryUnlocked
                        ? 'text-[var(--loome-sage-text)]'
                        : 'text-[var(--heading-color)]'
                        }`}
                    >
                      {deliveryUnlocked ? 'Free' : 'Calculated at checkout'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-[var(--loome-border)] pt-4">
                  <span className="text-sm font-bold text-[var(--heading-color)]">Total</span>
                  <span
                    data-preview-static="cart-subtotal-total"
                    className="whitespace-nowrap font-heading text-2xl font-extrabold leading-none tabular-nums text-[var(--heading-color)]"
                  >
                    {subtotalDisplay}
                  </span>
                </div>

                {/* Prominent Single Primary Checkout CTA */}
                <div className="mt-5">
                  <motion.button
                    type="button"
                    onClick={() => window.location.assign(withBasePath('/checkout/'))}
                    data-testid="cart-checkout-cta"
                    whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-[11px] border-0 bg-[var(--loome-btn-primary-bg)] px-6 text-xs font-bold uppercase tracking-[0.16em] text-[var(--loome-btn-primary-text)] shadow-sm transition-colors hover:bg-[var(--loome-btn-primary-hover)] hover:text-white dark:hover:text-[#201C1A]"
                  >
                    <span data-preview-field-path="cartPage.checkoutLabel">{checkoutLabel}</span>
                    <ArrowRight className="h-4 w-4 stroke-[1.8] transition-transform duration-300 group-hover:translate-x-0.5" />
                  </motion.button>
                </div>

                <p className="mt-3.5 mb-0 text-center text-xs leading-relaxed text-[var(--muted-text)]">
                  Delivery details and WhatsApp confirmation happen on the next step.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* Compact Delivery & Order Assurance Band */}
      <section className="border-t border-[var(--loome-border)] bg-[var(--loome-surface-subtle)] py-6">
        <div className="mx-auto flex max-w-[1260px] flex-col justify-between gap-4 px-4 sm:px-8 md:flex-row md:items-center lg:px-10">
          <div className="max-w-2xl">
            <p className="m-0 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              <ShieldCheck className="h-3.5 w-3.5 stroke-[1.7]" />
              <span data-preview-field-path="cartPage.assuranceEyebrow">{assuranceEyebrow}</span>
            </p>
            <div className="mt-1.5">
              <EditableText
                as="p"
                data-preview-field-path="cartPage.deliveryNote"
                defaultValue={deliveryNote}
                fontFamily="body"
                size="0.8125rem"
                lineHeight={1.65}
                color="muted"
                className="m-0"
              />
            </div>
          </div>

          <p
            data-preview-static="cart-handoff-note"
            className="m-0 shrink-0 text-xs font-medium text-[var(--muted-text)]"
          >
            Prices in {storeCurrency} · Saved automatically in your browser
          </p>
        </div>
      </section>
    </div>
  );
}
