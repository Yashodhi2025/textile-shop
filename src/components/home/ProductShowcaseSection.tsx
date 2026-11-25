'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import type { LoomeProduct } from '@/lib/storeContext';
import LoomeProductCard from '@/components/LoomeProductCard';
import { LuxuryHairline, LuxuryReveal } from '@/components/motion/LuxuryReveal';

interface ProductShowcaseSectionProps {
  id: string;
  designSection: string;
  headerLeft: ReactNode;
  headerSummary: ReactNode;
  products: LoomeProduct[];
  filterPool?: LoomeProduct[];
  showCategoryFilter?: boolean;
  surfaceClassName?: string;
  tone?: 'dark' | 'light';
}

interface CategoryFilterTab {
  key: string;
  label: string;
  fieldPath?: string;
  matchValues: string[];
}

export default function ProductShowcaseSection({
  id,
  designSection,
  headerLeft,
  headerSummary,
  products,
  filterPool,
  showCategoryFilter = false,
  surfaceClassName = '',
  tone = 'light',
}: ProductShowcaseSectionProps) {
  const siteData = useSiteData();
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('All');
  const isDark = tone === 'dark';

  const home = contentObject(contentObject(siteData.content).home);
  const allFilterLabel = contentText(home.productsAllFilterLabel) || 'All';
  const resetFilterLabel = contentText(home.productsResetFilterLabel) || 'View All Arrivals';

  const homeCategories = useMemo(
    () =>
      contentList(home.categories).map((raw, index) => {
        const obj = contentObject(raw);
        return {
          index,
          id: contentText(obj.id),
          name: contentText(obj.name),
        };
      }),
    [home.categories],
  );

  const sourcePool = filterPool && filterPool.length > 0 ? filterPool : products;

  const categoryTabs = useMemo<CategoryFilterTab[]>(() => {
    const tabs: CategoryFilterTab[] = [
      {
        key: 'All',
        label: allFilterLabel,
        fieldPath: 'home.productsAllFilterLabel',
        matchValues: ['all'],
      },
    ];

    const seenKeys = new Set<string>();
    sourcePool.forEach((product) => {
      const rawCat = product.category?.trim();
      if (!rawCat) return;
      const lower = rawCat.toLowerCase();

      const matchedHomeCat = homeCategories.find(
        (cat) =>
          (cat.id && cat.id.toLowerCase() === lower) ||
          (cat.name && cat.name.toLowerCase() === lower),
      );

      const canonicalKey = matchedHomeCat
        ? `cat-${matchedHomeCat.id || matchedHomeCat.index}`
        : `raw-${lower}`;
      if (seenKeys.has(canonicalKey)) return;
      seenKeys.add(canonicalKey);

      if (matchedHomeCat) {
        const matchValues = Array.from(
          new Set(
            [lower, matchedHomeCat.id.toLowerCase(), matchedHomeCat.name.toLowerCase()].filter(
              Boolean,
            ),
          ),
        );
        tabs.push({
          key: canonicalKey,
          label: matchedHomeCat.name || rawCat,
          fieldPath: `home.categories[${matchedHomeCat.index}].name`,
          matchValues,
        });
      } else {
        tabs.push({
          key: canonicalKey,
          label: rawCat,
          fieldPath: `products[${product.index}].category`,
          matchValues: [lower],
        });
      }
    });

    return tabs;
  }, [sourcePool, homeCategories, allFilterLabel]);

  const activeTab = useMemo(() => {
    if (selectedCategoryKey === 'All') return categoryTabs[0];
    return (
      categoryTabs.find((tab) => tab.key === selectedCategoryKey) ?? categoryTabs[0]
    );
  }, [categoryTabs, selectedCategoryKey]);

  const displayedProducts = useMemo(() => {
    if (!showCategoryFilter || !activeTab || activeTab.key === 'All') return products;
    return sourcePool.filter((p) =>
      activeTab.matchValues.includes((p.category || '').trim().toLowerCase()),
    );
  }, [products, sourcePool, showCategoryFilter, activeTab]);

  return (
    <section
      id={id}
      data-design-section={designSection}
      className={`w-full py-12 sm:py-14 lg:py-16 ${surfaceClassName}`}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        <LuxuryReveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">{headerLeft}</div>

          <div className="flex flex-col items-start gap-3.5 lg:items-end">
            {headerSummary}
            {showCategoryFilter && categoryTabs.length > 2 && (
              <div
                data-testid="new-arrivals-category-filters"
                className="flex flex-wrap items-center gap-2 pt-0.5"
              >
                {categoryTabs.map((tab) => {
                  const isActive = activeTab?.key === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      data-testid={`category-tab-${tab.key.toLowerCase()}`}
                      onClick={() => setSelectedCategoryKey(tab.key)}
                      className={`rounded-[10px] border px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                        isActive
                          ? isDark
                            ? 'border-[#C8A98B] bg-[#C8A98B] text-[#2D2722]'
                            : 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                          : isDark
                            ? 'border-[#C8A98B]/25 bg-transparent text-[#C7B6A6] hover:border-[#C8A98B] hover:text-[#F7F4EF]'
                            : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--muted-color)] hover:border-[var(--brand-accent)] hover:text-[var(--heading-color)]'
                      }`}
                    >
                      <span data-preview-field-path={tab.fieldPath}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </LuxuryReveal>

        <LuxuryHairline
          delay={0.14}
          className={`mt-6 h-px w-full ${
            isDark ? 'bg-[#C8A98B]/20' : 'bg-[var(--loome-border)]'
          }`}
        />

        {/* Product Grid */}
        <div
          data-preview-list-path="products"
          className="mt-8 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4"
        >
          {displayedProducts.length === 0 ? (
            <div
              data-preview-static="products-empty"
              className={`col-span-full rounded-2xl border border-dashed py-14 text-center text-sm ${
                isDark
                  ? 'border-[#C8A98B]/25 text-[#C7B6A6]'
                  : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--muted-color)]'
              }`}
            >
              Add products in your Fivora catalog to showcase them here.
            </div>
          ) : (
            displayedProducts.map((product) => (
              <div key={product.id} className="min-w-0">
                <LoomeProductCard product={product} tone={tone} />
              </div>
            ))
          )}
        </div>

        {/* Reset Filter Helper if filtered */}
        {showCategoryFilter && activeTab && activeTab.key !== 'All' && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              data-testid="reset-category-filter"
              onClick={() => setSelectedCategoryKey('All')}
              className={`group inline-flex items-center gap-2 rounded-[11px] border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all ${
                isDark
                  ? 'border-[#C8A98B]/40 text-[#F7F4EF] hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#2D2722]'
                  : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--heading-color)] hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)]'
              }`}
            >
              <span data-preview-field-path="home.productsResetFilterLabel">
                {resetFilterLabel}
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
