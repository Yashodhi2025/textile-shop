'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import {
  contentObject,
  contentText,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import {
  extractHomeCategories,
  resolveCategoryQueryId,
  resolveShopCategoryParam,
} from '@/lib/categoryUtils';
import {
  extractCuratedCollections,
  findCollectionByParam,
  productMatchesCollection,
} from '@/lib/collectionUtils';
import {
  formatLoomePrice,
  normalizeLoomeProduct,
  resolveLoomeCurrency,
  useLoomeStore,
  type LoomeColorSwatch,
  type LoomeProduct,
} from '@/lib/storeContext';
import LoomeProductCard from '@/components/LoomeProductCard';
import { LUXURY_EASE, LuxuryReveal } from '@/components/motion/LuxuryReveal';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'bestsellers';
type PriceBand = 'all' | 'low' | 'mid' | 'high';

function roundNiceStep(value: number): number {
  if (value >= 5000) return Math.round(value / 1000) * 1000;
  if (value >= 500) return Math.round(value / 100) * 100;
  return Math.max(25, Math.round(value / 25) * 25);
}

function extractMaterialGroup(material?: string): string {
  const m = (material || '').toLowerCase();
  if (!m) return 'Natural Weave';
  if (m.includes('velvet')) return 'Washed Velvet';
  if (m.includes('sateen') || m.includes('cotton')) return 'Organic Cotton Sateen';
  if (m.includes('merino') || m.includes('cashmere') || m.includes('wool')) return 'Merino & Wool Blend';
  if (m.includes('flax') || m.includes('linen')) return 'European Flax Linen';
  return material!.split('·')[0].trim();
}

