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
  category: string;
  badge?: string;
  showPrice: boolean;
  isAvailable: boolean;
  collectionTag?: string;
  material?: string;
  colors: LoomeColorSwatch[];
  raw: Record<string, unknown>;
}

const DEFAULT_SWATCHES: LoomeColorSwatch[] = [
  { name: 'Warm Ivory', hex: '#F8F6F1' },
  { name: 'Soft Beige', hex: '#E8E0D5' },
  { name: 'Sage Olive', hex: '#747B65' },
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

  const rawColors = Array.isArray(raw.colors) ? raw.colors : [];
  const colors: LoomeColorSwatch[] = rawColors
    .map((entry) => {
      const obj = contentObject(entry);
      const name = contentText(obj.name);
      const hex = contentText(obj.hex);
      if (!name || !hex) return null;
      return { name, hex };
    })
    .filter((item): item is LoomeColorSwatch => Boolean(item));

  const showPrice =
    raw.showPrice !== undefined
      ? Boolean(raw.showPrice)
      : (raw.customData as Record<string, unknown> | undefined)?.showPrice !== undefined
        ? Boolean((raw.customData as Record<string, unknown>).showPrice)
        : true;

  return {
    id,
    index,
    name: contentText(raw.name) || 'Atelier Textile Piece',
    description: contentText(raw.description),
    price,
    compareAtPrice: parsedCompare && parsedCompare > 0 ? parsedCompare : null,
    currency: contentText(raw.currency) || 'USD',
    imageUrl: contentText(raw.imageUrl) || '/images/prod-curtain-ivory.jpg',
    category: contentText(raw.category) || 'Textiles',
    badge: contentText(raw.badge) || undefined,
    showPrice,
    isAvailable: raw.isAvailable !== false,
    collectionTag: contentText(raw.collectionTag) || undefined,
    material: contentText(raw.material) || undefined,
    colors: colors.length > 0 ? colors : DEFAULT_SWATCHES,
    raw,
  };
}

export function formatLoomePrice(amount: number, currency = 'USD'): string {
  const code = (currency || 'USD').toUpperCase();
  if (code === 'USD' || code === '$') {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (code === 'EUR' || code === '€') {
    return `€${amount.toLocaleString('en-US')}`;
  }
  return `${code} ${amount.toLocaleString('en-US')}`;
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
      const pendingCategory = window.sessionStorage.getItem(PENDING_CATEGORY_KEY);
      if (pendingCategory) {
        setActiveCategory(pendingCategory);
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
