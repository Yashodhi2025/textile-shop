'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { LoomeProduct } from '@/lib/storeContext';
import LoomeProductCard from '@/components/LoomeProductCard';
import { LUXURY_EASE, LuxuryHairline, LuxuryReveal } from '@/components/motion/LuxuryReveal';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const prefersReducedMotion = useReducedMotion();
  const isDark = tone === 'dark';

  const sourcePool = filterPool && filterPool.length > 0 ? filterPool : products;

  const categories = useMemo(() => {
    const unique = new Set<string>();
    sourcePool.forEach((p) => {
      if (p.category) unique.add(p.category);
    });
    return ['All', ...Array.from(unique)];
  }, [sourcePool]);

  const activeCategory = useMemo(() => {
    if (selectedCategory === 'All') return 'All';
    const matched = categories.find(
      (cat) => cat.toLowerCase() === selectedCategory.toLowerCase(),
    );
    return matched ?? 'All';
  }, [categories, selectedCategory]);

  const displayedProducts = useMemo(() => {
    if (!showCategoryFilter || activeCategory === 'All') return products;
    return sourcePool.filter(
      (p) => p.category.toLowerCase() === activeCategory.toLowerCase(),
    );
  }, [products, sourcePool, showCategoryFilter, activeCategory]);

  return (
    <section
      id={id}
      data-design-section={designSection}
      className={`w-full py-16 sm:py-20 lg:py-24 ${surfaceClassName}`}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
        <LuxuryReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">{headerLeft}</div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            {headerSummary}
            {showCategoryFilter && categories.length > 2 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {categories.map((cat) => {
                  const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      data-preview-static={`category-tab-${cat}`}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-[10px] border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
                        isActive
                          ? isDark
                            ? 'border-[#C8A98B] bg-[#C8A98B] text-[#201C1A]'
                            : 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                          : isDark
                            ? 'border-[#C8A98B]/25 bg-transparent text-[#C7B6A6] hover:border-[#C8A98B] hover:text-[#F2E9DE]'
                            : 'border-[#3B302B]/20 bg-[#FAF5EE] text-[#5E4E45] hover:border-[#8D7667] hover:text-[#201C1A] dark:border-[#C8A98B]/25 dark:bg-[#2A221F] dark:text-[#C9B9AA] dark:hover:border-[#C8A98B] dark:hover:text-[#F5EEE6]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </LuxuryReveal>

        <LuxuryHairline
          delay={0.14}
          className={`mt-8 h-px w-full ${
            isDark ? 'bg-[#C8A98B]/20' : 'bg-[#3B302B]/14'
          }`}
        />

        {/* Product Grid */}
        <div
          data-preview-list-path="products"
          className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6"
        >
          {displayedProducts.length === 0 ? (
            <div
              data-preview-static="products-empty"
              className={`col-span-full rounded-2xl border border-dashed py-16 text-center text-sm ${
                isDark
                  ? 'border-[#C8A98B]/25 text-[#C7B6A6]'
                  : 'border-[#3B302B]/20 text-[#5E4E45]'
              }`}
            >
              Add products in your Fivora catalog to showcase them here.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.75,
                          delay: Math.min(idx * 0.085, 0.34),
                          ease: LUXURY_EASE,
                        }
                  }
                >
                  <LoomeProductCard product={product} tone={tone} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Reset Filter Helper if filtered */}
        {showCategoryFilter && activeCategory !== 'All' && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              data-preview-static="reset-category-filter"
              onClick={() => setSelectedCategory('All')}
              className={`group inline-flex items-center gap-2 rounded-[10px] border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all ${
                isDark
                  ? 'border-[#C8A98B]/40 text-[#F2E9DE] hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A]'
                  : 'border-[#201C1A]/25 text-[#201C1A] hover:border-[#201C1A] hover:bg-[#201C1A] hover:text-[#F2E9DE]'
              }`}
            >
              View All Arrivals
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