export default function ShopCatalogView() {
  const siteData = useSiteData();
  const rawProducts = useProducts();
  const { activeCategory, setActiveCategory } = useLoomeStore();

  const content = contentObject(siteData.content);
  const shopPage = contentObject(content.shopPage);
  const homeCategories = useMemo(
    () => extractHomeCategories(content.home),
    [content.home],
  );
  const curatedCollections = useMemo(
    () => extractCuratedCollections(content.collectionsPage),
    [content.collectionsPage],
  );

  const allProducts = useMemo<LoomeProduct[]>(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  const storeCurrency = resolveLoomeCurrency(siteData, allProducts[0]?.currency);

  const { catalogMinPrice, catalogMaxPrice, lowCut, highCut, sliderStep } = useMemo(() => {
    const prices = allProducts.map((p) => p.price).filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length === 0) {
      return {
        catalogMinPrice: 5000,
        catalogMaxPrice: 60000,
        lowCut: 20000,
        highCut: 35000,
        sliderStep: 1000,
      };
    }
    const minVal = Math.min(...prices);
    const maxVal = Math.max(...prices);
    const step = maxVal >= 5000 ? 1000 : maxVal >= 500 ? 100 : 15;
    const roundedMax = Math.ceil(maxVal / step) * step;
    const roundedMin = Math.max(0, Math.floor(minVal / step) * step);
    const span = Math.max(step * 2, roundedMax - roundedMin);
    return {
      catalogMinPrice: roundedMin,
      catalogMaxPrice: roundedMax,
      lowCut: roundNiceStep(roundedMin + span * 0.35),
      highCut: roundNiceStep(roundedMin + span * 0.7),
      sliderStep: step,
    };
  }, [allProducts]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCollectionId, setActiveCollectionId] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [priceBand, setPriceBand] = useState<PriceBand>('all');
  const [maxPriceCap, setMaxPriceCap] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const effectiveMaxPrice = maxPriceCap ?? catalogMaxPrice;

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileDrawerOpen]);

  // Derived filter facets from live catalog
  const categoryEntries = useMemo(() => {
    const counts = new Map<string, number>();
    allProducts.forEach((p) => {
      if (p.category) {
        counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
      }
    });
    return [
      { name: 'All', count: allProducts.length },
      ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
    ];
  }, [allProducts]);

  const availableCategoryNames = useMemo(
    () => categoryEntries.filter((entry) => entry.name !== 'All').map((entry) => entry.name),
    [categoryEntries],
  );

  const resolvedActiveCategory = useMemo(
    () => resolveShopCategoryParam(activeCategory, availableCategoryNames, homeCategories),
    [activeCategory, availableCategoryNames, homeCategories],
  );

  const activeCollection = useMemo(
    () => findCollectionByParam(activeCollectionId, curatedCollections),
    [activeCollectionId, curatedCollections],
  );

  const syncShopQueryParams = useCallback(
    (nextCategory: string, nextCollectionId: string) => {
      if (typeof window === 'undefined') return;
      try {
        const url = new URL(window.location.href);
        const queryId = resolveCategoryQueryId(nextCategory, homeCategories);
        if (queryId) {
          url.searchParams.set('category', queryId);
        } else {
          url.searchParams.delete('category');
        }
        if (nextCollectionId.trim()) {
          url.searchParams.set('collection', nextCollectionId.trim());
        } else {
          url.searchParams.delete('collection');
        }
        window.history.replaceState(window.history.state, '', url.toString());
      } catch {
        // Ignore history restrictions in sandboxed environments
      }
    },
    [homeCategories],
  );

  const selectCategory = useCallback(
    (nextCategory: string) => {
      const resolved = resolveShopCategoryParam(
        nextCategory,
        availableCategoryNames,
        homeCategories,
      );
      setActiveCategory(resolved);
      syncShopQueryParams(resolved, activeCollectionId);
    },
    [
      availableCategoryNames,
      homeCategories,
      setActiveCategory,
      syncShopQueryParams,
      activeCollectionId,
    ],
  );

  const selectCollection = useCallback(
    (nextCollectionId: string) => {
      const cleanId = nextCollectionId.trim();
      setActiveCollectionId(cleanId);
      syncShopQueryParams(resolvedActiveCategory, cleanId);
    },
    [resolvedActiveCategory, syncShopQueryParams],
  );

  // Sync ?category=<stableId> and ?collection=<stableId> query parameters on mount and browser back/forward
  useEffect(() => {
    const applyParamsFromUrl = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlCollection = params.get('collection');
        if (urlCollection !== null) {
          const matchedCol = findCollectionByParam(urlCollection, curatedCollections);
          setActiveCollectionId(matchedCol ? matchedCol.id : '');
        } else {
          setActiveCollectionId('');
        }

        const urlCategory = params.get('category');
        if (urlCategory !== null) {
          const resolved = resolveShopCategoryParam(
            urlCategory,
            availableCategoryNames,
            homeCategories,
          );
          setActiveCategory(resolved);
          try {
            window.sessionStorage.removeItem('loome_pending_category_v1');
          } catch {
            // Ignore storage errors
          }
        }
      } catch {
        // Ignore URL parsing errors
      }
    };

    applyParamsFromUrl();
    window.addEventListener('popstate', applyParamsFromUrl);
    return () => window.removeEventListener('popstate', applyParamsFromUrl);
  }, [availableCategoryNames, homeCategories, curatedCollections, setActiveCategory]);

  const materials = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => set.add(extractMaterialGroup(p.material)));
    return ['All', ...Array.from(set)];
  }, [allProducts]);

  const colorSwatches = useMemo(() => {
    const map = new Map<string, LoomeColorSwatch>();
    allProducts.forEach((p) => {
      p.colors.forEach((c) => {
        const key = c.name.trim().toLowerCase();
        if (!map.has(key)) map.set(key, c);
      });
    });
    return Array.from(map.values());
  }, [allProducts]);

  // Apply all filters + sorting
  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const list = allProducts.filter((product) => {
      if (activeCollection && !productMatchesCollection(product, activeCollection)) {
        return false;
      }

      if (
        resolvedActiveCategory !== 'All' &&
        product.category.toLowerCase() !== resolvedActiveCategory.toLowerCase()
      ) {
        return false;
      }

      if (normalizedSearch) {
        const haystack = [
          product.name,
          product.category,
          product.description,
          product.material,
          ...product.colors.map((c) => c.name),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }

      if (
        selectedMaterial !== 'All' &&
        extractMaterialGroup(product.material) !== selectedMaterial
      ) {
        return false;
      }

      if (selectedColor !== 'All') {
        const matchesTone = product.colors.some(
          (c) => c.name.toLowerCase() === selectedColor.toLowerCase(),
        );
        if (!matchesTone) return false;
      }

      if (priceBand === 'low' && product.price >= lowCut) return false;
      if (priceBand === 'mid' && (product.price < lowCut || product.price > highCut)) return false;
      if (priceBand === 'high' && product.price <= highCut) return false;

      if (maxPriceCap !== null && product.price > maxPriceCap) return false;

      if (inStockOnly && !product.isAvailable) return false;

      return true;
    });

    const sorted = [...list];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'bestsellers') {
      sorted.sort((a, b) => {
        const aScore = a.collectionTag === 'bestseller' ? 0 : 1;
        const bScore = b.collectionTag === 'bestseller' ? 0 : 1;
        return aScore - bScore || a.index - b.index;
      });
    } else {
      // newest
      sorted.sort((a, b) => {
        const aScore = a.collectionTag === 'new' ? 0 : 1;
        const bScore = b.collectionTag === 'new' ? 0 : 1;
        return aScore - bScore || a.index - b.index;
      });
    }
    return sorted;
  }, [
    allProducts,
    activeCollection,
    resolvedActiveCategory,
    searchQuery,
    selectedMaterial,
    selectedColor,
    priceBand,
    lowCut,
    highCut,
    maxPriceCap,
    inStockOnly,
    sortBy,
  ]);

  const activeFilters = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (activeCollection) {
      chips.push({
        key: 'collection',
        label: `Collection: ${activeCollection.title}`,
        onRemove: () => selectCollection(''),
      });
    }
    if (resolvedActiveCategory !== 'All') {
      chips.push({
        key: 'category',
        label: `Category: ${resolvedActiveCategory}`,
        onRemove: () => selectCategory('All'),
      });
    }
    if (searchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (selectedMaterial !== 'All') {
      chips.push({
        key: 'material',
        label: `Material: ${selectedMaterial}`,
        onRemove: () => setSelectedMaterial('All'),
      });
    }
    if (selectedColor !== 'All') {
      chips.push({
        key: 'color',
        label: `Tone: ${selectedColor}`,
        onRemove: () => setSelectedColor('All'),
      });
    }
    if (priceBand !== 'all') {
      const bandLabels: Record<Exclude<PriceBand, 'all'>, string> = {
        low: `Under ${formatLoomePrice(lowCut, storeCurrency)}`,
        mid: `${formatLoomePrice(lowCut, storeCurrency)} – ${formatLoomePrice(highCut, storeCurrency)}`,
        high: `${formatLoomePrice(highCut, storeCurrency)}+`,
      };
      chips.push({
        key: 'priceBand',
        label: `Price: ${bandLabels[priceBand]}`,
        onRemove: () => setPriceBand('all'),
      });
    }
    if (maxPriceCap !== null && maxPriceCap < catalogMaxPrice) {
      chips.push({
        key: 'maxPrice',
        label: `Up to ${formatLoomePrice(maxPriceCap, storeCurrency)}`,
        onRemove: () => setMaxPriceCap(null),
      });
    }
    if (inStockOnly) {
      chips.push({
        key: 'stock',
        label: 'In Stock Only',
        onRemove: () => setInStockOnly(false),
      });
    }
    return chips;
  }, [
    activeCollection,
    resolvedActiveCategory,
    searchQuery,
    selectedMaterial,
    selectedColor,
    priceBand,
    lowCut,
    highCut,
    maxPriceCap,
    catalogMaxPrice,
    inStockOnly,
    storeCurrency,
    selectCategory,
    selectCollection,
  ]);

  const resetAllFilters = () => {
    setActiveCategory('All');
    setActiveCollectionId('');
    setSearchQuery('');
    setSelectedMaterial('All');
    setSelectedColor('All');
    setPriceBand('all');
    setMaxPriceCap(null);
    setInStockOnly(false);
    setSortBy('newest');
    syncShopQueryParams('All', '');
  };

  const renderFilterGroups = (idPrefix: string) => (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Material Filter */}
      <div>
        <p
          data-preview-static={`${idPrefix}-material-heading`}
          className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
        >
          Material &amp; Fiber
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {materials.map((mat) => {
            const active = selectedMaterial === mat;
            return (
              <button
                key={mat}
                type="button"
                data-preview-static={`${idPrefix}-mat-${mat}`}
                onClick={() => setSelectedMaterial(mat)}
                className={`rounded-[10px] border px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${active
                  ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                  : 'border-[var(--loome-border)] bg-[var(--loome-ivory)] text-[var(--muted-color)] hover:border-[var(--brand-accent)] hover:text-[var(--heading-color)]'
                  }`}
              >
                {mat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Tone Filter */}
      <div>
        <p
          data-preview-static={`${idPrefix}-color-heading`}
          className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
        >
          Color Palette
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-preview-static={`${idPrefix}-color-all`}
            onClick={() => setSelectedColor('All')}
            className={`rounded-[10px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${selectedColor === 'All'
              ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
              : 'border-[var(--loome-border)] text-[var(--muted-color)] hover:border-[var(--brand-accent)] hover:text-[var(--heading-color)]'
              }`}
          >
            All
          </button>
          {colorSwatches.map((swatch) => {
            const active = selectedColor.toLowerCase() === swatch.name.toLowerCase();
            return (
              <button
                key={swatch.name}
                type="button"
                data-preview-static={`${idPrefix}-swatch-${swatch.name}`}
                onClick={() => setSelectedColor(active ? 'All' : swatch.name)}
                aria-label={`Filter by ${swatch.name}`}
                title={swatch.name}
                className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-transform ${active
                  ? 'scale-110 border-[var(--heading-color)] ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--card-bg)]'
                  : 'border-[var(--loome-border)] hover:scale-110'
                  }`}
                style={{ backgroundColor: swatch.hex }}
              >
                {active && (
                  <Check className="h-3 w-3 stroke-[2.5] text-[#2D2722] drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Range Filter */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <p
            data-preview-static={`${idPrefix}-price-heading`}
            className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
          >
            Price Range
          </p>
          <span
            data-preview-static={`${idPrefix}-price-cap`}
            className="text-[11px] font-semibold text-[var(--heading-color)]"
          >
            Up to {formatLoomePrice(effectiveMaxPrice, storeCurrency)}
          </span>
        </div>

        <input
          type="range"
          min={catalogMinPrice}
          max={Math.max(catalogMaxPrice, catalogMinPrice + sliderStep)}
          step={sliderStep}
          value={effectiveMaxPrice}
          onChange={(e) => setMaxPriceCap(Number(e.target.value))}
          aria-label="Maximum price"
          data-preview-static={`${idPrefix}-price-slider`}
          className="mt-3 h-1 w-full cursor-pointer appearance-none bg-[var(--loome-border)] accent-[var(--brand-accent)]"
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'low', label: `Under ${formatLoomePrice(lowCut, storeCurrency)}` },
              {
                id: 'mid',
                label: `${formatLoomePrice(lowCut, storeCurrency)}–${formatLoomePrice(highCut, storeCurrency)}`,
              },
              { id: 'high', label: `${formatLoomePrice(highCut, storeCurrency)}+` },
            ] as const
          ).map((band) => {
            const active = priceBand === band.id;
            return (
              <button
                key={band.id}
                type="button"
                data-preview-static={`${idPrefix}-band-${band.id}`}
                onClick={() => setPriceBand(band.id)}
                className={`rounded-[10px] border px-2.5 py-1 text-[10px] font-medium tracking-wide transition-colors ${active
                  ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                  : 'border-[var(--loome-border)] text-[var(--muted-color)] hover:border-[var(--brand-accent)] hover:text-[var(--heading-color)]'
                  }`}
              >
                {band.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Availability Filter */}
      <div>
        <p
          data-preview-static={`${idPrefix}-availability-heading`}
          className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
        >
          Availability
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={inStockOnly}
          data-preview-static={`${idPrefix}-instock-toggle`}
          onClick={() => setInStockOnly((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-[11px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] px-4 py-2.5 text-left text-xs font-medium text-[var(--heading-color)] transition-colors hover:border-[var(--brand-accent)]"
        >
          <span>In Stock &amp; Ready to Ship</span>
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${inStockOnly ? 'bg-[var(--brand-accent)]' : 'bg-[var(--loome-border)]'
              }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${inStockOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'
                }`}
            />
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div data-preview-page-key="shop" className="loome-surface-ivory w-full overflow-x-clip">
      {/* 1. Light Editorial Shop Heading & Introduction — Warm Ivory */}
      <section
        data-design-section="shop-heading"
        className="mx-auto w-full max-w-[1280px] px-4 pb-7 pt-9 sm:px-8 lg:px-10 lg:pb-8 lg:pt-11"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--brand-accent)]" aria-hidden="true" />
              <EditableText
                as="p"
                data-preview-field-path="shopPage.eyebrow"
                defaultValue={contentText(shopPage.eyebrow) || 'SHOP ALL TEXTILES'}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.24em"
                color="primary"
                className="m-0"
              />
            </div>

            <EditableText
              as="h1"
              data-preview-field-path="shopPage.heading"
              defaultValue={contentText(shopPage.heading) || 'Shop Fine Textiles'}
              fontFamily="heading"
              size="clamp(1.9rem, 3.1vw, 2.65rem)"
              weight={800}
              lineHeight={1.08}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-2.5 mb-0"
            />
          </div>

          <EditableText
            as="p"
            data-preview-field-path="shopPage.intro"
            defaultValue={contentText(shopPage.intro)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.7}
            color="muted"
            className="m-0 max-w-md lg:text-right"
          />
        </LuxuryReveal>
      </section>

      {/* 2. Category Navigation Ribbon — Oat Beige */}
      <section
        data-design-section="shop-categories-nav"
        className="loome-surface-beige w-full border-y border-[var(--loome-border)]"
      >
        <div className="mx-auto flex max-w-[1280px] items-center gap-6 overflow-x-auto px-4 py-3 sm:px-8 lg:gap-8 lg:px-10">
          {categoryEntries.map((entry) => {
            const isActive =
              resolvedActiveCategory.toLowerCase() === entry.name.toLowerCase();
            return (
              <button
                key={entry.name}
                type="button"
                data-preview-static={`shop-cat-nav-${entry.name}`}
                onClick={() => selectCategory(entry.name)}
                className={`group relative flex shrink-0 items-baseline gap-1.5 border-0 bg-transparent px-0 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${isActive
                  ? 'text-[var(--heading-color)]'
                  : 'text-[var(--muted-color)] hover:text-[var(--heading-color)]'
                  }`}
              >
                <span>{entry.name}</span>
                <span className="text-[10px] font-medium text-[var(--brand-accent)]">
                  ({entry.count})
                </span>
                <span
                  className={`absolute inset-x-0 bottom-0 h-[2px] bg-[var(--brand-accent)] transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Active Collection Context Banner (shown when arriving from /collections/?collection=...) */}
      {activeCollection && (
        <div className="border-b border-[var(--loome-border)] bg-[var(--card-bg)]">
          <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p
                data-preview-static="shop-active-collection-eyebrow"
                className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
              >
                Viewing Collection · {activeCollection.tag}
              </p>
              <h2
                data-preview-static="shop-active-collection-title"
                className="mt-1 mb-0 font-heading text-xl font-extrabold text-[var(--heading-color)] sm:text-2xl"
              >
                {activeCollection.title}
              </h2>
              {activeCollection.description && (
                <p
                  data-preview-static="shop-active-collection-desc"
                  className="mt-1 mb-0 text-xs leading-relaxed text-[var(--muted-color)]"
                >
                  {activeCollection.description}
                </p>
              )}
            </div>
            <button
              type="button"
              data-preview-static="shop-clear-collection"
              onClick={() => selectCollection('')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--heading-color)] transition-colors hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)]"
            >
              <X className="h-3.5 w-3.5 stroke-[1.8]" />
              View All Products
            </button>
          </div>
        </div>
      )}

      {/* 4. Toolbar (Search, Filters, Sort), Active Chips & 4-Column Product Grid — Warm Ivory */}
      <div className="loome-surface-ivory w-full">
        <section
          data-design-section="shop-catalog"
          className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8 lg:px-10 lg:py-10"
        >
          {/* Filter, Search & Sort Toolbar */}
          <div className="flex flex-col gap-4 border-b border-[var(--loome-border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Desktop Filter Drawer Toggle */}
              <button
                type="button"
                data-preview-static="shop-desktop-filter-toggle"
                onClick={() => setDesktopFiltersOpen((v) => !v)}
                aria-expanded={desktopFiltersOpen}
                className="hidden items-center gap-2 rounded-[10px] border border-[var(--loome-border)] bg-[var(--card-bg)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--heading-color)] transition-colors hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)] lg:inline-flex"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.6]" />
                <span>{desktopFiltersOpen ? 'Hide Filters' : 'Filters'}</span>
                {activeFilters.length > 0 && (
                  <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brand-accent)] px-1 text-[9px] font-bold text-white dark:text-[#1A1614]">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              {/* Mobile Filter Drawer Trigger */}
              <button
                type="button"
                data-preview-static="shop-mobile-filter-toggle"
                onClick={() => setMobileDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--loome-border)] bg-[var(--card-bg)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--heading-color)] transition-colors hover:border-[var(--brand-accent)] lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.6]" />
                <span>Filters</span>
                {activeFilters.length > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brand-accent)] px-1 text-[9px] font-bold text-white dark:text-[#1A1614]">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              {/* Live Product Count */}
              <p
                data-preview-static="shop-product-count"
                className="m-0 text-xs tracking-wide text-[var(--muted-color)]"
              >
                Showing{' '}
                <strong className="font-semibold text-[var(--heading-color)]">
                  {filteredProducts.length}
                </strong>{' '}
                of {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            {/* Right: Inline Catalog Search + Sort Dropdown */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:w-64 sm:flex-initial">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[1.6] text-[var(--muted-color)]"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search textiles..."
                  aria-label="Search shop products"
                  data-preview-static="shop-search-input"
                  className="h-10 w-full rounded-[10px] border border-[var(--loome-border)] bg-[var(--card-bg)] pl-9 pr-8 text-xs text-[var(--heading-color)] placeholder:text-[var(--muted-color)]/75 focus:border-[var(--brand-accent)] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    data-preview-static="shop-search-clear"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0.5 text-[var(--muted-color)] hover:text-[var(--heading-color)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <label
                  htmlFor="loome-shop-sort"
                  data-preview-static="shop-sort-label"
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-color)]"
                >
                  Sort
                </label>
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    id="loome-shop-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    data-preview-static="shop-sort-select"
                    className="h-10 w-full appearance-none rounded-[10px] border border-[var(--loome-border)] bg-[var(--card-bg)] pl-3.5 pr-9 text-xs font-medium text-[var(--heading-color)] focus:border-[var(--brand-accent)] focus:outline-none"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="bestsellers">Bestsellers</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 stroke-[1.6] text-[var(--muted-color)]"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Expandable Filter Panel */}
          <AnimatePresence initial={false}>
            {desktopFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: LUXURY_EASE }}
                className="mt-4 hidden overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] lg:block"
              >
                <div className="p-6">{renderFilterGroups('desktop')}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filter Chips Bar */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {activeFilters.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  data-preview-static={`active-chip-${chip.key}`}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--brand-accent)]/55 bg-[var(--loome-beige)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--heading-color)] transition-colors hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)]"
                >
                  <span>{chip.label}</span>
                  <X className="h-3 w-3 stroke-[1.8]" />
                </button>
              ))}

              <button
                type="button"
                data-preview-static="shop-clear-filters"
                onClick={resetAllFilters}
                className="ml-1 inline-flex items-center gap-1.5 border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)] underline underline-offset-4 transition-colors hover:text-[var(--heading-color)]"
              >
                <RotateCcw className="h-3 w-3 stroke-[1.6]" />
                Clear All
              </button>
            </div>
          )}

          {/* Responsive 4-Column Product Grid */}
          <div
            data-preview-list-path="products"
            className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {allProducts.length === 0 ? (
              <p
                data-preview-static="shop-catalog-empty"
                className="col-span-full rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] py-16 text-center text-sm text-[var(--muted-color)]"
              >
                Add textile products in your Fivora catalog to populate the shop.
              </p>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-16 text-center">
                <p
                  data-preview-static="shop-empty-eyebrow"
                  className="m-0 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-accent)]"
                >
                  No Matching Products
                </p>
                <h2
                  data-preview-static="shop-empty-heading"
                  className="mt-2.5 font-heading text-2xl font-bold text-[var(--heading-color)] sm:text-3xl"
                >
                  No textiles match your current selection
                </h2>
                <p
                  data-preview-static="shop-empty-copy"
                  className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-[var(--muted-color)]"
                >
                  Try widening your price range, switching fiber or tone filters, or returning to the full LOOMÉ collection.
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    data-preview-static="shop-empty-reset-btn"
                    onClick={resetAllFilters}
                    className="loome-btn-primary"
                  >
                    <RotateCcw className="h-3.5 w-3.5 stroke-[1.5]" />
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.32,
                        delay: Math.min(idx * 0.03, 0.15),
                        ease: LUXURY_EASE,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.14, delay: 0, ease: 'easeOut' },
                    }}
                  >
                    <LoomeProductCard product={product} tone="light" />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
      </div>

      {/* 4. Mobile Slide-Over Filter Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-[#2D2722]/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.42, ease: LUXURY_EASE }}
              aria-label="Shop filters"
              className="relative z-10 flex h-full w-[88%] max-w-sm flex-col bg-[var(--loome-ivory)] text-[var(--heading-color)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--loome-border)] px-6 py-4">
                <div>
                  <h2 className="m-0 font-heading text-xl font-bold">Refine Selection</h2>
                  <p className="mt-0.5 m-0 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)]">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--loome-border)] text-[var(--heading-color)]"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* Category quick select inside mobile drawer */}
                <div className="mb-7">
                  <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
                    Category
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categoryEntries.map((entry) => {
                      const active =
                        resolvedActiveCategory.toLowerCase() === entry.name.toLowerCase();
                      return (
                        <button
                          key={entry.name}
                          type="button"
                          onClick={() => selectCategory(entry.name)}
                          className={`rounded-[10px] border px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${active
                            ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                            : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--muted-color)]'
                            }`}
                        >
                          {entry.name} ({entry.count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {renderFilterGroups('mobile')}
              </div>

              <div className="flex gap-3 border-t border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-4">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="loome-btn-outline flex-1 px-4 py-3 text-[11px]"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="loome-btn-primary flex-1 px-4 py-3 text-[11px]"
                >
                  View ({filteredProducts.length})
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
