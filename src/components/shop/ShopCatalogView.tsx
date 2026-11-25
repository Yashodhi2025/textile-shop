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
  const home = contentObject(content.home);
  const shopPage = contentObject(content.shopPage);
  const allFilterLabel = contentText(home.productsAllFilterLabel) || 'All';
  const searchPlaceholder = contentText(shopPage.searchPlaceholder) || 'Search textiles...';
  const collectionEyebrow = contentText(shopPage.collectionEyebrow) || 'Collection';
  const viewAllProductsLabel = contentText(shopPage.viewAllProductsLabel) || 'View All Products';
  const filtersLabel = contentText(shopPage.filtersLabel) || 'Filters';
  const sortLabel = contentText(shopPage.sortLabel) || 'Sort';
  const materialFilterHeading = contentText(shopPage.materialFilterHeading) || 'Material & Fiber';
  const colorFilterHeading = contentText(shopPage.colorFilterHeading) || 'Color Palette';
  const priceFilterHeading = contentText(shopPage.priceFilterHeading) || 'Price Range';
  const availabilityFilterHeading =
    contentText(shopPage.availabilityFilterHeading) || 'Availability';
  const inStockOnlyLabel =
    contentText(shopPage.inStockOnlyLabel) || 'In Stock & Ready to Ship';
  const mobileFiltersHeading = contentText(shopPage.mobileFiltersHeading) || 'Refine Selection';
  const clearAllFiltersLabel = contentText(shopPage.clearAllFiltersLabel) || 'Clear All';
  const emptyEyebrow = contentText(shopPage.emptyEyebrow) || 'No Matching Products';
  const emptyHeading =
    contentText(shopPage.emptyHeading) || 'No textiles match your current selection';
  const emptyDescription =
    contentText(shopPage.emptyDescription) ||
    'Try widening your price range, switching fiber or tone filters, or returning to the full collection.';
  const resetFiltersLabel = contentText(shopPage.resetFiltersLabel) || 'Reset All Filters';
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
          data-preview-field-path="shopPage.materialFilterHeading"
          className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
        >
          {materialFilterHeading}
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
          data-preview-field-path="shopPage.colorFilterHeading"
          className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
        >
          {colorFilterHeading}
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
            data-preview-field-path="shopPage.priceFilterHeading"
            className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
          >
            {priceFilterHeading}
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
          data-preview-field-path="shopPage.availabilityFilterHeading"
          className="m-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]"
        >
          {availabilityFilterHeading}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={inStockOnly}
          data-testid={`${idPrefix}-instock-toggle`}
          onClick={() => setInStockOnly((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-[11px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] px-4 py-2.5 text-left text-xs font-medium text-[var(--heading-color)] transition-colors hover:border-[var(--brand-accent)]"
        >
          <span data-preview-field-path="shopPage.inStockOnlyLabel">{inStockOnlyLabel}</span>
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
      {/* 1. Compact Editorial Shop Header — Unified Warm Ivory */}
      <section
        data-design-section="shop-heading"
        className="mx-auto w-full max-w-[1280px] px-4 pb-4 pt-6 sm:px-8 sm:pt-7 lg:px-10"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-2.5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="h-px w-7 bg-[var(--brand-accent)]" aria-hidden="true" />
              <EditableText
                as="p"
                data-preview-field-path="shopPage.eyebrow"
                defaultValue={contentText(shopPage.eyebrow) || 'SHOP ALL TEXTILES'}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.22em"
                color="primary"
                className="m-0"
              />
            </div>

            <EditableText
              as="h1"
              data-preview-field-path="shopPage.heading"
              defaultValue={contentText(shopPage.heading) || 'Shop Fine Textiles'}
              fontFamily="heading"
              size="clamp(1.65rem, 2.5vw, 2.2rem)"
              weight={800}
              lineHeight={1.1}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-1.5 mb-0"
            />
          </div>

          <EditableText
            as="p"
            data-preview-field-path="shopPage.intro"
            defaultValue={contentText(shopPage.intro)}
            fontFamily="body"
            size="0.875rem"
            lineHeight={1.6}
            color="muted"
            className="m-0 max-w-md lg:text-right"
          />
        </LuxuryReveal>
      </section>

      {/* 2. Unified Category Pills, Collection Context, Toolbar & Product Grid — Same Warm Ivory Canvas */}
      <section
        data-design-section="shop-catalog"
        className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-1 sm:px-8 lg:px-10 lg:pb-14"
      >
        {/* Compact Category Filter Pills */}
        <div
          data-design-section="shop-categories-nav"
          className="flex items-center gap-2 overflow-x-auto pb-3"
        >
          {categoryEntries.map((entry) => {
            const isActive =
              resolvedActiveCategory.toLowerCase() === entry.name.toLowerCase();
            const isAll = entry.name === 'All';
            const matchedHomeCatIdx = isAll
              ? -1
              : homeCategories.findIndex(
                  (c) =>
                    c.id.toLowerCase() === entry.name.toLowerCase() ||
                    c.name.toLowerCase() === entry.name.toLowerCase(),
                );
            const firstProdMatch = isAll
              ? undefined
              : allProducts.find(
                  (p) => p.category.toLowerCase() === entry.name.toLowerCase(),
                );
            const displayLabel = isAll
              ? allFilterLabel
              : matchedHomeCatIdx >= 0
                ? homeCategories[matchedHomeCatIdx].name || entry.name
                : entry.name;
            return (
              <button
                key={entry.name}
                type="button"
                data-testid={`shop-cat-nav-${entry.name.toLowerCase()}`}
                onClick={() => selectCategory(entry.name)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${isActive
                  ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                  : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--muted-color)] hover:border-[var(--brand-accent)] hover:text-[var(--heading-color)]'
                  }`}
              >
                {isAll ? (
                  <span data-preview-field-path="home.productsAllFilterLabel">
                    {displayLabel}
                  </span>
                ) : matchedHomeCatIdx >= 0 ? (
                  <span data-preview-field-path={`home.categories[${matchedHomeCatIdx}].name`}>
                    {displayLabel}
                  </span>
                ) : firstProdMatch ? (
                  <span data-preview-field-path={`products[${firstProdMatch.index}].category`}>
                    {displayLabel}
                  </span>
                ) : (
                  <span>{displayLabel}</span>
                )}
                <span
                  data-preview-static={`shop-cat-count-${entry.name}`}
                  className={`text-[10px] font-medium ${isActive ? 'opacity-80' : 'text-[var(--brand-accent)]'
                    }`}
                >
                  ({entry.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Streamlined Collection Context Bar (shown when arriving from /collections/?collection=...) */}
        {activeCollection && (
          <div
            data-testid="shop-collection-banner"
            className="mb-3 flex flex-col justify-between gap-2.5 rounded-xl border border-[var(--brand-accent)]/40 bg-[var(--card-bg)] px-4 py-3 sm:flex-row sm:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <span
                  data-preview-field-path="shopPage.collectionEyebrow"
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]"
                >
                  {collectionEyebrow}
                </span>
                <h2
                  data-testid="shop-active-collection-title"
                  data-preview-field-path={`collectionsPage.collections[${activeCollection.index}].title`}
                  className="m-0 font-heading text-base font-extrabold text-[var(--heading-color)]"
                >
                  {activeCollection.title}
                </h2>
              </div>
              {activeCollection.description && (
                <p
                  data-testid="shop-active-collection-desc"
                  data-preview-field-path={`collectionsPage.collections[${activeCollection.index}].description`}
                  className="mt-0.5 mb-0 truncate text-xs text-[var(--muted-color)]"
                >
                  {activeCollection.description}
                </p>
              )}
            </div>
            <button
              type="button"
              data-testid="shop-clear-collection"
              onClick={() => selectCollection('')}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-[9px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--heading-color)] transition-colors hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)] sm:self-center"
            >
              <X className="h-3 w-3 stroke-[1.8]" />
              <span data-preview-field-path="shopPage.viewAllProductsLabel">
                {viewAllProductsLabel}
              </span>
            </button>
          </div>
        )}

        {/* Compact Single-Row Filter, Search & Sort Control Bar */}
        <div
          data-testid="shop-toolbar"
          className="flex flex-col gap-3 rounded-xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-3.5 py-2.5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Desktop Filter Drawer Toggle */}
            <button
              type="button"
              data-testid="shop-desktop-filter-toggle"
              onClick={() => setDesktopFiltersOpen((v) => !v)}
              aria-expanded={desktopFiltersOpen}
              className="hidden h-9 items-center gap-2 rounded-[9px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] px-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--heading-color)] transition-colors hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)] lg:inline-flex"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.6]" />
              <span data-preview-field-path="shopPage.filtersLabel">
                {desktopFiltersOpen ? `Hide ${filtersLabel}` : filtersLabel}
              </span>
              {activeFilters.length > 0 && (
                <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brand-accent)] px-1 text-[9px] font-bold text-white dark:text-[#1A1614]">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              data-testid="shop-mobile-filter-toggle"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] px-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--heading-color)] transition-colors hover:border-[var(--brand-accent)] lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.6]" />
              <span data-preview-field-path="shopPage.filtersLabel">{filtersLabel}</span>
              {activeFilters.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brand-accent)] px-1 text-[9px] font-bold text-white dark:text-[#1A1614]">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Live Product Count */}
            <p
              data-preview-static="shop-product-count"
              className="m-0 text-xs text-[var(--muted-color)]"
            >
              Showing{' '}
              <strong className="font-semibold text-[var(--heading-color)]">
                {filteredProducts.length}
              </strong>{' '}
              of {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {/* Right: Inline Catalog Search + Sort Dropdown */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-56 sm:flex-initial">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 stroke-[1.6] text-[var(--muted-color)]"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search shop products"
                data-preview-field-path="shopPage.searchPlaceholder"
                className="h-9 w-full rounded-[9px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] pl-8 pr-7 text-xs text-[var(--heading-color)] placeholder:text-[var(--muted-color)]/75 focus:border-[var(--brand-accent)] focus:bg-[var(--card-bg)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  data-preview-static="shop-search-clear"
                  className="absolute right-2 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0.5 text-[var(--muted-color)] hover:text-[var(--heading-color)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="loome-shop-sort"
                data-preview-field-path="shopPage.sortLabel"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-color)]"
              >
                {sortLabel}
              </label>
              <div className="relative flex-1 sm:flex-initial">
                <select
                  id="loome-shop-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  data-preview-static="shop-sort-select"
                  className="h-9 w-full appearance-none rounded-[9px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] pl-3 pr-8 text-xs font-medium text-[var(--heading-color)] focus:border-[var(--brand-accent)] focus:bg-[var(--card-bg)] focus:outline-none"
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
              className="mt-3 hidden overflow-hidden rounded-xl border border-[var(--loome-border)] bg-[var(--card-bg)] lg:block"
            >
              <div className="p-5">{renderFilterGroups('desktop')}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Chips Bar */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {activeFilters.map((chip) => (
              <button
                key={chip.key}
                type="button"
                data-preview-static={`active-chip-${chip.key}`}
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 rounded-[9px] border border-[var(--brand-accent)]/50 bg-[var(--card-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--heading-color)] transition-colors hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)]"
              >
                <span>{chip.label}</span>
                <X className="h-3 w-3 stroke-[1.8]" />
              </button>
            ))}

            <button
              type="button"
              data-testid="shop-clear-filters"
              onClick={resetAllFilters}
              className="ml-1 inline-flex items-center gap-1 border-0 bg-transparent px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent)] underline underline-offset-4 transition-colors hover:text-[var(--heading-color)]"
            >
              <RotateCcw className="h-3 w-3 stroke-[1.6]" />
              <span data-preview-field-path="shopPage.clearAllFiltersLabel">
                {clearAllFiltersLabel}
              </span>
            </button>
          </div>
        )}

        {/* Responsive 4-Column Product Grid — Visible Immediately Above Fold */}
        <div
          data-preview-list-path="products"
          data-testid="shop-products-grid"
          className="mt-5 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {allProducts.length === 0 ? (
            <p
              data-preview-static="shop-catalog-empty"
              className="col-span-full rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] py-14 text-center text-sm text-[var(--muted-color)]"
            >
              Add textile products in your Fivora catalog to populate the shop.
            </p>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-14 text-center">
              <p
                data-preview-field-path="shopPage.emptyEyebrow"
                className="m-0 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-accent)]"
              >
                {emptyEyebrow}
              </p>
              <h2
                data-preview-field-path="shopPage.emptyHeading"
                className="mt-2 font-heading text-2xl font-bold text-[var(--heading-color)]"
              >
                {emptyHeading}
              </h2>
              <p
                data-preview-field-path="shopPage.emptyDescription"
                className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted-color)]"
              >
                {emptyDescription}
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  data-testid="shop-empty-reset-btn"
                  onClick={resetAllFilters}
                  className="loome-btn-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span data-preview-field-path="shopPage.resetFiltersLabel">
                    {resetFiltersLabel}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="h-full">
                <LoomeProductCard product={product} tone="light" />
              </div>
            ))
          )}
        </div>
      </section>

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
                  <h2
                    data-preview-field-path="shopPage.mobileFiltersHeading"
                    className="m-0 font-heading text-xl font-bold"
                  >
                    {mobileFiltersHeading}
                  </h2>
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
                  <span data-preview-field-path="shopPage.clearAllFiltersLabel">
                    {clearAllFiltersLabel}
                  </span>
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
