'use client';

import { ArrowUpRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { buildShopCategoryHref, slugifyCategoryId } from '@/lib/categoryUtils';
import { withBasePath } from '@/lib/utils';
import {
  LuxuryImageReveal,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

export default function CategorySection() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData.content).home);
  const rawCategories = contentList(home.categories);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'services',
        'journal',
        'about_us',
        'contact',
      ];
  const hasShopPage = requiredPages.includes('shop');

  const categories = rawCategories.map((raw, idx) => {
    const obj = contentObject(raw);
    const name = contentText(obj.name) || 'Category';
    const id = contentText(obj.id) || slugifyCategoryId(name) || `category-${idx}`;
    const rawHref = contentText(obj.href);
    return {
      index: idx,
      id,
      name,
      subtitle: contentText(obj.subtitle),
      itemCount: contentText(obj.itemCount),
      imageUrl: contentText(obj.imageUrl) || '/images/cat-curtains.jpg',
      href: rawHref,
    };
  });

  const resolveCategoryHref = (cat: (typeof categories)[number]) => {
    const customHref = cat.href.trim();
    const isShopDestination =
      !customHref || /^\/?shop(?:\/|\?|$)/i.test(customHref);

    if (!hasShopPage && isShopDestination) {
      return '#new-arrivals';
    }

    return buildShopCategoryHref(cat.id, customHref);
  };

  return (
    <section
      id="categories"
      data-design-section="home-categories"
      className="loome-surface-espresso w-full py-18 sm:py-22 lg:py-26"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
        {/* Editorial Section Header */}
        <LuxuryReveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <EditableText
              as="p"
              data-preview-field-path="home.categoriesEyebrow"
              defaultValue={contentText(home.categoriesEyebrow) || 'CURATED EDITIONS'}
              fontFamily="body"
              size="0.6875rem"
              weight={600}
              transform="uppercase"
              letterSpacing="0.26em"
              color="#C8A98B"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.categoriesHeading"
              defaultValue={contentText(home.categoriesHeading) || 'Shop by Category'}
              fontFamily="heading"
              size="clamp(2.25rem, 4vw, 3.4rem)"
              weight={800}
              lineHeight={1.04}
              letterSpacing="-0.03em"
              color="#F2E9DE"
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
            color="#C7B6A6"
            className="m-0 max-w-md"
          />
        </LuxuryReveal>

        {/* Asymmetric Editorial Grid: 2 tall monumental cards on top, 3 architectural cards below */}
        <div data-preview-list-path="home.categories" className="mt-14">
          {categories.length === 0 ? (
            <div
              data-preview-static="categories-empty"
              className="rounded-2xl border border-dashed border-[#C8A98B]/28 py-16 text-center text-sm text-[#C7B6A6]"
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
                const targetHref = resolveCategoryHref(cat);
                const isExternal = /^https?:\/\//i.test(targetHref);

                return (
                  <LuxuryStaggerItem key={cat.id} className={spanClass} y={24}>
                    <div
                      data-preview-item-path={`home.categories[${cat.index}]`}
                      className="h-full w-full"
                    >
                      <a
                        href={targetHref}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        data-preview-field-path={`home.categories[${cat.index}].href`}
                        aria-label={`Shop ${cat.name}`}
                        className="group relative flex h-full w-full overflow-hidden rounded-2xl border border-[#C8A98B]/20 bg-[#3B302B] p-0 text-left no-underline transition-all duration-500 hover:border-[#C8A98B]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B]"
                      >
                        <LuxuryImageReveal
                          delay={Math.min(idx * 0.08, 0.28)}
                          tone="charcoal"
                          className="h-full w-full"
                        >
                          <img
                            src={withBasePath(cat.imageUrl)}
                            alt={cat.name}
                            loading="lazy"
                            data-preview-field-path={`home.categories[${cat.index}].imageUrl`}
                            className="h-full w-full object-cover transition-transform duration-[950ms] ease-luxury group-hover:scale-[1.05]"
                          />
                        </LuxuryImageReveal>

                        {/* Rich Midnight Espresso bottom scrim for crisp contrast */}
                        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#201C1A]/90 via-[#201C1A]/28 to-transparent transition-opacity duration-700 group-hover:from-[#201C1A]/95" />

                        {/* Top Count Badge */}
                        <span
                          data-preview-field-path={`home.categories[${cat.index}].itemCount`}
                          className="absolute left-5 top-5 z-20 rounded-[8px] border border-[#C8A98B]/40 bg-[#201C1A]/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F2E9DE] backdrop-blur-md transition-colors duration-500 group-hover:border-[#C8A98B]"
                        >
                          {cat.itemCount}
                        </span>

                        {/* Bottom Animated Label & Sliding Arrow */}
                        <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-6 sm:p-8">
                          <div className="max-w-sm">
                            <h3
                              data-preview-field-path={`home.categories[${cat.index}].name`}
                              className="m-0 font-heading text-2xl font-extrabold tracking-[-0.025em] text-[#F2E9DE] transition-transform duration-500 ease-luxury group-hover:-translate-y-1 sm:text-3xl"
                            >
                              {cat.name}
                            </h3>
                            <p
                              data-preview-field-path={`home.categories[${cat.index}].subtitle`}
                              className="mt-1.5 m-0 text-xs leading-relaxed text-[#E6D9C9]/90 transition-all duration-500 group-hover:text-[#F2E9DE]"
                            >
                              {cat.subtitle}
                            </p>
                          </div>

                          <span
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] border border-[#C8A98B]/45 bg-[#201C1A]/55 text-[#F2E9DE] backdrop-blur-sm transition-all duration-500 ease-luxury group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-[#C8A98B] group-hover:bg-[#C8A98B] group-hover:text-[#201C1A]"
                          >
                            <ArrowUpRight className="h-4 w-4 stroke-[1.7]" />
                          </span>
                        </div>
                      </a>
                    </div>
                  </LuxuryStaggerItem>
                );
              })}
            </LuxuryStagger>
          )}
        </div>
      </div>
    </section>
  );
}
