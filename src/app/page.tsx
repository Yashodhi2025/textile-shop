'use client';

import { useMemo } from 'react';
import { EditableText } from '@deneb-ui/ui';
import {
  contentObject,
  contentText,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import { normalizeLoomeProduct } from '@/lib/storeContext';
import HeroSection from '@/components/home/HeroSection';
import BrandMarquee from '@/components/home/BrandMarquee';
import CategorySection from '@/components/home/CategorySection';
import ProductShowcaseSection from '@/components/home/ProductShowcaseSection';
import CraftsmanshipSection from '@/components/home/CraftsmanshipSection';
import FeaturedCollectionBanner from '@/components/home/FeaturedCollectionBanner';
import ShopTheLookSection from '@/components/home/ShopTheLookSection';
import BrandBenefitsSection from '@/components/home/BrandBenefitsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import JournalSection from '@/components/home/JournalSection';

export default function HomePage() {
  const siteData = useSiteData();
  const rawProducts = useProducts();

  const content = contentObject(siteData.content);
  const home = contentObject(content.home);

  const allProducts = useMemo(
    () => rawProducts.map((item, index) => normalizeLoomeProduct(item, index)),
    [rawProducts],
  );

  // Split live catalog seamlessly into New Arrivals & Bestsellers while preserving every original index
  const { newArrivals, bestsellers } = useMemo(() => {
    const taggedNew = allProducts.filter((p) => p.collectionTag === 'new');
    const taggedBest = allProducts.filter((p) => p.collectionTag === 'bestseller');

    if (taggedNew.length > 0 && taggedBest.length > 0) {
      return { newArrivals: taggedNew, bestsellers: taggedBest };
    }

    const midpoint = Math.ceil(allProducts.length / 2);
    return {
      newArrivals: allProducts.slice(0, Math.max(midpoint, Math.min(4, allProducts.length))),
      bestsellers:
        allProducts.length > midpoint ? allProducts.slice(midpoint) : allProducts,
    };
  }, [allProducts]);

  return (
    <div data-preview-page-key="home" className="w-full overflow-x-clip">
      {/* 1. Cinematic Full-Width Hero */}
      <HeroSection />

      {/* 2. Infinite Scrolling Brand Marquee */}
      <BrandMarquee />

      {/* 3. Asymmetric Shop by Category Cards */}
      <CategorySection />

      {/* 4. New Arrivals 4-Column Product Grid with Interactive Category Filters */}
      <ProductShowcaseSection
        id="new-arrivals"
        designSection="home-products"
        headerLeft={
          <>
            <EditableText
              as="p"
              data-preview-field-path="home.productsEyebrow"
              defaultValue={contentText(home.productsEyebrow) || 'SEASONAL ARRIVALS'}
              fontFamily="body"
              className="m-0 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.productsHeading"
              defaultValue={contentText(home.productsHeading) || 'New Arrivals'}
              fontFamily="heading"
              className="mt-3 font-serif text-4xl font-light leading-[1.06] tracking-tight text-[#262923] dark:text-[#F8F6F1] sm:text-5xl lg:text-[3.5rem]"
            />
          </>
        }
        headerSummary={
          <EditableText
            as="p"
            data-preview-field-path="home.productsSummary"
            defaultValue={contentText(home.productsSummary)}
            fontFamily="body"
            className="m-0 max-w-md text-sm leading-relaxed text-[#65685E] dark:text-[#B6B8AE] lg:text-right"
          />
        }
        products={newArrivals}
        showCategoryFilter
        surfaceClassName="border-t border-[#262923]/8 dark:border-[#F8F6F1]/8"
      />

      {/* 5. Editorial Craftsmanship Split Section ("The Beauty Is in the Details") */}
      <CraftsmanshipSection />

      {/* 6. Featured Seasonal Collection Banner */}
      <FeaturedCollectionBanner />

      {/* 7. Bestsellers Reusable Product Showcase */}
      <ProductShowcaseSection
        id="bestsellers"
        designSection="home-bestsellers"
        headerLeft={
          <>
            <EditableText
              as="p"
              data-preview-field-path="home.bestsellersEyebrow"
              defaultValue={contentText(home.bestsellersEyebrow) || 'CLIENT FAVORITES'}
              fontFamily="body"
              className="m-0 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.bestsellersHeading"
              defaultValue={contentText(home.bestsellersHeading) || 'Bestsellers'}
              fontFamily="heading"
              className="mt-3 font-serif text-4xl font-light leading-[1.06] tracking-tight text-[#262923] dark:text-[#F8F6F1] sm:text-5xl lg:text-[3.5rem]"
            />
          </>
        }
        headerSummary={
          <EditableText
            as="p"
            data-preview-field-path="home.bestsellersSummary"
            defaultValue={contentText(home.bestsellersSummary)}
            fontFamily="body"
            className="m-0 max-w-md text-sm leading-relaxed text-[#65685E] dark:text-[#B6B8AE] lg:text-right"
          />
        }
        products={bestsellers}
      />

      {/* 8. Interactive Shop the Look Editorial Room */}
      <ShopTheLookSection products={allProducts} />

      {/* 9. Brand Benefits Pillars */}
      <BrandBenefitsSection />

      {/* 10. Refined Client Testimonials Slider */}
      <TestimonialsSection />

      {/* 11. Editorial Journal & Inspiration Cards */}
      <JournalSection />
    </div>
  );
}
