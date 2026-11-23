'use client';

import { ArrowUpRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useLoomeStore } from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';
import {
  LuxuryImageReveal,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

export default function CategorySection() {
  const siteData = useSiteData();
  const { setActiveCategory } = useLoomeStore();
  const home = contentObject(contentObject(siteData.content).home);
  const rawCategories = contentList(home.categories);

  const categories = rawCategories.map((raw, idx) => {
    const obj = contentObject(raw);
    return {
      index: idx,
      id: contentText(obj.id) || `category-${idx}`,
      name: contentText(obj.name) || 'Category',
      subtitle: contentText(obj.subtitle),
      itemCount: contentText(obj.itemCount),
      imageUrl: contentText(obj.imageUrl) || '/images/cat-curtains.jpg',
    };
  });

  const handleSelectCategory = (name: string) => {
    setActiveCategory(name);
    const target = document.getElementById('new-arrivals');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="categories"
      data-design-section="home-categories"
      className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 sm:py-20 lg:px-14 lg:py-24"
    >
      {/* Editorial Section Header */}
      <LuxuryReveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <EditableText
            as="p"
            data-preview-field-path="home.categoriesEyebrow"
            defaultValue={contentText(home.categoriesEyebrow) || 'CURATED EDITIONS'}
            fontFamily="body"
            size="0.6875rem"
            weight={500}
            transform="uppercase"
            letterSpacing="0.26em"
            color="primary"
            className="m-0"
          />
          <EditableText
            as="h2"
            data-preview-field-path="home.categoriesHeading"
            defaultValue={contentText(home.categoriesHeading) || 'Shop by Category'}
            fontFamily="heading"
            size="clamp(2.35rem, 4.2vw, 3.5rem)"
            weight={300}
            lineHeight={1.06}
            letterSpacing="-0.02em"
            color="heading"
            className="mt-3 mb-0"
          />
        </div>
        <EditableText
          as="p"
          data-preview-field-path="home.categoriesSummary"
          defaultValue={contentText(home.categoriesSummary)}
          fontFamily="body"
          size="0.9375rem"
          lineHeight={1.75}
          color="muted"
          className="m-0 max-w-md"
        />
      </LuxuryReveal>

      {/* Asymmetric Editorial Grid: 2 tall monumental cards on top, 3 architectural cards below */}
      <div data-preview-list-path="home.categories" className="mt-14">
        {categories.length === 0 ? (
          <div
            data-preview-static="categories-empty"
            className="border border-dashed border-[#262923]/20 py-16 text-center text-sm text-[#65685E]"
          >
            Add categories in your Fivora editor to populate this showcase.
          </div>
        ) : (
          <LuxuryStagger
            staggerDelay={0.11}
            delayChildren={0.04}
            className="grid grid-cols-1 gap-6 md:grid-cols-6 lg:gap-7"
          >
            {categories.map((cat, idx) => {
              const isHeroFeature = idx < 2;
              const spanClass = isHeroFeature
                ? 'md:col-span-3 aspect-[4/5] sm:aspect-[5/6] lg:aspect-[16/15]'
                : 'md:col-span-2 aspect-[4/3] sm:aspect-[5/4]';

              return (
                <LuxuryStaggerItem key={cat.id} className={spanClass} y={24}>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory(cat.name)}
                    data-preview-item-path={`home.categories[${cat.index}]`}
                    className="group relative flex h-full w-full overflow-hidden border-0 bg-[#E8E0D5]/60 p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B59B79]"
                  >
                    <LuxuryImageReveal
                      delay={Math.min(idx * 0.08, 0.28)}
                      tone="beige"
                      className="h-full w-full"
                    >
                      <img
                        src={withBasePath(cat.imageUrl)}
                        alt={cat.name}
                        loading="lazy"
                        data-preview-field-path={`home.categories[${cat.index}].imageUrl`}
                        className="h-full w-full object-cover transition-transform duration-[950ms] ease-luxury group-hover:scale-[1.055]"
                      />
                    </LuxuryImageReveal>

                    {/* Subtle warm editorial bottom scrim */}
                    <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#262923]/72 via-[#262923]/16 to-transparent transition-opacity duration-700 group-hover:from-[#262923]/82" />

                    {/* Top Count Pill */}
                    <span
                      data-preview-field-path={`home.categories[${cat.index}].itemCount`}
                      className="absolute left-5 top-5 z-20 border border-[#F8F6F1]/30 bg-[#262923]/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#F8F6F1] backdrop-blur-md transition-colors duration-500 group-hover:border-[#B59B79]/70"
                    >
                      {cat.itemCount}
                    </span>

                    {/* Bottom Animated Label & Sliding Arrow */}
                    <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-6 sm:p-8">
                      <div className="max-w-sm">
                        <h3
                          data-preview-field-path={`home.categories[${cat.index}].name`}
                          className="m-0 font-serif text-3xl font-light tracking-wide text-[#F8F6F1] transition-transform duration-500 ease-luxury group-hover:-translate-y-1 sm:text-4xl"
                        >
                          {cat.name}
                        </h3>
                        <p
                          data-preview-field-path={`home.categories[${cat.index}].subtitle`}
                          className="mt-1.5 m-0 text-xs leading-relaxed text-[#E8E0D5]/88 transition-all duration-500 group-hover:text-[#F8F6F1]"
                        >
                          {cat.subtitle}
                        </p>
                      </div>

                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#F8F6F1]/40 bg-[#F8F6F1]/10 text-[#F8F6F1] backdrop-blur-sm transition-all duration-500 ease-luxury group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-[#B59B79] group-hover:bg-[#B59B79]"
                      >
                        <ArrowUpRight className="h-4 w-4 stroke-[1.5]" />
                      </span>
                    </div>
                  </button>
                </LuxuryStaggerItem>
              );
            })}
          </LuxuryStagger>
        )}
      </div>
    </section>
  );
}
