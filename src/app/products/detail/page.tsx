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
          className="loome-surface-espresso bg-[#201C1A] py-16 text-[#F2E9DE] sm:py-24"
        >
          <div className="mx-auto max-w-[1380px] px-4 sm:px-8 lg:px-14">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-[#3B302B]/70" />
              </div>
              <div className="flex flex-col justify-center space-y-5 lg:col-span-5">
                <span
                  data-preview-static="product-detail-loading-eyebrow"
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C8A98B]"
                >
                  Atelier Archive
                </span>
                <p
                  data-preview-static="product-detail-loading"
                  className="m-0 font-heading text-3xl font-extrabold tracking-tight text-[#F2E9DE]"
                >
                  Preparing your textile piece…
                </p>
                <div className="space-y-3 pt-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[#3B302B]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#3B302B]/80" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#3B302B]/80" />
                </div>
              </div>
            </div>
          </div>
        </section>
      }
      notFoundFallback={
        <section className="loome-surface-espresso bg-[#201C1A] py-24 text-[#F2E9DE] sm:py-32">
          <div className="mx-auto flex max-w-[1380px] flex-col items-center px-4 text-center sm:px-8 lg:px-14">
            <span
              data-preview-static="product-not-found-eyebrow"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C8A98B]"
            >
              <Sparkles className="h-3.5 w-3.5 stroke-[1.6]" />
              Archive Notice
            </span>
            <h1
              data-preview-static="product-not-found-title"
              className="mt-4 mb-0 font-heading text-4xl font-extrabold tracking-[-0.025em] sm:text-5xl"
            >
              This textile piece could not be found
            </h1>
            <p
              data-preview-static="product-not-found-copy"
              className="mt-4 max-w-md text-sm leading-relaxed text-[#C7B6A6]"
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
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[1.6]" />
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
        <section className="loome-surface-espresso bg-[#201C1A] py-24 text-[#F2E9DE] sm:py-32">
          <div className="mx-auto flex max-w-[1380px] flex-col items-center px-4 text-center sm:px-8 lg:px-14">
            <span
              data-preview-static="product-error-eyebrow"
              className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C8A98B]"
            >
              Temporary Interruption
            </span>
            <h1
              data-preview-static="product-error-title"
              className="mt-4 mb-0 font-heading text-4xl font-extrabold tracking-[-0.025em] sm:text-5xl"
            >
              Unable to load this textile right now
            </h1>
            <p
              data-preview-static="product-error-copy"
              className="mt-4 max-w-md text-sm leading-relaxed text-[#C7B6A6]"
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
                <RefreshCw className="h-3.5 w-3.5 stroke-[1.6]" />
                Reload Page
              </button>
              <a
                href={withBasePath(backHref)}
                data-target-page={hasShopPage ? 'shop' : undefined}
                data-preview-static="product-error-back-cta"
                className="loome-btn-outline inline-flex items-center gap-2 no-underline"
              >
                <ArrowLeft className="h-3.5 w-3.5 stroke-[1.6]" />
                {hasShopPage ? 'Return to Shop' : 'Return Home'}
              </a>
            </div>
          </div>
        </section>
      }
    />
  );
}
