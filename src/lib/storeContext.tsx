'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { contentObject, contentText } from '@/lib/siteDataContext';

export interface LoomeColorSwatch {
  name: string;
  hex: string;
}

export interface LoomeProduct {
  id: string;
  index: number;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  imageUrl: string;
  gallery: string[];
  category: string;
  badge?: string;
  showPrice: boolean;
  isAvailable: boolean;
  collectionTag?: string;
  material?: string;
  composition?: string;
  gsm?: string;
  dimensions?: string;
  careInstructions?: string;
  sizes: string[];
  hasExplicitColors: boolean;
  colors: LoomeColorSwatch[];
  raw: Record<string, unknown>;
}

const DEFAULT_SWATCHES: LoomeColorSwatch[] = [
  { name: 'Cream Ivory', hex: '#F2E9DE' },
  { name: 'Soft Sand', hex: '#E6D9C9' },
  { name: 'Warm Mushroom', hex: '#8D7667' },
];

export function normalizeLoomeProduct(rawInput: unknown, index: number): LoomeProduct {
  const raw = contentObject(rawInput);
  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : typeof raw.id === 'number'
        ? String(raw.id)
        : `product-${index}`;

  const rawPrice = raw.price;
  const price =
    typeof rawPrice === 'number'
      ? rawPrice
      : Number.parseFloat(String(rawPrice ?? 0)) || 0;

  const rawCompare = raw.compareAtPrice;
  const parsedCompare =
    rawCompare === null || rawCompare === undefined || rawCompare === ''
      ? null
      : typeof rawCompare === 'number'
        ? rawCompare
        : Number.parseFloat(String(rawCompare)) || null;

  const customData = contentObject(raw.customData);
  const rawColors = Array.isArray(raw.colors)
    ? raw.colors
    : Array.isArray(customData.colors)
      ? customData.colors
      : [];
  const colors: LoomeColorSwatch[] = rawColors
    .map((entry) => {
      const obj = contentObject(entry);
      const name = contentText(obj.name);
      const hex = contentText(obj.hex);
      if (!name || !hex) return null;
      return { name, hex };
    })
    .filter((item): item is LoomeColorSwatch => Boolean(item));

  const splitDelimited = (input: unknown): string[] => {
    if (Array.isArray(input)) {
      return input.map((entry) => contentText(entry)).filter(Boolean);
    }
    const text = contentText(input);
    if (!text) return [];
    const delimiter = text.includes('|') ? '|' : text.includes('\n') ? '\n' : ',';
    return text
      .split(delimiter)
      .map((part) => part.trim())
      .filter(Boolean);
  };

  const primaryImage = contentText(raw.imageUrl) || '/images/prod-curtain-ivory.jpg';
  const rawGallerySources = [
    ...splitDelimited(raw.gallery),
    ...splitDelimited(raw.galleryImages),
    ...splitDelimited(raw.images),
    ...splitDelimited(raw.additionalImages),
    ...splitDelimited(customData.gallery),
    ...splitDelimited(customData.galleryImages),
  ];
  const gallerySet = new Set<string>([primaryImage]);
  rawGallerySources.forEach((url) => {
    if (url) gallerySet.add(url);
  });

  const sizes = [
    ...splitDelimited(raw.sizes),
    ...splitDelimited(raw.sizesText),
    ...splitDelimited(customData.sizes),
    ...splitDelimited(customData.sizesText),
  ].filter((value, index, arr) => arr.indexOf(value) === index);

  const showPrice =
    raw.showPrice !== undefined
      ? Boolean(raw.showPrice)
      : customData.showPrice !== undefined
        ? Boolean(customData.showPrice)
        : true;

  return {
    id,
    index,
    name: contentText(raw.name) || 'Atelier Textile Piece',
    description: contentText(raw.description),
    price,
    compareAtPrice: parsedCompare && parsedCompare > 0 ? parsedCompare : null,
    currency: contentText(raw.currency) || 'LKR',
    imageUrl: primaryImage,
    gallery: Array.from(gallerySet),
    category: contentText(raw.category) || 'Textiles',
    badge: contentText(raw.badge) || undefined,
    showPrice,
    isAvailable: raw.isAvailable !== false && raw.inStock !== false,
    collectionTag: contentText(raw.collectionTag) || undefined,
    material: contentText(raw.material) || contentText(customData.material) || undefined,
    composition: contentText(raw.composition) || contentText(customData.composition) || undefined,
    gsm: contentText(raw.gsm) || contentText(customData.gsm) || undefined,
    dimensions:
      contentText(raw.dimensions) ||
      contentText(customData.dimensions) ||
      (contentText(raw.measurement)
        ? `${contentText(raw.measurement)} ${contentText(raw.unit)}`.trim()
        : undefined),
    careInstructions:
      contentText(raw.careInstructions) || contentText(customData.careInstructions) || undefined,
    sizes,
    hasExplicitColors: colors.length > 0,
    colors: colors.length > 0 ? colors : DEFAULT_SWATCHES,
    raw,
  };
}

