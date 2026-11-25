'use client';

import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Heart, Trash2 } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import {
  contentObject,
  contentText,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import { normalizeLoomeProduct, useLoomeStore } from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import LoomeProductCard from '@/components/LoomeProductCard';
import { LuxuryReveal } from '@/components/motion/LuxuryReveal';

export default function WishlistView() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const { wishlistIds, toggleWishlist } = useLoomeStore();

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const wishlistPage = contentObject(content.wishlistPage);

  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
      'home',
      'shop',
      'collections',
      'wishlist',
      'cart',
      'checkout',
      'services',
      'contact',
    ];
  const hasShopPage = requiredPages.includes('shop');

  const allProducts = useMemo(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  const savedProducts = useMemo(
    () => allProducts.filter((p) => wishlistIds.includes(p.id)),
    [allProducts, wishlistIds],
  );

  // Merchant-editable page copy
  const eyebrow = contentText(wishlistPage.eyebrow) || 'SAVED ITEMS';
  const heading = contentText(wishlistPage.heading) || 'Your Wishlist';
  const intro =
    contentText(wishlistPage.intro) ||
    'Keep track of your favorite curtains, bedding, and fabrics and move them to your bag whenever you are ready.';
  const emptyHeading = contentText(wishlistPage.emptyHeading) || 'Your wishlist is empty';
  const emptyDescription =
    contentText(wishlistPage.emptyDescription) ||
    'Tap the heart icon on any product to save it here for easy comparison and future orders.';
  const emptyCtaLabel = contentText(wishlistPage.emptyCtaLabel) || 'Explore Shop';

  const shopHref = withBasePath(hasShopPage ? '/shop/' : '/');

  const handleClearAll = () => {
    savedProducts.forEach((product) => toggleWishlist(product.id));
  };

  return (
    <div
      data-preview-page-key="wishlist"
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
          <span aria-hidden="true" data-preview-static="wishlist-bc-sep" className="text-[var(--brand-accent)]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-static="wishlist-breadcrumb-current"
            className="font-semibold text-[var(--heading-color)]"
          >
            Wishlist
          </span>
        </nav>
      </div>

      {/* Left-Aligned Wishlist Header + Far-Right Clear All */}
      <section
        data-design-section="wishlist-header"
        className="mx-auto w-full max-w-[1260px] px-4 pb-6 pt-7 sm:px-8 sm:pt-9 lg:px-10"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <EditableText
              as="p"
              data-preview-field-path="wishlistPage.eyebrow"
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
                data-preview-field-path="wishlistPage.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(1.75rem, 3vw, 2.35rem)"
                weight={800}
                lineHeight={1.12}
                letterSpacing="-0.025em"
                color="heading"
                className="m-0"
              />
              <span
                data-preview-static="wishlist-item-count"
                className="rounded-full border border-[var(--loome-border)] bg-[var(--card-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--page-text)]"
              >
                {savedProducts.length} {savedProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="mt-2">
              <EditableText
                as="p"
                data-preview-field-path="wishlistPage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.875rem"
                lineHeight={1.6}
                color="muted"
                className="m-0"
              />
            </div>
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              data-preview-static="wishlist-clear-all"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-[10px] border border-[var(--loome-border)] bg-[var(--card-bg)] px-4 text-xs font-semibold text-[var(--page-text)] transition-colors hover:border-[var(--loome-danger-text)]/45 hover:text-[var(--loome-danger-text)] sm:ml-auto sm:self-end"
            >
              <Trash2 className="h-3.5 w-3.5 stroke-[1.6]" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </section>

      {/* Main Saved 4-Column Grid or Empty State */}
      <section
        data-design-section="wishlist-grid"
        className="mx-auto w-full max-w-[1260px] px-4 pb-14 sm:px-8 lg:px-10 lg:pb-16"
      >
        {savedProducts.length === 0 ? (
          <LuxuryReveal className="mx-auto max-w-lg rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-12 text-center shadow-[0_6px_24px_rgba(73,56,45,0.06)] sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--brand-accent)]/30 bg-[var(--loome-surface-muted)] text-[var(--brand-accent)]">
              <Heart className="h-6 w-6 stroke-[1.6]" />
            </div>

            <div className="mt-5">
              <EditableText
                as="h2"
                data-preview-field-path="wishlistPage.emptyHeading"
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
                data-preview-field-path="wishlistPage.emptyDescription"
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
                onClick={() => window.location.assign(shopHref)}
                data-target-page={hasShopPage ? 'shop' : undefined}
                data-testid="wishlist-empty-cta"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border-0 bg-[var(--loome-btn-primary-bg)] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loome-btn-primary-text)] transition-colors hover:bg-[var(--loome-btn-primary-hover)] hover:text-white dark:hover:text-[#201C1A]"
              >
                <span data-preview-field-path="wishlistPage.emptyCtaLabel">{emptyCtaLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.7] transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          </LuxuryReveal>
        ) : (
          <>
            <div
              data-testid="wishlist-cards-grid"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {savedProducts.map((product) => (
                <LoomeProductCard
                  key={product.id}
                  product={product}
                  tone="light"
                  showRemoveAction
                  compactMedia
                />
              ))}
            </div>

            {/* Continue Shopping Link */}
            <div className="mt-8 flex items-center justify-between border-t border-[var(--loome-border)] pt-5">
              <button
                type="button"
                onClick={() => window.location.assign(shopHref)}
                data-target-page={hasShopPage ? 'shop' : undefined}
                data-preview-static="wishlist-continue-shopping"
                className="group inline-flex items-center gap-2 border-0 bg-transparent p-0 text-xs font-semibold text-[var(--page-text)] transition-colors hover:text-[var(--brand-accent)]"
              >
                <ArrowLeft className="h-3.5 w-3.5 stroke-[1.8] transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
