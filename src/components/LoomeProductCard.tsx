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
  tone?: 'dark' | 'light';
}

export default function LoomeProductCard({
  product,
  tone = 'light',
}: LoomeProductCardProps) {
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
  const isDark = tone === 'dark';

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
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border p-3 transition-all duration-500 ease-luxury ${
        isDark
          ? 'border-[#C8A98B]/16 bg-[#2A2320] hover:border-[#C8A98B]/45'
          : 'border-[#3B302B]/12 bg-[#FAF5EE] hover:border-[#C8A98B]/75'
      }`}
    >
      {/* Editorial 3:4 Photography Frame (14px inner radius harmonizing with 16px card) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] bg-[#3B302B]/40">
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
            className="h-full w-full object-cover will-change-transform transition-transform duration-[900ms] ease-luxury group-hover:scale-[1.045]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#201C1A]/55 via-[#201C1A]/10 to-transparent opacity-40 transition-opacity duration-500 ease-luxury group-hover:opacity-100" />
        </div>

        {/* Top Left Editorial Badge — always visible & clickable in Fivora */}
        <span
          data-preview-field-path={`products[${idx}].badge`}
          className={
            product.badge
              ? 'pointer-events-none absolute left-3 top-3 rounded-[8px] border border-[#C8A98B]/35 bg-[#201C1A]/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#F2E9DE] backdrop-blur-md transition-transform duration-500 ease-luxury group-hover:-translate-y-0.5'
              : 'pointer-events-none absolute left-3 top-3 text-[9px]'
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
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[10px] backdrop-blur-md transition-all duration-300 ${
            wishlisted
              ? 'bg-[#201C1A] text-[#C8A98B] ring-1 ring-[#C8A98B]/50'
              : 'bg-[#201C1A]/75 text-[#F2E9DE] opacity-90 hover:bg-[#C8A98B] hover:text-[#201C1A] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100'
          }`}
        >
          <Heart className={`h-4 w-4 stroke-[1.5] ${wishlisted ? 'fill-[#C8A98B]' : ''}`} />
        </motion.button>

        {/* Bottom Slide-Up Quick Action Bar (softly rounded 10px controls) */}
        <div className="absolute inset-x-2.5 bottom-2.5 flex translate-y-2 items-center gap-1.5 opacity-0 transition-all duration-500 ease-luxury group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => openQuickView(product)}
            data-preview-static="product-quick-view"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#F2E9DE]/95 px-2.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#201C1A] backdrop-blur-sm transition-colors hover:bg-[#C8A98B]"
          >
            <Eye className="h-3.5 w-3.5 stroke-[1.6]" />
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
            className={`flex h-[36px] w-[38px] shrink-0 items-center justify-center rounded-[10px] transition-colors ${
              product.isAvailable
                ? 'bg-[#201C1A] text-[#F2E9DE] hover:bg-[#C8A98B] hover:text-[#201C1A]'
                : 'cursor-not-allowed bg-[#201C1A]/40 text-[#F2E9DE]/50'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 stroke-[1.6]" />
          </button>
          <a
            href={detailHref}
            aria-label={`View details for ${product.name}`}
            data-preview-static="Open the stable live product detail page"
            className="flex h-[36px] items-center justify-center rounded-[10px] bg-[#F2E9DE]/95 px-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#201C1A] no-underline transition-colors hover:bg-[#C8A98B]"
          >
            Details
          </a>
        </div>
      </div>

      {/* Product Typography & Swatch Details */}
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span
            data-preview-field-path={`products[${idx}].category`}
            className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
              isDark ? 'text-[#C8A98B]' : 'text-[#8D7667]'
            }`}
          >
            {product.category}
          </span>
          {activeColor && (
            <span
              data-preview-static="product-active-tone"
              className={`text-[10px] tracking-wide ${
                isDark ? 'text-[#C7B6A6]' : 'text-[#6B5B51]'
              }`}
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
          className={`mt-1.5 block w-full border-0 bg-transparent p-0 text-left transition-colors ${
            isDark
              ? 'text-[#F2E9DE] hover:text-[#C8A98B]'
              : 'text-[#201C1A] hover:text-[#8D7667]'
          }`}
        >
          <EditableText
            as="h3"
            data-preview-field-path={`products[${idx}].name`}
            defaultValue={product.name}
            fontFamily="heading"
            size="1.125rem"
            weight={700}
            lineHeight={1.28}
            letterSpacing="-0.015em"
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
          color={isDark ? '#C7B6A6' : '#5E4E45'}
          className="mt-1.5 mb-0 line-clamp-2"
        />

        {/* Price + Interactive Color Swatches Footer */}
        <div className="mt-auto pt-3.5">
          <div
            className={`flex items-center justify-between gap-3 border-t pt-3.5 ${
              isDark ? 'border-[#C8A98B]/14' : 'border-[#3B302B]/10'
            }`}
          >
          <div className="flex items-baseline gap-2">
            <span
              data-preview-field-path={`products[${idx}].price`}
              className={`text-sm font-bold tracking-wide ${
                isDark ? 'text-[#F2E9DE]' : 'text-[#201C1A]'
              }`}
            >
              {product.showPrice ? formatLoomePrice(product.price, storeCurrency) : 'Upon Inquiry'}
            </span>
            <span
              data-preview-field-path={`products[${idx}].compareAtPrice`}
              className={
                product.showPrice && product.compareAtPrice
                  ? `text-xs line-through ${isDark ? 'text-[#C7B6A6]/70' : 'text-[#8D7667]'}`
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
                        ? `scale-110 border-[#C8A98B] ring-1 ring-[#C8A98B] ring-offset-1 ${
                            isDark ? 'ring-offset-[#2A2320]' : 'ring-offset-[#FAF5EE]'
                          }`
                        : 'border-[#C8A98B]/40 hover:scale-110'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                </span>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </article>
  );
}
