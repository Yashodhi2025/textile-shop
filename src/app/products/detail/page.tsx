'use client';

import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { PlatformProductDetail } from '@deneb-ui/ui';
import { useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import LoomeProductDetailView from '@/components/product/LoomeProductDetailView';

export default function ProductDetailPage() {
  const siteData = useSiteData();
  const requiredPages = Array.isArray(siteData.requiredPages)
    ? siteData.requiredPages
    : ['home', 'shop', 'about_us', 'services', 'contact'];
  const hasShopPage = requiredPages.includes('shop');
  const backHref = hasShopPage ? '/shop' : '/';

  return (
    <PlatformProductDetail
      backHref={backHref}
      backLabel={hasShopPage ? 'Return to Shop' : 'Return Home'}
      renderProduct={(product, context) => (
        <LoomeProductDetailView product={product} productIndex={context.productIndex} />
      )}
      loadingFallback={
        <section
          role="status"
          aria-live="polite"
          className="bg-[#F8F6F1] py-16 text-[#262923] dark:bg-[#171915] dark:text-[#F8F6F1] sm:py-24"
        >
          <div className="loome-container">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="aspect-[4/5] w-full animate-pulse bg-[#E8E0D5]/65 dark:bg-[#22251F]" />
              </div>
              <div className="flex flex-col justify-center space-y-5 lg:col-span-5">
                <span
                  data-preview-static="product-detail-loading-eyebrow"
                  className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#747B65] dark:text-[#B59B79]"
                >
                  LOOMÉ Atelier
                </span>
                <p
                  data-preview-static="product-detail-loading"
                  className="m-0 font-serif text-3xl font-light text-[#262923] dark:text-[#F8F6F1]"
                >
                  Preparing your textile piece…
                </p>
                <div className="space-y-3 pt-2">
                  <div className="h-3 w-3/4 animate-pulse bg-[#E8E0D5]/70 dark:bg-[#22251F]" />
                  <div className="h-3 w-full animate-pulse bg-[#E8E0D5]/55 dark:bg-[#22251F]" />
                  <div className="h-3 w-2/3 animate-pulse bg-[#E8E0D5]/55 dark:bg-[#22251F]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      }
      notFoundFallback={
        <section className="bg-[#F8F6F1] py-24 text-[#262923] dark:bg-[#171915] dark:text-[#F8F6F1] sm:py-32">
          <div className="loome-container flex flex-col items-center text-center">
            <span
              data-preview-static="product-not-found-eyebrow"
              className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
            >
              <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" />
              Archive Notice
            </span>
            <h1
              data-preview-static="product-not-found-title"
              className="mt-4 mb-0 font-serif text-4xl font-light tracking-[-0.015em] sm:text-5xl"
            >
              This textile piece could not be found
            </h1>
            <p
              data-preview-static="product-not-found-copy"
              className="mt-4 max-w-md text-sm leading-relaxed text-[#595C52] dark:text-[#B6B8AE]"
            >
              The weave you are looking for may have been retired from our seasonal archive or moved to a new collection.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {hasShopPage && (
                <a
                  href={withBasePath('/shop')}
                  data-target-page="shop"
                  data-preview-static="product-not-found-shop-cta"
                  className="loome-btn-primary inline-flex items-center gap-2 no-underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                  Explore the Shop
                </a>
              )}
              <a
                href={withBasePath('/')}
                data-preview-static="product-not-found-home-cta"
                className="loome-btn-outline inline-flex items-center gap-2 no-underline"
              >
                Return Home
              </a>
            </div>
          </div>
        </section>
      }
      errorFallback={
        <section className="bg-[#F8F6F1] py-24 text-[#262923] dark:bg-[#171915] dark:text-[#F8F6F1] sm:py-32">
          <div className="loome-container flex flex-col items-center text-center">
            <span
              data-preview-static="product-error-eyebrow"
              className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
            >
              Temporary Interruption
            </span>
            <h1
              data-preview-static="product-error-title"
              className="mt-4 mb-0 font-serif text-4xl font-light tracking-[-0.015em] sm:text-5xl"
            >
              Unable to load this textile right now
            </h1>
            <p
              data-preview-static="product-error-copy"
              className="mt-4 max-w-md text-sm leading-relaxed text-[#595C52] dark:text-[#B6B8AE]"
            >
              Please refresh the page or return to our curated catalog while we reconnect to the atelier archive.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                data-preview-static="product-error-retry-cta"
                className="loome-btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5 stroke-[1.5]" />
                Reload Page
              </button>
              <a
                href={withBasePath(backHref)}
                data-target-page={hasShopPage ? 'shop' : undefined}
                data-preview-static="product-error-back-cta"
                className="loome-btn-outline inline-flex items-center gap-2 no-underline"
              >
                <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                {hasShopPage ? 'Return to Shop' : 'Return Home'}
              </a>
            </div>
          </div>
        </section>
      }
    />
  );
}
