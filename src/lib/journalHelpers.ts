import { contentList, contentObject, contentText } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';

export interface LoomeJournalArticle {
  index: number;
  id: string;
  category: string;
  categoryId: string;
  date: string;
  readTime: string;
  author: string;
  title: string;
  excerpt: string;
  body: string;
  imageUrl: string;
}

export interface LoomeJournalCategory {
  index: number;
  id: string;
  label: string;
}

export function slugifyJournalCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeJournalArticles(rawPosts: unknown): LoomeJournalArticle[] {
  return contentList(rawPosts).map((raw, idx) => {
    const obj = contentObject(raw);
    const category = contentText(obj.category) || 'Atelier Note';
    const categoryId = contentText(obj.categoryId) || slugifyJournalCategory(category);
    return {
      index: idx,
      id: contentText(obj.id) || `journal-${idx}`,
      category,
      categoryId,
      date: contentText(obj.date) || 'Autumn 2026',
      readTime: contentText(obj.readTime) || '4 min read',
      author: contentText(obj.author) || 'LOOMÉ Editorial Studio',
      title: contentText(obj.title) || 'Material & Light',
      excerpt: contentText(obj.excerpt),
      body: contentText(obj.body) || contentText(obj.excerpt),
      imageUrl: contentText(obj.imageUrl) || '/images/cat-fabrics.jpg',
    };
  });
}

export function normalizeJournalCategories(rawCategories: unknown): LoomeJournalCategory[] {
  return contentList(rawCategories)
    .map((raw, idx) => {
      const obj = contentObject(raw);
      const label = contentText(obj.label);
      const id = contentText(obj.id) || slugifyJournalCategory(label) || `category-${idx}`;
      return {
        index: idx,
        id,
        label: label || id,
      };
    })
    .filter((cat) => Boolean(cat.label));
}

/**
 * Resolves the stable category key for an article so renaming a category filter label
 * in Fivora never breaks filtering, while changing an article's category text to another
 * configured category label cleanly reassigns it.
 */
export function resolveArticleCategoryKey(
  article: LoomeJournalArticle,
  configuredCategories: LoomeJournalCategory[],
): string {
  const normalizedLabel = article.category.trim().toLowerCase();
  const matchedByLabel = configuredCategories.find(
    (cat) => cat.label.trim().toLowerCase() === normalizedLabel,
  );
  if (matchedByLabel) return matchedByLabel.id;

  const normalizedId = article.categoryId.trim().toLowerCase();
  if (normalizedId) {
    const matchedById = configuredCategories.find(
      (cat) => cat.id.trim().toLowerCase() === normalizedId,
    );
    if (matchedById) return matchedById.id;
  }

  return slugifyJournalCategory(article.category) || normalizedId;
}

/**
 * Builds a static-export-safe shareable URL for any journal article, including
 * newly authored merchant stories added via Fivora without rebuilding routes.
 */
export function journalArticleHref(articleId: string): string {
  const safeSlug = encodeURIComponent(articleId.trim());
  return withBasePath(`/journal/article/?slug=${safeSlug}`);
}
