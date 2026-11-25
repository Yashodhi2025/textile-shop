'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '@deneb-ui/ui';
import {
  contentList,
  contentObject,
  contentText,
  platformProductDetailHref,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import {
  formatAmountTemplate,
  formatLoomePrice,
  normalizeLoomeProduct,
  resolveDeliveryBarConfig,
  resolveFreeDeliveryThreshold,
  resolveLoomeCurrency,
  useLoomeStore,
} from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import { LUXURY_EASE } from '@/components/motion/LuxuryReveal';

export default function LoomeOverlays() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const cart = useCart();
  const {
    wishlistIds,
    toggleWishlist,
    isWishlisted,
    isSearchOpen,
    closeSearch,
    isAccountOpen,
    closeAccount,
    quickViewProduct,
    openQuickView,
    closeQuickView,
  } = useLoomeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quickQty, setQuickQty] = useState(1);

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const home = contentObject(content.home);
  const shopTheLook = contentObject(home.shopTheLook);
  const shopPage = contentObject(content.shopPage);
  const cartPage = contentObject(content.cartPage);
  const checkoutPage = contentObject(content.checkoutPage);
  const productDetailPage = contentObject(content.productDetailPage);
  const accountDrawer = contentObject(common.accountDrawer);
  const storeName = contentText(common.websiteTitle) || 'LOOMÉ';

  const toneLabel = contentText(productDetailPage.toneLabel) || 'Tone';
  const sizeLabel = contentText(productDetailPage.sizeLabel) || 'Size';
  const quantityLabel = contentText(productDetailPage.quantityLabel) || 'Quantity';
  const outOfStockLabel = contentText(productDetailPage.outOfStockLabel) || 'Out of Stock';
  const addToBagLabel = contentText(productDetailPage.addToBagLabel) || 'Add to Bag';
  const quickViewSpecsLabel =
    contentText(productDetailPage.quickViewSpecsLabel) || 'View Full Specifications';
  const quickViewLabel = contentText(shopTheLook.quickViewLabel) || 'Quick View';
  const searchPlaceholder =
    contentText(shopPage.searchPlaceholder) || 'Search Belgian linen, curtains, duvet, velvet...';
  const searchEmptyDescription =
    contentText(shopPage.emptyDescription) ||
    'Try widening your search or exploring another textile category.';
  const priceOnRequestLabel = contentText(cartPage.priceOnRequestLabel) || 'Price on Request';
  const estimatedSubtotalLabel =
    contentText(checkoutPage.estimatedSubtotalLabel) || 'Estimated Subtotal';
  const deliveryBar = resolveDeliveryBarConfig(siteData);

  const bagDrawerHeading = contentText(cartPage.heading) || 'Your Shopping Bag';
  const bagEmptyHeading = contentText(cartPage.emptyHeading) || 'Your bag is currently empty';
  const bagEmptyDesc =
    contentText(cartPage.emptyDescription) ||
    'Explore our Belgian flax drapery, stonewashed bedding, and tactile studio accents.';
  const continueShoppingLabel =
    contentText(cartPage.continueShoppingLabel) || 'Continue Shopping';
  const checkoutLabel = contentText(cartPage.checkoutLabel) || 'Proceed to Checkout';
  const viewBagLabel = contentText(cartPage.viewBagLabel) || 'View Shopping Bag';
  const summaryFootnote =
    contentText(cartPage.summaryFootnote) ||
    'Custom sizing & shipping confirmed with our atelier concierge.';

  const accountEyebrow = contentText(accountDrawer.eyebrow) || 'Private Client Services';
  const accountHeading = contentText(accountDrawer.heading) || `${storeName} Atelier`;
  const accountWishlistLabel = contentText(accountDrawer.wishlistLabel) || 'Wishlist';
  const accountBagLabel = contentText(accountDrawer.bagLabel) || 'In Your Bag';
  const accountTradeHeading =
    contentText(accountDrawer.tradeHeading) || 'Trade & Interior Architects';
  const accountTradeDesc =
    contentText(accountDrawer.tradeDescription) ||
    'Enjoy dedicated yardage reservations, custom drapery specifications, and complimentary fabric swatch boxes delivered to your studio.';
  const accountPrimaryCta =
    contentText(accountDrawer.primaryCtaLabel) || 'Schedule Atelier Consultation';
  const accountSecondaryCta =
    contentText(accountDrawer.secondaryCtaLabel) || 'Explore Bespoke Services';

  const quickSearchCategories = useMemo(() => {
    const fromHome = contentList(home.categories)
      .map((raw) => contentText(contentObject(raw).name))
      .filter(Boolean);
    if (fromHome.length > 0) return fromHome;
    return ['Curtains', 'Bedding', 'Upholstery', 'Fabrics', 'Cushions'];
  }, [home.categories]);
  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'cart',
        'checkout',
        'services',
        'contact',
      ];
  const hasContactPage = requiredPages.includes('contact');
  const hasServicesPage = requiredPages.includes('services');

  const products = useMemo(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  const storeCurrency = resolveLoomeCurrency(siteData, products[0]?.currency);
  const freeDeliveryThreshold = resolveFreeDeliveryThreshold(siteData);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(
        quickViewProduct.hasExplicitColors ? quickViewProduct.colors[0]?.name || '' : '',
      );
      setSelectedSize(quickViewProduct.sizes[0] || '');
      setQuickQty(1);
    }
  }, [quickViewProduct]);

  useEffect(() => {
    const anyOpen =
      isSearchOpen || isAccountOpen || Boolean(quickViewProduct) || cart.isOpen;
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
        closeAccount();
        closeQuickView();
        cart.closeCart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    isSearchOpen,
    isAccountOpen,
    quickViewProduct,
    cart,
    closeSearch,
    closeAccount,
    closeQuickView,
  ]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.material && p.material.toLowerCase().includes(q)),
    );
  }, [products, searchQuery]);

  const handleQuickAddToBag = () => {
    if (!quickViewProduct || !quickViewProduct.isAvailable) return;
    closeQuickView();
    cart.addItem({
      id: quickViewProduct.id,
      name: quickViewProduct.name,
      price: quickViewProduct.price,
      originalPrice: quickViewProduct.compareAtPrice ?? undefined,
      image: quickViewProduct.imageUrl,
      color: quickViewProduct.hasExplicitColors && selectedColor ? selectedColor : undefined,
      size: selectedSize || undefined,
      quantity: quickQty,
      showPrice: quickViewProduct.showPrice,
    });
  };

  const allCartInquiryOnly =
    cart.items.length > 0 && cart.items.every((item) => item.showPrice === false);
  const hasDeliveryThreshold = freeDeliveryThreshold > 0;
  const deliveryProgress = hasDeliveryThreshold
    ? Math.min(100, Math.round((cart.subtotal / freeDeliveryThreshold) * 100))
    : 0;
  const deliveryRemaining = hasDeliveryThreshold
    ? Math.max(0, freeDeliveryThreshold - cart.subtotal)
    : 0;

  return (
    <>
      {/* 1. LUXURY QUICK VIEW MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeQuickView}
              className="fixed inset-0 bg-[#120E0C]/72 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Quick view ${quickViewProduct.name}`}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.38, ease: LUXURY_EASE }}
              className="relative z-10 grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-2xl border border-[#C8A98B]/24 bg-[#201C1A] text-[#F2E9DE] shadow-[0_28px_72px_rgba(8,6,5,0.65)] md:grid-cols-2"
            >
              <button
                type="button"
                onClick={closeQuickView}
                aria-label="Close quick view"
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#C8A98B]/30 bg-[#201C1A]/88 text-[#F2E9DE] backdrop-blur-md transition-colors hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A]"
              >
                <X className="h-4 w-4 stroke-[1.6]" />
              </button>

              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#3B302B]/50 md:aspect-auto md:min-h-[520px]">
                <img
                  src={withBasePath(quickViewProduct.imageUrl)}
                  alt={quickViewProduct.name}
                  data-preview-field-path={`products[${quickViewProduct.index}].imageUrl`}
                  data-preview-style-target={`products[${quickViewProduct.index}].imageUrl`}
                  data-preview-style-type="image"
                  className="h-full w-full object-cover"
                />
                {quickViewProduct.badge && (
                  <span
                    data-preview-field-path={`products[${quickViewProduct.index}].badge`}
                    className="absolute left-5 top-5 rounded-[8px] border border-[#C8A98B]/35 bg-[#201C1A]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F2E9DE] backdrop-blur-md"
                  >
                    {quickViewProduct.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-between p-7 sm:p-9">
                <div>
                  <p
                    data-preview-field-path={`products[${quickViewProduct.index}].category`}
                    className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C8A98B]"
                  >
                    {quickViewProduct.category}
                  </p>
                  <h2
                    data-preview-field-path={`products[${quickViewProduct.index}].name`}
                    className="mt-2 font-heading text-2xl font-extrabold leading-tight tracking-[-0.02em] text-[#F2E9DE] sm:text-3xl"
                  >
                    {quickViewProduct.name}
                  </h2>

                  {quickViewProduct.showPrice ? (
                    <div className="mt-4 flex items-baseline gap-3">
                      <span
                        data-preview-field-path={`products[${quickViewProduct.index}].price`}
                        className="whitespace-nowrap text-xl font-bold tracking-wide tabular-nums text-[#F2E9DE]"
                      >
                        {formatLoomePrice(quickViewProduct.price, storeCurrency)}
                      </span>
                      {quickViewProduct.compareAtPrice && (
                        <span
                          data-preview-field-path={`products[${quickViewProduct.index}].compareAtPrice`}
                          className="whitespace-nowrap text-sm tabular-nums text-[#C7B6A6]/70 line-through"
                        >
                          {formatLoomePrice(quickViewProduct.compareAtPrice, storeCurrency)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p
                      data-preview-field-path="cartPage.priceOnRequestLabel"
                      className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A98B]"
                    >
                      {priceOnRequestLabel}
                    </p>
                  )}

                  <p
                    data-preview-field-path={`products[${quickViewProduct.index}].description`}
                    className="mt-4 text-sm leading-relaxed text-[#C7B6A6]"
                  >
                    {quickViewProduct.description}
                  </p>

                  {quickViewProduct.material && (
                    <p
                      data-preview-field-path={`products[${quickViewProduct.index}].material`}
                      className="mt-4 border-l-2 border-[#C8A98B] pl-3 text-xs tracking-wide text-[#F2E9DE]/85"
                    >
                      {quickViewProduct.material}
                    </p>
                  )}

                  {/* Color Swatches — only when merchant product has explicit swatches */}
                  {quickViewProduct.hasExplicitColors && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em]">
                        <span
                          data-preview-field-path="productDetailPage.toneLabel"
                          className="text-[#C7B6A6]"
                        >
                          {toneLabel}
                        </span>
                        <span className="font-semibold text-[#F2E9DE]">{selectedColor}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        {quickViewProduct.colors.map((swatch) => {
                          const isSelected = selectedColor === swatch.name;
                          return (
                            <button
                              key={swatch.name}
                              type="button"
                              onClick={() => setSelectedColor(swatch.name)}
                              aria-label={`Select tone ${swatch.name}`}
                              title={swatch.name}
                              className={`h-7 w-7 rounded-full border transition-all ${
                                isSelected
                                  ? 'scale-110 border-[#C8A98B] ring-2 ring-[#C8A98B] ring-offset-2 ring-offset-[#201C1A]'
                                  : 'border-[#F2E9DE]/25 hover:scale-105'
                              }`}
                              style={{ backgroundColor: swatch.hex }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size / Measurement Selector — only when real sizes exist */}
                  {quickViewProduct.sizes.length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em]">
                        <span
                          data-preview-field-path="productDetailPage.sizeLabel"
                          className="text-[#C7B6A6]"
                        >
                          {sizeLabel}
                        </span>
                        <span className="font-semibold text-[#F2E9DE]">{selectedSize}</span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {quickViewProduct.sizes.map((sizeOpt) => {
                          const isSelected = selectedSize === sizeOpt;
                          return (
                            <button
                              key={sizeOpt}
                              type="button"
                              onClick={() => setSelectedSize(sizeOpt)}
                              className={`rounded-[10px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                                isSelected
                                  ? 'border-[#C8A98B] bg-[#C8A98B] text-[#201C1A]'
                                  : 'border-[#C8A98B]/28 bg-[#3B302B]/40 text-[#F2E9DE] hover:border-[#C8A98B]'
                              }`}
                            >
                              {sizeOpt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mt-6 flex items-center gap-4">
                    <span
                      data-preview-field-path="productDetailPage.quantityLabel"
                      className="text-[11px] uppercase tracking-[0.18em] text-[#C7B6A6]"
                    >
                      {quantityLabel}
                    </span>
                    <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-[#C8A98B]/28 bg-[#3B302B]/45">
                      <button
                        type="button"
                        disabled={!quickViewProduct.isAvailable}
                        onClick={() => setQuickQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center text-[#F2E9DE] transition-colors hover:bg-[#C8A98B]/18 disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold tabular-nums text-[#F2E9DE]">
                        {quickQty}
                      </span>
                      <button
                        type="button"
                        disabled={!quickViewProduct.isAvailable}
                        onClick={() => setQuickQty((q) => q + 1)}
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center text-[#F2E9DE] transition-colors hover:bg-[#C8A98B]/18 disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3 border-t border-[#C8A98B]/18 pt-6">
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      disabled={!quickViewProduct.isAvailable}
                      onClick={handleQuickAddToBag}
                      className={`loome-btn-primary flex-1 ${
                        !quickViewProduct.isAvailable ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      {quickViewProduct.isAvailable ? (
                        <>
                          <ShoppingBag className="h-4 w-4 stroke-[1.6]" />
                          <span data-preview-field-path="productDetailPage.addToBagLabel">
                            {addToBagLabel}
                          </span>
                        </>
                      ) : (
                        <span data-preview-field-path="productDetailPage.outOfStockLabel">
                          {outOfStockLabel}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                      aria-label="Toggle wishlist"
                      className={`flex h-[50px] w-[50px] items-center justify-center rounded-[11px] border transition-colors ${
                        isWishlisted(quickViewProduct.id)
                          ? 'border-[#C8A98B] bg-[#C8A98B]/18 text-[#C8A98B]'
                          : 'border-[#C8A98B]/30 bg-[#3B302B]/40 text-[#F2E9DE] hover:border-[#C8A98B]'
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 stroke-[1.6] ${
                          isWishlisted(quickViewProduct.id) ? 'fill-[#C8A98B]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <a
                    href={platformProductDetailHref(quickViewProduct.id)}
                    data-testid="quickview-detail-link"
                    className="flex items-center justify-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A98B] no-underline transition-colors hover:text-[#F2E9DE]"
                  >
                    <span data-preview-field-path="productDetailPage.quickViewSpecsLabel">
                      {quickViewSpecsLabel}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. LUXURY SHOPPING BAG DRAWER (Powered by DENEB useCart) */}
      <AnimatePresence>
        {cart.isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cart.closeCart}
              className="fixed inset-0 bg-[#120E0C]/68 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              aria-label="Shopping bag"
              className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#C8A98B]/20 bg-[#201C1A] text-[#F2E9DE] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#C8A98B]/18 px-6 py-5">
                <div>
                  <h2
                    data-preview-field-path="cartPage.heading"
                    className="font-heading text-xl font-extrabold tracking-tight text-[#F2E9DE]"
                  >
                    {bagDrawerHeading}
                  </h2>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[#C8A98B]">
                    {cart.totalCount} {cart.totalCount === 1 ? 'piece' : 'pieces'} selected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cart.closeCart}
                  aria-label="Close bag"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C8A98B]/25 text-[#F2E9DE] transition-colors hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A]"
                >
                  <X className="h-4 w-4 stroke-[1.6]" />
                </button>
              </div>

              {/* Merchant-Configurable Complimentary Delivery Meter */}
              {hasDeliveryThreshold && (
                <div className="border-b border-[#C8A98B]/14 bg-[#3B302B]/55 px-6 py-3.5">
                  <p className="text-xs text-[#F2E9DE]/88">
                    {deliveryRemaining === 0 ? (
                      <span
                        data-preview-field-path="cartPage.freeDeliveryUnlockedLabel"
                        className="font-semibold text-[#C8A98B]"
                      >
                        {deliveryBar.unlockedLabel}
                      </span>
                    ) : (
                      <span data-preview-field-path="cartPage.freeDeliveryRemainingTemplate">
                        {formatAmountTemplate(
                          deliveryBar.remainingTemplate,
                          formatLoomePrice(deliveryRemaining, storeCurrency),
                        )}
                      </span>
                    )}
                  </p>
                  <div
                    className="mt-2 h-1 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: deliveryBar.trackColor }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${deliveryProgress}%`,
                        backgroundColor:
                          deliveryRemaining === 0
                            ? deliveryBar.unlockedColor
                            : deliveryBar.progressColor,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {cart.items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C8A98B]/35 bg-[#3B302B]/55 text-[#C8A98B]">
                      <ShoppingBag className="h-6 w-6 stroke-[1.4]" />
                    </div>
                    <h3
                      data-preview-field-path="cartPage.emptyHeading"
                      className="mt-5 font-heading text-2xl font-bold text-[#F2E9DE]"
                    >
                      {bagEmptyHeading}
                    </h3>
                    <p
                      data-preview-field-path="cartPage.emptyDescription"
                      className="mt-2 max-w-xs text-sm leading-relaxed text-[#C7B6A6]"
                    >
                      {bagEmptyDesc}
                    </p>
                    <button
                      type="button"
                      onClick={cart.closeCart}
                      className="loome-btn-outline mt-6"
                    >
                      <span data-preview-field-path="cartPage.continueShoppingLabel">
                        {continueShoppingLabel}
                      </span>
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#C8A98B]/14">
                    {cart.items.map((item) => (
                      <li
                        key={`${item.id}-${item.color || ''}-${item.size || ''}`}
                        className="flex gap-4 py-5"
                      >
                        <img
                          src={withBasePath(item.image || '/images/prod-curtain-ivory.jpg')}
                          alt={item.name}
                          className="h-24 w-20 shrink-0 rounded-[10px] border border-[#C8A98B]/16 bg-[#3B302B]/50 object-cover"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-heading text-base font-bold leading-snug text-[#F2E9DE]">
                                {item.name}
                              </h4>
                              <button
                                type="button"
                                onClick={() => cart.removeItem(item.id, item.size, item.color)}
                                aria-label={`Remove ${item.name}`}
                                className="rounded-[8px] p-1 text-[#C7B6A6] transition-colors hover:bg-[#3B302B] hover:text-[#F2E9DE]"
                              >
                                <Trash2 className="h-3.5 w-3.5 stroke-[1.6]" />
                              </button>
                            </div>
                            {item.color && (
                              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#C8A98B]">
                                Tone: {item.color}
                              </p>
                            )}
                            {item.size && (
                              <p className="mt-0.5 text-[11px] tracking-wide text-[#C7B6A6]">
                                Size: {item.size}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-[#C8A98B]/28 bg-[#3B302B]/45">
                              <button
                                type="button"
                                onClick={() =>
                                  cart.updateQuantity(item.id, item.quantity - 1, item.size, item.color)
                                }
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center text-[#F2E9DE] hover:bg-[#C8A98B]/18"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold tabular-nums text-[#F2E9DE]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  cart.updateQuantity(item.id, item.quantity + 1, item.size, item.color)
                                }
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center text-[#F2E9DE] hover:bg-[#C8A98B]/18"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-bold tabular-nums text-[#F2E9DE]">
                              {item.showPrice === false
                                ? 'Upon Inquiry'
                                : formatLoomePrice(item.price * item.quantity, storeCurrency)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.items.length > 0 && (
                <div className="border-t border-[#C8A98B]/18 bg-[#2B2320] px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span
                      data-preview-field-path="checkoutPage.estimatedSubtotalLabel"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C7B6A6]"
                    >
                      {estimatedSubtotalLabel}
                    </span>
                    <span className="font-heading text-2xl font-extrabold tabular-nums text-[#F2E9DE]">
                      {allCartInquiryOnly
                        ? priceOnRequestLabel
                        : formatLoomePrice(cart.subtotal, storeCurrency)}
                    </span>
                  </div>
                  <p
                    data-preview-field-path="cartPage.summaryFootnote"
                    className="mt-1 text-xs text-[#C7B6A6]"
                  >
                    {summaryFootnote}
                  </p>
                  <div className="mt-4 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        cart.closeCart();
                        window.location.assign(withBasePath('/checkout/'));
                      }}
                      className="loome-btn-primary w-full text-center"
                    >
                      <span data-preview-field-path="cartPage.checkoutLabel">{checkoutLabel}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        cart.closeCart();
                        window.location.assign(withBasePath('/cart/'));
                      }}
                      className="loome-btn-outline w-full text-center"
                    >
                      <span data-preview-field-path="cartPage.viewBagLabel">{viewBagLabel}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 3. EDITORIAL SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:p-8 sm:pt-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSearch}
              className="fixed inset-0 bg-[#120E0C]/72 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Search ${storeName} textiles`}
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-[#C8A98B]/24 bg-[#201C1A] p-6 text-[#F2E9DE] shadow-[0_28px_72px_rgba(8,6,5,0.65)] sm:p-8"
            >
              <div className="flex items-center gap-3 border-b border-[#C8A98B]/22 pb-4">
                <Search className="h-5 w-5 stroke-[1.6] text-[#C8A98B]" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-preview-field-path="shopPage.searchPlaceholder"
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent font-heading text-xl font-semibold text-[#F2E9DE] outline-none placeholder:text-[#C7B6A6]/60 sm:text-2xl"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#C8A98B]/25 text-[#F2E9DE] transition-colors hover:border-[#C8A98B] hover:bg-[#3B302B]"
                >
                  <X className="h-4 w-4 stroke-[1.6]" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickSearchCategories.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="rounded-[10px] border border-[#C8A98B]/25 bg-[#3B302B]/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C7B6A6] transition-colors hover:border-[#C8A98B] hover:text-[#F2E9DE]"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <div className="mt-6 max-h-[55vh] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p
                    data-preview-field-path="shopPage.emptyDescription"
                    className="py-10 text-center text-sm text-[#C7B6A6]"
                  >
                    {searchEmptyDescription}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="group flex items-center gap-4 rounded-xl border border-[#C8A98B]/16 bg-[#2B2320] p-3 transition-colors hover:border-[#C8A98B]/55"
                      >
                        <img
                          src={withBasePath(product.imageUrl)}
                          alt={product.name}
                          className="h-20 w-16 shrink-0 rounded-[9px] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8A98B]">
                            {product.category}
                          </p>
                          <a
                            href={platformProductDetailHref(product.id)}
                            className="mt-0.5 block truncate font-heading text-base font-bold text-[#F2E9DE] no-underline transition-colors hover:text-[#C8A98B]"
                          >
                            {product.name}
                          </a>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#F2E9DE]">
                              {product.showPrice
                                ? formatLoomePrice(product.price, storeCurrency)
                                : 'Upon Inquiry'}
                            </span>
                            <button
                              type="button"
                              onClick={() => openQuickView(product)}
                              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A98B] transition-colors hover:text-[#F2E9DE]"
                            >
                              <span data-preview-field-path="home.shopTheLook.quickViewLabel">
                                {quickViewLabel}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. CLIENT ATELIER ACCOUNT DRAWER */}
      <AnimatePresence>
        {isAccountOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAccount}
              className="fixed inset-0 bg-[#120E0C]/68 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              aria-label="Client atelier profile"
              className="relative z-10 flex h-full w-full max-w-md flex-col justify-between border-l border-[#C8A98B]/20 bg-[#201C1A] p-7 text-[#F2E9DE] shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#C8A98B]/18 pb-5">
                  <div>
                    <p
                      data-preview-field-path="common.accountDrawer.eyebrow"
                      className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C8A98B]"
                    >
                      {accountEyebrow}
                    </p>
                    <h2
                      data-preview-field-path="common.accountDrawer.heading"
                      className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-[#F2E9DE]"
                    >
                      {accountHeading}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeAccount}
                    aria-label="Close atelier account"
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C8A98B]/25 text-[#F2E9DE] transition-colors hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A]"
                  >
                    <X className="h-4 w-4 stroke-[1.6]" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <a
                    href={withBasePath('/wishlist/')}
                    onClick={closeAccount}
                    className="block rounded-xl border border-[#C8A98B]/20 bg-[#2B2320] p-4 text-left no-underline transition-colors hover:border-[#C8A98B]/55"
                  >
                    <p
                      data-preview-field-path="common.accountDrawer.wishlistLabel"
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C7B6A6]"
                    >
                      {accountWishlistLabel}
                    </p>
                    <p className="mt-1 font-heading text-3xl font-extrabold text-[#F2E9DE]">
                      {wishlistIds.length}
                    </p>
                  </a>
                  <a
                    href={withBasePath('/cart/')}
                    onClick={closeAccount}
                    className="block rounded-xl border border-[#C8A98B]/20 bg-[#2B2320] p-4 text-left no-underline transition-colors hover:border-[#C8A98B]/55"
                  >
                    <p
                      data-preview-field-path="common.accountDrawer.bagLabel"
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C7B6A6]"
                    >
                      {accountBagLabel}
                    </p>
                    <p className="mt-1 font-heading text-3xl font-extrabold text-[#F2E9DE]">
                      {cart.totalCount}
                    </p>
                  </a>
                </div>

                <div className="mt-6 rounded-2xl border border-[#C8A98B]/28 bg-[#3B302B]/55 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A98B]">
                    <Sparkles className="h-4 w-4 stroke-[1.6]" />
                    <span data-preview-field-path="common.accountDrawer.tradeHeading">
                      {accountTradeHeading}
                    </span>
                  </div>
                  <p
                    data-preview-field-path="common.accountDrawer.tradeDescription"
                    className="mt-2 text-sm leading-relaxed text-[#C7B6A6]"
                  >
                    {accountTradeDesc}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-[#C8A98B]/18 pt-5">
                {hasContactPage && (
                  <a
                    href={withBasePath('/contact')}
                    onClick={closeAccount}
                    className="loome-btn-primary w-full text-center no-underline"
                  >
                    <span data-preview-field-path="common.accountDrawer.primaryCtaLabel">
                      {accountPrimaryCta}
                    </span>
                  </a>
                )}
                {hasServicesPage && (
                  <a
                    href={withBasePath('/services')}
                    onClick={closeAccount}
                    className="loome-btn-outline w-full text-center no-underline"
                  >
                    <span data-preview-field-path="common.accountDrawer.secondaryCtaLabel">
                      {accountSecondaryCta}
                    </span>
                  </a>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
