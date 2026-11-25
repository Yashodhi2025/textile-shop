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

  const home = contentObject(contentObject(siteData.content).home);
  const look = contentObject(home.shopTheLook);
  const rawHotspots = contentList(look.hotspots);

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
      x: Math.min(88, Math.max(12, x)),
      y: Math.min(86, Math.max(14, y)),
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
      className="loome-surface-beige w-full border-y border-[#49382D]/10 py-16 dark:border-[#C8A98B]/16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
        <LuxuryReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <EditableText
              as="p"
              data-preview-field-path="home.shopTheLook.eyebrow"
              defaultValue={contentText(look.eyebrow) || 'INTERACTIVE STYLING'}
              fontFamily="body"
              size="0.6875rem"
              weight={600}
              transform="uppercase"
              letterSpacing="0.26em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.shopTheLook.title"
              defaultValue={contentText(look.title) || 'Shop the Look'}
              fontFamily="heading"
              size="clamp(2.25rem, 4vw, 3.4rem)"
              weight={800}
              lineHeight={1.04}
              letterSpacing="-0.03em"
              color="heading"
              className="mt-3 mb-0"
            />
          </div>
          <EditableText
            as="p"
            data-preview-field-path="home.shopTheLook.subtitle"
            defaultValue={contentText(look.subtitle)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.75}
            color="muted"
            className="m-0 max-w-md"
          />
        </LuxuryReveal>

        <div className="mt-14 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left: Interactive Hotspot Room Photograph with 16px rounded frame */}
          <div className="relative lg:col-span-7">
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-[#3B302B]/14 bg-[#201C1A]">
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
                    className="h-full w-full scale-[1.06] object-cover"
                  />
                </motion.div>
              </LuxuryImageReveal>
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#201C1A]/55 via-transparent to-transparent" />

              {/* Interactive Pulsing Champagne Hotspots */}
              {hotspots.map((spot, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    data-preview-static={`shop-look-hotspot-${idx}`}
                    onClick={() => setActiveIndex(idx)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    aria-label={`Inspect ${spot.label}`}
                    aria-pressed={isSelected}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-2 focus:outline-none"
                  >
                    <span
                      className={`loome-hotspot-ring absolute inset-1 rounded-full bg-[#C8A98B]/75 ${
                        isSelected ? 'opacity-100' : 'opacity-60'
                      }`}
                    />
                    <span
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold shadow-lg transition-all duration-300 ${
                        isSelected
                          ? 'scale-110 border-[#C8A98B] bg-[#201C1A] text-[#F2E9DE]'
                          : 'border-[#F2E9DE] bg-[#F2E9DE]/95 text-[#201C1A] hover:scale-105 hover:bg-[#C8A98B]'
                      }`}
                    >
                      {isSelected ? `0${idx + 1}` : <Plus className="h-3.5 w-3.5 stroke-[1.8]" />}
                    </span>
                  </button>
                );
              })}

              {/* Subtle Floating Active Piece Card on Desktop */}
              {activeSpot?.product && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSpot.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                    transition={
                      prefersReducedMotion ? { duration: 0 } : { duration: 0.38, ease: LUXURY_EASE }
                    }
                    className="absolute bottom-4 left-4 right-4 z-20 hidden items-center justify-between gap-4 rounded-[14px] border border-[#C8A98B]/35 bg-[#201C1A]/85 px-5 py-3.5 text-[#F2E9DE] backdrop-blur-md sm:flex"
                  >
                    <div className="min-w-0">
                      <p
                        data-preview-static="shop-look-pill-label"
                        className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C8A98B]"
                      >
                        0{safeIndex + 1} · {activeSpot.label}
                      </p>
                      <p
                        data-preview-static="shop-look-pill-name"
                        className="mt-0.5 m-0 truncate font-heading text-base font-bold"
                      >
                        {activeSpot.product.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      data-preview-static="shop-look-inspect-btn"
                      onClick={() => openQuickView(activeSpot.product!)}
                      className="shrink-0 rounded-[10px] border border-[#C8A98B]/60 bg-[#C8A98B] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#201C1A] transition-all hover:bg-[#D8BFA4]"
                    >
                      Inspect Piece
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right: Synchronized Curated Pieces List */}
          <div
            data-preview-list-path="home.shopTheLook.hotspots"
            className="lg:col-span-5"
          >
            {hotspots.length === 0 ? (
              <div
                data-preview-static="shop-look-empty"
                className="rounded-2xl border border-dashed border-[#3B302B]/25 p-10 text-center text-sm text-[#5E4E45]"
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
                        data-preview-item-path={`home.shopTheLook.hotspots[${spot.index}]`}
                        onClick={() => setActiveIndex(idx)}
                        className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${
                          isSelected
                            ? 'border-[#B28B65] bg-white shadow-[0_8px_24px_rgba(73,56,45,0.08)] dark:border-[#C8A98B] dark:bg-[#28211D]'
                            : 'border-[#49382D]/12 bg-white/85 hover:border-[#B28B65]/70 dark:border-[#C8A98B]/18 dark:bg-[#241D1A] dark:hover:border-[#C8A98B]/55'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {product && (
                            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[11px] bg-[#E6D9C9] dark:bg-[#3B302B]">
                              <img
                                src={withBasePath(product.imageUrl)}
                                alt={product.name}
                                data-preview-static="shop-look-product-thumb"
                                className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.06]"
                              />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8D7667] dark:text-[#C8A98B]">
                                <span data-preview-static="shop-look-num">0{idx + 1} · </span>
                                <span data-preview-field-path={`home.shopTheLook.hotspots[${spot.index}].label`}>
                                  {spot.label}
                                </span>
                              </span>
                              {product && product.showPrice && (
                                <span
                                  data-preview-static="shop-look-price"
                                  className="text-sm font-bold text-[#201C1A] dark:text-[#F5EEE6]"
                                >
                                  {formatLoomePrice(product.price, storeCurrency)}
                                </span>
                              )}
                            </div>

                            {product && (
                              <h3
                                data-preview-static="shop-look-product-title"
                                className="mt-1 m-0 font-heading text-lg font-bold leading-snug text-[#201C1A] dark:text-[#F5EEE6]"
                              >
                                {product.name}
                              </h3>
                            )}

                            <p
                              data-preview-field-path={`home.shopTheLook.hotspots[${spot.index}].note`}
                              className="mt-1 m-0 text-xs leading-relaxed text-[#5E4E45] dark:text-[#C9B9AA]"
                            >
                              {spot.note}
                            </p>

                            {product && (
                              <div className="mt-3.5 flex flex-wrap items-center gap-3">
                                <button
                                  type="button"
                                  data-preview-static="shop-look-add-bag"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddPiece(product);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#201C1A] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F2E9DE] transition-all hover:bg-[#3B302B] hover:text-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A] dark:hover:bg-[#D8BFA4]"
                                >
                                  <ShoppingBag className="h-3 w-3 stroke-[1.6]" />
                                  Add to Bag
                                </button>
                                <button
                                  type="button"
                                  data-preview-static="shop-look-quick-view"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openQuickView(product);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-[10px] border border-[#3B302B]/25 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3B302B] transition-colors hover:border-[#201C1A] hover:text-[#201C1A] dark:border-[#C8A98B]/35 dark:text-[#F5EEE6] dark:hover:border-[#C8A98B] dark:hover:text-[#C8A98B]"
                                >
                                  <Eye className="h-3 w-3 stroke-[1.6]" />
                                  Quick View
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </LuxuryStaggerItem>
                  );
                })}
              </LuxuryStagger>
            )}

            {hotspots.length > 0 && (
              <div className="pt-5">
                <a
                  href={withBasePath('/collections/')}
                  data-preview-static="shop-look-explore-all"
                  className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2C211B] no-underline transition-colors hover:text-[#B28B65] dark:text-[#F5EEE6] dark:hover:text-[#C8A98B]"
                >
                  Explore Collections
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
