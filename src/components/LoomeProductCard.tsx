'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { EditableText, useCart } from '@deneb-ui/ui';
import { platformProductDetailHref, useSiteData } from '@/lib/siteDataContext';
import {
  formatLoomePrice,
  resolveLoomeCurrency,
  useLoomeStore,
  type LoomeProduct,
} from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';

interface LoomeProductCardProps {
  product: LoomeProduct;
}

export default function LoomeProductCard({ product }: LoomeProductCardProps) {
  const siteData = useSiteData();
  const cart = useCart();
  const { toggleWishlist, isWishlisted, openQuickView } = useLoomeStore();
  const prefersReducedMotion = useReducedMotion();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const wishlisted = isWishlisted(product.id);
  const activeColor = product.colors[selectedColorIndex] ?? product.colors[0];
  const storeCurrency = resolveLoomeCurrency(siteData, product.currency);
  const detailHref = platformProductDetailHref(product.id);
  const idx = product.index;

  const handleQuickAdd = () => {
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
  };

  return (
    <article
      data-preview-item-path={`products[${idx}]`}
      className="group flex h-full flex-col"
    >
      {/* Editorial 3:4 Photography Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#E8E0D5]/50 dark:bg-[#20231D]">
        <div
          onClick={() => {
            window.location.href = detailHref;
          }}
          className="block h-full w-full cursor-pointer"
        >
          <img
            src={withBasePath(product.imageUrl)}
            alt={product.name}
            loading="lazy"
            data-preview-field-path={`products[${idx}].imageUrl`}
            className="h-full w-full object-cover will-change-transform transition-transform duration-[950ms] ease-luxury group-hover:scale-[1.055]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#262923]/32 via-[#262923]/5 to-transparent opacity-0 transition-opacity duration-700 ease-luxury group-hover:opacity-100" />
        </div>

        {/* Top Left Editorial Badge — always visible & clickable in Fivora */}
        <span
          data-preview-field-path={`products[${idx}].badge`}
          className={
            product.badge
              ? 'pointer-events-none absolute left-3.5 top-3.5 bg-[#F8F6F1]/92 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-[#262923] backdrop-blur-sm transition-transform duration-500 ease-luxury group-hover:-translate-y-0.5'
              : 'pointer-events-none absolute left-3.5 top-3.5 text-[9px]'
          }
        >
          {product.badge ?? ''}
        </span>

        {/* Top Right Wishlist Toggle */}
        <motion.button
          type="button"
          whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          data-preview-static="product-wishlist-toggle"
          className={`absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            wishlisted
              ? 'bg-[#262923] text-[#B59B79]'
              : 'bg-[#F8F6F1]/88 text-[#262923] opacity-90 hover:bg-[#262923] hover:text-[#F8F6F1] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100'
          }`}
        >
          <Heart className={`h-4 w-4 stroke-[1.5] ${wishlisted ? 'fill-[#B59B79]' : ''}`} />
        </motion.button>

        {/* Bottom Slide-Up Quick Action Bar */}
        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-500 ease-luxury group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => openQuickView(product)}
            data-preview-static="product-quick-view"
            className="flex flex-1 items-center justify-center gap-1.5 bg-[#F8F6F1]/95 px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#262923] backdrop-blur-sm transition-colors hover:bg-[#262923] hover:text-[#F8F6F1]"
          >
            <Eye className="h-3.5 w-3.5 stroke-[1.5]" />
            Quick View
          </button>
          <button
            type="button"
            disabled={!product.isAvailable}
            onClick={handleQuickAdd}
            aria-label={
              product.isAvailable
                ? `Add ${product.name} to bag`
                : `${product.name} is currently unavailable`
            }
            data-preview-static="product-quick-add"
            className={`flex h-[36px] w-[38px] shrink-0 items-center justify-center transition-colors ${
              product.isAvailable
                ? 'bg-[#262923] text-[#F8F6F1] hover:bg-[#747B65]'
                : 'cursor-not-allowed bg-[#262923]/40 text-[#F8F6F1]/60'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 stroke-[1.5]" />
          </button>
          <a
            href={detailHref}
            aria-label={`View details for ${product.name}`}
            data-preview-static="Open the stable live product detail page"
            className="flex h-[36px] items-center justify-center bg-[#F8F6F1]/95 px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#262923] no-underline transition-colors hover:bg-[#262923] hover:text-[#F8F6F1]"
          >
            Details
          </a>
        </div>
      </div>

      {/* Product Typography & Swatch Details */}
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center justify-between gap-2">
          <span
            data-preview-field-path={`products[${idx}].category`}
            className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#747B65] dark:text-[#B59B79]"
          >
            {product.category}
          </span>
          {activeColor && (
            <span
              data-preview-static="product-active-tone"
              className="text-[10px] tracking-wide text-[#65685E] dark:text-[#B6B8AE]"
            >
              {activeColor.name}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = detailHref;
          }}
          className="mt-1.5 block w-full border-0 bg-transparent p-0 text-left text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
        >
          <EditableText
            as="h3"
            data-preview-field-path={`products[${idx}].name`}
            defaultValue={product.name}
            fontFamily="heading"
            size="1.375rem"
            weight={400}
            lineHeight={1.25}
            letterSpacing="-0.01em"
            color="inherit"
            className="m-0"
          />
        </button>

        <EditableText
          as="p"
          data-preview-field-path={`products[${idx}].description`}
          defaultValue={product.description}
          fontFamily="body"
          size="0.8125rem"
          lineHeight={1.65}
          color="muted"
          className="mt-1.5 mb-0 line-clamp-2"
        />

        {/* Price + Interactive Color Swatches Footer */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3.5">
          <div className="flex items-baseline gap-2">
            <span
              data-preview-field-path={`products[${idx}].price`}
              className="text-sm font-medium tracking-wide text-[#262923] dark:text-[#F8F6F1]"
            >
              {product.showPrice ? formatLoomePrice(product.price, storeCurrency) : 'Upon Inquiry'}
            </span>
            <span
              data-preview-field-path={`products[${idx}].compareAtPrice`}
              className={
                product.showPrice && product.compareAtPrice
                  ? 'text-xs text-[#65685E]/80 line-through'
                  : 'inline-block text-xs'
              }
            >
              {product.showPrice && product.compareAtPrice
                ? formatLoomePrice(product.compareAtPrice, storeCurrency)
                : ''}
            </span>
          </div>

          <div
            data-preview-list-path={`products[${idx}].colors`}
            className="flex items-center gap-1.5"
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
                    className={`h-3.5 w-3.5 rounded-full border transition-all ${
                      selected
                        ? 'scale-110 border-[#262923] ring-1 ring-[#B59B79] ring-offset-1 ring-offset-[#F8F6F1] dark:ring-offset-[#171915]'
                        : 'border-[#262923]/25 hover:scale-110'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
