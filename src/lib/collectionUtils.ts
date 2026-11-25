import { contentList, contentObject, contentText } from '@/lib/siteDataContext';
import { slugifyCategoryId } from '@/lib/categoryUtils';
import type { LoomeProduct } from '@/lib/storeContext';
import { withBasePath } from '@/lib/utils';

export interface LoomeCollectionItem {
  index: number;
  id: string;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  href: string;
  matchCategories: string[];
  matchCollectionTag: string;
  matchProductIds: string[];
}

function splitTokens(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => contentText(item).trim()).filter(Boolean);
  }
  const text = contentText(raw);
  if (!text) return [];
  return text
    .split(/[,|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Extracts normalized curated collections from siteData.content.collectionsPage.collections.
 */
export function extractCuratedCollections(rawCollectionsPage: unknown): LoomeCollectionItem[] {
  const page = contentObject(rawCollectionsPage);
  return contentList(page.collections).map((raw, idx) => {
    const obj = contentObject(raw);
    const title = contentText(obj.title) || 'Curated Collection';
    const id =
      slugifyCategoryId(contentText(obj.id)) ||
      slugifyCategoryId(title) ||
      `collection-${idx}`;
    return {
      index: idx,
      id,
      tag: contentText(obj.tag) || 'Curated Edit',
      title,
      description: contentText(obj.description),
      imageUrl: contentText(obj.imageUrl) || '/images/featured-collection.jpg',
      ctaLabel: contentText(obj.ctaLabel) || 'Explore Collection',
      href: contentText(obj.href),
      matchCategories: splitTokens(obj.matchCategories),
      matchCollectionTag: contentText(obj.matchCollectionTag).trim().toLowerCase(),
      matchProductIds: splitTokens(obj.matchProductIds),
    };
  });
}

/**
 * Builds a static-export-safe Shop URL with a stable ?collection=<id> query parameter,
 * respecting any merchant-customized external or non-shop link.
 */
export function buildShopCollectionHref(
  collectionId?: string | null,
  customHref?: string | null,
): string {
  const trimmedCustom = (customHref ?? '').trim();
  const safeId = slugifyCategoryId(collectionId);

  if (trimmedCustom) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(trimmedCustom)) {
      return trimmedCustom;
    }
    const isPlainShopPath = /^\/?shop\/?$/i.test(trimmedCustom);
    if (!isPlainShopPath) {
      return withBasePath(trimmedCustom);
    }
  }

  if (!safeId) {
    return withBasePath('/shop/');
  }

  return withBasePath(`/shop/?collection=${encodeURIComponent(safeId)}`);
}

/**
 * Resolves a ?collection=<id> URL parameter to the matching curated collection entry.
 */
export function findCollectionByParam(
  rawParam: string | null | undefined,
  collections: LoomeCollectionItem[],
): LoomeCollectionItem | null {
  const clean = (rawParam ?? '').trim();
  if (!clean) return null;
  const slug = slugifyCategoryId(clean);

  return (
    collections.find(
      (col) =>
        col.id.toLowerCase() === clean.toLowerCase() ||
        slugifyCategoryId(col.id) === slug ||
        slugifyCategoryId(col.title) === slug,
    ) ?? null
  );
}

/**
 * Checks whether a catalog product belongs to a given curated collection.
 * Supports explicit productIds, product-level collectionIds, category lists, and collectionTag.
 */
export function productMatchesCollection(
  product: LoomeProduct,
  collection: LoomeCollectionItem,
): boolean {
  const productIdLower = product.id.trim().toLowerCase();
  const colIdLower = collection.id.trim().toLowerCase();

  // 1. Explicit product-level collections array (if merchant assigns collection IDs on a product)
  if (
    product.collectionIds.some(
      (cid) =>
        cid.toLowerCase() === colIdLower ||
        slugifyCategoryId(cid) === slugifyCategoryId(collection.id),
    )
  ) {
    return true;
  }

  // 2. Explicit collection matchProductIds
  if (collection.matchProductIds.length > 0) {
    if (collection.matchProductIds.some((pid) => pid.toLowerCase() === productIdLower)) {
      return true;
    }
  }

  // 3. Matching product categories
  if (collection.matchCategories.length > 0) {
    const prodCatSlug = slugifyCategoryId(product.category);
    if (
      collection.matchCategories.some(
        (cat) => slugifyCategoryId(cat) === prodCatSlug,
      )
    ) {
      return true;
    }
  }

  // 4. Matching collectionTag (e.g. 'new' or 'bestseller')
  if (
    collection.matchCollectionTag &&
    product.collectionTag &&
    product.collectionTag.trim().toLowerCase() === collection.matchCollectionTag
  ) {
    return true;
  }

  // 5. Fallback: if merchant created a new collection with no explicit rules yet,
  // match by collection ID against product category slug
  if (
    collection.matchProductIds.length === 0 &&
    collection.matchCategories.length === 0 &&
    !collection.matchCollectionTag
  ) {
    return slugifyCategoryId(product.category) === slugifyCategoryId(collection.id);
  }

  return false;
}
