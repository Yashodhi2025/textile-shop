'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Heart, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { EditableImage, EditableText, useCart } from '@deneb-ui/ui';
import { platformProductDetailHref, useSiteData } from '@/lib/siteDataContext';
import {
  formatLoomePrice,
  resolveLoomeCurrency,
  useLoomeStore,
  type LoomeProduct,
} from '@/lib/storeContext';

interface LoomeProductCardProps {
  product: LoomeProduct;
  tone?: 'dark' | 'light';
  showRemoveAction?: boolean;
  compactMedia?: boolean;
}

export default function LoomeProductCard({
  product,
  tone = 'light',
  showRemoveAction = false,
  compactMedia = false,
}: LoomeProductCardProps) {
  const siteData = useSiteData();
  const cart = useCart();
  const { toggleWishlist, isWishlisted } = useLoomeStore();
  const prefersReducedMotion = useReducedMotion();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const activeColor = product.colors[selectedColorIndex] ?? product.colors[0];
  const storeCurrency = resolveLoomeCurrency(siteData, product.currency);
  const detailHref = platformProductDetailHref(product.id);
  const idx = product.index;
  const isDark = tone === 'dark';

  const hasValidRating =
    typeof product.rating === 'number' &&
    Number.isFinite(product.rating) &&
    product.rating > 0 &&
    product.rating <= 5;
  const hasSalePrice =
    product.showPrice &&
    typeof product.compareAtPrice === 'number' &&
    product.compareAtPrice > product.price;

  const handleAddToBag = () => {
    if (!product.isAvailable) return;
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.compareAtPrice ?? undefined,
      image: product.imageUrl,
      color: product.hasExplicitColors ? activeColor?.name : undefined,
      size: product.sizes[0],
      quantity: 1,
      showPrice: product.showPrice,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article
      data-preview-item-path={`products[${idx}]`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'border-[#C8A98B]/20 bg-[#28211D] shadow-[0_2px_14px_rgba(0,0,0,0.22)] hover:border-[#C8A98B]/50'
          : 'border-[#49382D]/12 bg-white shadow-[0_2px_12px_rgba(73,56,45,0.05)] hover:border-[#B28B65]/60 hover:shadow-[0_10px_28px_rgba(73,56,45,0.09)] dark:border-[#C8A98B]/20 dark:bg-[#28211D] dark:shadow-none dark:hover:border-[#C8A98B]/50'
      }`}
    >
      {/* Product Image Frame — compact 276px height on Wishlist desktop, 3:4 editorial elsewhere */}
      <div
        data-testid={compactMedia ? 'wishlist-card-media' : undefined}
        className={`relative w-full overflow-hidden bg-[var(--brand-secondary,#E8DDD0)]/60 dark:bg-[#3B302B]/40 ${
          compactMedia ? 'aspect-[4/3] sm:h-[268px] sm:aspect-auto lg:h-[276px]' : 'aspect-[3/4]'
        }`}
      >
        <div
          onClick={() => {
            window.location.href = detailHref;
          }}
          className="block h-full w-full cursor-pointer"
        >
          <EditableImage
            id={`products[${idx}].imageUrl`}
            data-preview-field-path={`products[${idx}].imageUrl`}
            data-preview-style-target={`products[${idx}].imageUrl`}
            data-preview-style-type="image"
            src={product.imageUrl}
            fallbackSrc="/images/prod-curtain-ivory.jpg"
            alt={product.name}
            loading="lazy"
            fit="cover"
            className="h-full w-full object-cover will-change-transform transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
          />
        </div>

        {/* Minimal Top-Left Badge (only rendered visually when set, keeping Fivora field bound) */}
        <span
          data-preview-field-path={`products[${idx}].badge`}
          className={
            product.badge
              ? 'pointer-events-none absolute left-3 top-3 rounded-[8px] bg-[#2C211B]/86 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] backdrop-blur-sm'
              : 'pointer-events-none absolute left-3 top-3 text-[10px]'
          }
        >
          {product.badge ?? ''}
        </span>

        {/* Always-Visible Wishlist Heart Toggle */}
        <motion.button
          type="button"
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          onClick={() => toggleWishlist(product.id)}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          data-preview-static="product-wishlist-toggle"
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors duration-200 ${
            wishlisted
              ? 'border-[#B28B65] bg-[#49382D] text-[#F7F3ED] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
              : 'border-[#49382D]/14 bg-white/92 text-[#49382D] hover:border-[#B28B65] hover:bg-[#B28B65] hover:text-white dark:border-[#C8A98B]/28 dark:bg-[#201C1A]/82 dark:text-[#F5EEE6] dark:hover:bg-[#C8A98B] dark:hover:text-[#201C1A]'
          }`}
        >
          <Heart
            className={`h-4 w-4 stroke-[1.7] ${wishlisted ? 'fill-current' : ''}`}
          />
        </motion.button>
      </div>

      {/* Clean Card Content: Name, Optional Valid Rating, Prominent LKR Price, Swatches & Always-Visible Add to Bag */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Short Product Name */}
        <button
          type="button"
          onClick={() => {
            window.location.href = detailHref;
          }}
          className={`block w-full border-0 bg-transparent p-0 text-left transition-colors ${
            isDark
              ? 'text-[#F5EEE6] hover:text-[#C8A98B]'
              : 'text-[#2C211B] hover:text-[#B28B65] dark:text-[#F5EEE6] dark:hover:text-[#C8A98B]'
          }`}
        >
          <EditableText
            as="h3"
            data-preview-field-path={`products[${idx}].name`}
            defaultValue={product.name}
            fontFamily="heading"
            size="1rem"
            weight={700}
            lineHeight={1.32}
            letterSpacing="-0.015em"
            color="inherit"
            className="m-0 line-clamp-2 min-h-[2.65rem]"
          />
        </button>

        {/* Rating — shown ONLY when valid product review data exists */}
        {hasValidRating && (
          <div
            data-preview-static="product-rating"
            className="mt-2 flex items-center gap-1.5 text-xs text-[#6E5B4E] dark:text-[#C9B9AA]"
          >
            <Star className="h-3.5 w-3.5 fill-[#B28B65] text-[#B28B65] dark:fill-[#C8A98B] dark:text-[#C8A98B]" />
            <span className="font-semibold text-[#2C211B] dark:text-[#F5EEE6]">
              {product.rating!.toFixed(1)}
            </span>
            {product.reviewCount && (
              <span className="text-[11px]">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Prominent LKR Price + Sale Compare-At Price */}
        <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
          <span
            data-preview-field-path={`products[${idx}].price`}
            className={`whitespace-nowrap text-base font-extrabold tracking-tight tabular-nums ${
              isDark ? 'text-[#F5EEE6]' : 'text-[#2C211B] dark:text-[#F5EEE6]'
            }`}
          >
            {product.showPrice ? formatLoomePrice(product.price, storeCurrency) : 'Price on Request'}
          </span>
          <span
            data-preview-field-path={`products[${idx}].compareAtPrice`}
            className={
              hasSalePrice
                ? `whitespace-nowrap text-xs font-medium tabular-nums line-through ${
                    isDark
                      ? 'text-[#C9B9AA]/75'
                      : 'text-[#6E5B4E]/80 dark:text-[#C9B9AA]/75'
                  }`
                : 'inline-block text-xs'
            }
          >
            {hasSalePrice ? formatLoomePrice(product.compareAtPrice!, storeCurrency) : ''}
          </span>
        </div>

        {/* Available Color Swatches */}
        <div
          data-preview-list-path={`products[${idx}].colors`}
          className="mt-3 flex items-center gap-2"
        >
          {product.colors.map((swatch, sIdx) => {
            const selected = sIdx === selectedColorIndex;
            return (
              <span
                key={`${product.id}-${swatch.name}-${sIdx}`}
                data-preview-item-path={`products[${idx}].colors[${sIdx}]`}
                className="inline-flex items-center"
              >
                <button
                  type="button"
                  data-preview-static={`swatch-${swatch.name}`}
                  onClick={() => setSelectedColorIndex(sIdx)}
                  aria-label={`Select ${swatch.name}`}
                  title={swatch.name}
                  className={`h-4 w-4 rounded-full border transition-transform ${
                    selected
                      ? `scale-110 border-[#49382D] ring-1 ring-[#B28B65] ring-offset-1 ${
                          isDark
                            ? 'ring-offset-[#28211D]'
                            : 'ring-offset-white dark:ring-offset-[#28211D]'
                        }`
                      : 'border-[#49382D]/25 hover:scale-110 dark:border-[#C8A98B]/40'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              </span>
            );
          })}
        </div>

        {/* Always-Visible Add to Bag Action (+ Optional Remove Action on Wishlist page) */}
        <div className="mt-auto space-y-2 pt-4">
          <button
            type="button"
            disabled={!product.isAvailable}
            onClick={handleAddToBag}
            data-preview-static="product-quick-add"
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border-0 text-xs font-bold uppercase tracking-[0.14em] transition-colors duration-200 ${
              !product.isAvailable
                ? 'cursor-not-allowed border border-[var(--loome-border)] bg-[var(--loome-beige)]/70 text-[var(--muted-text)]'
                : justAdded
                  ? 'bg-[var(--brand-accent)] text-white dark:text-[#201C1A]'
                  : isDark
                    ? 'bg-[#C8A98B] text-[#201C1A] hover:bg-[#D8BFA4]'
                    : 'bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)] hover:bg-[var(--loome-btn-primary-hover)] hover:text-white dark:hover:text-[#201C1A]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[2.2]" />
                <span>Added to Bag</span>
              </>
            ) : !product.isAvailable ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>

          {showRemoveAction && (
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              data-preview-static="wishlist-card-remove"
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#49382D]/16 bg-transparent text-xs font-semibold text-[#6E5B4E] transition-colors hover:border-[#A63A2B]/40 hover:bg-[#A63A2B]/8 hover:text-[#A63A2B] dark:border-[#C8A98B]/22 dark:text-[#C9B9AA] dark:hover:border-[#F09A8B]/50 dark:hover:text-[#F09A8B]"
            >
              <Trash2 className="h-3.5 w-3.5 stroke-[1.6]" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
