'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Eye, Plus, ShoppingBag } from 'lucide-react';
import { EditableText, useCart } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import {
  formatLoomePrice,
  resolveLoomeCurrency,
  useLoomeStore,
  type LoomeProduct,
} from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import {
  LUXURY_EASE,
  LuxuryImageReveal,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
  useParallaxActive,
} from '@/components/motion/LuxuryReveal';

interface ShopTheLookSectionProps {
  products: LoomeProduct[];
}

export default function ShopTheLookSection({ products }: ShopTheLookSectionProps) {
  const siteData = useSiteData();
  const cart = useCart();
  const { openQuickView } = useLoomeStore();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const parallaxActive = useParallaxActive();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const roomImageY = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);

  const content = contentObject(siteData.content);
  const home = contentObject(content.home);
  const productDetailPage = contentObject(content.productDetailPage);
  const look = contentObject(home.shopTheLook);
  const rawHotspots = contentList(look.hotspots);

  const inspectCtaLabel = contentText(look.inspectCtaLabel) || 'Inspect Piece';
  const quickViewLabel = contentText(look.quickViewLabel) || 'Quick View';
  const exploreCtaLabel = contentText(look.exploreCtaLabel) || 'Explore Collections';
  const exploreCtaUrl = contentText(look.exploreCtaUrl) || '/collections/';
  const addToBagLabel = contentText(productDetailPage.addToBagLabel) || 'Add to Bag';

  const requiredPages: string[] = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [];
  const resolveExploreHref = (href: string) => {
    if (!href) return '#new-arrivals';
    if (href.startsWith('#') || /^https?:\/\//i.test(href)) return href;
    const pageKey = href.replace(/^\/+/, '').split(/[/?#]/)[0].replace(/-/g, '_');
    if (pageKey && pageKey !== 'home' && !requiredPages.includes(pageKey)) {
      return requiredPages.includes('shop') ? withBasePath('/shop/') : '#new-arrivals';
    }
    return withBasePath(href);
  };

  const hotspots = rawHotspots.map((raw, idx) => {
    const obj = contentObject(raw);
    const productId = contentText(obj.productId);
    const linkedProduct =
      products.find((p) => p.id === productId) || products[idx % Math.max(products.length, 1)];
    const x = typeof obj.x === 'number' ? obj.x : Number.parseFloat(String(obj.x ?? 50)) || 50;
    const y = typeof obj.y === 'number' ? obj.y : Number.parseFloat(String(obj.y ?? 50)) || 50;

    return {
      index: idx,
      id: contentText(obj.id) || `spot-${idx}`,
      productId,
      label: contentText(obj.label) || linkedProduct?.name || 'Curated Piece',
      note: contentText(obj.note),
      x: Math.min(94, Math.max(6, x)),
      y: Math.min(92, Math.max(8, y)),
      product: linkedProduct,
    };
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = hotspots.length > 0 ? activeIndex % hotspots.length : 0;
  const activeSpot = hotspots[safeIndex];

  const storeCurrency = resolveLoomeCurrency(siteData, products[0]?.currency);

  const handleAddPiece = (product: LoomeProduct) => {
    if (!product.isAvailable) return;
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.compareAtPrice ?? undefined,
      image: product.imageUrl,
      color: product.hasExplicitColors ? product.colors[0]?.name : undefined,
      size: product.sizes[0],
      quantity: 1,
      showPrice: product.showPrice,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="shop-the-look"
      data-design-section="shop-the-look"
      className="loome-surface-beige w-full border-y border-[var(--loome-border)] py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        <LuxuryReveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <EditableText
              as="p"
              data-preview-field-path="home.shopTheLook.eyebrow"
              defaultValue={contentText(look.eyebrow) || 'INTERACTIVE STYLING'}
              fontFamily="body"
              size="0.6875rem"
              weight={600}
              transform="uppercase"
              letterSpacing="0.24em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.shopTheLook.title"
              defaultValue={contentText(look.title) || 'Shop the Look'}
              fontFamily="heading"
              size="clamp(1.85rem, 3vw, 2.45rem)"
              weight={800}
              lineHeight={1.08}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-2 mb-0"
            />
          </div>
          <EditableText
            as="p"
            data-preview-field-path="home.shopTheLook.subtitle"
            defaultValue={contentText(look.subtitle)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.7}
            color="muted"
            className="m-0 max-w-md"
          />
        </LuxuryReveal>

        <div className="mt-9 grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-8">
          {/* Left: Interactive Hotspot Room Photograph with 16px rounded frame */}
          <div className="relative min-w-0 lg:col-span-7">
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[#2D2722]">
              <LuxuryImageReveal tone="charcoal" className="h-full w-full">
                <motion.div
                  style={parallaxActive ? { y: roomImageY } : undefined}
                  className="h-full w-full will-change-transform"
                >
                  <img
                    src={withBasePath(contentText(look.imageUrl) || '/images/hero-linen.jpg')}
                    alt="Interactive LOOMÉ styled living room"
                    loading="lazy"
                    data-preview-field-path="home.shopTheLook.imageUrl"
                    data-preview-style-target="home.shopTheLook.imageUrl"
                    data-preview-style-type="image"
                    className="h-full w-full scale-[1.06] object-cover"
                  />
                </motion.div>
              </LuxuryImageReveal>
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#201C1A]/65 via-transparent to-transparent" />

              {/* Interactive Pulsing Champagne Hotspots */}
              {hotspots.map((spot, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    data-testid={`shop-look-hotspot-${idx}`}
                    data-preview-static={`shop-look-hotspot-${idx}`}
                    data-hotspot-x={String(spot.x)}
                    data-hotspot-y={String(spot.y)}
                    data-hotspot-product-id={spot.productId}
                    onClick={() => setActiveIndex(idx)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    aria-label={`Inspect ${spot.label}`}
                    aria-pressed={isSelected}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-2 focus:outline-none"
                  >
                    <span
                      className={`loome-hotspot-ring absolute inset-1 rounded-full bg-[#C8A98B]/75 ${isSelected ? 'opacity-100' : 'opacity-60'
                        }`}
                    />
                    <span
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold shadow-lg transition-all duration-300 ${isSelected
                        ? 'scale-110 border-[#C8A98B] bg-[#201C1A] text-[#F2E9DE]'
                        : 'border-[#F2E9DE] bg-[#F2E9DE]/95 text-[#201C1A] hover:scale-105 hover:bg-[#C8A98B]'
                        }`}
                    >
                      {isSelected ? `0${idx + 1}` : <Plus className="h-3.5 w-3.5 stroke-[1.8]" />}
                    </span>
                  </button>
                );
              })}

              {/* Floating Active Piece Overlay Bar */}
              {activeSpot?.product && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSpot.id}
                    data-testid="shop-look-overlay"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                    transition={
                      prefersReducedMotion ? { duration: 0 } : { duration: 0.38, ease: LUXURY_EASE }
                    }
                    className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 rounded-[14px] border border-[#C8A98B]/40 bg-[#201C1A]/90 px-4 py-3 text-[#F2E9DE] backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:gap-4 sm:px-5 sm:py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="m-0 truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A98B]">
                        <span>0{safeIndex + 1} · </span>
                        <span
                          data-testid="shop-look-overlay-label"
                          data-preview-field-path={`home.shopTheLook.hotspots[${activeSpot.index}].label`}
                        >
                          {activeSpot.label}
                        </span>
                      </p>
                      <p className="mt-0.5 m-0 truncate font-heading text-sm font-bold text-[#FAF7F2] sm:text-base">
                        <span
                          data-testid="shop-look-overlay-product-name"
                          data-preview-field-path={`products[${activeSpot.product.index}].name`}
                        >
                          {activeSpot.product.name}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid="shop-look-inspect-btn"
                      onClick={() => openQuickView(activeSpot.product!)}
                      className="shrink-0 whitespace-nowrap rounded-[10px] border border-[#C8A98B]/60 bg-[#C8A98B] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#201C1A] transition-all hover:bg-[#D8BFA4] sm:px-4"
                    >
                      <span data-preview-field-path="home.shopTheLook.inspectCtaLabel">
                        {inspectCtaLabel}
                      </span>
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right: Synchronized Curated Pieces List bound directly to shared products[*] + hotspot metadata */}
          <div
            data-preview-list-path="home.shopTheLook.hotspots"
            className="min-w-0 lg:col-span-5"
          >
            {hotspots.length === 0 ? (
              <div
                data-preview-static="shop-look-empty"
                className="rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] p-10 text-center text-sm text-[var(--muted-text)]"
              >
                Add interactive hotspots in site data to curate this room.
              </div>
            ) : (
              <LuxuryStagger staggerDelay={0.09} className="flex flex-col gap-3.5">
                {hotspots.map((spot, idx) => {
                  const isSelected = idx === safeIndex;
                  const product = spot.product;

                  return (
                    <LuxuryStaggerItem key={spot.id} y={16}>
                      <div
                        data-testid={`shop-look-card-${idx}`}
                        onClick={() => setActiveIndex(idx)}
                        className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${isSelected
                          ? 'border-[var(--brand-accent)] bg-[var(--card-bg)] shadow-[0_6px_20px_rgba(73,56,44,0.08)]'
                          : 'border-[var(--loome-border)] bg-[var(--card-bg)] hover:border-[var(--brand-accent)]/70'
                          }`}
                      >
                        {/* Hotspot metadata (pin label + styling note) — its own list item */}
                        <div
                          data-preview-item-path={`home.shopTheLook.hotspots[${spot.index}]`}
                          className="mb-3 flex min-w-0 items-baseline gap-2 border-b border-[var(--loome-border)] pb-2.5"
                        >
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent)]">
                            <span>0{idx + 1} · </span>
                            <span
                              data-preview-field-path={`home.shopTheLook.hotspots[${spot.index}].label`}
                            >
                              {spot.label}
                            </span>
                          </span>
                          <EditableText
                            as="span"
                            data-preview-field-path={`home.shopTheLook.hotspots[${spot.index}].note`}
                            defaultValue={spot.note}
                            fontFamily="body"
                            size="0.71875rem"
                            weight={500}
                            lineHeight={1.4}
                            color="muted"
                            className="min-w-0 truncate"
                          />
                        </div>

                        {/* Linked product — bound to the shared products[N] item (no duplicated fields) */}
                        {product && (
                          <div data-preview-list-path="products">
                            <div
                              data-preview-item-path={`products[${product.index}]`}
                              className="flex items-start gap-4"
                            >
                              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[11px] bg-[var(--loome-beige)]">
                                <img
                                  src={withBasePath(product.imageUrl)}
                                  alt={product.name}
                                  data-preview-field-path={`products[${product.index}].imageUrl`}
                                  data-preview-style-target={`products[${product.index}].imageUrl`}
                                  data-preview-style-type="image"
                                  className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.06]"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <EditableText
                                    as="h3"
                                    data-preview-field-path={`products[${product.index}].name`}
                                    defaultValue={product.name}
                                    fontFamily="heading"
                                    size="0.96875rem"
                                    weight={700}
                                    lineHeight={1.32}
                                    letterSpacing="-0.015em"
                                    color="heading"
                                    className="m-0 min-w-0"
                                  />
                                  {product.showPrice && (
                                    <span
                                      data-testid={`shop-look-price-${idx}`}
                                      data-preview-field-path={`products[${product.index}].price`}
                                      className="shrink-0 whitespace-nowrap pt-0.5 text-[14.5px] font-extrabold tracking-tight tabular-nums text-[var(--heading-color)]"
                                    >
                                      {formatLoomePrice(product.price, storeCurrency)}
                                    </span>
                                  )}
                                </div>

                                {product.description && (
                                  <EditableText
                                    as="p"
                                    data-preview-field-path={`products[${product.index}].description`}
                                    defaultValue={product.description}
                                    fontFamily="body"
                                    size="0.75rem"
                                    lineHeight={1.5}
                                    color="muted"
                                    className="mt-1 mb-0 line-clamp-2"
                                  />
                                )}

                                <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                                  <button
                                    type="button"
                                    data-testid="shop-look-add-bag"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddPiece(product);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-[10px] border-0 bg-[var(--loome-btn-primary-bg)] px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--loome-btn-primary-text)] transition-all hover:bg-[var(--loome-btn-primary-hover)]"
                                  >
                                    <ShoppingBag className="h-3 w-3 stroke-[1.7]" />
                                    <span data-preview-field-path="productDetailPage.addToBagLabel">
                                      {addToBagLabel}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    data-testid="shop-look-quick-view"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openQuickView(product);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--loome-border)] bg-transparent px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--heading-color)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                                  >
                                    <Eye className="h-3 w-3 stroke-[1.7]" />
                                    <span data-preview-field-path="home.shopTheLook.quickViewLabel">
                                      {quickViewLabel}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </LuxuryStaggerItem>
                  );
                })}
              </LuxuryStagger>
            )}

            <div className="pt-4">
              <a
                href={resolveExploreHref(exploreCtaUrl)}
                data-testid="shop-look-explore-all"
                data-preview-field-path="home.shopTheLook.exploreCtaUrl"
                className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--heading-color)] no-underline transition-colors hover:text-[var(--brand-accent)]"
              >
                <span data-preview-field-path="home.shopTheLook.exploreCtaLabel">
                  {exploreCtaLabel}
                </span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
