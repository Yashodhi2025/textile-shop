'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Link2,
  Share2,
} from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import {
  journalArticleHref,
  normalizeJournalArticles,
  normalizeJournalCategories,
  resolveArticleCategoryKey,
  type LoomeJournalArticle,
} from '@/lib/journalHelpers';
import { withBasePath } from '@/lib/utils';
import {
  LuxuryHairline,
  LuxuryImageReveal,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

export default function JournalArticleView() {
  const siteData = useSiteData();
  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const home = contentObject(content.home);
  const journalPage = contentObject(content.journalPage);
  const articlePage = contentObject(content.journalArticlePage);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
      'home',
      'shop',
      'cart',
      'checkout',
      'journal',
      'about_us',
      'services',
      'contact',
    ];
  const hasJournalPage = requiredPages.includes('journal');
  const hasShopPage = requiredPages.includes('shop');

  const allPosts = useMemo(
    () => normalizeJournalArticles(home.journalPosts),
    [home.journalPosts],
  );

  const configuredCategories = useMemo(
    () => normalizeJournalCategories(journalPage.categories),
    [journalPage.categories],
  );

  // Start with null slug during SSR (displays featured essay cleanly in static HTML),
  // then resolve exact ?slug= / ?id= query param on client mount.
  const [requestedSlug, setRequestedSlug] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const slug = (params.get('slug') || params.get('id') || '').trim();
    if (slug) {
      setRequestedSlug(slug);
    }
  }, []);

  const resolvedArticle: LoomeJournalArticle | null = useMemo(() => {
    if (allPosts.length === 0) return null;
    if (!requestedSlug) return allPosts[0];
    return (
      allPosts.find(
        (post) => post.id.toLowerCase() === requestedSlug.toLowerCase(),
      ) ?? null
    );
  }, [allPosts, requestedSlug]);

  const relatedPosts = useMemo(() => {
    if (!resolvedArticle) return allPosts.slice(0, 3);
    const activeCatKey = resolveArticleCategoryKey(
      resolvedArticle,
      configuredCategories,
    ).toLowerCase();
    const others = allPosts.filter((post) => post.id !== resolvedArticle.id);
    const sameCategory = others.filter(
      (post) =>
        resolveArticleCategoryKey(post, configuredCategories).toLowerCase() ===
        activeCatKey,
    );
    const otherCategories = others.filter(
      (post) =>
        resolveArticleCategoryKey(post, configuredCategories).toLowerCase() !==
        activeCatKey,
    );
    return [...sameCategory, ...otherCategories].slice(0, 3);
  }, [allPosts, configuredCategories, resolvedArticle]);

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      // Clipboard API unavailable; silent no-op
    }
  };

  const handleNativeShare = async () => {
    if (typeof window === 'undefined' || !resolvedArticle) return;
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: resolvedArticle.title,
          text: resolvedArticle.excerpt,
          url,
        });
        return;
      } catch {
        // User canceled or unsupported; fall back to copying link
      }
    }
    await handleCopyShareLink();
  };

  const backToJournalHref = withBasePath(hasJournalPage ? '/journal/' : '/#journal');

  // Editable navigation, article reader, and CTA labels
  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const journalNavLabel = contentText(navLabels.journal) || 'Journal';
  const authorPrefixLabel = contentText(journalPage.authorPrefixLabel) || 'By';
  const readStoryLabel = contentText(journalPage.readStoryLabel) || 'Read Story';

  const copyLinkLabel = contentText(articlePage.copyLinkLabel) || 'Copy Link';
  const copiedLinkLabel = contentText(articlePage.copiedLinkLabel) || 'Link Copied';
  const shareLabel = contentText(articlePage.shareLabel) || 'Share';
  const backToJournalLabel =
    contentText(articlePage.backToJournalLabel) || 'All Journal Stories';
  const shopCtaLabel =
    contentText(articlePage.shopCtaLabel) || 'Shop Featured Textiles';
  const relatedEyebrow = contentText(articlePage.relatedEyebrow) || 'Continue Reading';
  const relatedHeading =
    contentText(articlePage.relatedHeading) || 'More From the LOOMÉ Journal';
  const viewArchiveLabel =
    contentText(articlePage.viewArchiveLabel) || 'View Complete Archive';

  const missingEyebrow =
    contentText(articlePage.missingEyebrow) || 'LOOMÉ Editorial Archive';
  const missingHeading =
    contentText(articlePage.missingHeading) || 'This story could not be found';
  const missingCopy =
    contentText(articlePage.missingCopy) ||
    'The editorial essay you followed may have been updated or moved in our archive.';
  const missingBackLabel =
    contentText(articlePage.missingBackLabel) || 'Return to Journal';

  return (
    <div
      data-preview-page-key="journal_article"
      className="loome-surface-ivory min-h-[75vh] w-full"
    >
      {/* Breadcrumb Strip */}
      <div className="border-b border-[var(--loome-border)] bg-[var(--loome-surface-subtle)]">
        <nav className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] transition-colors hover:text-[var(--heading-color)]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" data-preview-static="article-bc-sep-1" className="text-[var(--brand-accent)]">
            /
          </span>
          <button
            type="button"
            onClick={() => window.location.assign(backToJournalHref)}
            data-target-page={hasJournalPage ? 'journal' : undefined}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] transition-colors hover:text-[var(--heading-color)]"
          >
            <span data-preview-field-path="common.navLabels.journal">{journalNavLabel}</span>
          </button>
          {resolvedArticle && (
            <>
              <span aria-hidden="true" data-preview-static="article-bc-sep-2" className="text-[var(--brand-accent)]">
                /
              </span>
              <span
                aria-current="page"
                data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].category`}
                className="font-semibold text-[var(--heading-color)]"
              >
                {resolvedArticle.category}
              </span>
            </>
          )}
        </nav>
      </div>

      {!resolvedArticle ? (
        /* Graceful Missing Story State */
        <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-8">
          <EditableText
            as="p"
            data-preview-field-path="journalArticlePage.missingEyebrow"
            defaultValue={missingEyebrow}
            fontFamily="body"
            size="0.6875rem"
            weight={500}
            transform="uppercase"
            letterSpacing="0.26em"
            color="primary"
            className="m-0"
          />
          <EditableText
            as="h1"
            data-preview-field-path="journalArticlePage.missingHeading"
            defaultValue={missingHeading}
            fontFamily="heading"
            size="2.25rem"
            weight={300}
            lineHeight={1.15}
            color="heading"
            className="mt-4 mb-0"
          />
          <EditableText
            as="p"
            data-preview-field-path="journalArticlePage.missingCopy"
            defaultValue={missingCopy}
            fontFamily="body"
            size="0.875rem"
            lineHeight={1.7}
            color="muted"
            className="mt-4 mb-0"
          />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => window.location.assign(backToJournalHref)}
              data-target-page={hasJournalPage ? 'journal' : undefined}
              className="loome-btn-primary inline-flex cursor-pointer items-center gap-2"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.5]" />
              <EditableText
                as="span"
                data-preview-field-path="journalArticlePage.missingBackLabel"
                defaultValue={missingBackLabel}
                fontFamily="body"
                size="0.75rem"
                weight={500}
                transform="uppercase"
                letterSpacing="0.2em"
                color="inherit"
                className="inline"
              />
            </button>
          </div>

          {/* Keep article toolbar & navigation labels mounted in empty-state for Fivora visual editing */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-[#201C1A]/10 pt-6 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:border-[#F2E9DE]/10 dark:text-[#C7B6A6]">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.2em] text-[#201C1A] transition-colors hover:text-[#8D7667] dark:text-[#F2E9DE] dark:hover:text-[#C8A98B]"
            >
              {copiedLink ? (
                <>
                  <Check aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.7] text-[#8D7667]" />
                  <EditableText
                    as="span"
                    data-preview-field-path="journalArticlePage.copiedLinkLabel"
                    defaultValue={copiedLinkLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.2em"
                    color="inherit"
                    className="inline"
                  />
                </>
              ) : (
                <>
                  <Link2 aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.5]" />
                  <EditableText
                    as="span"
                    data-preview-field-path="journalArticlePage.copyLinkLabel"
                    defaultValue={copyLinkLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.2em"
                    color="inherit"
                    className="inline"
                  />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.2em] text-[#5E4E45] transition-colors hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]"
            >
              <Share2 aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.5]" />
              <EditableText
                as="span"
                data-preview-field-path="journalArticlePage.shareLabel"
                defaultValue={shareLabel}
                fontFamily="body"
                size="0.6875rem"
                weight={500}
                transform="uppercase"
                letterSpacing="0.2em"
                color="inherit"
                className="inline"
              />
            </button>

            <button
              type="button"
              onClick={() => window.location.assign(backToJournalHref)}
              data-target-page={hasJournalPage ? 'journal' : undefined}
              className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#201C1A] dark:text-[#F2E9DE]"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.5]" />
              <EditableText
                as="span"
                data-preview-field-path="journalArticlePage.backToJournalLabel"
                defaultValue={backToJournalLabel}
                fontFamily="body"
                size="0.6875rem"
                weight={500}
                transform="uppercase"
                letterSpacing="0.2em"
                color="inherit"
                className="inline"
              />
            </button>

            {hasShopPage ? (
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath('/shop/'))}
                data-target-page="shop"
                className="inline-flex cursor-pointer items-center gap-1.5 border-0 border-b border-[#C8A98B] bg-transparent px-0 pb-0.5 pt-0 text-[11px] uppercase tracking-[0.2em] text-[#8D7667] dark:text-[#C8A98B]"
              >
                <EditableText
                  as="span"
                  data-preview-field-path="journalArticlePage.shopCtaLabel"
                  defaultValue={shopCtaLabel}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.5]" />
              </button>
            ) : (
              <span
                data-target-page="shop"
                data-preview-field-path="journalArticlePage.shopCtaLabel"
                className="unavailable inline-flex items-center gap-1.5"
              >
                {shopCtaLabel}
              </span>
            )}
          </div>
        </section>
      ) : (
        /* Magazine Article Masthead & Essay */
        <article
          data-preview-item-path={`home.journalPosts[${resolvedArticle.index}]`}
          className="mx-auto w-full max-w-[1040px] px-4 pb-12 pt-9 sm:px-8 sm:pt-12 lg:px-10 lg:pb-16"
        >
          <LuxuryReveal className="mx-auto max-w-3xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
              <EditableText
                as="span"
                data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].category`}
                defaultValue={resolvedArticle.category}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.22em"
                color="inherit"
                className="inline"
              />
              <span aria-hidden="true" className="text-[var(--brand-accent)]">
                ·
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--muted-color)]">
                <Calendar aria-hidden="true" className="h-3 w-3 stroke-[1.5]" />
                <EditableText
                  as="span"
                  data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].date`}
                  defaultValue={resolvedArticle.date}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.22em"
                  color="inherit"
                  className="inline"
                />
              </span>
              <span aria-hidden="true" className="text-[var(--brand-accent)]">
                ·
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--muted-color)]">
                <Clock aria-hidden="true" className="h-3 w-3 stroke-[1.5]" />
                <EditableText
                  as="span"
                  data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].readTime`}
                  defaultValue={resolvedArticle.readTime}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.22em"
                  color="inherit"
                  className="inline"
                />
              </span>
            </div>

            <EditableText
              as="h1"
              data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].title`}
              defaultValue={resolvedArticle.title}
              fontFamily="heading"
              size="clamp(1.9rem, 3.3vw, 2.75rem)"
              weight={800}
              lineHeight={1.1}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-3.5 mb-0"
            />

            <LuxuryHairline
              origin="center"
              className="mx-auto my-5 h-px w-12 bg-[var(--brand-accent)]"
            />

            <EditableText
              as="p"
              data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].excerpt`}
              defaultValue={resolvedArticle.excerpt}
              fontFamily="body"
              size="1.05rem"
              weight={400}
              lineHeight={1.65}
              color="muted"
              className="mx-auto m-0 max-w-2xl"
            />

            {/* Author Byline + Shareable Link Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.18em] text-[var(--muted-color)]">
              <div className="inline-flex flex-wrap items-center gap-1.5">
                <EditableText
                  as="span"
                  data-preview-field-path="journalPage.authorPrefixLabel"
                  defaultValue={authorPrefixLabel}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.18em"
                  color="inherit"
                  className="inline"
                />
                <EditableText
                  as="span"
                  data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].author`}
                  defaultValue={resolvedArticle.author}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.18em"
                  color="inherit"
                  className="inline"
                />
              </div>
              <span
                aria-hidden="true"
                className="h-3 w-px bg-[var(--loome-border)]"
              />
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--heading-color)] transition-colors hover:text-[var(--brand-accent)]"
              >
                {copiedLink ? (
                  <>
                    <Check
                      aria-hidden="true"
                      className="h-3.5 w-3.5 stroke-[1.7] text-[var(--brand-accent)]"
                    />
                    <EditableText
                      as="span"
                      data-preview-field-path="journalArticlePage.copiedLinkLabel"
                      defaultValue={copiedLinkLabel}
                      fontFamily="body"
                      size="0.6875rem"
                      weight={600}
                      transform="uppercase"
                      letterSpacing="0.18em"
                      color="inherit"
                      className="inline"
                    />
                  </>
                ) : (
                  <>
                    <Link2 aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.5]" />
                    <EditableText
                      as="span"
                      data-preview-field-path="journalArticlePage.copyLinkLabel"
                      defaultValue={copyLinkLabel}
                      fontFamily="body"
                      size="0.6875rem"
                      weight={600}
                      transform="uppercase"
                      letterSpacing="0.18em"
                      color="inherit"
                      className="inline"
                    />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-color)] transition-colors hover:text-[var(--heading-color)]"
              >
                <Share2 aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.5]" />
                <EditableText
                  as="span"
                  data-preview-field-path="journalArticlePage.shareLabel"
                  defaultValue={shareLabel}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.18em"
                  color="inherit"
                  className="inline"
                />
              </button>
            </div>
          </LuxuryReveal>

          {/* Immersive Framed Editorial Hero Image */}
          <div className="mt-8 sm:mt-10">
            <LuxuryImageReveal tone="beige" className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--loome-beige)]">
              <img
                src={withBasePath(resolvedArticle.imageUrl)}
                alt={resolvedArticle.title}
                data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].imageUrl`}
                data-preview-style-target={`home.journalPosts[${resolvedArticle.index}].imageUrl`}
                data-preview-style-type="image"
                className="h-full w-full object-cover"
              />
            </LuxuryImageReveal>
          </div>

          {/* Editorial Essay Body */}
          <LuxuryReveal delay={0.08} className="mx-auto mt-10 max-w-[68ch]">
            <EditableText
              as="p"
              data-preview-field-path={`home.journalPosts[${resolvedArticle.index}].body`}
              defaultValue={resolvedArticle.body}
              fontFamily="body"
              size="1rem"
              weight={400}
              lineHeight={1.88}
              color="body"
              className="m-0 whitespace-pre-line text-[var(--page-text)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-heading first-letter:text-4xl first-letter:font-extrabold first-letter:leading-none first-letter:text-[var(--brand-accent)]"
            />

            {/* Subtle Editorial Signoff & Navigation */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--loome-border)] pt-6">
              <button
                type="button"
                onClick={() => window.location.assign(backToJournalHref)}
                data-target-page={hasJournalPage ? 'journal' : undefined}
                className="group inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--heading-color)] transition-colors hover:text-[var(--brand-accent)]"
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:-translate-x-1"
                />
                <EditableText
                  as="span"
                  data-preview-field-path="journalArticlePage.backToJournalLabel"
                  defaultValue={backToJournalLabel}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.18em"
                  color="inherit"
                  className="inline"
                />
              </button>

              {hasShopPage ? (
                <button
                  type="button"
                  onClick={() => window.location.assign(withBasePath('/shop/'))}
                  data-target-page="shop"
                  className="group inline-flex cursor-pointer items-center gap-2 border-0 border-b border-[var(--brand-accent)] bg-transparent px-0 pb-1 pt-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)] transition-colors hover:text-[var(--heading-color)]"
                >
                  <EditableText
                    as="span"
                    data-preview-field-path="journalArticlePage.shopCtaLabel"
                    defaultValue={shopCtaLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.18em"
                    color="inherit"
                    className="inline"
                  />
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              ) : (
                <span
                  data-target-page="shop"
                  data-preview-field-path="journalArticlePage.shopCtaLabel"
                  className="unavailable inline-flex items-center gap-2 border-b border-[var(--brand-accent)] pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]"
                >
                  {shopCtaLabel}
                </span>
              )}
            </div>
          </LuxuryReveal>
        </article>
      )}

      {/* Continue Reading — Related Essays (always mounted so section headings stay editable in Fivora empty-state) */}
      <section className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-12 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <LuxuryReveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <EditableText
                as="p"
                data-preview-field-path="journalArticlePage.relatedEyebrow"
                defaultValue={relatedEyebrow}
                fontFamily="body"
                size="0.65625rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.24em"
                color="primary"
                className="m-0"
              />
              <EditableText
                as="h2"
                data-preview-field-path="journalArticlePage.relatedHeading"
                defaultValue={relatedHeading}
                fontFamily="heading"
                size="clamp(1.6rem, 2.5vw, 2.1rem)"
                weight={800}
                lineHeight={1.15}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-2 mb-0"
              />
            </div>

            <button
              type="button"
              onClick={() => window.location.assign(backToJournalHref)}
              data-target-page={hasJournalPage ? 'journal' : undefined}
              className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--heading-color)] transition-colors hover:text-[var(--brand-accent)]"
            >
              <EditableText
                as="span"
                data-preview-field-path="journalArticlePage.viewArchiveLabel"
                defaultValue={viewArchiveLabel}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.18em"
                color="inherit"
                className="inline"
              />
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.6]" />
            </button>
          </LuxuryReveal>

          {relatedPosts.length > 0 && (
            <LuxuryStagger className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedPosts.map((rel) => (
                <LuxuryStaggerItem key={rel.id}>
                  <article
                    data-preview-item-path={`home.journalPosts[${rel.index}]`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-3.5 transition-all duration-300 hover:border-[var(--brand-accent)]/70"
                  >
                    <div
                      onClick={() => window.location.assign(journalArticleHref(rel.id))}
                      className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl bg-[var(--loome-beige)]"
                    >
                      <img
                        src={withBasePath(rel.imageUrl)}
                        alt={rel.title}
                        loading="lazy"
                        data-preview-field-path={`home.journalPosts[${rel.index}].imageUrl`}
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-luxury group-hover:scale-[1.045]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
                        <EditableText
                          as="span"
                          data-preview-field-path={`home.journalPosts[${rel.index}].category`}
                          defaultValue={rel.category}
                          fontFamily="body"
                          size="0.625rem"
                          weight={600}
                          transform="uppercase"
                          letterSpacing="0.18em"
                          color="primary"
                          className="inline"
                        />
                        <EditableText
                          as="span"
                          data-preview-field-path={`home.journalPosts[${rel.index}].date`}
                          defaultValue={rel.date}
                          fontFamily="body"
                          size="0.625rem"
                          weight={500}
                          transform="uppercase"
                          letterSpacing="0.18em"
                          color="muted"
                          className="inline"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => window.location.assign(journalArticleHref(rel.id))}
                        className="mt-2 block w-full border-0 bg-transparent p-0 text-left text-[var(--heading-color)] transition-colors hover:text-[var(--brand-accent)]"
                      >
                        <EditableText
                          as="h3"
                          data-preview-field-path={`home.journalPosts[${rel.index}].title`}
                          defaultValue={rel.title}
                          fontFamily="heading"
                          size="1.15rem"
                          weight={700}
                          lineHeight={1.28}
                          color="inherit"
                          className="m-0"
                        />
                      </button>

                      <div className="mt-auto pt-4">
                        <button
                          type="button"
                          onClick={() => window.location.assign(journalArticleHref(rel.id))}
                          className="inline-flex cursor-pointer items-center gap-1.5 border-0 border-b border-[var(--loome-border)] bg-transparent px-0 pb-1 pt-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--heading-color)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                        >
                          <EditableText
                            as="span"
                            data-preview-field-path="journalPage.readStoryLabel"
                            defaultValue={readStoryLabel}
                            fontFamily="body"
                            size="0.6875rem"
                            weight={600}
                            transform="uppercase"
                            letterSpacing="0.18em"
                            color="inherit"
                            className="inline"
                          />
                          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.6]" />
                        </button>
                      </div>
                    </div>
                  </article>
                </LuxuryStaggerItem>
              ))}
            </LuxuryStagger>
          )}
        </div>
      </section>
    </div>
  );
}
