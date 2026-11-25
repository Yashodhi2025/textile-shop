'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
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

type DetailTabKey = 'details' | 'specs' | 'care' | 'delivery';

interface LoomeProductDetailViewProps {
  product: ProductDetailItem;
  productIndex: number;
}

interface SpecRow {
  label: string;
  value: string;
  fieldPath?: string;
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
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'collections',
        'wishlist',
        'about_us',
        'services',
        'contact',
      ];
  const hasShopPage = requiredPages.includes('shop');
  const hasContactPage = requiredPages.includes('contact');

  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const shopNavLabel = contentText(navLabels.shop) || 'Shop';
  const colorLabel = contentText(detailCopy.toneLabel) || 'Color';
  const sizeLabel = contentText(detailCopy.sizeLabel) || 'Size';
  const addToBagLabel = contentText(detailCopy.addToBagLabel) || 'Add to Bag';
  const whatsappInquireLabel =
    contentText(detailCopy.whatsappInquireLabel) || 'Order or Ask via WhatsApp';
  const deliveryTitle = contentText(detailCopy.deliveryTitle) || 'Island-Wide Delivery';
  const deliveryNoteFallback =
    contentText(detailCopy.deliveryNote) || 'Tracked delivery across Sri Lanka';
  const swatchTitle = contentText(detailCopy.swatchTitle) || 'Need Fabric Swatches?';
  const swatchLinkLabel =
    contentText(detailCopy.swatchLinkLabel) || 'Request complimentary swatches';
  const detailsHeading = contentText(detailCopy.detailsHeading) || 'Details';
  const specsHeading = contentText(detailCopy.specsHeading) || 'Specifications';
  const careHeading = contentText(detailCopy.careHeading) || 'Care';
  const shippingHeading = contentText(detailCopy.shippingHeading) || 'Delivery & Returns';
  const relatedEyebrow = contentText(detailCopy.relatedEyebrow) || 'Related Products';
  const relatedHeading = contentText(detailCopy.relatedHeading) || 'You May Also Like';
  const relatedCtaLabel = contentText(detailCopy.relatedCtaLabel) || 'View All Products';

  const storeName = contentText(common.websiteTitle) || 'LOOMÉ';
  const storeCurrency = resolveLoomeCurrency(siteData, normalized.currency);
  const freeDeliveryThreshold = resolveFreeDeliveryThreshold(siteData);
  const whatsappNumber =
    contentText(rawProduct.whatsappNumber) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);

  // Resolve real merchant sizes
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
    if (normalized.material)
      rows.push({ label: 'Material', value: normalized.material, fieldPath: `products[${idx}].material` });
    if (normalized.composition)
      rows.push({ label: 'Composition', value: normalized.composition, fieldPath: `products[${idx}].composition` });
    if (normalized.gsm)
      rows.push({ label: 'Fabric Weight', value: normalized.gsm, fieldPath: `products[${idx}].gsm` });
    if (normalized.dimensions)
      rows.push({ label: 'Dimensions', value: normalized.dimensions, fieldPath: `products[${idx}].dimensions` });

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
    idx,
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
  const [activeTab, setActiveTab] = useState<DetailTabKey>('details');

  // Reset interactive state whenever the resolved product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedColorIndex(0);
    setSelectedSizeIndex(0);
    setQuantity(1);
    setAddedFeedback(false);
    setIsHoverZoomed(false);
    setIsLightboxOpen(false);
    setActiveTab('details');
  }, [normalized.id]);

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
      ? `Free island-wide delivery on orders over ${formatLoomePrice(freeDeliveryThreshold, storeCurrency)}. Standard dispatch within 2–4 business days.`
      : 'Island-wide delivery arranged directly at checkout. Standard dispatch within 2–4 business days.');
  const shippingReturns =
    contentText(rawProduct.shippingReturns) ||
    contentText(detailCopy.defaultShippingReturns) ||
    'Ready-to-ship textiles may be returned unused and unwashed in original packaging within our return window. Custom-cut yardage and bespoke drapery are made to order.';

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
    }, 2000);
  };

  const handleSelectColor = (swatchIndex: number) => {
    setSelectedColorIndex(swatchIndex);
    const rawColors = Array.isArray(rawProduct.colors) ? rawProduct.colors : [];
    const entry = rawColors[swatchIndex];
    if (entry && typeof entry === 'object' && 'image' in entry && typeof entry.image === 'string') {
      const targetIdx = galleryImages.findIndex((url) => url === entry.image);
      if (targetIdx >= 0) {
        setActiveImageIndex(targetIdx);
      }
    }
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const tabs: Array<{ key: DetailTabKey; label: string; fieldPath?: string }> = [
    { key: 'details', label: detailsHeading, fieldPath: 'productDetailPage.detailsHeading' },
    ...(hasSpecs
      ? [{ key: 'specs' as const, label: specsHeading, fieldPath: 'productDetailPage.specsHeading' }]
      : []),
    ...(hasCare
      ? [{ key: 'care' as const, label: careHeading, fieldPath: 'productDetailPage.careHeading' }]
      : []),
    {
      key: 'delivery',
      label: shippingHeading,
      fieldPath: 'productDetailPage.shippingHeading',
    },
  ];

  return (
    <div className="loome-surface-commerce min-h-[75vh] w-full font-sans">
      {/* Compact Breadcrumb Bar */}
      <div className="border-b border-[var(--loome-border)] bg-[var(--loome-surface-subtle)]">
        <nav className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted-text)] sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted-text)] transition-colors hover:text-[var(--heading-color)]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" data-preview-static="pdp-bc-sep-1" className="text-[var(--brand-accent)]">
            /
          </span>
          {hasShopPage && (
            <>
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath('/shop/'))}
                data-target-page="shop"
                className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted-text)] transition-colors hover:text-[var(--heading-color)]"
              >
                <span data-preview-field-path="common.navLabels.shop">{shopNavLabel}</span>
              </button>
              <span aria-hidden="true" data-preview-static="pdp-bc-sep-2" className="text-[var(--brand-accent)]">
                /
              </span>
            </>
          )}
          <button
            type="button"
            onClick={handleCategoryBreadcrumbClick}
            data-preview-static="breadcrumb-category"
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted-text)] transition-colors hover:text-[var(--heading-color)]"
          >
            {normalized.category}
          </button>
          <span aria-hidden="true" data-preview-static="pdp-bc-sep-3" className="text-[var(--brand-accent)]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-static="breadcrumb-current"
            className="max-w-[220px] truncate font-semibold text-[var(--heading-color)] sm:max-w-md"
          >
            {normalized.name}
          </span>
        </nav>
      </div>

      {/* Compact Balanced Two-Column Product Hero (Designed to fit cleanly on 1366x768) */}
      <section className="mx-auto w-full max-w-[1240px] px-4 pb-10 pt-5 sm:px-8 lg:px-10 lg:pb-12 lg:pt-6">
        <div
          data-preview-item-path={`products[${idx}]`}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-10"
        >
          {/* Left Column: Clean Editorial Gallery (No Outer White Card) with Thumbnails Below */}
          <div data-testid="product-gallery-column" className="lg:col-span-6">
            {/* Main Product Image Stage */}
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
              data-testid="product-gallery-zoom-stage"
              className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[var(--loome-surface-muted)] shadow-[0_10px_30px_rgba(73,56,45,0.08)] lg:h-[420px] lg:aspect-auto"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={prefersReducedMotion ? false : { opacity: 0.3, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0.25 }}
                  transition={{ duration: 0.3, ease: LUXURY_EASE }}
                  className="h-full w-full"
                >
                  <img
                    src={withBasePath(activeImage)}
                    alt={normalized.name}
                    data-preview-field-path={`products[${idx}].imageUrl`}
                    data-preview-style-target={`products[${idx}].imageUrl`}
                    data-preview-style-type="image"
                    className="h-full w-full object-cover transition-transform duration-300 ease-out"
                    style={{
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      transform:
                        isHoverZoomed && !prefersReducedMotion ? 'scale(1.38)' : 'scale(1)',
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Product Badge — high-contrast and clickable in Fivora visual editor */}
              {normalized.badge && (
                <span
                  data-preview-field-path={`products[${idx}].badge`}
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto absolute left-3.5 top-3.5 z-10 rounded-[8px] border border-[#C8A98B]/55 bg-[#201A17]/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#FAF7F2] shadow-[0_4px_12px_rgba(0,0,0,0.28)] backdrop-blur-sm"
                >
                  {normalized.badge}
                </span>
              )}

              {/* Zoom Hint */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3.5 right-3.5 flex items-center gap-1.5 rounded-[8px] bg-[var(--card-bg)]/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--heading-color)] shadow-sm backdrop-blur-sm transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Maximize2 className="h-3 w-3 stroke-[1.7]" />
                Zoom
              </span>

              {/* Prev / Next Gallery Arrows */}
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
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--card-bg)]/90 text-[var(--heading-color)] shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)]"
                  >
                    <ChevronLeft className="h-4 w-4 stroke-[1.8]" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    aria-label="Next product image"
                    data-preview-static="gallery-next"
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--card-bg)]/90 text-[var(--heading-color)] shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)]"
                  >
                    <ChevronRight className="h-4 w-4 stroke-[1.8]" />
                  </button>
                </>
              )}
            </div>

            {/* Horizontal Thumbnail Strip BELOW Main Image */}
            {hasMultipleImages && (
              <div
                data-preview-static="gallery-thumbnails-below"
                className="mt-3.5 flex items-center justify-between gap-3"
              >
                <div
                  role="tablist"
                  aria-label="Product gallery thumbnails"
                  className="flex items-center gap-2.5 overflow-x-auto py-0.5"
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
                        className={`group relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-xl border-2 bg-[var(--loome-surface-muted)] transition-all duration-200 sm:h-[70px] sm:w-[70px] ${
                          isSelected
                            ? 'border-[var(--brand-accent)] opacity-100 shadow-sm'
                            : 'border-transparent opacity-72 hover:border-[var(--loome-border)] hover:opacity-100'
                        }`}
                      >
                        <img
                          src={withBasePath(imgUrl)}
                          alt={`${normalized.name} view ${gIdx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                    );
                  })}
                </div>

                <span
                  data-preview-static="gallery-counter"
                  className="shrink-0 text-xs font-semibold tabular-nums text-[var(--muted-text)]"
                >
                  {activeImageIndex + 1} / {galleryImages.length}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Compact White Purchase Card (Controls Visible Above Fold on 1366x768) */}
          <div className="lg:col-span-6">
            <div
              data-testid="product-purchase-card"
              className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-5 shadow-[0_6px_24px_rgba(73,56,45,0.06)] sm:p-6"
            >
              {/* Category & Subtle Sage Stock Status Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  data-preview-field-path={`products[${idx}].category`}
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]"
                >
                  {normalized.category}
                </span>

                <div
                  data-preview-static="product-availability-pill"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    normalized.isAvailable
                      ? 'border-[var(--loome-sage-border)] bg-[var(--loome-sage-bg)] text-[var(--loome-sage-text)]'
                      : 'border-[var(--loome-danger-text)]/20 bg-[var(--loome-danger-bg)] text-[var(--loome-danger-text)]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      normalized.isAvailable
                        ? 'bg-[var(--loome-sage-accent)]'
                        : 'bg-[var(--loome-danger-text)]'
                    }`}
                  />
                  <span>{normalized.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>

              {/* Compact Manrope Product Name */}
              <EditableText
                as="h1"
                data-preview-field-path={`products[${idx}].name`}
                defaultValue={normalized.name}
                fontFamily="heading"
                size="clamp(1.45rem, 2.3vw, 1.85rem)"
                weight={800}
                lineHeight={1.18}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-2 mb-0"
              />

              {/* Single-Line LKR Price + Compare-At + Discount Badge */}
              <div className="mt-3 flex flex-wrap items-center gap-2.5 border-b border-[var(--loome-border)] pb-3.5">
                <span
                  data-preview-field-path={`products[${idx}].price`}
                  className="whitespace-nowrap font-heading text-2xl font-extrabold tracking-tight tabular-nums text-[var(--heading-color)]"
                >
                  {normalized.showPrice
                    ? formatLoomePrice(normalized.price, storeCurrency)
                    : 'Price on Request'}
                </span>
                {normalized.showPrice && normalized.compareAtPrice && (
                  <span
                    data-preview-field-path={`products[${idx}].compareAtPrice`}
                    className="whitespace-nowrap text-sm font-medium tabular-nums text-[var(--muted-text)]/80 line-through"
                  >
                    {formatLoomePrice(normalized.compareAtPrice, storeCurrency)}
                  </span>
                )}
                {savingsPercent && (
                  <span
                    data-preview-static="product-savings-badge"
                    className="rounded-md bg-[var(--brand-accent)]/16 px-2 py-0.5 text-[11px] font-bold text-[var(--brand-accent)]"
                  >
                    Save {savingsPercent}%
                  </span>
                )}
              </div>

              {/* Concise Short Description */}
              {normalized.description && (
                <EditableText
                  as="p"
                  data-preview-field-path={`products[${idx}].description`}
                  defaultValue={normalized.description}
                  fontFamily="body"
                  size="0.875rem"
                  lineHeight={1.6}
                  color="muted"
                  className="mt-3 mb-0 line-clamp-2"
                />
              )}

              {/* Compact Color Swatch Selector */}
              {hasSwatches && activeColor && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      data-preview-field-path="productDetailPage.toneLabel"
                      className="font-semibold text-[var(--heading-color)]"
                    >
                      {colorLabel}
                    </span>
                    <span
                      data-testid="color-swatch-value"
                      className="font-medium text-[var(--muted-text)]"
                    >
                      {activeColor.name}
                    </span>
                  </div>
                  <div
                    data-preview-list-path={`products[${idx}].colors`}
                    className="mt-2 flex flex-wrap items-center gap-2"
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
                            aria-label={`Select color ${swatch.name}`}
                            aria-pressed={selected}
                            title={swatch.name}
                            data-testid={`detail-swatch-${sIdx}`}
                            className={`flex items-center gap-2 rounded-[10px] border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                              selected
                                ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-surface-muted)] text-[var(--heading-color)] ring-1 ring-[var(--brand-accent)]/45'
                                : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--page-text)] hover:border-[var(--brand-accent)]'
                            }`}
                          >
                            <span
                              data-preview-field-path={`products[${idx}].colors[${sIdx}].hex`}
                              className="h-3.5 w-3.5 rounded-full border border-[var(--loome-border)]"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span data-preview-field-path={`products[${idx}].colors[${sIdx}].name`}>
                              {swatch.name}
                            </span>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Compact Size Selector */}
              {hasSizes && activeSize && (
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--heading-color)]">
                      <Ruler className="h-3.5 w-3.5 stroke-[1.7] text-[var(--brand-accent)]" />
                      <span data-preview-field-path="productDetailPage.sizeLabel">{sizeLabel}</span>
                    </span>
                    <span
                      data-preview-static="size-selector-value"
                      className="font-medium text-[var(--muted-text)]"
                    >
                      {activeSize}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resolvedSizes.map((sizeOption, szIdx) => {
                      const selected = szIdx === selectedSizeIndex;
                      return (
                        <button
                          key={`${normalized.id}-size-${sizeOption}`}
                          type="button"
                          onClick={() => setSelectedSizeIndex(szIdx)}
                          aria-pressed={selected}
                          data-preview-static={`detail-size-${szIdx}`}
                          className={`rounded-[10px] border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                            selected
                              ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                              : 'border-[var(--loome-border)] bg-[var(--loome-surface-muted)]/70 text-[var(--page-text)] hover:border-[var(--brand-accent)]'
                          }`}
                        >
                          {sizeOption}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Bag + Wishlist Row */}
              <div className="mt-4 flex flex-wrap items-stretch gap-2.5 sm:flex-nowrap">
                {/* Quantity Stepper */}
                <div className="flex h-11 w-[112px] shrink-0 items-center justify-between overflow-hidden rounded-[11px] border border-[var(--loome-border)] bg-[var(--loome-surface-muted)] px-1">
                  <button
                    type="button"
                    disabled={!normalized.isAvailable || quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    data-preview-static="detail-qty-decrease"
                    className="flex h-9 w-8 items-center justify-center rounded-[8px] text-[var(--heading-color)] transition-colors hover:bg-[var(--brand-accent)]/15 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Minus className="h-3.5 w-3.5 stroke-[1.8]" />
                  </button>
                  <span
                    aria-live="polite"
                    data-preview-static="detail-qty-value"
                    className="w-8 text-center text-sm font-bold tabular-nums text-[var(--heading-color)]"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={!normalized.isAvailable || quantity >= 99}
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    aria-label="Increase quantity"
                    data-preview-static="detail-qty-increase"
                    className="flex h-9 w-8 items-center justify-center rounded-[8px] text-[var(--heading-color)] transition-colors hover:bg-[var(--brand-accent)]/15 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[1.8]" />
                  </button>
                </div>

                {/* Primary Add to Bag CTA */}
                <motion.button
                  type="button"
                  whileTap={normalized.isAvailable ? { scale: 0.99 } : undefined}
                  disabled={!normalized.isAvailable}
                  onClick={handleAddToBag}
                  data-testid="detail-add-to-bag"
                  className={`flex h-11 min-w-[160px] flex-1 items-center justify-center gap-2 rounded-[11px] border-0 px-5 text-xs font-bold uppercase tracking-[0.16em] transition-colors duration-200 ${
                    !normalized.isAvailable
                      ? 'cursor-not-allowed bg-[var(--loome-surface-muted)] text-[var(--muted-text)]'
                      : addedFeedback
                        ? 'bg-[var(--loome-sage-accent)] text-white'
                        : 'bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)] hover:bg-[var(--loome-btn-primary-hover)] hover:text-white dark:hover:text-[#201C1A]'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="h-4 w-4 stroke-[2.2]" />
                      <span>Added to Bag</span>
                    </>
                  ) : normalized.isAvailable ? (
                    <>
                      <ShoppingBag className="h-4 w-4 stroke-[1.75]" />
                      <span data-preview-field-path="productDetailPage.addToBagLabel">
                        {addToBagLabel}
                      </span>
                    </>
                  ) : (
                    <span>Out of Stock</span>
                  )}
                </motion.button>

                {/* Wishlist Toggle Button */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.93 }}
                  onClick={() => toggleWishlist(normalized.id)}
                  aria-label={
                    wishlisted
                      ? `Remove ${normalized.name} from wishlist`
                      : `Save ${normalized.name} to wishlist`
                  }
                  aria-pressed={wishlisted}
                  data-preview-static="detail-wishlist-toggle"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] border transition-colors duration-200 ${
                    wishlisted
                      ? 'border-[var(--brand-accent)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                      : 'border-[var(--loome-border)] bg-[var(--loome-surface-muted)] text-[var(--page-text)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]'
                  }`}
                >
                  <Heart className={`h-4 w-4 stroke-[1.7] ${wishlisted ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {/* Compact WhatsApp Order / Inquiry Action */}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="detail-whatsapp-cta"
                  className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-[11px] border border-[var(--loome-border)] bg-transparent px-4 text-xs font-semibold text-[var(--page-text)] no-underline transition-colors hover:border-[var(--brand-accent)] hover:bg-[var(--loome-surface-muted)]"
                >
                  <MessageCircle className="h-3.5 w-3.5 stroke-[1.7] text-[var(--brand-accent)]" />
                  <span data-preview-field-path="productDetailPage.whatsappInquireLabel">
                    {whatsappInquireLabel}
                  </span>
                </a>
              )}

              {/* Compact Delivery & Swatch Assurance Footer */}
              <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-[var(--loome-border)] pt-3.5 text-xs text-[var(--muted-text)] sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.7] text-[var(--loome-sage-accent)]" />
                  <div>
                    <EditableText
                      as="p"
                      data-preview-field-path="productDetailPage.deliveryTitle"
                      defaultValue={deliveryTitle}
                      fontFamily="body"
                      size="0.75rem"
                      weight={700}
                      color="heading"
                      className="m-0"
                    />
                    <p className="m-0 mt-0.5 text-[11.5px] leading-snug text-[var(--loome-sage-text)]">
                      {freeDeliveryThreshold > 0 ? (
                        `Free over ${formatLoomePrice(freeDeliveryThreshold, storeCurrency)}`
                      ) : (
                        <span data-preview-field-path="productDetailPage.deliveryNote">
                          {deliveryNoteFallback}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.7] text-[var(--brand-accent)]" />
                  <div>
                    <EditableText
                      as="p"
                      data-preview-field-path="productDetailPage.swatchTitle"
                      defaultValue={swatchTitle}
                      fontFamily="body"
                      size="0.75rem"
                      weight={700}
                      color="heading"
                      className="m-0"
                    />
                    <p className="m-0 mt-0.5 text-[11.5px] leading-snug">
                      {hasContactPage ? (
                        <a
                          href={withBasePath('/contact/')}
                          data-target-page="contact"
                          className="text-[var(--page-text)] underline decoration-[var(--brand-accent)] underline-offset-4 transition-colors hover:text-[var(--brand-accent)]"
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
            </div>
          </div>
        </div>

        {/* Clean Tabbed Product Information Below (Details, Specifications, Care, Delivery & Returns) */}
        <div
          data-testid="product-detail-tabs-card"
          className="mt-8 overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] shadow-[0_6px_24px_rgba(73,56,45,0.05)]"
        >
          {/* Tab Header Strip */}
          <div
            role="tablist"
            aria-label="Product information tabs"
            className="flex items-center gap-1 overflow-x-auto border-b border-[var(--loome-border)] px-4 pt-2 sm:gap-2 sm:px-6"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-testid={`detail-tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative shrink-0 border-0 bg-transparent px-3.5 py-3 text-xs font-bold uppercase tracking-[0.14em] transition-colors sm:px-4 ${
                    isActive
                      ? 'text-[var(--heading-color)]'
                      : 'text-[var(--muted-text)] hover:text-[var(--heading-color)]'
                  }`}
                >
                  {tab.fieldPath === 'productDetailPage.detailsHeading' ? (
                    <span data-preview-field-path="productDetailPage.detailsHeading">
                      {tab.label}
                    </span>
                  ) : tab.fieldPath === 'productDetailPage.specsHeading' ? (
                    <span data-preview-field-path="productDetailPage.specsHeading">
                      {tab.label}
                    </span>
                  ) : tab.fieldPath === 'productDetailPage.careHeading' ? (
                    <span data-preview-field-path="productDetailPage.careHeading">
                      {tab.label}
                    </span>
                  ) : tab.fieldPath === 'productDetailPage.shippingHeading' ? (
                    <span data-preview-field-path="productDetailPage.shippingHeading">
                      {tab.label}
                    </span>
                  ) : (
                    <span>{tab.label}</span>
                  )}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-0 h-[2.5px] rounded-t-full bg-[var(--brand-accent)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Panel Content */}
          <div role="tabpanel" className="p-5 sm:p-7">
            {activeTab === 'details' && (
              <div data-testid="detail-panel-details" className="max-w-3xl space-y-4">
                <p
                  data-preview-field-path={`products[${idx}].description`}
                  className="m-0 text-sm leading-relaxed text-[var(--page-text)]"
                >
                  {normalized.description ||
                    'Crafted from natural long-staple fibers designed for everyday elegance and breathable comfort.'}
                </p>

                {(normalized.material || normalized.gsm || normalized.dimensions) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {normalized.material && (
                      <span
                        data-preview-field-path={`products[${idx}].material`}
                        className="rounded-[9px] border border-[var(--loome-border)] bg-[var(--loome-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--heading-color)]"
                      >
                        {normalized.material}
                      </span>
                    )}
                    {normalized.gsm && (
                      <span
                        data-preview-field-path={`products[${idx}].gsm`}
                        className="rounded-[9px] border border-[var(--loome-border)] bg-[var(--loome-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--heading-color)]"
                      >
                        {normalized.gsm}
                      </span>
                    )}
                    {normalized.dimensions && (
                      <span
                        data-preview-field-path={`products[${idx}].dimensions`}
                        className="rounded-[9px] border border-[var(--loome-border)] bg-[var(--loome-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--heading-color)]"
                      >
                        {normalized.dimensions}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && hasSpecs && (
              <dl
                data-testid="detail-panel-specs"
                className="m-0 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2"
              >
                {textileSpecs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex flex-col justify-between gap-1 border-b border-[var(--loome-border)] pb-3 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <dt
                      data-preview-static={`spec-label-${spec.label}`}
                      className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]"
                    >
                      {spec.label}
                    </dt>
                    <dd
                      data-preview-field-path={spec.fieldPath}
                      className="m-0 text-sm font-semibold text-[var(--heading-color)] sm:text-right"
                    >
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {activeTab === 'care' && hasCare && normalized.careInstructions && (
              <div data-testid="detail-panel-care" className="max-w-3xl">
                <p
                  data-preview-field-path={`products[${idx}].careInstructions`}
                  className="m-0 text-sm leading-relaxed text-[var(--page-text)]"
                >
                  {normalized.careInstructions}
                </p>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div
                data-testid="detail-panel-delivery"
                className="max-w-3xl space-y-3 text-sm leading-relaxed text-[var(--page-text)]"
              >
                <p data-preview-field-path="productDetailPage.defaultShippingSummary" className="m-0">
                  {shippingSummary}
                </p>
                <p
                  data-preview-field-path="productDetailPage.defaultShippingReturns"
                  className="m-0 text-[var(--muted-text)]"
                >
                  {shippingReturns}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="loome-surface-ivory border-t border-[var(--loome-border)] py-12 sm:py-16">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-8 lg:px-10">
            <LuxuryReveal>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
                    <Sparkles className="h-3.5 w-3.5 stroke-[1.6]" />
                    <span data-preview-field-path="productDetailPage.relatedEyebrow">
                      {relatedEyebrow}
                    </span>
                  </span>
                  <EditableText
                    as="h2"
                    data-preview-field-path="productDetailPage.relatedHeading"
                    defaultValue={relatedHeading}
                    fontFamily="heading"
                    size="clamp(1.65rem, 2.8vw, 2.15rem)"
                    weight={800}
                    lineHeight={1.12}
                    letterSpacing="-0.025em"
                    color="heading"
                    className="mt-2 mb-0"
                  />
                </div>
                {hasShopPage && (
                  <a
                    href={withBasePath('/shop/')}
                    data-target-page="shop"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--heading-color)] no-underline transition-colors hover:text-[var(--brand-accent)]"
                  >
                    <span data-preview-field-path="productDetailPage.relatedCtaLabel">
                      {relatedCtaLabel}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[1.8]" />
                  </a>
                )}
              </div>
            </LuxuryReveal>

            <div data-preview-list-path="products">
              <LuxuryStagger className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relProduct) => (
                  <LuxuryStaggerItem key={relProduct.id}>
                    <LoomeProductCard product={relProduct} tone="light" />
                  </LuxuryStaggerItem>
                ))}
              </LuxuryStagger>
            </div>
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
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${normalized.name} enlarged view`}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#14110F]/92 p-4 backdrop-blur-md sm:p-8"
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close enlarged view"
              data-preview-static="lightbox-close"
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#F2E9DE]/25 bg-[#201C1A]/80 text-[#F2E9DE] transition-colors hover:bg-[#F2E9DE] hover:text-[#201C1A]"
            >
              <X className="h-5 w-5 stroke-[1.6]" />
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
                  <ChevronLeft className="h-5 w-5 stroke-[1.6]" />
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
                  <ChevronRight className="h-5 w-5 stroke-[1.6]" />
                </button>
              </>
            )}

            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.28, ease: LUXURY_EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[88vh] max-w-4xl flex-col items-center"
            >
              <img
                src={withBasePath(activeImage)}
                alt={normalized.name}
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
              <div className="mt-4 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#E6D9C9]">
                <span data-preview-static="lightbox-title">{normalized.name}</span>
                {hasMultipleImages && (
                  <span data-preview-static="lightbox-counter" className="text-[#C8A98B]">
                    {activeImageIndex + 1} / {galleryImages.length}
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
