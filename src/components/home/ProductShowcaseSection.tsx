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
      className={`w-full py-12 sm:py-14 lg:py-16 ${surfaceClassName}`}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        <LuxuryReveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">{headerLeft}</div>

          <div className="flex flex-col items-start gap-3.5 lg:items-end">
            {headerSummary}
            {showCategoryFilter && categories.length > 2 && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {categories.map((cat) => {
                  const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      data-preview-static={`category-tab-${cat}`}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-[10px] border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                        isActive
                          ? isDark
                            ? 'border-[#C8A98B] bg-[#C8A98B] text-[#2D2722]'
                            : 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                          : isDark
                            ? 'border-[#C8A98B]/25 bg-transparent text-[#C7B6A6] hover:border-[#C8A98B] hover:text-[#F7F4EF]'
                            : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--muted-color)] hover:border-[var(--brand-accent)] hover:text-[var(--heading-color)]'
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
          className={`mt-6 h-px w-full ${
            isDark ? 'bg-[#C8A98B]/20' : 'bg-[var(--loome-border)]'
          }`}
        />

        {/* Product Grid */}
        <div
          data-preview-list-path="products"
          className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
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
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              data-preview-static="reset-category-filter"
              onClick={() => setSelectedCategory('All')}
              className={`group inline-flex items-center gap-2 rounded-[11px] border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all ${
                isDark
                  ? 'border-[#C8A98B]/40 text-[#F7F4EF] hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#2D2722]'
                  : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--heading-color)] hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)]'
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
