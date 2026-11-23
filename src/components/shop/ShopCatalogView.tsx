'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  RotateCcw,
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
  formatLoomePrice,
  normalizeLoomeProduct,
  useLoomeStore,
  type LoomeColorSwatch,
  type LoomeProduct,
} from '@/lib/storeContext';
import LoomeProductCard from '@/components/LoomeProductCard';
import { LUXURY_EASE, LuxuryReveal } from '@/components/motion/LuxuryReveal';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'bestsellers';
type PriceBand = 'all' | 'under-150' | '150-275' | 'over-275';

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
  const common = contentObject(content.common);
  const shopMeta = contentObject((siteData as Record<string, unknown>).shop);
  const shopPage = contentObject(content.shopPage);

  const allProducts = useMemo<LoomeProduct[]>(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  const storeCurrency =
    contentText(common.currency) ||
    contentText(shopMeta.currency) ||
    allProducts[0]?.currency ||
    'USD';

  const catalogMaxPrice = useMemo(() => {
    const prices = allProducts.map((p) => p.price).filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length === 0) return 500;
    return Math.ceil(Math.max(...prices) / 25) * 25;
  }, [allProducts]);

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
    const list = allProducts.filter((product) => {
      if (
        activeCategory !== 'All' &&
        product.category.toLowerCase() !== activeCategory.toLowerCase()
      ) {
        return false;
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

      if (priceBand === 'under-150' && product.price >= 150) return false;
      if (priceBand === '150-275' && (product.price < 150 || product.price > 275)) return false;
      if (priceBand === 'over-275' && product.price <= 275) return false;

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
    activeCategory,
    selectedMaterial,
    selectedColor,
    priceBand,
    maxPriceCap,
    inStockOnly,
    sortBy,
  ]);

  const activeFilters = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (activeCategory !== 'All') {
      chips.push({
        key: 'category',
        label: `Category: ${activeCategory}`,
        onRemove: () => setActiveCategory('All'),
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
        'under-150': `Under ${formatLoomePrice(150, storeCurrency)}`,
        '150-275': `${formatLoomePrice(150, storeCurrency)} – ${formatLoomePrice(275, storeCurrency)}`,
        'over-275': `${formatLoomePrice(275, storeCurrency)}+`,
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
    activeCategory,
    selectedMaterial,
    selectedColor,
    priceBand,
    maxPriceCap,
    catalogMaxPrice,
    inStockOnly,
    storeCurrency,
    setActiveCategory,
  ]);

  const resetAllFilters = () => {
    setActiveCategory('All');
    setSelectedMaterial('All');
    setSelectedColor('All');
    setPriceBand('all');
    setMaxPriceCap(null);
    setInStockOnly(false);
    setSortBy('newest');
  };

  const renderFilterGroups = (idPrefix: string) => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Material Filter */}
      <div>
        <p
          data-preview-static={`${idPrefix}-material-heading`}
          className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]"
        >
          Material &amp; Fiber
        </p>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {materials.map((mat) => {
            const active = selectedMaterial === mat;
            return (
              <button
                key={mat}
                type="button"
                data-preview-static={`${idPrefix}-mat-${mat}`}
                onClick={() => setSelectedMaterial(mat)}
                className={`border px-3 py-1.5 text-[11px] tracking-wide transition-colors ${
                  active
                    ? 'border-[#262923] bg-[#262923] text-[#F8F6F1] dark:border-[#B59B79] dark:bg-[#B59B79] dark:text-[#262923]'
                    : 'border-[#262923]/15 bg-transparent text-[#595C52] hover:border-[#B59B79] hover:text-[#262923] dark:border-[#F8F6F1]/18 dark:text-[#B6B8AE]'
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
          className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]"
        >
          Color Palette
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-preview-static={`${idPrefix}-color-all`}
            onClick={() => setSelectedColor('All')}
            className={`border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
              selectedColor === 'All'
                ? 'border-[#262923] bg-[#262923] text-[#F8F6F1] dark:border-[#B59B79] dark:bg-[#B59B79] dark:text-[#262923]'
                : 'border-[#262923]/15 text-[#595C52] hover:border-[#B59B79]'
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
                className={`relative flex h-6 w-6 items-center justify-center rounded-full border transition-transform ${
                  active
                    ? 'scale-110 border-[#262923] ring-2 ring-[#B59B79] ring-offset-2 ring-offset-[#F8F6F1] dark:ring-offset-[#20231D]'
                    : 'border-[#262923]/25 hover:scale-110'
                }`}
                style={{ backgroundColor: swatch.hex }}
              >
                {active && (
                  <Check className="h-3 w-3 stroke-[2.5] text-[#262923] drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]" />
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
            className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]"
          >
            Price Range
          </p>
          <span
            data-preview-static={`${idPrefix}-price-cap`}
            className="text-[11px] font-medium text-[#262923] dark:text-[#F8F6F1]"
          >
            Up to {formatLoomePrice(effectiveMaxPrice, storeCurrency)}
          </span>
        </div>

        <input
          type="range"
          min={50}
          max={Math.max(catalogMaxPrice, 100)}
          step={15}
          value={effectiveMaxPrice}
          onChange={(e) => setMaxPriceCap(Number(e.target.value))}
          aria-label="Maximum price"
          data-preview-static={`${idPrefix}-price-slider`}
          className="mt-3 h-1 w-full cursor-pointer appearance-none bg-[#262923]/20 accent-[#747B65] dark:bg-[#F8F6F1]/20"
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'under-150', label: `Under ${formatLoomePrice(150, storeCurrency)}` },
              {
                id: '150-275',
                label: `${formatLoomePrice(150, storeCurrency)}–${formatLoomePrice(275, storeCurrency)}`,
              },
              { id: 'over-275', label: `${formatLoomePrice(275, storeCurrency)}+` },
            ] as const
          ).map((band) => {
            const active = priceBand === band.id;
            return (
              <button
                key={band.id}
                type="button"
                data-preview-static={`${idPrefix}-band-${band.id}`}
                onClick={() => setPriceBand(band.id)}
                className={`border px-2.5 py-1 text-[10px] tracking-wide transition-colors ${
                  active
                    ? 'border-[#262923] bg-[#262923] text-[#F8F6F1] dark:border-[#B59B79] dark:bg-[#B59B79] dark:text-[#262923]'
                    : 'border-[#262923]/15 text-[#595C52] hover:border-[#B59B79]'
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
          className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]"
        >
          Availability
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={inStockOnly}
          data-preview-static={`${idPrefix}-instock-toggle`}
          onClick={() => setInStockOnly((v) => !v)}
          className="mt-3.5 flex w-full items-center justify-between border border-[#262923]/15 bg-[#F8F6F1] px-4 py-3 text-left text-xs text-[#262923] transition-colors hover:border-[#B59B79] dark:border-[#F8F6F1]/18 dark:bg-[#171915] dark:text-[#F8F6F1]"
        >
          <span>In Stock &amp; Ready to Ship</span>
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              inStockOnly ? 'bg-[#747B65]' : 'bg-[#262923]/20 dark:bg-[#F8F6F1]/25'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-[#F8F6F1] transition-transform ${
                inStockOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div data-preview-page-key="shop" className="w-full overflow-x-clip">
      {/* 1. Editorial Shop Heading & Introduction */}
      <section
        data-design-section="shop-heading"
        className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 sm:px-8 lg:px-14 lg:pb-10 lg:pt-16"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B59B79]" aria-hidden="true" />
              <EditableText
                as="p"
                data-preview-field-path="shopPage.eyebrow"
                defaultValue={contentText(shopPage.eyebrow) || 'THE COMPLETE ARCHIVE'}
                fontFamily="body"
                size="0.6875rem"
                weight={500}
                transform="uppercase"
                letterSpacing="0.26em"
                color="primary"
                className="m-0"
              />
            </div>

            <EditableText
              as="h1"
              data-preview-field-path="shopPage.heading"
              defaultValue={contentText(shopPage.heading) || 'Shop Fine Textiles'}
              fontFamily="heading"
              size="clamp(2.75rem, 4.8vw, 4.35rem)"
              weight={300}
              lineHeight={1.03}
              letterSpacing="-0.02em"
              color="heading"
              className="mt-4 mb-0"
            />
          </div>

          <EditableText
            as="p"
            data-preview-field-path="shopPage.intro"
            defaultValue={contentText(shopPage.intro)}
            fontFamily="body"
            size="0.96875rem"
            lineHeight={1.8}
            color="muted"
            className="m-0 max-w-md lg:text-right"
          />
        </LuxuryReveal>
      </section>

      {/* 2. Premium Category Navigation Ribbon */}
      <section
        data-design-section="shop-categories-nav"
        className="w-full border-y border-[#262923]/10 bg-[#FCFBF8] dark:border-[#F8F6F1]/10 dark:bg-[#20231D]"
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-4 py-4 sm:px-8 lg:gap-10 lg:px-14">
          {categoryEntries.map((entry) => {
            const isActive = activeCategory.toLowerCase() === entry.name.toLowerCase();
            return (
              <button
                key={entry.name}
                type="button"
                data-preview-static={`shop-cat-nav-${entry.name}`}
                onClick={() => setActiveCategory(entry.name)}
                className={`group relative flex shrink-0 items-baseline gap-2 border-0 bg-transparent px-0 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors ${
                  isActive
                    ? 'text-[#262923] dark:text-[#F8F6F1]'
                    : 'text-[#595C52] hover:text-[#262923] dark:text-[#B6B8AE] dark:hover:text-[#F8F6F1]'
                }`}
              >
                <span>{entry.name}</span>
                <span className="text-[10px] font-normal text-[#B59B79]">({entry.count})</span>
                <span
                  className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-[#B59B79] transition-transform duration-300 ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Toolbar, Filters, Active Chips & 4-Column Product Grid */}
      <section
        data-design-section="shop-catalog"
        className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-14 lg:py-14"
      >
        {/* Filter & Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262923]/10 pb-5 dark:border-[#F8F6F1]/10">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            {/* Desktop Filter Drawer Toggle */}
            <button
              type="button"
              data-preview-static="shop-desktop-filter-toggle"
              onClick={() => setDesktopFiltersOpen((v) => !v)}
              aria-expanded={desktopFiltersOpen}
              className="hidden items-center gap-2 border border-[#262923]/20 bg-transparent px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#262923] transition-colors hover:border-[#262923] hover:bg-[#262923] hover:text-[#F8F6F1] dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1] lg:inline-flex"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>{desktopFiltersOpen ? 'Hide Filters' : 'Filters'}</span>
              {activeFilters.length > 0 && (
                <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B59B79] px-1 text-[9px] text-[#F8F6F1]">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              data-preview-static="shop-mobile-filter-toggle"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex items-center gap-2 border border-[#262923]/20 bg-transparent px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#262923] transition-colors hover:border-[#262923] dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1] lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B59B79] px-1 text-[9px] text-[#F8F6F1]">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Live Product Count */}
            <p
              data-preview-static="shop-product-count"
              className="m-0 text-xs tracking-wide text-[#595C52] dark:text-[#B6B8AE]"
            >
              Showing <strong className="font-medium text-[#262923] dark:text-[#F8F6F1]">{filteredProducts.length}</strong> of{' '}
              {allProducts.length} {allProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="loome-shop-sort"
              data-preview-static="shop-sort-label"
              className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#595C52] dark:text-[#B6B8AE]"
            >
              Sort
            </label>
            <div className="relative">
              <select
                id="loome-shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                data-preview-static="shop-sort-select"
                className="appearance-none border border-[#262923]/20 bg-[#FCFBF8] py-2.5 pl-3.5 pr-9 text-xs text-[#262923] focus:border-[#B59B79] focus:outline-none dark:border-[#F8F6F1]/20 dark:bg-[#20231D] dark:text-[#F8F6F1]"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="bestsellers">Bestsellers</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 stroke-[1.5] text-[#595C52]"
                aria-hidden="true"
              />
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
              className="hidden overflow-hidden border-b border-[#262923]/10 bg-[#FCFBF8] dark:border-[#F8F6F1]/10 dark:bg-[#20231D] lg:block"
            >
              <div className="p-7">{renderFilterGroups('desktop')}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Chips Bar */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-5">
            {activeFilters.map((chip) => (
              <button
                key={chip.key}
                type="button"
                data-preview-static={`active-chip-${chip.key}`}
                onClick={chip.onRemove}
                className="inline-flex items-center gap-2 border border-[#B59B79]/55 bg-[#E8E0D5]/45 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#262923] transition-colors hover:border-[#262923] hover:bg-[#262923] hover:text-[#F8F6F1] dark:bg-[#20231D] dark:text-[#F8F6F1]"
              >
                <span>{chip.label}</span>
                <X className="h-3 w-3 stroke-[1.8]" />
              </button>
            ))}

            <button
              type="button"
              data-preview-static="shop-clear-filters"
              onClick={resetAllFilters}
              className="ml-1 inline-flex items-center gap-1.5 border-0 bg-transparent px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#747B65] underline underline-offset-4 transition-colors hover:text-[#262923] dark:text-[#B59B79]"
            >
              <RotateCcw className="h-3 w-3 stroke-[1.6]" />
              Clear All
            </button>
          </div>
        )}

        {/* Responsive 4-Column Product Grid */}
        <div
          data-preview-list-path="products"
          className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-7"
        >
          {allProducts.length === 0 ? (
            <p
              data-preview-static="shop-catalog-empty"
              className="col-span-full border border-dashed border-[#262923]/20 py-20 text-center text-sm text-[#595C52]"
            >
              Add textile products in your Fivora catalog to populate the shop.
            </p>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full border border-[#262923]/12 bg-[#FCFBF8] px-6 py-20 text-center dark:border-[#F8F6F1]/12 dark:bg-[#20231D]">
              <p
                data-preview-static="shop-empty-eyebrow"
                className="m-0 text-[10px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
              >
                No Matching Editions
              </p>
              <h2
                data-preview-static="shop-empty-heading"
                className="mt-3 font-serif text-3xl font-light text-[#262923] dark:text-[#F8F6F1] sm:text-4xl"
              >
                No textiles match your current selection
              </h2>
              <p
                data-preview-static="shop-empty-copy"
                className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#595C52] dark:text-[#B6B8AE]"
              >
                Try widening your price range, switching fiber or tone filters, or returning to the full LOOMÉ collection.
              </p>
              <div className="mt-7 flex justify-center">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{
                    duration: 0.52,
                    delay: Math.min(idx * 0.05, 0.25),
                    ease: LUXURY_EASE,
                  }}
                >
                  <LoomeProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
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
              className="fixed inset-0 bg-[#262923]/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.42, ease: LUXURY_EASE }}
              aria-label="Shop filters"
              className="relative z-10 flex h-full w-[88%] max-w-sm flex-col bg-[#F8F6F1] text-[#262923] shadow-2xl dark:bg-[#171915] dark:text-[#F8F6F1]"
            >
              <div className="flex items-center justify-between border-b border-[#262923]/10 px-6 py-5 dark:border-[#F8F6F1]/10">
                <div>
                  <h2 className="m-0 font-serif text-2xl font-normal">Refine Selection</h2>
                  <p className="mt-0.5 m-0 text-[10px] uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE]">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#262923]/15 dark:border-[#F8F6F1]/20"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Category quick select inside mobile drawer */}
                <div className="mb-8">
                  <p className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]">
                    Category
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categoryEntries.map((entry) => {
                      const active = activeCategory.toLowerCase() === entry.name.toLowerCase();
                      return (
                        <button
                          key={entry.name}
                          type="button"
                          onClick={() => setActiveCategory(entry.name)}
                          className={`border px-3 py-1.5 text-[11px] tracking-wide transition-colors ${
                            active
                              ? 'border-[#262923] bg-[#262923] text-[#F8F6F1] dark:border-[#B59B79] dark:bg-[#B59B79] dark:text-[#262923]'
                              : 'border-[#262923]/15 text-[#595C52] dark:border-[#F8F6F1]/18 dark:text-[#B6B8AE]'
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

              <div className="flex gap-3 border-t border-[#262923]/10 bg-[#FCFBF8] px-6 py-4 dark:border-[#F8F6F1]/10 dark:bg-[#20231D]">
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
