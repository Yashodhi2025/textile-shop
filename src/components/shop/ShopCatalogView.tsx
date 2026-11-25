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
  resolveLoomeCurrency,
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
  const shopPage = contentObject(content.shopPage);

  const allProducts = useMemo<LoomeProduct[]>(
    () => rawProducts.map((item, idx) => normalizeLoomeProduct(item, idx)),
    [rawProducts],
  );

  const storeCurrency = resolveLoomeCurrency(siteData, allProducts[0]?.currency);

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
          className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]"
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
                className={`rounded-[10px] border px-3 py-1.5 text-[11px] tracking-wide transition-colors ${
                  active
                    ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                    : 'border-[#201C1A]/15 bg-transparent text-[#5E4E45] hover:border-[#C8A98B] hover:text-[#201C1A] dark:border-[#F2E9DE]/18 dark:text-[#C7B6A6]'
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
          className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]"
        >
          Color Palette
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-preview-static={`${idPrefix}-color-all`}
            onClick={() => setSelectedColor('All')}
            className={`rounded-[10px] border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
              selectedColor === 'All'
                ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                : 'border-[#201C1A]/15 text-[#5E4E45] hover:border-[#C8A98B]'
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
                    ? 'scale-110 border-[#201C1A] ring-2 ring-[#C8A98B] ring-offset-2 ring-offset-[#F2E9DE] dark:ring-offset-[#3B302B]'
                    : 'border-[#201C1A]/25 hover:scale-110'
                }`}
                style={{ backgroundColor: swatch.hex }}
              >
                {active && (
                  <Check className="h-3 w-3 stroke-[2.5] text-[#201C1A] drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]" />
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
            className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]"
          >
            Price Range
          </p>
          <span
            data-preview-static={`${idPrefix}-price-cap`}
            className="text-[11px] font-medium text-[#201C1A] dark:text-[#F2E9DE]"
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
          className="mt-3 h-1 w-full cursor-pointer appearance-none bg-[#201C1A]/20 accent-[#8D7667] dark:bg-[#F2E9DE]/20"
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
                className={`rounded-[10px] border px-2.5 py-1 text-[10px] tracking-wide transition-colors ${
                  active
                    ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                    : 'border-[#201C1A]/15 text-[#5E4E45] hover:border-[#C8A98B]'
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
          className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]"
        >
          Availability
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={inStockOnly}
          data-preview-static={`${idPrefix}-instock-toggle`}
          onClick={() => setInStockOnly((v) => !v)}
          className="mt-3.5 flex w-full items-center justify-between rounded-[11px] border border-[#201C1A]/15 bg-[#F2E9DE] px-4 py-3 text-left text-xs text-[#201C1A] transition-colors hover:border-[#C8A98B] dark:border-[#F2E9DE]/18 dark:bg-[#201C1A] dark:text-[#F2E9DE]"
        >
          <span>In Stock &amp; Ready to Ship</span>
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              inStockOnly ? 'bg-[#8D7667]' : 'bg-[#201C1A]/20 dark:bg-[#F2E9DE]/25'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-[#F2E9DE] transition-transform ${
                inStockOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div data-preview-page-key="shop" className="loome-surface-espresso w-full overflow-x-clip">
      {/* 1. Editorial Shop Heading & Introduction — Deep Espresso */}
      <section
        data-design-section="shop-heading"
        className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 sm:px-8 lg:px-14 lg:pb-10 lg:pt-16"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#C8A98B]" aria-hidden="true" />
              <EditableText
                as="p"
                data-preview-field-path="shopPage.eyebrow"
                defaultValue={contentText(shopPage.eyebrow) || 'THE COMPLETE ARCHIVE'}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.26em"
                color="#C8A98B"
                className="m-0"
              />
            </div>

            <EditableText
              as="h1"
              data-preview-field-path="shopPage.heading"
              defaultValue={contentText(shopPage.heading) || 'Shop Fine Textiles'}
              fontFamily="heading"
              size="clamp(2.55rem, 4.6vw, 4.15rem)"
              weight={800}
              lineHeight={1.03}
              letterSpacing="-0.03em"
              color="#F2E9DE"
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
            color="#C7B6A6"
            className="m-0 max-w-md lg:text-right"
          />
        </LuxuryReveal>
      </section>

      {/* 2. Premium Category Navigation Ribbon — Dark Mocha */}
      <section
        data-design-section="shop-categories-nav"
        className="w-full border-y border-[#C8A98B]/20 bg-[var(--brand-secondary,#3B302B)]"
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
                className={`group relative flex shrink-0 items-baseline gap-2 border-0 bg-transparent px-0 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors ${
                  isActive
                    ? 'text-[#F2E9DE]'
                    : 'text-[#C7B6A6] hover:text-[#F2E9DE]'
                }`}
              >
                <span>{entry.name}</span>
                <span className="text-[10px] font-normal text-[#C8A98B]">({entry.count})</span>
                <span
                  className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C8A98B] transition-transform duration-300 ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Toolbar, Filters, Active Chips & 4-Column Product Grid — Warm Cream Ivory */}
      <div className="loome-surface-cream w-full">
        <section
          data-design-section="shop-catalog"
          className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-14 lg:py-14"
        >
        {/* Filter & Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3B302B]/14 pb-5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            {/* Desktop Filter Drawer Toggle */}
            <button
              type="button"
              data-preview-static="shop-desktop-filter-toggle"
              onClick={() => setDesktopFiltersOpen((v) => !v)}
              aria-expanded={desktopFiltersOpen}
              className="hidden items-center gap-2 rounded-[10px] border border-[#3B302B]/25 bg-[#FAF5EE] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#201C1A] transition-colors hover:border-[#201C1A] hover:bg-[#201C1A] hover:text-[#F2E9DE] lg:inline-flex"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>{desktopFiltersOpen ? 'Hide Filters' : 'Filters'}</span>
              {activeFilters.length > 0 && (
                <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C8A98B] px-1 text-[9px] font-bold text-[#201C1A]">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              data-preview-static="shop-mobile-filter-toggle"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#3B302B]/25 bg-[#FAF5EE] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#201C1A] transition-colors hover:border-[#201C1A] lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C8A98B] px-1 text-[9px] font-bold text-[#201C1A]">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Live Product Count */}
            <p
              data-preview-static="shop-product-count"
              className="m-0 text-xs tracking-wide text-[#5E4E45]"
            >
              Showing <strong className="font-semibold text-[#201C1A]">{filteredProducts.length}</strong> of{' '}
              {allProducts.length} {allProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="loome-shop-sort"
              data-preview-static="shop-sort-label"
              className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#5E4E45]"
            >
              Sort
            </label>
            <div className="relative">
              <select
                id="loome-shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                data-preview-static="shop-sort-select"
                className="appearance-none rounded-[10px] border border-[#3B302B]/22 bg-[#FAF5EE] py-2.5 pl-3.5 pr-9 text-xs font-medium text-[#201C1A] focus:border-[#C8A98B] focus:outline-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="bestsellers">Bestsellers</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 stroke-[1.5] text-[#5E4E45]"
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
              className="hidden overflow-hidden border-b border-[#201C1A]/10 bg-[#FAF5EE] dark:border-[#F2E9DE]/10 dark:bg-[#3B302B] lg:block"
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
                className="inline-flex items-center gap-2 border border-[#C8A98B]/55 bg-[#E6D9C9]/45 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#201C1A] transition-colors hover:border-[#201C1A] hover:bg-[#201C1A] hover:text-[#F2E9DE] dark:bg-[#3B302B] dark:text-[#F2E9DE]"
              >
                <span>{chip.label}</span>
                <X className="h-3 w-3 stroke-[1.8]" />
              </button>
            ))}

            <button
              type="button"
              data-preview-static="shop-clear-filters"
              onClick={resetAllFilters}
              className="ml-1 inline-flex items-center gap-1.5 border-0 bg-transparent px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8D7667] underline underline-offset-4 transition-colors hover:text-[#201C1A] dark:text-[#C8A98B]"
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
              className="col-span-full border border-dashed border-[#201C1A]/20 py-20 text-center text-sm text-[#5E4E45]"
            >
              Add textile products in your Fivora catalog to populate the shop.
            </p>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full border border-[#201C1A]/12 bg-[#FAF5EE] px-6 py-20 text-center dark:border-[#F2E9DE]/12 dark:bg-[#3B302B]">
              <p
                data-preview-static="shop-empty-eyebrow"
                className="m-0 text-[10px] font-medium uppercase tracking-[0.26em] text-[#8D7667] dark:text-[#C8A98B]"
              >
                No Matching Editions
              </p>
              <h2
                data-preview-static="shop-empty-heading"
                className="mt-3 font-serif text-3xl font-light text-[#201C1A] dark:text-[#F2E9DE] sm:text-4xl"
              >
                No textiles match your current selection
              </h2>
              <p
                data-preview-static="shop-empty-copy"
                className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5E4E45] dark:text-[#C7B6A6]"
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
              className="fixed inset-0 bg-[#201C1A]/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.42, ease: LUXURY_EASE }}
              aria-label="Shop filters"
              className="relative z-10 flex h-full w-[88%] max-w-sm flex-col bg-[#F2E9DE] text-[#201C1A] shadow-2xl dark:bg-[#201C1A] dark:text-[#F2E9DE]"
            >
              <div className="flex items-center justify-between border-b border-[#201C1A]/10 px-6 py-5 dark:border-[#F2E9DE]/10">
                <div>
                  <h2 className="m-0 font-serif text-2xl font-normal">Refine Selection</h2>
                  <p className="mt-0.5 m-0 text-[10px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6]">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#201C1A]/15 dark:border-[#F2E9DE]/20"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Category quick select inside mobile drawer */}
                <div className="mb-8">
                  <p className="m-0 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8D7667] dark:text-[#C8A98B]">
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
                              ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                              : 'border-[#201C1A]/15 text-[#5E4E45] dark:border-[#F2E9DE]/18 dark:text-[#C7B6A6]'
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

              <div className="flex gap-3 border-t border-[#201C1A]/10 bg-[#FAF5EE] px-6 py-4 dark:border-[#F2E9DE]/10 dark:bg-[#3B302B]">
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