export const SRI_LANKAN_DISTRICTS: readonly string[] = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Moneragala',
  'Ratnapura',
  'Kegalle',
] as const;

export function resolveLoomeCurrency(siteData: unknown, fallbackCurrency?: string): string {
  const sd = contentObject(siteData);
  const content = contentObject(sd.content);
  const common = contentObject(content.common);
  const shop = contentObject(sd.shop);
  const merchant = contentObject(sd.merchant);
  return (
    contentText(shop.currency) ||
    contentText(common.currency) ||
    contentText(merchant.currency) ||
    contentText(fallbackCurrency) ||
    'LKR'
  );
}

export function resolveFreeDeliveryThreshold(siteData: unknown): number {
  const sd = contentObject(siteData);
  const content = contentObject(sd.content);
  const common = contentObject(content.common);
  const shop = contentObject(sd.shop);
  const raw = common.freeDeliveryThreshold ?? shop.freeDeliveryThreshold;
  if (raw === undefined || raw === null || raw === '') return 35000;
  const parsed = typeof raw === 'number' ? raw : Number.parseFloat(String(raw));
  if (!Number.isFinite(parsed)) return 35000;
  return Math.max(0, parsed);
}

export function formatLoomePrice(amount: number, currency = 'LKR'): string {
  const code = (currency || 'LKR').trim().toUpperCase();
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  if (code === 'LKR' || code === 'RS' || code === 'RS.') {
    return `Rs. ${formatted}`;
  }
  if (code === 'USD' || code === '$') {
    return `$${formatted}`;
  }
  if (code === 'EUR' || code === '€') {
    return `€${formatted}`;
  }
  if (code === 'GBP' || code === '£') {
    return `£${formatted}`;
  }
  return `${code} ${formatted}`;
}

interface LoomeStoreContextValue {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  isAccountOpen: boolean;
  openAccount: () => void;
  closeAccount: () => void;
  quickViewProduct: LoomeProduct | null;
  openQuickView: (product: LoomeProduct) => void;
  closeQuickView: () => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const WISHLIST_STORAGE_KEY = 'loome_wishlist_v1';
const PENDING_CATEGORY_KEY = 'loome_pending_category_v1';

const LoomeStoreContext = createContext<LoomeStoreContextValue | null>(null);

export function LoomeStoreProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<LoomeProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setWishlistIds(parsed.filter((item): item is string => typeof item === 'string'));
        }
      }
      const hasUrlCategory = new URLSearchParams(window.location.search).has('category');
      const pendingCategory = window.sessionStorage.getItem(PENDING_CATEGORY_KEY);
      if (pendingCategory) {
        if (!hasUrlCategory) {
          setActiveCategory(pendingCategory);
        }
        window.sessionStorage.removeItem(PENDING_CATEGORY_KEY);
      }
    } catch {
      // Ignore storage access errors in restricted environments
    }
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      try {
        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const openWishlist = useCallback(() => {
    setIsSearchOpen(false);
    setIsAccountOpen(false);
    setQuickViewProduct(null);
    setIsWishlistOpen(true);
  }, []);

  const closeWishlist = useCallback(() => setIsWishlistOpen(false), []);

  const openSearch = useCallback(() => {
    setIsWishlistOpen(false);
    setIsAccountOpen(false);
    setQuickViewProduct(null);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const openAccount = useCallback(() => {
    setIsWishlistOpen(false);
    setIsSearchOpen(false);
    setQuickViewProduct(null);
    setIsAccountOpen(true);
  }, []);

  const closeAccount = useCallback(() => setIsAccountOpen(false), []);

  const openQuickView = useCallback((product: LoomeProduct) => {
    setIsWishlistOpen(false);
    setIsSearchOpen(false);
    setIsAccountOpen(false);
    setQuickViewProduct(product);
  }, []);

  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

  const value = useMemo<LoomeStoreContextValue>(
    () => ({
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      isWishlistOpen,
      openWishlist,
      closeWishlist,
      isSearchOpen,
      openSearch,
      closeSearch,
      isAccountOpen,
      openAccount,
      closeAccount,
      quickViewProduct,
      openQuickView,
      closeQuickView,
      activeCategory,
      setActiveCategory,
    }),
    [
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      isWishlistOpen,
      openWishlist,
      closeWishlist,
      isSearchOpen,
      openSearch,
      closeSearch,
      isAccountOpen,
      openAccount,
      closeAccount,
      quickViewProduct,
      openQuickView,
      closeQuickView,
      activeCategory,
    ],
  );

  return (
    <LoomeStoreContext.Provider value={value}>
      {children}
    </LoomeStoreContext.Provider>
  );
}

export function useLoomeStore() {
  const ctx = useContext(LoomeStoreContext);
  if (!ctx) {
    throw new Error('useLoomeStore must be used within LoomeStoreProvider');
  }
  return ctx;
}
