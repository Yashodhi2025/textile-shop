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
  buildShopCategoryHref,
  slugifyCategoryId,
} from '@/lib/categoryUtils';
import {
  formatLoomePrice,
  normalizeLoomeProduct,
  resolveFreeDeliveryThreshold,
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
  const navLabels = contentObject(common.navLabels);
  const contact = contentObject(content.contact);
  const detailCopy = contentObject(content.productDetailPage);
  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'shop', 'about_us', 'services', 'contact'];
  const hasShopPage = requiredPages.includes('shop');
  const hasContactPage = requiredPages.includes('contact');

  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const shopNavLabel = contentText(navLabels.shop) || 'Shop';
  const toneLabel = contentText(detailCopy.toneLabel) || 'Tone';
  const sizeLabel = contentText(detailCopy.sizeLabel) || 'Size & Measurement';
  const addToBagLabel = contentText(detailCopy.addToBagLabel) || 'Add to Bag';
  const whatsappInquireLabel =
    contentText(detailCopy.whatsappInquireLabel) || 'Inquire via Atelier Concierge';
  const deliveryTitle = contentText(detailCopy.deliveryTitle) || 'Island-Wide Delivery';
  const deliveryNoteFallback =
    contentText(detailCopy.deliveryNote) || 'Personal atelier concierge dispatch';
  const swatchTitle = contentText(detailCopy.swatchTitle) || 'Bespoke Sizing & Swatches';
  const swatchLinkLabel =
    contentText(detailCopy.swatchLinkLabel) || 'Request complimentary fabric swatches';
  const specsHeading = contentText(detailCopy.specsHeading) || 'Textile Specifications';
  const careHeading = contentText(detailCopy.careHeading) || 'Fabric Care & Longevity';
  const shippingHeading = contentText(detailCopy.shippingHeading) || 'Shipping & Returns';
  const relatedEyebrow = contentText(detailCopy.relatedEyebrow) || 'Curated Pairings';
  const relatedHeading = contentText(detailCopy.relatedHeading) || 'You May Also Like';
  const relatedCtaLabel = contentText(detailCopy.relatedCtaLabel) || 'View Full Collection';

  const storeName = contentText(common.websiteTitle) || 'LOOMÉ';
  const storeCurrency = resolveLoomeCurrency(siteData, normalized.currency);
  const freeDeliveryThreshold = resolveFreeDeliveryThreshold(siteData);
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
    contentText(detailCopy.defaultShippingSummary) ||
    (freeDeliveryThreshold > 0
      ? `Complimentary white-glove delivery on orders over ${formatLoomePrice(freeDeliveryThreshold, storeCurrency)}. Standard atelier dispatch within 2–4 business days.`
      : 'White-glove atelier delivery arranged personally at checkout. Standard atelier dispatch within 2–4 business days.');
  const shippingReturns =
    contentText(rawProduct.shippingReturns) ||
    contentText(detailCopy.defaultShippingReturns) ||
    'Ready-to-ship textiles may be returned unworn and unwashed in original linen packaging within our store return window. Custom-cut yardage and bespoke drapery are crafted to order.';

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
    window.location.href = hasShopPage
      ? buildShopCategoryHref(slugifyCategoryId(normalized.category))
      : withBasePath('/#new-arrivals');
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
    <div className="loome-surface-cream min-h-[75vh] w-full">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#201C1A]/10 bg-[#FAF5EE]/90 dark:border-[#C8A98B]/16 dark:bg-[#201C1A]">
        <nav
          aria-label="Breadcrumb"
          className="loome-container flex flex-wrap items-center gap-2 py-4 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C9B9AA]"
        >
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] transition-colors hover:text-[#201C1A] dark:text-[#C9B9AA] dark:hover:text-[#F5EEE6]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" className="text-[#C8A98B]">
            /
          </span>
          {hasShopPage && (
            <>
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath('/shop'))}
                data-target-page="shop"
                className="cursor-pointer border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] transition-colors hover:text-[#201C1A] dark:text-[#C9B9AA] dark:hover:text-[#F5EEE6]"
              >
                <span data-preview-field-path="common.navLabels.shop">{shopNavLabel}</span>
              </button>
              <span aria-hidden="true" className="text-[#C8A98B]">
                /
              </span>
            </>
          )}
          <button
            type="button"
            onClick={handleCategoryBreadcrumbClick}
            data-preview-static="breadcrumb-category"
            className="border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] transition-colors hover:text-[#201C1A] dark:text-[#C9B9AA] dark:hover:text-[#F5EEE6]"
          >
            {normalized.category}
          </button>
          <span aria-hidden="true" className="text-[#C8A98B]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-static="breadcrumb-current"
            className="max-w-[240px] truncate font-medium text-[#201C1A] dark:text-[#F5EEE6] sm:max-w-md"
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
                        className={`group relative aspect-[4/5] w-[72px] shrink-0 overflow-hidden bg-[#E6D9C9]/50 transition-all duration-300 sm:w-full dark:bg-[#3B302B] ${isSelected
                          ? 'ring-1 ring-[#201C1A] ring-offset-2 ring-offset-[#F2E9DE] dark:ring-[#C8A98B] dark:ring-offset-[#201C1A]'
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
                  className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-[#E6D9C9]/45 dark:bg-[#3B302B]"
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
                      className="pointer-events-none absolute left-4 top-4 bg-[#F2E9DE]/92 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#201C1A] backdrop-blur-sm"
                    >
                      {normalized.badge}
                    </span>
                  )}

                  {/* Zoom Affordance Pill */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#F2E9DE]/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#201C1A] opacity-90 backdrop-blur-sm transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100"
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
                        className="absolute left-3.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2E9DE]/88 text-[#201C1A] backdrop-blur-sm transition-all duration-300 hover:bg-[#201C1A] hover:text-[#F2E9DE] sm:opacity-0 sm:group-hover:opacity-100"
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
                        className="absolute right-3.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2E9DE]/88 text-[#201C1A] backdrop-blur-sm transition-all duration-300 hover:bg-[#201C1A] hover:text-[#F2E9DE] sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <ChevronRight className="h-4 w-4 stroke-[1.5]" />
                      </button>
                    </>
                  )}
                </div>

                {/* Subtle gallery caption counter when multiple images exist */}
                {hasMultipleImages && (
                  <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6]">
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
                  className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]"
                >
                  {normalized.category}
                </span>
                {normalized.collectionTag && (
                  <>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#C8A98B]" />
                    <span
                      data-preview-static="product-collection-tag"
                      className="text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6]"
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
                className="mt-3 mb-0 text-[#201C1A] dark:text-[#F2E9DE]"
              />

              {/* Price + Real Availability Indicator */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#201C1A]/10 pb-6 dark:border-[#F2E9DE]/12">
                <div className="flex items-baseline gap-3">
                  <span
                    data-preview-field-path={`products[${idx}].price`}
                    className="font-serif text-3xl font-normal tracking-wide text-[#201C1A] dark:text-[#F2E9DE]"
                  >
                    {normalized.showPrice
                      ? formatLoomePrice(normalized.price, storeCurrency)
                      : 'Price Upon Inquiry'}
                  </span>
                  {normalized.showPrice && normalized.compareAtPrice && (
                    <span
                      data-preview-field-path={`products[${idx}].compareAtPrice`}
                      className="text-sm text-[#5E4E45]/80 line-through dark:text-[#C7B6A6]/75"
                    >
                      {formatLoomePrice(normalized.compareAtPrice, storeCurrency)}
                    </span>
                  )}
                  {savingsPercent && (
                    <span
                      data-preview-static="product-savings-badge"
                      className="bg-[#E6D9C9]/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#201C1A] dark:bg-[#201C1A] dark:text-[#C8A98B]"
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
                    className={`h-2 w-2 rounded-full ${normalized.isAvailable ? 'bg-[#8D7667]' : 'bg-[#A1685A]'
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
                      className="rounded-[10px] border border-[#201C1A]/14 bg-[#FAF5EE] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[#3B302B] dark:border-[#C8A98B]/24 dark:bg-[#2A221F] dark:text-[#F5EEE6]"
                    >
                      {normalized.material}
                    </span>
                  )}
                  {normalized.gsm && (
                    <span
                      data-preview-static="product-gsm-pill"
                      className="rounded-[10px] border border-[#201C1A]/14 bg-[#FAF5EE] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[#3B302B] dark:border-[#C8A98B]/24 dark:bg-[#2A221F] dark:text-[#F5EEE6]"
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
                      data-preview-field-path="productDetailPage.toneLabel"
                      className="font-medium text-[#5E4E45] dark:text-[#C9B9AA]"
                    >
                      {toneLabel}
                    </span>
                    <span
                      data-preview-static="color-swatch-value"
                      className="font-semibold text-[#201C1A] dark:text-[#F5EEE6]"
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
                            className={`group flex items-center gap-2.5 border px-3 py-2 text-xs transition-all duration-300 ${selected
                              ? 'border-[#201C1A] bg-[#FAF5EE] text-[#201C1A] dark:border-[#C8A98B] dark:bg-[#3B302B] dark:text-[#F2E9DE]'
                              : 'border-[#201C1A]/14 bg-transparent text-[#5E4E45] hover:border-[#201C1A]/40 dark:border-[#F2E9DE]/16 dark:text-[#C7B6A6] dark:hover:border-[#F2E9DE]/40'
                              }`}
                          >
                            <span
                              className={`h-4 w-4 rounded-full border border-[#201C1A]/25 transition-transform duration-300 ${selected ? 'scale-105 ring-1 ring-[#C8A98B] ring-offset-1 ring-offset-[#FAF5EE] dark:ring-offset-[#3B302B]' : ''
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
                      className="inline-flex items-center gap-1.5 font-medium text-[#5E4E45] dark:text-[#C7B6A6]"
                    >
                      <Ruler className="h-3.5 w-3.5 stroke-[1.5] text-[#8D7667] dark:text-[#C8A98B]" />
                      <span data-preview-field-path="productDetailPage.sizeLabel">{sizeLabel}</span>
                    </span>
                    <span
                      data-preview-static="size-selector-value"
                      className="font-medium text-[#201C1A] dark:text-[#F2E9DE]"
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
                          className={`rounded-[11px] border px-3.5 py-2.5 text-left text-xs tracking-wide transition-all duration-300 ${selected
                            ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#F2E9DE] dark:bg-[#F2E9DE] dark:text-[#201C1A]'
                            : 'border-[#201C1A]/16 bg-[#FAF5EE] text-[#201C1A] hover:border-[#201C1A]/45 dark:border-[#F2E9DE]/16 dark:bg-[#3B302B] dark:text-[#F2E9DE] dark:hover:border-[#F2E9DE]/45'
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
                  <div className="flex h-[50px] items-center justify-between overflow-hidden rounded-[11px] border border-[#201C1A]/20 bg-[#FAF5EE] px-1 dark:border-[#F2E9DE]/20 dark:bg-[#3B302B] sm:w-32 sm:shrink-0">
                    <button
                      type="button"
                      disabled={!normalized.isAvailable || quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      data-preview-static="detail-qty-decrease"
                      className="flex h-10 w-10 items-center justify-center rounded-[9px] text-[#201C1A] transition-colors hover:bg-[#201C1A]/6 disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#F2E9DE] dark:hover:bg-[#F2E9DE]/10"
                    >
                      <Minus className="h-3.5 w-3.5 stroke-[1.5]" />
                    </button>
                    <span
                      aria-live="polite"
                      data-preview-static="detail-qty-value"
                      className="w-8 text-center text-sm font-semibold tabular-nums text-[#201C1A] dark:text-[#F5EEE6]"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={!normalized.isAvailable || quantity >= 99}
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      aria-label="Increase quantity"
                      data-preview-static="detail-qty-increase"
                      className="flex h-10 w-10 items-center justify-center rounded-[9px] text-[#201C1A] transition-colors hover:bg-[#201C1A]/6 disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#F2E9DE] dark:hover:bg-[#F2E9DE]/10"
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
                    className={`flex h-[50px] flex-1 items-center justify-center gap-2.5 rounded-[11px] px-6 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 ${!normalized.isAvailable
                      ? 'cursor-not-allowed bg-[#201C1A]/25 text-[#201C1A]/60 dark:bg-[#F2E9DE]/15 dark:text-[#F2E9DE]/50'
                      : addedFeedback
                        ? 'bg-[#8D7667] text-[#F2E9DE]'
                        : 'bg-[#201C1A] text-[#F2E9DE] hover:bg-[#3B302B] dark:bg-[#C8A98B] dark:text-[#201C1A] dark:hover:bg-[#D8BFA4]'
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
                        <span data-preview-field-path="productDetailPage.addToBagLabel">
                          {addToBagLabel}
                        </span>
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
                    className={`flex h-[50px] items-center justify-center gap-2 rounded-[11px] border px-4 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 sm:w-[50px] sm:shrink-0 sm:px-0 ${wishlisted
                      ? 'border-[#201C1A] bg-[#201C1A] text-[#C8A98B] dark:border-[#C8A98B] dark:bg-[#201C1A]'
                      : 'border-[#201C1A]/20 bg-[#FAF5EE] text-[#201C1A] hover:border-[#201C1A] dark:border-[#F2E9DE]/20 dark:bg-[#3B302B] dark:text-[#F2E9DE] dark:hover:border-[#F2E9DE]'
                      }`}
                  >
                    <Heart
                      className={`h-4 w-4 stroke-[1.5] ${wishlisted ? 'fill-[#C8A98B]' : ''}`}
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
                    className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] border border-[#201C1A]/20 bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#201C1A] no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-[#201C1A] hover:bg-[#201C1A]/5 dark:border-[#C8A98B]/35 dark:text-[#F2E9DE] dark:hover:border-[#C8A98B] dark:hover:bg-[#3B302B]/70"
                  >
                    <MessageCircle className="h-3.5 w-3.5 stroke-[1.6] text-[#8D7667] dark:text-[#C8A98B]" />
                    <span data-preview-field-path="productDetailPage.whatsappInquireLabel">
                      {whatsappInquireLabel}
                    </span>
                  </a>
                )}
              </div>

              {/* Delivery & Atelier Assurance Strip */}
              <div className="mt-7 grid grid-cols-1 gap-3 border-y border-[#201C1A]/12 py-5 text-xs text-[#5E4E45] dark:border-[#C8A98B]/18 dark:text-[#C9B9AA] sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#8D7667] dark:text-[#C8A98B]" />
                  <div>
                    <EditableText
                      as="p"
                      data-preview-field-path="productDetailPage.deliveryTitle"
                      defaultValue={deliveryTitle}
                      fontFamily="body"
                      size="0.75rem"
                      weight={600}
                      color="heading"
                      className="m-0"
                    />
                    <p className="m-0 mt-0.5 leading-relaxed">
                      {freeDeliveryThreshold > 0 ? (
                        `Complimentary over ${formatLoomePrice(freeDeliveryThreshold, storeCurrency)}`
                      ) : (
                        <span data-preview-field-path="productDetailPage.deliveryNote">
                          {deliveryNoteFallback}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#8D7667] dark:text-[#C8A98B]" />
                  <div>
                    <EditableText
                      as="p"
                      data-preview-field-path="productDetailPage.swatchTitle"
                      defaultValue={swatchTitle}
                      fontFamily="body"
                      size="0.75rem"
                      weight={600}
                      color="heading"
                      className="m-0"
                    />
                    <p className="m-0 mt-0.5 leading-relaxed">
                      {hasContactPage ? (
                        <a
                          href={withBasePath('/contact')}
                          data-target-page="contact"
                          className="text-[#5E4E45] underline decoration-[#C8A98B] underline-offset-4 transition-colors hover:text-[#201C1A] dark:text-[#C9B9AA] dark:hover:text-[#F5EEE6]"
                        >
                          <span data-preview-field-path="productDetailPage.swatchLinkLabel">
                            {swatchLinkLabel}
                          </span>
                        </a>
                      ) : (
                        <span data-preview-field-path="productDetailPage.swatchLinkLabel">
                          {swatchLinkLabel}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expandable Product Detail Accordions */}
              <div className="divide-y divide-[#201C1A]/12 border-b border-[#201C1A]/12 dark:divide-[#C8A98B]/18 dark:border-[#C8A98B]/18">
                {/* 1. Textile Specifications — ONLY rendered when real specs exist */}
                {hasSpecs && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion('specs')}
                      aria-expanded={openAccordion === 'specs'}
                      className="flex w-full items-center justify-between py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-[#201C1A] transition-colors hover:text-[#8D7667] dark:text-[#F5EEE6] dark:hover:text-[#C8A98B]"
                    >
                      <span data-preview-field-path="productDetailPage.specsHeading">
                        {specsHeading}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 stroke-[1.5] text-[#8D7667] transition-transform duration-300 dark:text-[#C8A98B] ${openAccordion === 'specs' ? 'rotate-180' : ''
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
                                className="flex flex-col justify-between gap-1 border-b border-[#201C1A]/8 pb-2.5 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-4 dark:border-[#C8A98B]/14"
                              >
                                <dt
                                  data-preview-static={`spec-label-${spec.label}`}
                                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5E4E45] dark:text-[#C9B9AA]"
                                >
                                  {spec.label}
                                </dt>
                                <dd
                                  data-preview-static={`spec-value-${spec.label}`}
                                  className="m-0 text-sm font-medium text-[#201C1A] sm:text-right dark:text-[#F5EEE6]"
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
                      className="flex w-full items-center justify-between py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-[#201C1A] transition-colors hover:text-[#8D7667] dark:text-[#F5EEE6] dark:hover:text-[#C8A98B]"
                    >
                      <span data-preview-field-path="productDetailPage.careHeading">
                        {careHeading}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 stroke-[1.5] text-[#8D7667] transition-transform duration-300 dark:text-[#C8A98B] ${openAccordion === 'care' ? 'rotate-180' : ''
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
                            className="m-0 pb-5 pt-1 text-sm leading-relaxed text-[#5E4E45] dark:text-[#C9B9AA]"
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
                    className="flex w-full items-center justify-between py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-[#201C1A] transition-colors hover:text-[#8D7667] dark:text-[#F5EEE6] dark:hover:text-[#C8A98B]"
                  >
                    <span data-preview-field-path="productDetailPage.shippingHeading">
                      {shippingHeading}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 stroke-[1.5] text-[#8D7667] transition-transform duration-300 dark:text-[#C8A98B] ${openAccordion === 'delivery' ? 'rotate-180' : ''
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
                        <div className="space-y-3 pb-5 pt-1 text-sm leading-relaxed text-[#5E4E45] dark:text-[#C9B9AA]">
                          <p
                            data-preview-field-path="productDetailPage.defaultShippingSummary"
                            className="m-0"
                          >
                            {shippingSummary}
                          </p>
                          <p
                            data-preview-field-path="productDetailPage.defaultShippingReturns"
                            className="m-0"
                          >
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
        <section className="border-t border-[#201C1A]/10 bg-[#E6D9C9]/45 py-16 dark:border-[#C8A98B]/16 dark:bg-[#201C1A] sm:py-20 lg:py-24">
          <div className="loome-container">
            <LuxuryReveal>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8D7667] dark:text-[#C8A98B]">
                    <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" />
                    <span data-preview-field-path="productDetailPage.relatedEyebrow">
                      {relatedEyebrow}
                    </span>
                  </span>
                  <EditableText
                    as="h2"
                    data-preview-field-path="productDetailPage.relatedHeading"
                    defaultValue={relatedHeading}
                    fontFamily="heading"
                    size="clamp(1.85rem, 3.2vw, 2.5rem)"
                    weight={800}
                    lineHeight={1.1}
                    letterSpacing="-0.025em"
                    color="heading"
                    className="mt-2.5 mb-0"
                  />
                </div>
                {hasShopPage && (
                  <a
                    href={withBasePath('/shop')}
                    data-target-page="shop"
                    className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#201C1A] no-underline transition-colors hover:text-[#8D7667] dark:text-[#F5EEE6] dark:hover:text-[#C8A98B]"
                  >
                    <span data-preview-field-path="productDetailPage.relatedCtaLabel">
                      {relatedCtaLabel}
                    </span>
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
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#F2E9DE]/25 bg-[#201C1A]/80 text-[#F2E9DE] transition-colors hover:bg-[#F2E9DE] hover:text-[#201C1A]"
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
                  className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#F2E9DE]/25 bg-[#201C1A]/80 text-[#F2E9DE] transition-colors hover:bg-[#F2E9DE] hover:text-[#201C1A] sm:left-8"
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
                  className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#F2E9DE]/25 bg-[#201C1A]/80 text-[#F2E9DE] transition-colors hover:bg-[#F2E9DE] hover:text-[#201C1A] sm:right-8"
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
              <div className="mt-4 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-[#E6D9C9]">
                <span data-preview-static="lightbox-title">{normalized.name}</span>
                {hasMultipleImages && (
                  <span data-preview-static="lightbox-counter" className="text-[#C8A98B]">
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
