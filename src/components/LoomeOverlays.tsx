'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
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
  contentObject,
  contentText,
  platformProductDetailHref,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import {
  formatLoomePrice,
  normalizeLoomeProduct,
  useLoomeStore,
} from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import { LUXURY_EASE } from '@/components/motion/LuxuryReveal';

const FREE_DELIVERY_THRESHOLD = 250;

export default function LoomeOverlays() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const cart = useCart();
  const {
    wishlistIds,
    toggleWishlist,
    isWishlisted,
    isWishlistOpen,
    closeWishlist,
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
  const [quickQty, setQuickQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const products = useMemo(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  const common = contentObject(contentObject(siteData.content).common);
  const shop = contentObject((siteData as Record<string, unknown>).shop);
  const storeCurrency =
    contentText(common.currency) ||
    contentText(shop.currency) ||
    products[0]?.currency ||
    'USD';

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(quickViewProduct.colors[0]?.name || 'Warm Ivory');
      setQuickQty(1);
      setAddedFeedback(false);
    }
  }, [quickViewProduct]);

  useEffect(() => {
    const anyOpen =
      isWishlistOpen || isSearchOpen || isAccountOpen || Boolean(quickViewProduct) || cart.isOpen;
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeWishlist();
        closeSearch();
        closeAccount();
        closeQuickView();
        cart.closeCart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    isWishlistOpen,
    isSearchOpen,
    isAccountOpen,
    quickViewProduct,
    cart,
    closeWishlist,
    closeSearch,
    closeAccount,
    closeQuickView,
  ]);

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds],
  );

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
    if (!quickViewProduct) return;
    cart.addItem({
      id: quickViewProduct.id,
      name: quickViewProduct.name,
      price: quickViewProduct.price,
      originalPrice: quickViewProduct.compareAtPrice ?? undefined,
      image: quickViewProduct.imageUrl,
      color: selectedColor,
      quantity: quickQty,
      showPrice: quickViewProduct.showPrice,
    });
    setAddedFeedback(true);
    window.setTimeout(() => {
      closeQuickView();
      cart.openCart();
    }, 450);
  };

  const deliveryProgress = Math.min(100, Math.round((cart.subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const deliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - cart.subtotal);

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
              className="fixed inset-0 bg-[#262923]/55 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Quick view ${quickViewProduct.name}`}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.38, ease: LUXURY_EASE }}
              className="relative z-10 grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto bg-[#F8F6F1] text-[#262923] shadow-2xl dark:bg-[#20231D] dark:text-[#F8F6F1] md:grid-cols-2"
            >
              <button
                type="button"
                onClick={closeQuickView}
                aria-label="Close quick view"
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F6F1]/90 text-[#262923] shadow-sm transition-colors hover:bg-[#262923] hover:text-[#F8F6F1]"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>

              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E8E0D5]/40 md:aspect-auto md:min-h-[520px]">
                <img
                  src={withBasePath(quickViewProduct.imageUrl)}
                  alt={quickViewProduct.name}
                  className="h-full w-full object-cover"
                />
                {quickViewProduct.badge && (
                  <span className="absolute left-5 top-5 bg-[#F8F6F1]/92 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#262923]">
                    {quickViewProduct.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-between p-7 sm:p-10">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#747B65]">
                    {quickViewProduct.category}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-normal leading-tight sm:text-4xl">
                    {quickViewProduct.name}
                  </h2>

                  {quickViewProduct.showPrice ? (
                    <div className="mt-4 flex items-baseline gap-3">
                      <span className="text-xl font-medium tracking-wide">
                        {formatLoomePrice(quickViewProduct.price, quickViewProduct.currency)}
                      </span>
                      {quickViewProduct.compareAtPrice && (
                        <span className="text-sm text-[#65685E] line-through">
                          {formatLoomePrice(quickViewProduct.compareAtPrice, quickViewProduct.currency)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#747B65]">
                      Price Upon Atelier Inquiry
                    </p>
                  )}

                  <p className="mt-5 text-sm leading-relaxed text-[#65685E] dark:text-[#B6B8AE]">
                    {quickViewProduct.description}
                  </p>

                  {quickViewProduct.material && (
                    <p className="mt-4 border-l-2 border-[#B59B79] pl-3 text-xs tracking-wide text-[#262923]/80 dark:text-[#F8F6F1]/80">
                      {quickViewProduct.material}
                    </p>
                  )}

                  {/* Color Swatches */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em]">
                      <span className="text-[#65685E] dark:text-[#B6B8AE]">Tone</span>
                      <span className="font-medium">{selectedColor}</span>
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
                                ? 'scale-110 border-[#262923] ring-2 ring-[#B59B79] ring-offset-2 ring-offset-[#F8F6F1] dark:ring-offset-[#20231D]'
                                : 'border-[#262923]/20 hover:scale-105'
                            }`}
                            style={{ backgroundColor: swatch.hex }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-[#65685E] dark:text-[#B6B8AE]">
                      Quantity
                    </span>
                    <div className="inline-flex items-center border border-[#262923]/20 dark:border-[#F8F6F1]/20">
                      <button
                        type="button"
                        onClick={() => setQuickQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-[#262923]/5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm">{quickQty}</span>
                      <button
                        type="button"
                        onClick={() => setQuickQty((q) => q + 1)}
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-[#262923]/5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3 border-t border-[#262923]/10 pt-6 dark:border-[#F8F6F1]/10">
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={handleQuickAddToBag}
                      className="loome-btn-primary flex-1"
                    >
                      {addedFeedback ? (
                        <>
                          <Check className="h-4 w-4" /> Added to Bag
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4 stroke-[1.5]" /> Add to Bag
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                      aria-label="Toggle wishlist"
                      className={`flex h-[50px] w-[50px] items-center justify-center border transition-colors ${
                        isWishlisted(quickViewProduct.id)
                          ? 'border-[#B59B79] bg-[#B59B79]/15 text-[#B59B79]'
                          : 'border-[#262923]/20 text-[#262923] hover:border-[#262923] dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1]'
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 stroke-[1.5] ${
                          isWishlisted(quickViewProduct.id) ? 'fill-[#B59B79]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <a
                    href={platformProductDetailHref(quickViewProduct.id)}
                    data-preview-static="quickview-detail-link"
                    className="flex items-center justify-center gap-2 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#747B65] transition-colors hover:text-[#262923] dark:text-[#B59B79]"
                  >
                    View Full Specifications <ArrowRight className="h-3.5 w-3.5" />
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
              className="fixed inset-0 bg-[#262923]/45 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              aria-label="Shopping bag"
              className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#F8F6F1] text-[#262923] shadow-2xl dark:bg-[#171915] dark:text-[#F8F6F1]"
            >
              <div className="flex items-center justify-between border-b border-[#262923]/10 px-6 py-5 dark:border-[#F8F6F1]/10">
                <div>
                  <h2 className="font-serif text-2xl font-normal tracking-wide">Your Atelier Bag</h2>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[#65685E] dark:text-[#B6B8AE]">
                    {cart.totalCount} {cart.totalCount === 1 ? 'piece' : 'pieces'} selected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cart.closeCart}
                  aria-label="Close bag"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#262923]/15 transition-colors hover:bg-[#262923] hover:text-[#F8F6F1] dark:border-[#F8F6F1]/20"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              {/* Complimentary Delivery Meter */}
              <div className="border-b border-[#262923]/8 bg-[#E8E0D5]/45 px-6 py-3.5 dark:border-[#F8F6F1]/8 dark:bg-[#20231D]">
                <p className="text-xs text-[#262923]/80 dark:text-[#F8F6F1]/80">
                  {deliveryRemaining === 0 ? (
                    <span className="font-medium text-[#747B65] dark:text-[#B59B79]">
                      ✦ Complimentary white-glove delivery unlocked
                    </span>
                  ) : (
                    <>
                      Add <strong>{formatLoomePrice(deliveryRemaining, storeCurrency)}</strong> more for complimentary
                      white-glove delivery
                    </>
                  )}
                </p>
                <div className="mt-2 h-[2px] w-full overflow-hidden bg-[#262923]/12 dark:bg-[#F8F6F1]/15">
                  <div
                    className="h-full bg-[#B59B79] transition-all duration-500"
                    style={{ width: `${deliveryProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {cart.items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#B59B79]/40 bg-[#FCFBF8] text-[#747B65] dark:bg-[#20231D]">
                      <ShoppingBag className="h-6 w-6 stroke-[1.3]" />
                    </div>
                    <h3 className="mt-5 font-serif text-2xl font-normal">Your bag is currently empty</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#65685E] dark:text-[#B6B8AE]">
                      Explore our Belgian flax drapery, stonewashed bedding, and tactile studio accents.
                    </p>
                    <button
                      type="button"
                      onClick={cart.closeCart}
                      className="loome-btn-outline mt-6"
                    >
                      Continue Exploring
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#262923]/10 dark:divide-[#F8F6F1]/10">
                    {cart.items.map((item) => (
                      <li
                        key={`${item.id}-${item.color || ''}-${item.size || ''}`}
                        className="flex gap-4 py-5"
                      >
                        <img
                          src={withBasePath(item.image || '/images/prod-curtain-ivory.jpg')}
                          alt={item.name}
                          className="h-24 w-20 shrink-0 bg-[#E8E0D5]/40 object-cover"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-serif text-lg leading-snug">{item.name}</h4>
                              <button
                                type="button"
                                onClick={() => cart.removeItem(item.id, item.size, item.color)}
                                aria-label={`Remove ${item.name}`}
                                className="p-1 text-[#65685E] transition-colors hover:text-[#262923] dark:hover:text-[#F8F6F1]"
                              >
                                <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                              </button>
                            </div>
                            {item.color && (
                              <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[#747B65]">
                                Tone: {item.color}
                              </p>
                            )}
                            {item.size && (
                              <p className="mt-0.5 text-[11px] tracking-wide text-[#65685E] dark:text-[#B6B8AE]">
                                Size: {item.size}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-[#262923]/18 dark:border-[#F8F6F1]/20">
                              <button
                                type="button"
                                onClick={() =>
                                  cart.updateQuantity(item.id, item.quantity - 1, item.size, item.color)
                                }
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center hover:bg-[#262923]/5"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  cart.updateQuantity(item.id, item.quantity + 1, item.size, item.color)
                                }
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center hover:bg-[#262923]/5"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-medium">
                              {formatLoomePrice(item.price * item.quantity, storeCurrency)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.items.length > 0 && (
                <div className="border-t border-[#262923]/10 bg-[#FCFBF8] px-6 py-5 dark:border-[#F8F6F1]/10 dark:bg-[#20231D]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#65685E] dark:text-[#B6B8AE]">
                      Estimated Subtotal
                    </span>
                    <span className="font-serif text-2xl">{formatLoomePrice(cart.subtotal, storeCurrency)}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#65685E] dark:text-[#B6B8AE]">
                    Custom sizing & shipping confirmed with our atelier concierge.
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
                      Proceed to Checkout
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        cart.closeCart();
                        window.location.assign(withBasePath('/cart/'));
                      }}
                      className="loome-btn-outline w-full text-center"
                    >
                      View Shopping Bag
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 3. WISHLIST DRAWER */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeWishlist}
              className="fixed inset-0 bg-[#262923]/45 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              aria-label="Saved pieces"
              className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#F8F6F1] text-[#262923] shadow-2xl dark:bg-[#171915] dark:text-[#F8F6F1]"
            >
              <div className="flex items-center justify-between border-b border-[#262923]/10 px-6 py-5 dark:border-[#F8F6F1]/10">
                <div>
                  <h2 className="font-serif text-2xl font-normal tracking-wide">Saved Pieces</h2>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[#65685E] dark:text-[#B6B8AE]">
                    {wishlistProducts.length} curated favorites
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeWishlist}
                  aria-label="Close wishlist"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#262923]/15 transition-colors hover:bg-[#262923] hover:text-[#F8F6F1] dark:border-[#F8F6F1]/20"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {wishlistProducts.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                    <Heart className="h-8 w-8 stroke-[1.2] text-[#B59B79]" />
                    <h3 className="mt-4 font-serif text-2xl font-normal">No saved textiles yet</h3>
                    <p className="mt-2 max-w-xs text-sm text-[#65685E] dark:text-[#B6B8AE]">
                      Tap the heart on any drapery, bedding, or fabric piece to curate your personal moodboard.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#262923]/10 dark:divide-[#F8F6F1]/10">
                    {wishlistProducts.map((product) => (
                      <li key={product.id} className="flex gap-4 py-5">
                        <img
                          src={withBasePath(product.imageUrl)}
                          alt={product.name}
                          className="h-24 w-20 shrink-0 bg-[#E8E0D5]/40 object-cover"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#747B65]">
                              {product.category}
                            </p>
                            <h4 className="mt-0.5 font-serif text-lg leading-snug">{product.name}</h4>
                            <p className="mt-1 text-sm font-medium">
                              {formatLoomePrice(product.price, product.currency)}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                cart.addItem({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.imageUrl,
                                  color: product.colors[0]?.name,
                                  quantity: 1,
                                  showPrice: product.showPrice,
                                });
                                closeWishlist();
                                cart.openCart();
                              }}
                              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#262923] underline underline-offset-4 hover:text-[#747B65] dark:text-[#F8F6F1]"
                            >
                              Move to Bag
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(product.id)}
                              className="text-[11px] uppercase tracking-[0.16em] text-[#65685E] hover:text-[#262923]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 4. EDITORIAL SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:p-8 sm:pt-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSearch}
              className="fixed inset-0 bg-[#262923]/55 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search LOOMÉ textiles"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              className="relative z-10 w-full max-w-3xl overflow-hidden bg-[#F8F6F1] p-6 text-[#262923] shadow-2xl dark:bg-[#20231D] dark:text-[#F8F6F1] sm:p-8"
            >
              <div className="flex items-center gap-3 border-b border-[#262923]/20 pb-4 dark:border-[#F8F6F1]/20">
                <Search className="h-5 w-5 stroke-[1.5] text-[#747B65]" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Belgian linen, curtains, duvet, velvet..."
                  className="w-full bg-transparent font-serif text-2xl outline-none placeholder:text-[#65685E]/60"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-[#262923]/5"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['Curtains', 'Bedding', 'Upholstery', 'Fabrics', 'Cushions'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="border border-[#262923]/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#65685E] transition-colors hover:border-[#B59B79] hover:text-[#262923] dark:border-[#F8F6F1]/15 dark:text-[#B6B8AE]"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <div className="mt-6 max-h-[55vh] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[#65685E]">
                    No textiles matched &ldquo;{searchQuery}&rdquo;. Try searching for linen, velvet, or drapery.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="group flex items-center gap-4 border border-[#262923]/8 bg-[#FCFBF8] p-3 transition-colors hover:border-[#B59B79]/60 dark:border-[#F8F6F1]/10 dark:bg-[#171915]"
                      >
                        <img
                          src={withBasePath(product.imageUrl)}
                          alt={product.name}
                          className="h-20 w-16 shrink-0 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[#747B65]">
                            {product.category}
                          </p>
                          <a
                            href={platformProductDetailHref(product.id)}
                            className="mt-0.5 block truncate font-serif text-lg hover:text-[#747B65]"
                          >
                            {product.name}
                          </a>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xs font-medium">
                              {formatLoomePrice(product.price, product.currency)}
                            </span>
                            <button
                              type="button"
                              onClick={() => openQuickView(product)}
                              className="text-[10px] uppercase tracking-[0.16em] text-[#B59B79] hover:text-[#262923]"
                            >
                              Quick View
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
              className="fixed inset-0 bg-[#262923]/45 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              aria-label="Client atelier profile"
              className="relative z-10 flex h-full w-full max-w-md flex-col justify-between bg-[#F8F6F1] p-7 text-[#262923] shadow-2xl dark:bg-[#171915] dark:text-[#F8F6F1]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#262923]/10 pb-5 dark:border-[#F8F6F1]/10">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#747B65]">
                      Private Client Services
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-normal">LOOMÉ Atelier</h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeAccount}
                    aria-label="Close atelier account"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#262923]/15"
                  >
                    <X className="h-4 w-4 stroke-[1.5]" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="border border-[#262923]/10 bg-[#FCFBF8] p-4 dark:border-[#F8F6F1]/10 dark:bg-[#20231D]">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#65685E]">Saved Pieces</p>
                    <p className="mt-1 font-serif text-3xl">{wishlistIds.length}</p>
                  </div>
                  <div className="border border-[#262923]/10 bg-[#FCFBF8] p-4 dark:border-[#F8F6F1]/10 dark:bg-[#20231D]">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#65685E]">In Your Bag</p>
                    <p className="mt-1 font-serif text-3xl">{cart.totalCount}</p>
                  </div>
                </div>

                <div className="mt-6 border border-[#B59B79]/35 bg-[#E8E0D5]/35 p-5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#747B65]">
                    <Sparkles className="h-4 w-4 stroke-[1.5]" />
                    Trade & Interior Architects
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#65685E] dark:text-[#B6B8AE]">
                    Enjoy dedicated yardage reservations, custom drapery specifications, and complimentary
                    fabric swatch boxes delivered to your studio.
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-[#262923]/10 pt-5 dark:border-[#F8F6F1]/10">
                <a
                  href={withBasePath('/contact')}
                  className="loome-btn-primary w-full text-center"
                >
                  Schedule Atelier Consultation
                </a>
                <a
                  href={withBasePath('/services')}
                  className="loome-btn-outline w-full text-center"
                >
                  Explore Bespoke Services
                </a>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
