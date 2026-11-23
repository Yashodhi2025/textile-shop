'use client';

import { useMemo, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLoomeStore, type LoomeProduct } from '@/lib/storeContext';
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
}: ProductShowcaseSectionProps) {
  const { activeCategory, setActiveCategory } = useLoomeStore();
  const prefersReducedMotion = useReducedMotion();

  const sourcePool = filterPool && filterPool.length > 0 ? filterPool : products;

  const categories = useMemo(() => {
    const unique = new Set<string>();
    sourcePool.forEach((p) => {
      if (p.category) unique.add(p.category);
    });
    return ['All', ...Array.from(unique)];
  }, [sourcePool]);

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
                      onClick={() => setActiveCategory(cat)}
                      className={`border px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                        isActive
                          ? 'border-[#262923] bg-[#262923] text-[#F8F6F1] dark:border-[#B59B79] dark:bg-[#B59B79] dark:text-[#262923]'
                          : 'border-[#262923]/15 bg-transparent text-[#65685E] hover:border-[#B59B79] hover:text-[#262923] dark:border-[#F8F6F1]/18 dark:text-[#B6B8AE]'
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
          className="mt-8 h-px w-full bg-[#262923]/10 dark:bg-[#F8F6F1]/10"
        />

        {/* Product Grid */}
        <div
          data-preview-list-path="products"
          className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-7"
        >
          {displayedProducts.length === 0 ? (
            <div
              data-preview-static="products-empty"
              className="col-span-full border border-dashed border-[#262923]/20 py-16 text-center text-sm text-[#65685E]"
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
                  <LoomeProductCard product={product} />
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
              onClick={() => setActiveCategory('All')}
              className="group inline-flex items-center gap-2 border-b border-[#262923]/40 pb-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[#262923] transition-colors hover:border-[#B59B79] hover:text-[#747B65] dark:border-[#F8F6F1]/40 dark:text-[#F8F6F1]"
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
