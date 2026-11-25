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
      className="loome-surface-ivory w-full py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        {/* Editorial Section Header */}
        <LuxuryReveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <EditableText
              as="p"
              data-preview-field-path="home.categoriesEyebrow"
              defaultValue={contentText(home.categoriesEyebrow) || 'BROWSE CATEGORIES'}
              fontFamily="body"
              size="0.6875rem"
              weight={600}
              transform="uppercase"
              letterSpacing="0.24em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.categoriesHeading"
              defaultValue={contentText(home.categoriesHeading) || 'Shop by Category'}
              fontFamily="heading"
              size="clamp(1.85rem, 3vw, 2.45rem)"
              weight={800}
              lineHeight={1.08}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-2 mb-0"
            />
          </div>
          <EditableText
            as="p"
            data-preview-field-path="home.categoriesSummary"
            defaultValue={contentText(home.categoriesSummary)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.7}
            color="muted"
            className="m-0 max-w-md"
          />
        </LuxuryReveal>

        {/* Asymmetric Editorial Grid: 2 tall monumental cards on top, 3 architectural cards below */}
        <div data-preview-list-path="home.categories" className="mt-8">
          {categories.length === 0 ? (
            <div
              data-preview-static="categories-empty"
              className="rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] py-14 text-center text-sm text-[var(--muted-color)]"
            >
              Add categories in your Fivora editor to populate this showcase.
            </div>
          ) : (
            <LuxuryStagger
              staggerDelay={0.11}
              delayChildren={0.04}
              className="grid grid-cols-1 gap-5 md:grid-cols-6 lg:gap-6"
            >
              {categories.map((cat, idx) => {
                const isHeroFeature = idx < 2;
                const spanClass = isHeroFeature
                  ? 'md:col-span-3 aspect-[4/3] sm:aspect-[16/11] lg:aspect-[16/11]'
                  : 'md:col-span-2 aspect-[4/3]';
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
                        className="group relative flex h-full w-full overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[#2D2722] p-0 text-left no-underline transition-all duration-500 hover:border-[#B18D69]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B18D69]"
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
                            data-preview-style-target={`home.categories[${cat.index}].imageUrl`}
                            data-preview-style-type="image"
                            className="h-full w-full object-cover transition-transform duration-[950ms] ease-luxury group-hover:scale-[1.05]"
                          />
                        </LuxuryImageReveal>

                        {/* Rich Espresso bottom scrim for crisp contrast */}
                        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#2D2722]/88 via-[#2D2722]/24 to-transparent transition-opacity duration-700 group-hover:from-[#2D2722]/94" />

                        {/* Top Count Badge */}
                        <span
                          data-preview-field-path={`home.categories[${cat.index}].itemCount`}
                          className="absolute left-4 top-4 z-20 rounded-[8px] border border-[#B18D69]/45 bg-[#2D2722]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F7F4EF] backdrop-blur-md transition-colors duration-500 group-hover:border-[#B18D69]"
                        >
                          {cat.itemCount}
                        </span>

                        {/* Bottom Animated Label & Sliding Arrow */}
                        <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-5 sm:p-6">
                          <div className="max-w-sm">
                            <h3
                              data-preview-field-path={`home.categories[${cat.index}].name`}
                              className="m-0 font-heading text-xl font-extrabold tracking-[-0.02em] text-[#F7F4EF] transition-transform duration-500 ease-luxury group-hover:-translate-y-0.5 sm:text-2xl"
                            >
                              {cat.name}
                            </h3>
                            <p
                              data-preview-field-path={`home.categories[${cat.index}].subtitle`}
                              className="mt-1 m-0 text-xs leading-relaxed text-[#EAE2D7]/90 transition-all duration-500 group-hover:text-[#F7F4EF]"
                            >
                              {cat.subtitle}
                            </p>
                          </div>

                          <span
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#B18D69]/50 bg-[#2D2722]/60 text-[#F7F4EF] backdrop-blur-sm transition-all duration-500 ease-luxury group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-[#B18D69] group-hover:bg-[#B18D69] group-hover:text-[#2D2722]"
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
