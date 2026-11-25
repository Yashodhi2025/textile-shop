'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import {
  journalArticleHref,
  normalizeJournalArticles,
  normalizeJournalCategories,
  resolveArticleCategoryKey,
  slugifyJournalCategory,
} from '@/lib/journalHelpers';
import { withBasePath } from '@/lib/utils';
import {
  LUXURY_EASE,
  LuxuryHairline,
  LuxuryImageReveal,
  LuxuryReveal,
} from '@/components/motion/LuxuryReveal';

export default function JournalIndexView() {
  const siteData = useSiteData();
  const prefersReducedMotion = useReducedMotion();

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const home = contentObject(content.home);
  const journalPage = contentObject(content.journalPage);

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
  const hasShopPage = requiredPages.includes('shop');

  const allPosts = useMemo(
    () => normalizeJournalArticles(home.journalPosts),
    [home.journalPosts],
  );

  const configuredCategories = useMemo(
    () => normalizeJournalCategories(journalPage.categories),
    [journalPage.categories],
  );

  // Include any ad-hoc category added on an individual article that doesn't map to a configured filter
  const extraPostCategories = useMemo(() => {
    const knownKeys = new Set(configuredCategories.map((c) => c.id.toLowerCase()));
    const seenExtra = new Map<string, { key: string; label: string; postIndex: number }>();

    allPosts.forEach((post) => {
      const resolvedKey = resolveArticleCategoryKey(post, configuredCategories);
      const lowerKey = resolvedKey.toLowerCase();
      if (lowerKey && !knownKeys.has(lowerKey) && !seenExtra.has(lowerKey)) {
        seenExtra.set(lowerKey, {
          key: resolvedKey,
          label: post.category,
          postIndex: post.index,
        });
      }
    });

    return Array.from(seenExtra.values());
  }, [allPosts, configuredCategories]);

  // Track stable category ID so renaming any category display label never breaks active filtering
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('all');

  const validCategoryKeys = useMemo(() => {
    const keys = new Set<string>(['all']);
    configuredCategories.forEach((c) => keys.add(c.id.toLowerCase()));
    extraPostCategories.forEach((c) => keys.add(c.key.toLowerCase()));
    return keys;
  }, [configuredCategories, extraPostCategories]);

  const effectiveCategoryKey = validCategoryKeys.has(activeCategoryKey.toLowerCase())
    ? activeCategoryKey
    : 'all';

  const filteredPosts = useMemo(() => {
    if (effectiveCategoryKey === 'all') return allPosts;
    const targetKey = effectiveCategoryKey.toLowerCase();
    return allPosts.filter((post) => {
      const postKey = resolveArticleCategoryKey(post, configuredCategories).toLowerCase();
      return (
        postKey === targetKey ||
        slugifyJournalCategory(post.category) === targetKey
      );
    });
  }, [allPosts, configuredCategories, effectiveCategoryKey]);

  const featuredPost = filteredPosts[0] ?? null;
  const gridPosts = filteredPosts.slice(1);

  // Editable page copy
  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const journalNavLabel = contentText(navLabels.journal) || 'Journal';
  const eyebrow =
    contentText(journalPage.eyebrow) ||
    contentText(home.journalEyebrow) ||
    'THE LOOMÉ JOURNAL';
  const heading =
    contentText(journalPage.heading) ||
    contentText(home.journalHeading) ||
    'Journal & Inspiration';
  const intro =
    contentText(journalPage.intro) ||
    contentText(home.journalSummary) ||
    'Editorial essays on architectural drapery, natural linen care, heritage weaving mills, and the quiet craft of sustainable interiors.';
  const allStoriesLabel = contentText(journalPage.allStoriesLabel) || 'All Stories';
  const essaysLabel = contentText(journalPage.essaysLabel) || 'Essays';
  const essaySingularLabel = contentText(journalPage.essaySingularLabel) || 'Essay';
  const featuredStoryLabel = contentText(journalPage.featuredStoryLabel) || 'Featured Story';
  const authorPrefixLabel = contentText(journalPage.authorPrefixLabel) || 'By';
  const readStoryLabel = contentText(journalPage.readStoryLabel) || 'Read Story';
  const archiveEyebrow = contentText(journalPage.archiveEyebrow) || 'Curated Essays';
  const archiveHeading =
    contentText(journalPage.archiveHeading) || 'From the Atelier Archive';
  const shopBannerEyebrow =
    contentText(journalPage.shopBannerEyebrow) || 'Experience the Weaves';
  const shopBannerHeading =
    contentText(journalPage.shopBannerHeading) ||
    'Bring European Flax & Natural Textiles Home';
  const shopBannerCtaLabel =
    contentText(journalPage.shopBannerCtaLabel) || 'Explore the Shop';

  return (
    <div
      data-preview-page-key="journal"
      className="loome-surface-cream min-h-[75vh] w-full"
    >
      {/* Editorial Breadcrumb Strip */}
      <div className="border-b border-[#201C1A]/8 bg-[#FAF5EE]/95 dark:border-[#F2E9DE]/10 dark:bg-[#201C1A]">
        <nav className="mx-auto flex max-w-[1380px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6] sm:px-8 lg:px-14">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] transition-colors hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" className="text-[#C8A98B]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.journal"
            className="font-medium text-[#201C1A] dark:text-[#F2E9DE]"
          >
            {journalNavLabel}
          </span>
        </nav>
      </div>

      {/* Magazine Editorial Hero */}
      <section
        data-design-section="journal-hero"
        className="border-b border-[#201C1A]/8 bg-gradient-to-b from-[#E6D9C9]/85 via-[#F2E9DE] to-[#F2E9DE] dark:border-[#F2E9DE]/10 dark:from-[#2B2320] dark:via-[#201C1A] dark:to-[#201C1A]"
      >
        <div className="mx-auto max-w-[1380px] px-4 py-10 sm:px-8 sm:py-14 lg:px-14 lg:py-16">
          <LuxuryReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-9 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="journalPage.eyebrow"
                  defaultValue={eyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.28em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h1"
                data-preview-field-path="journalPage.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(2.65rem, 5vw, 4.4rem)"
                weight={300}
                lineHeight={1.03}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-3.5 mb-0"
              />
            </div>

            <div className="max-w-md lg:text-right">
              <EditableText
                as="p"
                data-preview-field-path="journalPage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.8}
                color="muted"
                className="m-0"
              />
            </div>
          </LuxuryReveal>

          {/* Editorial Category Navigation Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#201C1A]/10 pt-5 dark:border-[#F2E9DE]/10">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategoryKey('all')}
                aria-pressed={effectiveCategoryKey === 'all'}
                className={`rounded-[10px] border px-3.5 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${effectiveCategoryKey === 'all'
                  ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                  : 'border-[#201C1A]/15 bg-transparent text-[#5E4E45] hover:border-[#C8A98B] hover:text-[#201C1A] dark:border-[#F2E9DE]/18 dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]'
                  }`}
              >
                <EditableText
                  as="span"
                  data-preview-field-path="journalPage.allStoriesLabel"
                  defaultValue={allStoriesLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
              </button>

              <div data-preview-list-path="journalPage.categories" className="contents">
                {configuredCategories.map((cat) => {
                  const isActive = effectiveCategoryKey.toLowerCase() === cat.id.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      data-preview-item-path={`journalPage.categories[${cat.index}]`}
                      onClick={() => setActiveCategoryKey(cat.id)}
                      aria-pressed={isActive}
                      className={`rounded-[10px] border px-3.5 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${isActive
                        ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                        : 'border-[#201C1A]/15 bg-transparent text-[#5E4E45] hover:border-[#C8A98B] hover:text-[#201C1A] dark:border-[#F2E9DE]/18 dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]'
                        }`}
                    >
                      <EditableText
                        as="span"
                        data-preview-field-path={`journalPage.categories[${cat.index}].label`}
                        defaultValue={cat.label}
                        fontFamily="body"
                        size="0.65625rem"
                        weight={500}
                        transform="uppercase"
                        letterSpacing="0.2em"
                        color="inherit"
                        className="inline"
                      />
                    </button>
                  );
                })}
              </div>

              {extraPostCategories.map((extra) => {
                const isActive = effectiveCategoryKey.toLowerCase() === extra.key.toLowerCase();
                return (
                  <button
                    key={extra.key}
                    type="button"
                    onClick={() => setActiveCategoryKey(extra.key)}
                    aria-pressed={isActive}
                    className={`rounded-[10px] border px-3.5 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${isActive
                      ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                      : 'border-[#201C1A]/15 bg-transparent text-[#5E4E45] hover:border-[#C8A98B] hover:text-[#201C1A] dark:border-[#F2E9DE]/18 dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]'
                      }`}
                  >
                    <EditableText
                      as="span"
                      data-preview-field-path={`home.journalPosts[${extra.postIndex}].category`}
                      defaultValue={extra.label}
                      fontFamily="body"
                      size="0.65625rem"
                      weight={500}
                      transform="uppercase"
                      letterSpacing="0.2em"
                      color="inherit"
                      className="inline"
                    />
                  </button>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6]">
              <span data-preview-static="journal-story-count-number" className="tabular-nums">
                {filteredPosts.length}
              </span>
              {filteredPosts.length === 1 ? (
                <EditableText
                  as="span"
                  data-preview-field-path="journalPage.essaySingularLabel"
                  defaultValue={essaySingularLabel}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
              ) : (
                <EditableText
                  as="span"
                  data-preview-field-path="journalPage.essaysLabel"
                  defaultValue={essaysLabel}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Editorial Magazine Feed */}
      <section
        data-design-section="journal-feed"
        className="mx-auto max-w-[1380px] px-4 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20"
      >
        <div data-preview-list-path="home.journalPosts">
          {filteredPosts.length === 0 ? (
            <div className="space-y-12">
              <div className="flex items-end justify-between gap-4 border-b border-[#201C1A]/10 pb-4 dark:border-[#F2E9DE]/10">
                <div>
                  <EditableText
                    as="p"
                    data-preview-field-path="journalPage.archiveEyebrow"
                    defaultValue={archiveEyebrow}
                    fontFamily="body"
                    size="0.65625rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.26em"
                    color="primary"
                    className="m-0"
                  />
                  <EditableText
                    as="h2"
                    data-preview-field-path="journalPage.archiveHeading"
                    defaultValue={archiveHeading}
                    fontFamily="heading"
                    size="1.875rem"
                    weight={300}
                    lineHeight={1.2}
                    letterSpacing="-0.015em"
                    color="heading"
                    className="mt-1.5 mb-0"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-[#201C1A]/20 px-6 py-16 text-center dark:border-[#F2E9DE]/20">
                <p
                  data-preview-static="journal-page-empty"
                  className="m-0 text-sm text-[#5E4E45] dark:text-[#C7B6A6]"
                >
                  {allPosts.length === 0
                    ? 'Add journal stories in your Fivora editor to populate this editorial archive.'
                    : 'No stories currently belong to this category.'}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[10.5px] uppercase tracking-[0.2em] text-[#8D7667] dark:text-[#C8A98B]">
                  <EditableText
                    as="span"
                    data-preview-field-path="journalPage.featuredStoryLabel"
                    defaultValue={featuredStoryLabel}
                    fontFamily="body"
                    size="0.65625rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.2em"
                    color="inherit"
                    className="inline border border-[#201C1A]/12 px-2.5 py-1 dark:border-[#F2E9DE]/12"
                  />
                  <span aria-hidden="true" className="text-[#C8A98B]">
                    ·
                  </span>
                  <EditableText
                    as="span"
                    data-preview-field-path="journalPage.authorPrefixLabel"
                    defaultValue={authorPrefixLabel}
                    fontFamily="body"
                    size="0.65625rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.2em"
                    color="inherit"
                    className="inline"
                  />
                  <span aria-hidden="true" className="text-[#C8A98B]">
                    ·
                  </span>
                  <EditableText
                    as="span"
                    data-preview-field-path="journalPage.readStoryLabel"
                    defaultValue={readStoryLabel}
                    fontFamily="body"
                    size="0.65625rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.2em"
                    color="inherit"
                    className="inline border-b border-[#201C1A]/25 pb-0.5 dark:border-[#F2E9DE]/25"
                  />
                </div>

                {allPosts.length > 0 && effectiveCategoryKey !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveCategoryKey('all')}
                    className="mt-6 inline-flex items-center border border-[#201C1A]/25 bg-transparent px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#201C1A] transition-colors hover:border-[#C8A98B] hover:text-[#8D7667] dark:border-[#F2E9DE]/25 dark:text-[#F2E9DE]"
                  >
                    <EditableText
                      as="span"
                      data-preview-field-path="journalPage.allStoriesLabel"
                      defaultValue={allStoriesLabel}
                      fontFamily="body"
                      size="0.65625rem"
                      weight={500}
                      transform="uppercase"
                      letterSpacing="0.2em"
                      color="inherit"
                      className="inline"
                    />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-16 lg:space-y-20">
              {/* 1. Large Immersive Featured Story */}
              {featuredPost && (
                <LuxuryReveal>
                  <article
                    data-preview-item-path={`home.journalPosts[${featuredPost.index}]`}
                    className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-[#3B302B]/14 bg-[#FAF5EE] shadow-[0_14px_40px_rgba(32,28,26,0.05)] dark:border-[#C8A98B]/20 dark:bg-[#2A221F] lg:grid-cols-12"
                  >
                    <div
                      onClick={() => window.location.assign(journalArticleHref(featuredPost.id))}
                      className="relative block aspect-[16/11] w-full cursor-pointer overflow-hidden bg-[#E6D9C9]/60 lg:col-span-7 lg:aspect-auto lg:min-h-[480px]"
                    >
                      <LuxuryImageReveal tone="beige" className="h-full w-full">
                        <img
                          src={withBasePath(featuredPost.imageUrl)}
                          alt={featuredPost.title}
                          data-preview-field-path={`home.journalPosts[${featuredPost.index}].imageUrl`}
                          className="h-full w-full object-cover transition-transform duration-[950ms] ease-luxury group-hover:scale-[1.05]"
                        />
                      </LuxuryImageReveal>
                      <span
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-5 top-5 z-20 rounded-[9px] border border-[#C8A98B]/35 bg-[#201C1A]/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F2E9DE] backdrop-blur-md"
                      >
                        <EditableText
                          as="span"
                          data-preview-field-path="journalPage.featuredStoryLabel"
                          defaultValue={featuredStoryLabel}
                          fontFamily="body"
                          size="0.625rem"
                          weight={500}
                          transform="uppercase"
                          letterSpacing="0.24em"
                          color="inherit"
                          className="inline"
                        />
                      </span>
                    </div>

                    <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-5 lg:p-12">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#8D7667] dark:text-[#C8A98B]">
                          <EditableText
                            as="span"
                            data-preview-field-path={`home.journalPosts[${featuredPost.index}].category`}
                            defaultValue={featuredPost.category}
                            fontFamily="body"
                            size="0.65625rem"
                            weight={500}
                            transform="uppercase"
                            letterSpacing="0.22em"
                            color="inherit"
                            className="inline"
                          />
                          <span aria-hidden="true" className="text-[#C8A98B]">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#5E4E45] dark:text-[#C7B6A6]">
                            <Calendar aria-hidden="true" className="h-3 w-3 stroke-[1.5]" />
                            <EditableText
                              as="span"
                              data-preview-field-path={`home.journalPosts[${featuredPost.index}].date`}
                              defaultValue={featuredPost.date}
                              fontFamily="body"
                              size="0.65625rem"
                              weight={500}
                              transform="uppercase"
                              letterSpacing="0.22em"
                              color="inherit"
                              className="inline"
                            />
                          </span>
                          <span aria-hidden="true" className="text-[#C8A98B]">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#5E4E45] dark:text-[#C7B6A6]">
                            <Clock aria-hidden="true" className="h-3 w-3 stroke-[1.5]" />
                            <EditableText
                              as="span"
                              data-preview-field-path={`home.journalPosts[${featuredPost.index}].readTime`}
                              defaultValue={featuredPost.readTime}
                              fontFamily="body"
                              size="0.65625rem"
                              weight={500}
                              transform="uppercase"
                              letterSpacing="0.22em"
                              color="inherit"
                              className="inline"
                            />
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => window.location.assign(journalArticleHref(featuredPost.id))}
                          className="mt-4 block w-full border-0 bg-transparent p-0 text-left text-[#201C1A] transition-colors hover:text-[#8D7667] dark:text-[#F2E9DE] dark:hover:text-[#C8A98B]"
                        >
                          <EditableText
                            as="h2"
                            data-preview-field-path={`home.journalPosts[${featuredPost.index}].title`}
                            defaultValue={featuredPost.title}
                            fontFamily="heading"
                            size="clamp(1.95rem, 3.1vw, 2.85rem)"
                            weight={300}
                            lineHeight={1.1}
                            letterSpacing="-0.015em"
                            color="inherit"
                            className="m-0"
                          />
                        </button>

                        <div className="my-5 h-px w-12 bg-[#C8A98B]" aria-hidden="true" />

                        <EditableText
                          as="p"
                          data-preview-field-path={`home.journalPosts[${featuredPost.index}].excerpt`}
                          defaultValue={featuredPost.excerpt}
                          fontFamily="body"
                          size="0.9375rem"
                          lineHeight={1.82}
                          color="muted"
                          className="m-0"
                        />
                      </div>

                      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#201C1A]/10 pt-5 dark:border-[#F2E9DE]/10">
                        <div className="inline-flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#5E4E45] dark:text-[#C7B6A6]">
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
                            data-preview-field-path={`home.journalPosts[${featuredPost.index}].author`}
                            defaultValue={featuredPost.author}
                            fontFamily="body"
                            size="0.6875rem"
                            weight={500}
                            transform="uppercase"
                            letterSpacing="0.18em"
                            color="inherit"
                            className="inline"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => window.location.assign(journalArticleHref(featuredPost.id))}
                          className="inline-flex cursor-pointer items-center gap-2 border-0 border-b border-[#201C1A]/40 bg-transparent px-0 pb-1 pt-0 text-[11px] font-medium uppercase tracking-[0.22em] text-[#201C1A] transition-colors hover:border-[#C8A98B] hover:text-[#8D7667] dark:border-[#F2E9DE]/40 dark:text-[#F2E9DE] dark:hover:text-[#C8A98B]"
                        >
                          <EditableText
                            as="span"
                            data-preview-field-path="journalPage.readStoryLabel"
                            defaultValue={readStoryLabel}
                            fontFamily="body"
                            size="0.6875rem"
                            weight={500}
                            transform="uppercase"
                            letterSpacing="0.22em"
                            color="inherit"
                            className="inline"
                          />
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                </LuxuryReveal>
              )}

              {/* 2. Asymmetric Magazine Editorial Grid */}
              {gridPosts.length > 0 && (
                <div>
                  <div className="mb-10 flex items-end justify-between gap-4 border-b border-[#201C1A]/10 pb-4 dark:border-[#F2E9DE]/10">
                    <div>
                      <EditableText
                        as="p"
                        data-preview-field-path="journalPage.archiveEyebrow"
                        defaultValue={archiveEyebrow}
                        fontFamily="body"
                        size="0.65625rem"
                        weight={500}
                        transform="uppercase"
                        letterSpacing="0.26em"
                        color="primary"
                        className="m-0"
                      />
                      <EditableText
                        as="h2"
                        data-preview-field-path="journalPage.archiveHeading"
                        defaultValue={archiveHeading}
                        fontFamily="heading"
                        size="1.875rem"
                        weight={300}
                        lineHeight={1.2}
                        letterSpacing="-0.015em"
                        color="heading"
                        className="mt-1.5 mb-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12 lg:gap-x-10 lg:gap-y-16">
                    <AnimatePresence mode="popLayout">
                      {gridPosts.map((post, idx) => {
                        // Alternating editorial magazine rhythm: 7/5 then 5/7
                        const rowPair = Math.floor(idx / 2) % 2;
                        const isWide =
                          (rowPair === 0 && idx % 2 === 0) ||
                          (rowPair === 1 && idx % 2 === 1);
                        const colClass = isWide ? 'md:col-span-7' : 'md:col-span-5';
                        const aspectClass = isWide
                          ? 'aspect-[16/10]'
                          : 'aspect-[4/3] md:aspect-[5/4]';

                        return (
                          <motion.div
                            key={post.id}
                            layout={!prefersReducedMotion}
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
                            viewport={{ once: true, amount: 0.12 }}
                            transition={
                              prefersReducedMotion
                                ? { duration: 0 }
                                : {
                                  duration: 0.78,
                                  delay: Math.min(idx * 0.09, 0.27),
                                  ease: LUXURY_EASE,
                                }
                            }
                            className={colClass}
                          >
                            <article
                              data-preview-item-path={`home.journalPosts[${post.index}]`}
                              className="group flex h-full flex-col"
                            >
                              <div
                                onClick={() => window.location.assign(journalArticleHref(post.id))}
                                className={`relative block w-full cursor-pointer overflow-hidden rounded-2xl bg-[#E6D9C9]/60 dark:bg-[#2A221F] ${aspectClass}`}
                              >
                                <LuxuryImageReveal
                                  delay={Math.min(idx * 0.08, 0.24)}
                                  tone="ivory"
                                  className="h-full w-full"
                                >
                                  <img
                                    src={withBasePath(post.imageUrl)}
                                    alt={post.title}
                                    loading="lazy"
                                    data-preview-field-path={`home.journalPosts[${post.index}].imageUrl`}
                                    className="h-full w-full object-cover transition-transform duration-[950ms] ease-luxury group-hover:scale-[1.055]"
                                  />
                                </LuxuryImageReveal>
                              </div>

                              <div className="flex flex-1 flex-col pt-5">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-[0.22em]">
                                  <EditableText
                                    as="span"
                                    data-preview-field-path={`home.journalPosts[${post.index}].category`}
                                    defaultValue={post.category}
                                    fontFamily="body"
                                    size="0.625rem"
                                    weight={500}
                                    transform="uppercase"
                                    letterSpacing="0.22em"
                                    color="primary"
                                    className="inline"
                                  />
                                  <div className="flex flex-wrap items-center gap-2.5 text-[#5E4E45] dark:text-[#C7B6A6]">
                                    <EditableText
                                      as="span"
                                      data-preview-field-path={`home.journalPosts[${post.index}].date`}
                                      defaultValue={post.date}
                                      fontFamily="body"
                                      size="0.625rem"
                                      weight={500}
                                      transform="uppercase"
                                      letterSpacing="0.2em"
                                      color="inherit"
                                      className="inline"
                                    />
                                    <span aria-hidden="true" className="text-[#C8A98B]">
                                      ·
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Clock aria-hidden="true" className="h-3 w-3 stroke-[1.5]" />
                                      <EditableText
                                        as="span"
                                        data-preview-field-path={`home.journalPosts[${post.index}].readTime`}
                                        defaultValue={post.readTime}
                                        fontFamily="body"
                                        size="0.625rem"
                                        weight={500}
                                        transform="uppercase"
                                        letterSpacing="0.2em"
                                        color="inherit"
                                        className="inline"
                                      />
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => window.location.assign(journalArticleHref(post.id))}
                                  className="mt-3 block w-full border-0 bg-transparent p-0 text-left text-[#201C1A] transition-colors hover:text-[#8D7667] dark:text-[#F2E9DE] dark:hover:text-[#C8A98B]"
                                >
                                  <EditableText
                                    as="h3"
                                    data-preview-field-path={`home.journalPosts[${post.index}].title`}
                                    defaultValue={post.title}
                                    fontFamily="heading"
                                    size={isWide ? 'clamp(1.65rem, 2.3vw, 2.15rem)' : '1.65rem'}
                                    weight={400}
                                    lineHeight={1.18}
                                    letterSpacing="-0.01em"
                                    color="inherit"
                                    className="m-0"
                                  />
                                </button>

                                <EditableText
                                  as="p"
                                  data-preview-field-path={`home.journalPosts[${post.index}].excerpt`}
                                  defaultValue={post.excerpt}
                                  fontFamily="body"
                                  size="0.875rem"
                                  lineHeight={1.76}
                                  color="muted"
                                  className="mt-2.5 mb-0 max-w-xl"
                                />

                                <div className="mt-auto pt-5">
                                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#201C1A]/8 pt-4 dark:border-[#F2E9DE]/10">
                                    <div className="inline-flex flex-wrap items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[#5E4E45] dark:text-[#C7B6A6]">
                                      <EditableText
                                        as="span"
                                        data-preview-field-path="journalPage.authorPrefixLabel"
                                        defaultValue={authorPrefixLabel}
                                        fontFamily="body"
                                        size="0.65625rem"
                                        weight={500}
                                        transform="uppercase"
                                        letterSpacing="0.18em"
                                        color="inherit"
                                        className="inline"
                                      />
                                      <EditableText
                                        as="span"
                                        data-preview-field-path={`home.journalPosts[${post.index}].author`}
                                        defaultValue={post.author}
                                        fontFamily="body"
                                        size="0.65625rem"
                                        weight={500}
                                        transform="uppercase"
                                        letterSpacing="0.18em"
                                        color="inherit"
                                        className="inline"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => window.location.assign(journalArticleHref(post.id))}
                                      className="inline-flex cursor-pointer items-center gap-1.5 border-0 border-b border-[#201C1A]/30 bg-transparent px-0 pb-1 pt-0 text-[11px] font-medium uppercase tracking-[0.2em] text-[#201C1A] transition-colors hover:border-[#C8A98B] hover:text-[#8D7667] dark:border-[#F2E9DE]/30 dark:text-[#F2E9DE] dark:hover:text-[#C8A98B]"
                                    >
                                      <EditableText
                                        as="span"
                                        data-preview-field-path="journalPage.readStoryLabel"
                                        defaultValue={readStoryLabel}
                                        fontFamily="body"
                                        size="0.6875rem"
                                        weight={500}
                                        transform="uppercase"
                                        letterSpacing="0.2em"
                                        color="inherit"
                                        className="inline"
                                      />
                                      <ArrowUpRight
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </article>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Subtle Editorial Material Invitation */}
      <section className="border-t border-[#201C1A]/8 bg-[#E6D9C9]/65 py-14 dark:border-[#F2E9DE]/10 dark:bg-[#1C1F19]">
        <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-6 px-4 text-center sm:px-8 md:flex-row md:text-left lg:px-14">
          <div>
            <EditableText
              as="p"
              data-preview-field-path="journalPage.shopBannerEyebrow"
              defaultValue={shopBannerEyebrow}
              fontFamily="body"
              size="0.65625rem"
              weight={500}
              transform="uppercase"
              letterSpacing="0.26em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="journalPage.shopBannerHeading"
              defaultValue={shopBannerHeading}
              fontFamily="heading"
              size="1.875rem"
              weight={300}
              lineHeight={1.2}
              color="heading"
              className="mt-2 mb-0"
            />
          </div>

          {hasShopPage ? (
            <button
              type="button"
              onClick={() => window.location.assign(withBasePath('/shop/'))}
              data-target-page="shop"
              className="group loome-btn-primary shrink-0 cursor-pointer"
            >
              <EditableText
                as="span"
                data-preview-field-path="journalPage.shopBannerCtaLabel"
                defaultValue={shopBannerCtaLabel}
                fontFamily="body"
                size="0.75rem"
                weight={500}
                transform="uppercase"
                letterSpacing="0.2em"
                color="inherit"
                className="inline"
              />
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          ) : (
            <span
              data-target-page="shop"
              data-preview-field-path="journalPage.shopBannerCtaLabel"
              className="unavailable loome-btn-primary shrink-0"
            >
              {shopBannerCtaLabel}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
