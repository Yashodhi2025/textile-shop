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
    : ['home', 'shop', 'collections', 'wishlist', 'about_us', 'services', 'contact'];
  const hasShopPage = requiredPages.includes('shop');
  const backHref = hasShopPage ? '/shop/' : '/';

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
          className="loome-surface-commerce py-10 font-sans sm:py-14"
        >
          <div className="mx-auto max-w-[1240px] px-4 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <div className="h-[400px] w-full animate-pulse rounded-2xl bg-white/80 dark:bg-[#28211D]" />
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-2xl bg-white p-6 dark:bg-[#28211D] lg:col-span-6">
                <span
                  data-preview-static="product-detail-loading-eyebrow"
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B28B65] dark:text-[#C8A98B]"
                >
                  Loading Product
                </span>
                <p
                  data-preview-static="product-detail-loading"
                  className="m-0 font-heading text-2xl font-extrabold tracking-tight text-[#2C211B] dark:text-[#F5EEE6]"
                >
                  Preparing product details…
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[#EDE5DA] dark:bg-[#3B302B]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#EDE5DA]/80 dark:bg-[#3B302B]/80" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#EDE5DA]/80 dark:bg-[#3B302B]/80" />
                </div>
              </div>
            </div>
          </div>
        </section>
      }
      notFoundFallback={
        <section className="loome-surface-commerce py-16 font-sans sm:py-24">
          <div className="mx-auto max-w-lg px-4">
            <div className="rounded-2xl border border-[#49382D]/12 bg-white px-6 py-12 text-center shadow-[0_6px_24px_rgba(73,56,45,0.06)] dark:border-[#C8A98B]/20 dark:bg-[#28211D] sm:px-10">
              <span
                data-preview-static="product-not-found-eyebrow"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B28B65] dark:text-[#C8A98B]"
              >
                <Sparkles className="h-3.5 w-3.5 stroke-[1.6]" />
                Product Not Found
              </span>
              <h1
                data-preview-static="product-not-found-title"
                className="mt-3 mb-0 font-heading text-2xl font-extrabold tracking-tight text-[#2C211B] dark:text-[#F5EEE6] sm:text-3xl"
              >
                This product is no longer available
              </h1>
              <p
                data-preview-static="product-not-found-copy"
                className="mt-3 text-sm leading-relaxed text-[#6E5B4E] dark:text-[#C9B9AA]"
              >
                It may have been removed or moved to another collection. Browse our catalog to find similar textiles.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {hasShopPage && (
                  <a
                    href={withBasePath('/shop/')}
                    data-target-page="shop"
                    data-preview-static="product-not-found-shop-cta"
                    className="inline-flex h-11 items-center gap-2 rounded-[11px] bg-[#49382D] px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#F7F3ED] no-underline transition-colors hover:bg-[#B28B65] hover:text-white dark:bg-[#C8A98B] dark:text-[#201C1A]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 stroke-[1.8]" />
                    Explore Shop
                  </a>
                )}
                <a
                  href={withBasePath('/')}
                  data-preview-static="product-not-found-home-cta"
                  className="inline-flex h-11 items-center gap-2 rounded-[11px] border border-[#49382D]/20 bg-transparent px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#49382D] no-underline transition-colors hover:border-[#B28B65] dark:border-[#C8A98B]/30 dark:text-[#F5EEE6]"
                >
                  Return Home
                </a>
              </div>
            </div>
          </div>
        </section>
      }
      errorFallback={
        <section className="loome-surface-commerce py-16 font-sans sm:py-24">
          <div className="mx-auto max-w-lg px-4">
            <div className="rounded-2xl border border-[#49382D]/12 bg-white px-6 py-12 text-center shadow-[0_6px_24px_rgba(73,56,45,0.06)] dark:border-[#C8A98B]/20 dark:bg-[#28211D] sm:px-10">
              <span
                data-preview-static="product-error-eyebrow"
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B28B65] dark:text-[#C8A98B]"
              >
                Temporary Issue
              </span>
              <h1
                data-preview-static="product-error-title"
                className="mt-3 mb-0 font-heading text-2xl font-extrabold tracking-tight text-[#2C211B] dark:text-[#F5EEE6] sm:text-3xl"
              >
                Unable to load this product
              </h1>
              <p
                data-preview-static="product-error-copy"
                className="mt-3 text-sm leading-relaxed text-[#6E5B4E] dark:text-[#C9B9AA]"
              >
                Please reload the page or return to the shop to continue browsing.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  data-preview-static="product-error-retry-cta"
                  className="inline-flex h-11 items-center gap-2 rounded-[11px] bg-[#49382D] px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#F7F3ED] transition-colors hover:bg-[#B28B65] hover:text-white dark:bg-[#C8A98B] dark:text-[#201C1A]"
                >
                  <RefreshCw className="h-3.5 w-3.5 stroke-[1.8]" />
                  Reload Page
                </button>
                <a
                  href={withBasePath(backHref)}
                  data-target-page={hasShopPage ? 'shop' : undefined}
                  data-preview-static="product-error-back-cta"
                  className="inline-flex h-11 items-center gap-2 rounded-[11px] border border-[#49382D]/20 bg-transparent px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#49382D] no-underline transition-colors hover:border-[#B28B65] dark:border-[#C8A98B]/30 dark:text-[#F5EEE6]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[1.8]" />
                  {hasShopPage ? 'Return to Shop' : 'Return Home'}
                </a>
              </div>
            </div>
          </div>
        </section>
      }
    />
  );
}
