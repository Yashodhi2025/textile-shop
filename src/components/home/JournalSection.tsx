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
      className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 sm:py-20 lg:px-14 lg:py-24"
    >
      <LuxuryReveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <EditableText
            as="p"
            data-preview-field-path="home.journalEyebrow"
            defaultValue={contentText(home.journalEyebrow) || 'THE LOOMÉ JOURNAL'}
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
            data-preview-field-path="home.journalHeading"
            defaultValue={contentText(home.journalHeading) || 'Notes on Material & Light'}
            fontFamily="heading"
            size="clamp(2.35rem, 4.2vw, 3.5rem)"
            weight={300}
            lineHeight={1.06}
            letterSpacing="-0.02em"
            color="heading"
            className="mt-3 mb-0"
          />
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <EditableText
            as="p"
            data-preview-field-path="home.journalSummary"
            defaultValue={contentText(home.journalSummary)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.75}
            color="muted"
            className="m-0 max-w-md md:text-right"
          />
          {hasJournalPage ? (
            <button
              type="button"
              onClick={() => window.location.assign(withBasePath('/journal/'))}
              data-target-page="journal"
              className="group inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.22em] text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
            >
              <EditableText
                as="span"
                data-preview-field-path="home.journalExploreLabel"
                defaultValue={exploreJournalLabel}
                fontFamily="body"
                size="0.6875rem"
                weight={500}
                transform="uppercase"
                letterSpacing="0.22em"
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
              data-target-page="journal"
              data-preview-field-path="home.journalExploreLabel"
              className="unavailable inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#262923]"
            >
              {exploreJournalLabel}
            </span>
          )}
        </div>
      </LuxuryReveal>

      {/* Always-mounted list container for Fivora strict validation */}
      <div data-preview-list-path="home.journalPosts" className="mt-14">
        {featuredThree.length === 0 ? (
          <div
            data-preview-static="journal-empty"
            className="border border-dashed border-[#262923]/20 py-14 text-center text-sm text-[#65685E]"
          >
            Add journal essays in your Fivora editor.
          </div>
        ) : (
          <LuxuryStagger className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
            {featuredThree.map((post) => {
              const storyHref = hasJournalPage ? journalArticleHref(post.id) : '#journal';
              return (
                <LuxuryStaggerItem key={post.id}>
                  <article
                    data-preview-item-path={`home.journalPosts[${post.index}]`}
                    className="group flex h-full flex-col"
                  >
                    <div
                      onClick={() => {
                        if (hasJournalPage) window.location.assign(storyHref);
                      }}
                      className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#E8E0D5]/60"
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
                          className="h-full w-full object-cover transition-transform duration-[950ms] ease-luxury group-hover:scale-[1.055]"
                        />
                      </LuxuryImageReveal>
                    </div>

                    <div className="flex flex-1 flex-col pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#747B65] dark:text-[#B59B79]">
                        <EditableText
                          as="span"
                          data-preview-field-path={`home.journalPosts[${post.index}].category`}
                          defaultValue={post.category}
                          fontFamily="body"
                          size="0.625rem"
                          weight={500}
                          transform="uppercase"
                          letterSpacing="0.22em"
                          color="inherit"
                          className="inline"
                        />
                        <span className="inline-flex items-center gap-1 text-[#65685E] dark:text-[#B6B8AE]">
                          <Clock aria-hidden="true" className="h-3 w-3 stroke-[1.5]" />
                          <EditableText
                            as="span"
                            data-preview-field-path={`home.journalPosts[${post.index}].readTime`}
                            defaultValue={post.readTime}
                            fontFamily="body"
                            size="0.625rem"
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
                        onClick={() => {
                          if (hasJournalPage) window.location.assign(storyHref);
                        }}
                        className="mt-3 block w-full border-0 bg-transparent p-0 text-left text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
                      >
                        <EditableText
                          as="h3"
                          data-preview-field-path={`home.journalPosts[${post.index}].title`}
                          defaultValue={post.title}
                          fontFamily="heading"
                          size="1.625rem"
                          weight={400}
                          lineHeight={1.22}
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
                        lineHeight={1.72}
                        color="muted"
                        className="mt-2.5 mb-0"
                      />

                      <div className="mt-auto pt-5">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasJournalPage) window.location.assign(storyHref);
                          }}
                          data-target-page={hasJournalPage ? 'journal' : undefined}
                          className="inline-flex cursor-pointer items-center gap-1.5 border-0 border-b border-[#262923]/30 bg-transparent px-0 pb-1 pt-0 text-[11px] font-medium uppercase tracking-[0.2em] text-[#262923] transition-colors hover:border-[#B59B79] hover:text-[#747B65] dark:border-[#F8F6F1]/30 dark:text-[#F8F6F1]"
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
                  </article>
                </LuxuryStaggerItem>
              );
            })}
          </LuxuryStagger>
        )}
      </div>
    </section>
  );
}
