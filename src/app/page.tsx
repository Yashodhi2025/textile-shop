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
      <HeroSection />
      <BrandMarquee />
      <CategorySection />

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
              size="0.6875rem"
              weight={500}
              transform="uppercase"
              letterSpacing="0.26em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.productsHeading"
              defaultValue={contentText(home.productsHeading) || 'New Arrivals'}
              fontFamily="heading"
              size="clamp(2.35rem, 4.2vw, 3.5rem)"
              weight={300}
              lineHeight={1.06}
              letterSpacing="-0.02em"
              color="heading"
              className="mt-3 mb-0"
            />
          </>
        }
        headerSummary={
          <EditableText
            as="p"
            data-preview-field-path="home.productsSummary"
            defaultValue={contentText(home.productsSummary)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.75}
            color="muted"
            className="m-0 max-w-md lg:text-right"
          />
        }
        products={newArrivals}
        filterPool={allProducts}
        showCategoryFilter
        surfaceClassName="border-t border-[#262923]/8 dark:border-[#F8F6F1]/8"
      />

      <CraftsmanshipSection />
      <FeaturedCollectionBanner />

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
              size="0.6875rem"
              weight={500}
              transform="uppercase"
              letterSpacing="0.26em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.bestsellersHeading"
              defaultValue={contentText(home.bestsellersHeading) || 'Bestsellers'}
              fontFamily="heading"
              size="clamp(2.35rem, 4.2vw, 3.5rem)"
              weight={300}
              lineHeight={1.06}
              letterSpacing="-0.02em"
              color="heading"
              className="mt-3 mb-0"
            />
          </>
        }
        headerSummary={
          <EditableText
            as="p"
            data-preview-field-path="home.bestsellersSummary"
            defaultValue={contentText(home.bestsellersSummary)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.75}
            color="muted"
            className="m-0 max-w-md lg:text-right"
          />
        }
        products={bestsellers}
      />

      <ShopTheLookSection products={allProducts} />
      <BrandBenefitsSection />
      <TestimonialsSection />
      <JournalSection />
    </div>
  );
}
