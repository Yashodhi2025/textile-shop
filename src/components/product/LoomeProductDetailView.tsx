'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  MessageCircle,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import {
  EditableText,
  getProductWhatsAppUrl,
  useCart,
  type ProductDetailItem,
} from '@deneb-ui/ui';
import {
  contentObject,
  contentText,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import {
  formatLoomePrice,
  normalizeLoomeProduct,
  resolveLoomeCurrency,
  useLoomeStore,
  type LoomeProduct,
} from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import LoomeProductCard from '@/components/LoomeProductCard';
import {
  LUXURY_EASE,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

const FREE_DELIVERY_THRESHOLD = 250;
const PENDING_CATEGORY_KEY = 'loome_pending_category_v1';

interface LoomeProductDetailViewProps {
  product: ProductDetailItem;
  productIndex: number;
}

interface SpecRow {
  label: string;
  value: string;
}

export default function LoomeProductDetailView({
  product: rawProduct,
  productIndex,
}: LoomeProductDetailViewProps) {
  const siteData = useSiteData();
  const catalogProducts = useProducts();
  const cart = useCart();
  const { toggleWishlist, isWishlisted, setActiveCategory } = useLoomeStore();
  const prefersReducedMotion = useReducedMotion();

  const normalized = useMemo(
    () => normalizeLoomeProduct(rawProduct, productIndex >= 0 ? productIndex : 0),
    [rawProduct, productIndex],
  );

  const idx = productIndex >= 0 ? productIndex : 0;

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'shop', 'about_us', 'services', 'contact'];
  const hasShopPage = requiredPages.includes('shop');
  const hasContactPage = requiredPages.includes('contact');

  const storeName = contentText(common.websiteTitle) || 'LOOMÉ';
  const storeCurrency = resolveLoomeCurrency(siteData, normalized.currency);
  const whatsappNumber =
    contentText(rawProduct.whatsappNumber) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);

  // Resolve real merchant sizes (fall back to platform options only if explicitly provided)
  const resolvedSizes = useMemo(() => {
    if (normalized.sizes.length > 0) return normalized.sizes;
    if (Array.isArray(rawProduct.options)) {
      return rawProduct.options.map((opt) => String(opt).trim()).filter(Boolean);
    }
    return [];
  }, [normalized.sizes, rawProduct.options]);

  // Build textile specifications strictly from real merchant product data
  const textileSpecs = useMemo<SpecRow[]>(() => {
    const rows: SpecRow[] = [];
    if (normalized.material) rows.push({ label: 'Material', value: normalized.material });
    if (normalized.composition) rows.push({ label: 'Composition', value: normalized.composition });
    if (normalized.gsm) rows.push({ label: 'Fabric Weight', value: normalized.gsm });
    if (normalized.dimensions) rows.push({ label: 'Dimensions', value: normalized.dimensions });

    if (Array.isArray(rawProduct.specs)) {
      rawProduct.specs.forEach((entry) => {
        const label = contentText(entry?.label);
        const value = contentText(entry?.value);
        if (label && value && !rows.some((r) => r.label.toLowerCase() === label.toLowerCase())) {
          rows.push({ label, value });
        }
      });
    }
    return rows;
  }, [
    normalized.material,
    normalized.composition,
    normalized.gsm,
    normalized.dimensions,
    rawProduct.specs,
  ]);

  const galleryImages = normalized.gallery;
  const hasMultipleImages = galleryImages.length > 1;
  const hasSwatches = normalized.hasExplicitColors;
  const hasSizes = resolvedSizes.length > 0;
  const hasSpecs = textileSpecs.length > 0;
  const hasCare = Boolean(normalized.careInstructions);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [isHoverZoomed, setIsHoverZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'specs' | 'care' | 'delivery' | null>(
    hasSpecs ? 'specs' : 'delivery',
  );

  // Reset interactive state whenever the resolved product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedColorIndex(0);
    setSelectedSizeIndex(0);
    setQuantity(1);
    setAddedFeedback(false);
    setIsHoverZoomed(false);
    setIsLightboxOpen(false);
    setOpenAccordion(textileSpecs.length > 0 ? 'specs' : 'delivery');
  }, [normalized.id, textileSpecs.length]);

  // Keyboard support for zoom lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight' && galleryImages.length > 1) {
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (e.key === 'ArrowLeft' && galleryImages.length > 1) {
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLightboxOpen, galleryImages.length]);

  const activeImage = galleryImages[activeImageIndex] ?? galleryImages[0] ?? normalized.imageUrl;
  const activeColor = hasSwatches
    ? normalized.colors[selectedColorIndex] ?? normalized.colors[0]
    : undefined;
  const activeSize = hasSizes
    ? resolvedSizes[selectedSizeIndex] ?? resolvedSizes[0]
    : undefined;
  const wishlisted = isWishlisted(normalized.id);

  const savingsPercent =
    normalized.showPrice &&
    normalized.compareAtPrice &&
    normalized.compareAtPrice > normalized.price &&
    normalized.price > 0
      ? Math.round(((normalized.compareAtPrice - normalized.price) / normalized.compareAtPrice) * 100)
      : null;

  const shippingSummary =
    contentText(rawProduct.shippingSummary) ||
    `Complimentary white-glove delivery on orders over ${formatLoomePrice(FREE_DELIVERY_THRESHOLD, storeCurrency)}. Standard atelier dispatch within 2–4 business days.`;
  const shippingReturns =
    contentText(rawProduct.shippingReturns) ||
    'Ready-to-ship textiles may be returned unworn and unwashed in original linen packaging within 30 days. Custom-cut yardage and bespoke drapery are crafted to order.';

  const whatsappHref = useMemo(() => {
    if (!whatsappNumber) return '';
    return getProductWhatsAppUrl(
      {
        name: normalized.name,
        price: normalized.price,
        showPrice: normalized.showPrice,
        color: activeColor?.name,
        size: activeSize,
      },
      whatsappNumber,
      { storeName, currency: storeCurrency },
    );
  }, [
    whatsappNumber,
    normalized.name,
    normalized.price,
    normalized.showPrice,
    activeColor?.name,
    activeSize,
    storeName,
    storeCurrency,
  ]);

  // Related products from live merchant catalog (same category first, exclude current item)
  const relatedProducts = useMemo<LoomeProduct[]>(() => {
    const all = catalogProducts.map((item, cIdx) => normalizeLoomeProduct(item, cIdx));
    const others = all.filter((item) => item.id !== normalized.id);
    if (others.length === 0) return [];
    const sameCategory = others.filter(
      (item) => item.category.toLowerCase() === normalized.category.toLowerCase(),
    );
    const differentCategory = others.filter(
      (item) => item.category.toLowerCase() !== normalized.category.toLowerCase(),
    );
    return [...sameCategory, ...differentCategory].slice(0, 4);
  }, [catalogProducts, normalized.id, normalized.category]);

  const handleImageMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleCategoryBreadcrumbClick = () => {
    setActiveCategory(normalized.category);
    try {
      window.sessionStorage.setItem(PENDING_CATEGORY_KEY, normalized.category);
    } catch {
      // Ignore restricted storage environments
    }
    window.location.href = hasShopPage ? withBasePath('/shop') : withBasePath('/#new-arrivals');
  };

  const handleAddToBag = () => {
    if (!normalized.isAvailable) return;
    cart.addItem({
      id: normalized.id,
      name: normalized.name,
      price: normalized.price,
      originalPrice: normalized.compareAtPrice ?? undefined,
      image: normalized.imageUrl,
      color: activeColor?.name,
      size: activeSize,
      quantity,
      showPrice: normalized.showPrice,
    });
    setAddedFeedback(true);
    window.setTimeout(() => {
      setAddedFeedback(false);
    }, 2200);
  };

  const handleSelectColor = (swatchIndex: number) => {
    setSelectedColorIndex(swatchIndex);
    // If raw merchant color entry maps to a specific gallery image, sync it smoothly
    const rawColors = Array.isArray(rawProduct.colors) ? rawProduct.colors : [];
    const entry = rawColors[swatchIndex];
    if (entry && typeof entry === 'object' && 'image' in entry && typeof entry.image === 'string') {
      const targetIdx = galleryImages.findIndex((url) => url === entry.image);
      if (targetIdx >= 0) {
        setActiveImageIndex(targetIdx);
      }
    }
  };

  const toggleAccordion = (panel: 'specs' | 'care' | 'delivery') => {
    setOpenAccordion((prev) => (prev === panel ? null : panel));
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  return (
    <div className="bg-[#F8F6F1] text-[#262923] dark:bg-[#171915] dark:text-[#F8F6F1]">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#262923]/8 bg-[#F8F6F1]/90 dark:border-[#F8F6F1]/10 dark:bg-[#171915]">
        <nav
          aria-label="Breadcrumb"
          className="loome-container flex flex-wrap items-center gap-2 py-4 text-[11px] uppercase tracking-[0.2em] text-[#65685E] dark:text-[#B6B8AE]"
        >
          <a
            href={withBasePath('/')}
            data-preview-static="breadcrumb-home"
            className="text-[#65685E] no-underline transition-colors hover:text-[#262923] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
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
                data-preview-static="breadcrumb-shop"
                className="text-[#65685E] no-underline transition-colors hover:text-[#262923] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
              >
                Shop
              </a>
              <span aria-hidden="true" className="text-[#B59B79]">
                /
              </span>
            </>
          )}
          <button
            type="button"
            onClick={handleCategoryBreadcrumbClick}
            data-preview-static="breadcrumb-category"
            className="border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#65685E] transition-colors hover:text-[#262923] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]"
          >
            {normalized.category}
          </button>
          <span aria-hidden="true" className="text-[#B59B79]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-static="breadcrumb-current"
            className="max-w-[240px] truncate text-[#262923] dark:text-[#F8F6F1] sm:max-w-md"
          >
            {normalized.name}
          </span>
        </nav>
      </div>

      {/* Main Editorial Product Detail Split */}
      <section className="loome-container py-10 sm:py-14 lg:py-20">
        <div
          data-preview-item-path={`products[${idx}]`}
          className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-14 xl:gap-16"
        >
          {/* Left Column: Large Product Gallery with Thumbnails & Zoom */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:gap-5">
              {/* Thumbnail Rail — rendered ONLY when multiple real images exist */}
              {hasMultipleImages && (
                <div
                  role="tablist"
                  aria-label="Product gallery thumbnails"
                  className="flex gap-3 overflow-x-auto pb-1 sm:w-[84px] sm:shrink-0 sm:flex-col sm:overflow-visible sm:pb-0"
                >
                  {galleryImages.map((imgUrl, gIdx) => {
                    const isSelected = gIdx === activeImageIndex;
                    return (
                      <button
                        key={`${normalized.id}-thumb-${gIdx}`}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        aria-label={`View image ${gIdx + 1} of ${galleryImages.length}`}
                        data-preview-static={`gallery-thumb-${gIdx}`}
                        onClick={() => setActiveImageIndex(gIdx)}
                        className={`group relative aspect-[4/5] w-[72px] shrink-0 overflow-hidden bg-[#E8E0D5]/50 transition-all duration-300 sm:w-full dark:bg-[#20231D] ${
                          isSelected
                            ? 'ring-1 ring-[#262923] ring-offset-2 ring-offset-[#F8F6F1] dark:ring-[#B59B79] dark:ring-offset-[#171915]'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={withBasePath(imgUrl)}
                          alt={`${normalized.name} — detail view ${gIdx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-500 ease-luxury group-hover:scale-105"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Primary Editorial Image Stage */}
              <div className="relative flex-1">
                <div
                  onMouseEnter={() => {
                    if (!prefersReducedMotion) setIsHoverZoomed(true);
                  }}
                  onMouseLeave={() => setIsHoverZoomed(false)}
                  onMouseMove={handleImageMouseMove}
                  onClick={() => setIsLightboxOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsLightboxOpen(true);
                    }
                  }}
                  aria-label={`Zoom ${normalized.name} image`}
                  data-preview-static="product-gallery-zoom-stage"
                  className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-[#E8E0D5]/45 dark:bg-[#20231D]"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={prefersReducedMotion ? false : { opacity: 0.25, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0.2 }}
                      transition={{ duration: 0.45, ease: LUXURY_EASE }}
                      className="h-full w-full"
                    >
                      <img
                        src={withBasePath(activeImage)}
                        alt={normalized.name}
                        data-preview-field-path={`products[${idx}].imageUrl`}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out"
                        style={{
                          transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                          transform:
                            isHoverZoomed && !prefersReducedMotion ? 'scale(1.42)' : 'scale(1)',
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Editorial Badge (only when provided) */}
                  {normalized.badge && (
                    <span
                      data-preview-field-path={`products[${idx}].badge`}
                      className="pointer-events-none absolute left-4 top-4 bg-[#F8F6F1]/92 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#262923] backdrop-blur-sm"
                    >
                      {normalized.badge}
                    </span>
                  )}

                  {/* Zoom Affordance Pill */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#F8F6F1]/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#262923] opacity-90 backdrop-blur-sm transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Maximize2 className="h-3 w-3 stroke-[1.5]" />
                    Inspect Weave
                  </span>

                  {/* Prev / Next Gallery Arrows — only when multiple images exist */}
                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        aria-label="Previous product image"
                        data-preview-static="gallery-prev"
                        className="absolute left-3.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#F8F6F1]/88 text-[#262923] backdrop-blur-sm transition-all duration-300 hover:bg-[#262923] hover:text-[#F8F6F1] sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        aria-label="Next product image"
                        data-preview-static="gallery-next"
                        className="absolute right-3.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#F8F6F1]/88 text-[#262923] backdrop-blur-sm transition-all duration-300 hover:bg-[#262923] hover:text-[#F8F6F1] sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <ChevronRight className="h-4 w-4 stroke-[1.5]" />
                      </button>
                    </>
                  )}
                </div>

                {/* Subtle gallery caption counter when multiple images exist */}
                {hasMultipleImages && (
                  <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#65685E] dark:text-[#B6B8AE]">
                    <span data-preview-static="gallery-hint">
                      Hover to inspect texture · Click for full view
                    </span>
                    <span data-preview-static="gallery-counter">
                      0{activeImageIndex + 1} / 0{galleryImages.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Buying & Specifications Panel */}
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: LUXURY_EASE }}
            >
              {/* Eyebrow Metadata */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  data-preview-field-path={`products[${idx}].category`}
                  className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]"
                >
                  {normalized.category}
                </span>
                {normalized.collectionTag && (
                  <>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#B59B79]" />
                    <span
                      data-preview-static="product-collection-tag"
                      className="text-[11px] uppercase tracking-[0.2em] text-[#65685E] dark:text-[#B6B8AE]"
                    >
                      {normalized.collectionTag}
                    </span>
                  </>
                )}
              </div>

              {/* Product Title */}
              <EditableText
                as="h1"
                data-preview-field-path={`products[${idx}].name`}
                defaultValue={normalized.name}
                fontFamily="heading"
                size="clamp(2.2rem, 3.6vw, 3.25rem)"
                weight={300}
                lineHeight={1.06}
                letterSpacing="-0.015em"
                color="inherit"
                className="mt-3 mb-0 text-[#262923] dark:text-[#F8F6F1]"
              />

              {/* Price + Real Availability Indicator */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#262923]/10 pb-6 dark:border-[#F8F6F1]/12">
                <div className="flex items-baseline gap-3">
                  <span
                    data-preview-field-path={`products[${idx}].price`}
                    className="font-serif text-3xl font-normal tracking-wide text-[#262923] dark:text-[#F8F6F1]"
                  >
                    {normalized.showPrice
                      ? formatLoomePrice(normalized.price, storeCurrency)
                      : 'Price Upon Inquiry'}
                  </span>
                  {normalized.showPrice && normalized.compareAtPrice && (
                    <span
                      data-preview-field-path={`products[${idx}].compareAtPrice`}
                      className="text-sm text-[#65685E]/80 line-through dark:text-[#B6B8AE]/75"
                    >
                      {formatLoomePrice(normalized.compareAtPrice, storeCurrency)}
                    </span>
                  )}
                  {savingsPercent && (
                    <span
                      data-preview-static="product-savings-badge"
                      className="bg-[#E8E0D5]/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#262923] dark:bg-[#262923] dark:text-[#B59B79]"
                    >
                      Save {savingsPercent}%
                    </span>
                  )}
                </div>

                <div
                  data-preview-static="product-availability-pill"
                  className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      normalized.isAvailable ? 'bg-[#747B65]' : 'bg-[#A1685A]'
                    }`}
                  />
                  <span
                    className={
                      normalized.isAvailable
                        ? 'text-[#555B49] dark:text-[#B5C09F]'
                        : 'text-[#8C5245] dark:text-[#E2A89B]'
                    }
                  >
                    {normalized.isAvailable ? 'In Stock' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Editorial Product Description */}
              {normalized.description && (
                <EditableText
                  as="p"
                  data-preview-field-path={`products[${idx}].description`}
                  defaultValue={normalized.description}
                  fontFamily="body"
                  size="0.9375rem"
                  lineHeight={1.82}
                  color="muted"
                  className="mt-6 mb-0"
                />
              )}

              {/* Subtle Textile Highlight Strip — strictly from real provided fields */}
              {(normalized.material || normalized.gsm || normalized.dimensions) && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {normalized.material && (
                    <span
                      data-preview-static="product-material-pill"
                      className="border border-[#262923]/12 bg-[#FCFBF8] px-3 py-1.5 text-[11px] tracking-wide text-[#494D44] dark:border-[#F8F6F1]/14 dark:bg-[#20231D] dark:text-[#D5D6CF]"
                    >
                      {normalized.material}
                    </span>
                  )}
                  {normalized.gsm && (
                    <span
                      data-preview-static="product-gsm-pill"
                      className="border border-[#262923]/12 bg-[#FCFBF8] px-3 py-1.5 text-[11px] tracking-wide text-[#494D44] dark:border-[#F8F6F1]/14 dark:bg-[#20231D] dark:text-[#D5D6CF]"
                    >
                      {normalized.gsm}
                    </span>
                  )}
                </div>
              )}

              {/* Interactive Fabric Color Swatches — rendered ONLY when explicit colors exist */}
              {hasSwatches && activeColor && (
                <div className="mt-7">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em]">
                    <span
                      data-preview-static="color-swatch-label"
                      className="font-medium text-[#65685E] dark:text-[#B6B8AE]"
                    >
                      Fabric Tone
                    </span>
                    <span
                      data-preview-static="color-swatch-value"
                      className="font-medium text-[#262923] dark:text-[#F8F6F1]"
                    >
                      {activeColor.name}
                    </span>
                  </div>
                  <div
                    data-preview-list-path={`products[${idx}].colors`}
                    className="mt-3 flex flex-wrap items-center gap-3"
                  >
                    {normalized.colors.map((swatch, sIdx) => {
                      const selected = sIdx === selectedColorIndex;
                      return (
                        <span
                          key={`${normalized.id}-detail-swatch-${swatch.name}-${sIdx}`}
                          data-preview-item-path={`products[${idx}].colors[${sIdx}]`}
                          className="inline-flex"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectColor(sIdx)}
                            aria-label={`Select color tone ${swatch.name}`}
                            aria-pressed={selected}
                            title={swatch.name}
                            data-preview-static={`detail-swatch-${sIdx}`}
                            className={`group flex items-center gap-2.5 border px-3 py-2 text-xs transition-all duration-300 ${
                              selected
                                ? 'border-[#262923] bg-[#FCFBF8] text-[#262923] dark:border-[#B59B79] dark:bg-[#20231D] dark:text-[#F8F6F1]'
                                : 'border-[#262923]/14 bg-transparent text-[#595C52] hover:border-[#262923]/40 dark:border-[#F8F6F1]/16 dark:text-[#B6B8AE] dark:hover:border-[#F8F6F1]/40'
                            }`}
                          >
                            <span
                              className={`h-4 w-4 rounded-full border border-[#262923]/25 transition-transform duration-300 ${
                                selected ? 'scale-105 ring-1 ring-[#B59B79] ring-offset-1 ring-offset-[#FCFBF8] dark:ring-offset-[#20231D]' : ''
                              }`}
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span className="tracking-wide">{swatch.name}</span>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Size / Measurement Selector — rendered ONLY when real sizes exist */}
              {hasSizes && activeSize && (
                <div className="mt-7">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em]">
                    <span
                      data-preview-static="size-selector-label"
                      className="inline-flex items-center gap-1.5 font-medium text-[#65685E] dark:text-[#B6B8AE]"
                    >
                      <Ruler className="h-3.5 w-3.5 stroke-[1.5] text-[#747B65] dark:text-[#B59B79]" />
                      Size &amp; Measurement
                    </span>
                    <span
                      data-preview-static="size-selector-value"
                      className="font-medium text-[#262923] dark:text-[#F8F6F1]"
                    >
                      {activeSize}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {resolvedSizes.map((sizeOption, szIdx) => {
                      const selected = szIdx === selectedSizeIndex;
                      return (
                        <button
                          key={`${normalized.id}-size-${sizeOption}`}
                          type="button"
                          onClick={() => setSelectedSizeIndex(szIdx)}
                          aria-pressed={selected}
                          data-preview-static={`detail-size-${szIdx}`}
                          className={`border px-3.5 py-2.5 text-left text-xs tracking-wide transition-all duration-300 ${
                            selected
                              ? 'border-[#262923] bg-[#262923] text-[#F8F6F1] dark:border-[#F8F6F1] dark:bg-[#F8F6F1] dark:text-[#262923]'
                              : 'border-[#262923]/16 bg-[#FCFBF8] text-[#262923] hover:border-[#262923]/45 dark:border-[#F8F6F1]/16 dark:bg-[#20231D] dark:text-[#F8F6F1] dark:hover:border-[#F8F6F1]/45'
                          }`}
                        >
                          {sizeOption}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper + Add to Bag + Wishlist Row */}
              <div className="mt-8 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                  {/* Quantity Selector */}
                  <div className="flex h-[50px] items-center justify-between border border-[#262923]/20 bg-[#FCFBF8] px-1 dark:border-[#F8F6F1]/20 dark:bg-[#20231D] sm:w-32 sm:shrink-0">
                    <button
                      type="button"
                      disabled={!normalized.isAvailable || quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      data-preview-static="detail-qty-decrease"
                      className="flex h-10 w-10 items-center justify-center text-[#262923] transition-colors hover:bg-[#262923]/6 disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/10"
                    >
                      <Minus className="h-3.5 w-3.5 stroke-[1.5]" />
                    </button>
                    <span
                      aria-live="polite"
                      data-preview-static="detail-qty-value"
                      className="w-8 text-center text-sm font-medium"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={!normalized.isAvailable || quantity >= 99}
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      aria-label="Increase quantity"
                      data-preview-static="detail-qty-increase"
                      className="flex h-10 w-10 items-center justify-center text-[#262923] transition-colors hover:bg-[#262923]/6 disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/10"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[1.5]" />
                    </button>
                  </div>

                  {/* Primary Add to Bag CTA */}
                  <motion.button
                    type="button"
                    whileTap={normalized.isAvailable ? { scale: 0.99 } : undefined}
                    disabled={!normalized.isAvailable}
                    onClick={handleAddToBag}
                    data-preview-static="detail-add-to-bag"
                    className={`flex h-[50px] flex-1 items-center justify-center gap-2.5 px-6 text-[11px] font-medium uppercase tracking-[0.22em] transition-all duration-300 ${
                      !normalized.isAvailable
                        ? 'cursor-not-allowed bg-[#262923]/25 text-[#262923]/60 dark:bg-[#F8F6F1]/15 dark:text-[#F8F6F1]/50'
                        : addedFeedback
                          ? 'bg-[#747B65] text-[#F8F6F1]'
                          : 'bg-[#262923] text-[#F8F6F1] hover:bg-[#747B65] dark:bg-[#F8F6F1] dark:text-[#262923] dark:hover:bg-[#E8E0D5]'
                    }`}
                  >
                    {addedFeedback ? (
                      <>
                        <Check className="h-4 w-4 stroke-[1.75]" />
                        Added to Bag
                      </>
                    ) : normalized.isAvailable ? (
                      <>
                        <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
                        Add to Bag
                      </>
                    ) : (
                      'Currently Unavailable'
                    )}
                  </motion.button>

                  {/* Wishlist Toggle */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleWishlist(normalized.id)}
                    aria-label={
                      wishlisted
                        ? `Remove ${normalized.name} from wishlist`
                        : `Save ${normalized.name} to wishlist`
                    }
                    aria-pressed={wishlisted}
                    data-preview-static="detail-wishlist-toggle"
                    className={`flex h-[50px] items-center justify-center gap-2 border px-4 text-[11px] font-medium uppercase tracking-[0.18em] transition-all duration-300 sm:w-[50px] sm:shrink-0 sm:px-0 ${
                      wishlisted
                        ? 'border-[#262923] bg-[#262923] text-[#B59B79] dark:border-[#B59B79] dark:bg-[#262923]'
                        : 'border-[#262923]/20 bg-[#FCFBF8] text-[#262923] hover:border-[#262923] dark:border-[#F8F6F1]/20 dark:bg-[#20231D] dark:text-[#F8F6F1] dark:hover:border-[#F8F6F1]'
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 stroke-[1.5] ${wishlisted ? 'fill-[#B59B79]' : ''}`}
                    />
                    <span className="sm:sr-only">{wishlisted ? 'Saved' : 'Save'}</span>
                  </motion.button>
                </div>

                {/* Atelier Concierge WhatsApp Inquiry (only when merchant WhatsApp/phone is set) */}
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="detail-concierge-whatsapp"
                    className="flex h-[46px] w-full items-center justify-center gap-2 border border-[#262923]/18 bg-transparent px-5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#262923] no-underline transition-colors duration-300 hover:border-[#262923] hover:bg-[#262923]/5 dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/8"
                  >
                    <MessageCircle className="h-3.5 w-3.5 stroke-[1.5] text-[#747B65] dark:text-[#B59B79]" />
                    Inquire via Atelier Concierge
                  </a>
                )}
              </div>

              {/* Delivery & Atelier Assurance Strip */}
              <div className="mt-7 grid grid-cols-1 gap-3 border-y border-[#262923]/10 py-5 text-xs text-[#595C52] dark:border-[#F8F6F1]/12 dark:text-[#C8CAC1] sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.4] text-[#747B65] dark:text-[#B59B79]" />
                  <div>
                    <p
                      data-preview-static="delivery-strip-title"
                      className="m-0 font-medium text-[#262923] dark:text-[#F8F6F1]"
                    >
                      White-Glove Delivery
                    </p>
                    <p data-preview-static="delivery-strip-note" className="m-0 mt-0.5 leading-relaxed">
                      Complimentary over {formatLoomePrice(FREE_DELIVERY_THRESHOLD, storeCurrency)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.4] text-[#747B65] dark:text-[#B59B79]" />
                  <div>
                    <p
                      data-preview-static="swatch-strip-title"
                      className="m-0 font-medium text-[#262923] dark:text-[#F8F6F1]"
                    >
                      Bespoke Sizing &amp; Swatches
                    </p>
                    <p data-preview-static="swatch-strip-note" className="m-0 mt-0.5 leading-relaxed">
                      {hasContactPage ? (
                        <a
                          href={withBasePath('/contact')}
                          data-target-page="contact"
                          data-preview-static="swatch-contact-link"
                          className="text-[#595C52] underline decoration-[#B59B79] underline-offset-4 transition-colors hover:text-[#262923] dark:text-[#C8CAC1] dark:hover:text-[#F8F6F1]"
                        >
                          Request complimentary fabric swatches
                        </a>
                      ) : (
                        'Crafted to order by our textile specialists'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expandable Product Detail Accordions */}
              <div className="divide-y divide-[#262923]/10 border-b border-[#262923]/10 dark:divide-[#F8F6F1]/12 dark:border-[#F8F6F1]/12">
                {/* 1. Textile Specifications — ONLY rendered when real specs exist */}
                {hasSpecs && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion('specs')}
                      aria-expanded={openAccordion === 'specs'}
                      data-preview-static="accordion-specs-toggle"
                      className="flex w-full items-center justify-between py-4 text-left text-[11px] font-medium uppercase tracking-[0.22em] text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
                    >
                      <span>Textile Specifications</span>
                      <ChevronDown
                        className={`h-4 w-4 stroke-[1.5] text-[#747B65] transition-transform duration-300 dark:text-[#B59B79] ${
                          openAccordion === 'specs' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openAccordion === 'specs' && (
                        <motion.div
                          initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: LUXURY_EASE }}
                          className="overflow-hidden"
                        >
                          <dl className="space-y-3 pb-5 pt-1 text-sm">
                            {textileSpecs.map((spec) => (
                              <div
                                key={spec.label}
                                className="flex flex-col justify-between gap-1 border-b border-[#262923]/6 pb-2.5 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-4 dark:border-[#F8F6F1]/8"
                              >
                                <dt
                                  data-preview-static={`spec-label-${spec.label}`}
                                  className="text-[11px] uppercase tracking-[0.18em] text-[#65685E] dark:text-[#B6B8AE]"
                                >
                                  {spec.label}
                                </dt>
                                <dd
                                  data-preview-static={`spec-value-${spec.label}`}
                                  className="m-0 text-sm text-[#262923] sm:text-right dark:text-[#F8F6F1]"
                                >
                                  {spec.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 2. Care & Longevity — ONLY rendered when real careInstructions exist */}
                {hasCare && normalized.careInstructions && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion('care')}
                      aria-expanded={openAccordion === 'care'}
                      data-preview-static="accordion-care-toggle"
                      className="flex w-full items-center justify-between py-4 text-left text-[11px] font-medium uppercase tracking-[0.22em] text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
                    >
                      <span>Care &amp; Longevity</span>
                      <ChevronDown
                        className={`h-4 w-4 stroke-[1.5] text-[#747B65] transition-transform duration-300 dark:text-[#B59B79] ${
                          openAccordion === 'care' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openAccordion === 'care' && (
                        <motion.div
                          initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: LUXURY_EASE }}
                          className="overflow-hidden"
                        >
                          <p
                            data-preview-static="product-care-instructions"
                            className="m-0 pb-5 pt-1 text-sm leading-relaxed text-[#595C52] dark:text-[#C8CAC1]"
                          >
                            {normalized.careInstructions}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 3. Delivery & Atelier Returns */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('delivery')}
                    aria-expanded={openAccordion === 'delivery'}
                    data-preview-static="accordion-delivery-toggle"
                    className="flex w-full items-center justify-between py-4 text-left text-[11px] font-medium uppercase tracking-[0.22em] text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
                  >
                    <span>Delivery &amp; Atelier Returns</span>
                    <ChevronDown
                      className={`h-4 w-4 stroke-[1.5] text-[#747B65] transition-transform duration-300 dark:text-[#B59B79] ${
                        openAccordion === 'delivery' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openAccordion === 'delivery' && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: LUXURY_EASE }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pb-5 pt-1 text-sm leading-relaxed text-[#595C52] dark:text-[#C8CAC1]">
                          <p data-preview-static="product-shipping-summary" className="m-0">
                            {shippingSummary}
                          </p>
                          <p data-preview-static="product-shipping-returns" className="m-0">
                            {shippingReturns}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#262923]/8 bg-[#F4F0E8]/60 py-16 dark:border-[#F8F6F1]/10 dark:bg-[#1B1E18] sm:py-20 lg:py-24">
          <div className="loome-container">
            <LuxuryReveal>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <span
                    data-preview-static="related-eyebrow"
                    className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
                  >
                    <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" />
                    Curated Pairings
                  </span>
                  <h2
                    data-preview-static="related-heading"
                    className="mt-2.5 mb-0 font-serif text-3xl font-light tracking-[-0.015em] text-[#262923] dark:text-[#F8F6F1] sm:text-4xl"
                  >
                    Complementary Atelier Textiles
                  </h2>
                </div>
                {hasShopPage && (
                  <a
                    href={withBasePath('/shop')}
                    data-target-page="shop"
                    data-preview-static="related-view-all-shop"
                    className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#262923] no-underline transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
                  >
                    Explore All Textiles
                    <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" />
                  </a>
                )}
              </div>
            </LuxuryReveal>

            <LuxuryStagger className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relProduct) => (
                <LuxuryStaggerItem key={relProduct.id}>
                  <LoomeProductCard product={relProduct} />
                </LuxuryStaggerItem>
              ))}
            </LuxuryStagger>
          </div>
        </section>
      )}

      {/* Full-Screen Weave Zoom Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${normalized.name} enlarged view`}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#141612]/92 p-4 backdrop-blur-md sm:p-8"
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close enlarged view"
              data-preview-static="lightbox-close"
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#F8F6F1]/25 bg-[#262923]/80 text-[#F8F6F1] transition-colors hover:bg-[#F8F6F1] hover:text-[#262923]"
            >
              <X className="h-5 w-5 stroke-[1.5]" />
            </button>

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous image"
                  data-preview-static="lightbox-prev"
                  className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#F8F6F1]/25 bg-[#262923]/80 text-[#F8F6F1] transition-colors hover:bg-[#F8F6F1] hover:text-[#262923] sm:left-8"
                >
                  <ChevronLeft className="h-5 w-5 stroke-[1.5]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next image"
                  data-preview-static="lightbox-next"
                  className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#F8F6F1]/25 bg-[#262923]/80 text-[#F8F6F1] transition-colors hover:bg-[#F8F6F1] hover:text-[#262923] sm:right-8"
                >
                  <ChevronRight className="h-5 w-5 stroke-[1.5]" />
                </button>
              </>
            )}

            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[88vh] max-w-4xl flex-col items-center"
            >
              <img
                src={withBasePath(activeImage)}
                alt={normalized.name}
                className="max-h-[80vh] w-auto max-w-full object-contain shadow-2xl"
              />
              <div className="mt-4 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-[#E8E0D5]">
                <span data-preview-static="lightbox-title">{normalized.name}</span>
                {hasMultipleImages && (
                  <span data-preview-static="lightbox-counter" className="text-[#B59B79]">
                    0{activeImageIndex + 1} / 0{galleryImages.length}
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
