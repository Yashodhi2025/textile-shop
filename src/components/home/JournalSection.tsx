'use client';

import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { journalArticleHref, normalizeJournalArticles } from '@/lib/journalHelpers';
import { withBasePath } from '@/lib/utils';
import {
  LuxuryImageReveal,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

export default function JournalSection() {
  const siteData = useSiteData();
  const content = contentObject(siteData.content);
  const home = contentObject(content.home);
  const journalPage = contentObject(content.journalPage);
  const allPosts = normalizeJournalArticles(home.journalPosts);
  const featuredThree = allPosts.slice(0, 3);

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

  const exploreJournalLabel =
    contentText(home.journalExploreLabel) || 'Explore the Journal';
  const readStoryLabel = contentText(journalPage.readStoryLabel) || 'Read Story';

  return (
    <section
      id="journal"
      data-design-section="home-journal"
      className="loome-surface-ivory w-full py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        <LuxuryReveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <EditableText
              as="p"
              data-preview-field-path="home.journalEyebrow"
              defaultValue={contentText(home.journalEyebrow) || 'THE LOOMÉ JOURNAL'}
              fontFamily="body"
              size="0.6875rem"
              weight={600}
              transform="uppercase"
              letterSpacing="0.24em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              data-preview-field-path="home.journalHeading"
              defaultValue={contentText(home.journalHeading) || 'Notes on Material & Light'}
              fontFamily="heading"
              size="clamp(1.85rem, 3vw, 2.45rem)"
              weight={800}
              lineHeight={1.08}
              letterSpacing="-0.025em"
              color="heading"
              className="mt-2 mb-0"
            />
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <EditableText
              as="p"
              data-preview-field-path="home.journalSummary"
              defaultValue={contentText(home.journalSummary)}
              fontFamily="body"
              size="0.9375rem"
              lineHeight={1.7}
              color="muted"
              className="m-0 max-w-md md:text-right"
            />
            {hasJournalPage ? (
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath('/journal/'))}
                data-target-page="journal"
                className="group inline-flex cursor-pointer items-center gap-2 rounded-[11px] border border-[var(--loome-border)] bg-[var(--card-bg)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--heading-color)] transition-all hover:border-[var(--loome-btn-primary-bg)] hover:bg-[var(--loome-btn-primary-bg)] hover:text-[var(--loome-btn-primary-text)]"
              >
                <EditableText
                  as="span"
                  data-preview-field-path="home.journalExploreLabel"
                  defaultValue={exploreJournalLabel}
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
                data-target-page="journal"
                data-preview-field-path="home.journalExploreLabel"
                className="unavailable inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--heading-color)]"
              >
                {exploreJournalLabel}
              </span>
            )}
          </div>
        </LuxuryReveal>

        {/* Always-mounted list container for Fivora strict validation */}
        <div data-preview-list-path="home.journalPosts" className="mt-9">
          {featuredThree.length === 0 ? (
            <div
              data-preview-static="journal-empty"
              className="rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] py-12 text-center text-sm text-[var(--muted-color)]"
            >
              Add journal essays in your Fivora editor.
            </div>
          ) : (
            <LuxuryStagger className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-7">
              {featuredThree.map((post) => {
                const storyHref = hasJournalPage ? journalArticleHref(post.id) : '#journal';
                return (
                  <LuxuryStaggerItem key={post.id}>
                    <article
                      data-preview-item-path={`home.journalPosts[${post.index}]`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-3.5 shadow-[0_2px_10px_rgba(73,56,44,0.04)] transition-all duration-300 hover:border-[var(--brand-accent)] dark:shadow-none"
                    >
                      <div
                        onClick={() => {
                          if (hasJournalPage) window.location.assign(storyHref);
                        }}
                        className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[12px] bg-[var(--loome-beige)]"
                      >
                        <LuxuryImageReveal
                          delay={Math.min(post.index * 0.1, 0.24)}
                          tone="ivory"
                          className="h-full w-full"
                        >
                          <img
                            src={withBasePath(post.imageUrl)}
                            alt={post.title}
                            loading="lazy"
                            data-preview-field-path={`home.journalPosts[${post.index}].imageUrl`}
                            data-preview-style-target={`home.journalPosts[${post.index}].imageUrl`}
                            data-preview-style-type="image"
                            className="h-full w-full object-cover transition-transform duration-[950ms] ease-luxury group-hover:scale-[1.045]"
                          />
                        </LuxuryImageReveal>
                      </div>

                      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                          <EditableText
                            as="span"
                            data-preview-field-path={`home.journalPosts[${post.index}].category`}
                            defaultValue={post.category}
                            fontFamily="body"
                            size="0.625rem"
                            weight={600}
                            transform="uppercase"
                            letterSpacing="0.2em"
                            color="inherit"
                            className="inline"
                          />
                          <span className="inline-flex items-center gap-1 text-[var(--muted-color)]">
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

                        <button
                          type="button"
                          onClick={() => {
                            if (hasJournalPage) window.location.assign(storyHref);
                          }}
                          className="mt-2.5 block w-full border-0 bg-transparent p-0 text-left text-[var(--heading-color)] transition-colors hover:text-[var(--brand-accent)]"
                        >
                          <EditableText
                            as="h3"
                            data-preview-field-path={`home.journalPosts[${post.index}].title`}
                            defaultValue={post.title}
                            fontFamily="heading"
                            size="1.15rem"
                            weight={700}
                            lineHeight={1.28}
                            letterSpacing="-0.015em"
                            color="inherit"
                            className="m-0"
                          />
                        </button>

                        <EditableText
                          as="p"
                          data-preview-field-path={`home.journalPosts[${post.index}].excerpt`}
                          defaultValue={post.excerpt}
                          fontFamily="body"
                          size="0.8625rem"
                          lineHeight={1.68}
                          color="muted"
                          className="mt-2 mb-0"
                        />

                        <div className="mt-auto pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (hasJournalPage) window.location.assign(storyHref);
                            }}
                            data-target-page={hasJournalPage ? 'journal' : undefined}
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
                            <ArrowUpRight
                              aria-hidden="true"
                              className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  </LuxuryStaggerItem>
                );
              })}
            </LuxuryStagger>
          )}
        </div>
      </div>
    </section>
  );
}
