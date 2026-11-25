import { contentList, contentObject, contentText } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';

export interface HomeCategoryLinkMeta {
  id: string;
  name: string;
  category?: string;
  href?: string;
}

/**
 * Normalizes any category label or identifier into a stable URL-safe slug.
 */
export function slugifyCategoryId(value?: string | null): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extracts normalized category metadata from siteData.content.home.categories.
 */
export function extractHomeCategories(rawHome: unknown): HomeCategoryLinkMeta[] {
  const home = contentObject(rawHome);
  return contentList(home.categories).map((raw, idx) => {
    const obj = contentObject(raw);
    const name = contentText(obj.name) || 'Category';
    const id = contentText(obj.id) || slugifyCategoryId(name) || `category-${idx}`;
    return {
      id,
      name,
      category: contentText(obj.category) || undefined,
      href: contentText(obj.href) || undefined,
    };
  });
}

/**
 * Builds a static-export-safe Shop URL with a stable ?category=<id> query parameter,
 * while respecting any merchant-customized non-shop or explicit link.
 */
export function buildShopCategoryHref(
  categoryId?: string | null,
  customHref?: string | null,
): string {
  const trimmedCustom = (customHref ?? '').trim();
  const safeId = slugifyCategoryId(categoryId);

  if (trimmedCustom) {
    // External links, mailto/tel, or in-page hash anchors are preserved as-is.
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(trimmedCustom)) {
      return trimmedCustom;
    }

    // If the merchant already wrote a query string or pointed to another page, preserve it.
    const isPlainShopPath = /^\/?shop\/?$/i.test(trimmedCustom);
    if (!isPlainShopPath) {
      return withBasePath(trimmedCustom);
    }
  }

  if (!safeId || safeId === 'all') {
    return withBasePath('/shop/');
  }

  return withBasePath(`/shop/?category=${encodeURIComponent(safeId)}`);
}

/**
 * Resolves a URL ?category= parameter (or pending category string) to a live
 * catalog product category name, remaining resilient even when a merchant
 * renames a homepage category card's display title in Fivora.
 */
export function resolveShopCategoryParam(
  rawParam: string | null | undefined,
  availableCategories: string[],
  homeCategories: HomeCategoryLinkMeta[] = [],
): string {
  const trimmed = (rawParam ?? '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') {
    return 'All';
  }

  const findInCatalog = (candidate?: string | null): string | null => {
    const clean = (candidate ?? '').trim();
    if (!clean || clean.toLowerCase() === 'all') return null;

    const lower = clean.toLowerCase();
    const exact = availableCategories.find((cat) => cat.trim().toLowerCase() === lower);
    if (exact) return exact;

    const slug = slugifyCategoryId(clean);
    if (!slug) return null;

    const bySlug = availableCategories.find((cat) => slugifyCategoryId(cat) === slug);
    if (bySlug) return bySlug;

    const strippedSlug = slug.replace(/^(?:cat|col|category)-/, '');
    if (strippedSlug && strippedSlug !== slug) {
      const byStripped = availableCategories.find(
        (cat) => slugifyCategoryId(cat) === strippedSlug,
      );
      if (byStripped) return byStripped;
    }

    return null;
  };

  // 1. Direct match against live catalog product categories (exact or slug)
  const direct = findInCatalog(trimmed);
  if (direct) return direct;

  // 2. Match via homepage category metadata (stable ID or display name)
  const paramLower = trimmed.toLowerCase();
  const paramSlug = slugifyCategoryId(trimmed);
  const matchedHome = homeCategories.find((entry) => {
    const idLower = entry.id.trim().toLowerCase();
    const nameLower = entry.name.trim().toLowerCase();
    return (
      idLower === paramLower ||
      slugifyCategoryId(entry.id) === paramSlug ||
      nameLower === paramLower ||
      slugifyCategoryId(entry.name) === paramSlug
    );
  });

  if (matchedHome) {
    const resolvedFromHome =
      findInCatalog(matchedHome.category) ||
      findInCatalog(matchedHome.id) ||
      findInCatalog(matchedHome.name);
    if (resolvedFromHome) return resolvedFromHome;
  }

  return 'All';
}

/**
 * Returns the stable category ID for a live Shop category name so URL query
 * parameters stay consistent across navigation, filtering, and refresh.
 */
export function resolveCategoryQueryId(
  categoryName: string,
  homeCategories: HomeCategoryLinkMeta[] = [],
): string {
  const clean = categoryName.trim();
  if (!clean || clean.toLowerCase() === 'all') return '';

  const slug = slugifyCategoryId(clean);
  const matchedHome = homeCategories.find(
    (entry) =>
      slugifyCategoryId(entry.category) === slug ||
      slugifyCategoryId(entry.id) === slug ||
      slugifyCategoryId(entry.name) === slug,
  );

  return slugifyCategoryId(matchedHome?.id || clean);
}
