'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Clock, X } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import {
  LUXURY_EASE,
  LuxuryImageReveal,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

interface JournalArticle {
  index: number;
  id: string;
  category: string;
  readTime: string;
  title: string;
  excerpt: string;
  body: string;
  imageUrl: string;
}

export default function JournalSection() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData.content).home);
  const rawPosts = contentList(home.journalPosts);

  const posts: JournalArticle[] = rawPosts.map((raw, idx) => {
    const obj = contentObject(raw);
    return {
      index: idx,
      id: contentText(obj.id) || `journal-${idx}`,
      category: contentText(obj.category) || 'Atelier Note',
      readTime: contentText(obj.readTime) || '4 min read',
      title: contentText(obj.title) || 'Material & Light',
      excerpt: contentText(obj.excerpt),
      body: contentText(obj.body) || contentText(obj.excerpt),
      imageUrl: contentText(obj.imageUrl) || '/images/cat-fabrics.jpg',
    };
  });

  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);

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
        <EditableText
          as="p"
          data-preview-field-path="home.journalSummary"
          defaultValue={contentText(home.journalSummary)}
          fontFamily="body"
          size="0.9375rem"
          lineHeight={1.75}
          color="muted"
          className="m-0 max-w-md"
        />
      </LuxuryReveal>

      {/* Always-mounted list container for Fivora strict validation */}
      <div data-preview-list-path="home.journalPosts" className="mt-14">
        {posts.length === 0 ? (
          <div
            data-preview-static="journal-empty"
            className="border border-dashed border-[#262923]/20 py-14 text-center text-sm text-[#65685E]"
          >
            Add journal essays in your Fivora editor.
          </div>
        ) : (
          <LuxuryStagger className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
            {posts.map((post) => (
              <LuxuryStaggerItem key={post.id}>
                <article
                  data-preview-item-path={`home.journalPosts[${post.index}]`}
                  className="group flex h-full flex-col"
                >
                  <button
                    type="button"
                    onClick={() => setActiveArticle(post)}
                    className="relative aspect-[4/3] w-full overflow-hidden border-0 bg-[#E8E0D5]/60 p-0 text-left"
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
                  </button>

                  <div className="flex flex-1 flex-col pt-5">
                    <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-[#747B65] dark:text-[#B59B79]">
                      <span data-preview-field-path={`home.journalPosts[${post.index}].category`}>
                        {post.category}
                      </span>
                      <span
                        data-preview-field-path={`home.journalPosts[${post.index}].readTime`}
                        className="inline-flex items-center gap-1 text-[#65685E] dark:text-[#B6B8AE]"
                      >
                        <Clock className="h-3 w-3 stroke-[1.5]" />
                        {post.readTime}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveArticle(post)}
                      className="mt-3 border-0 bg-transparent p-0 text-left text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
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
                        data-preview-static="journal-read-essay"
                        onClick={() => setActiveArticle(post)}
                        className="inline-flex items-center gap-1.5 border-0 border-b border-[#262923]/30 bg-transparent px-0 pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#262923] transition-colors hover:border-[#B59B79] hover:text-[#747B65] dark:border-[#F8F6F1]/30 dark:text-[#F8F6F1]"
                      >
                        Read Essay
                        <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>
                  </div>
                </article>
              </LuxuryStaggerItem>
            ))}
          </LuxuryStagger>
        )}
      </div>

      {/* Interactive Editorial Reader Modal */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 bg-[#262923]/55 backdrop-blur-sm"
            />
            <motion.article
              role="dialog"
              aria-modal="true"
              aria-label={activeArticle.title}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.36, ease: LUXURY_EASE }}
              className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto bg-[#F8F6F1] text-[#262923] shadow-2xl dark:bg-[#20231D] dark:text-[#F8F6F1]"
            >
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close journal story"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F6F1]/90 text-[#262923] shadow-sm transition-colors hover:bg-[#262923] hover:text-[#F8F6F1]"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>

              <div className="aspect-[16/9] w-full overflow-hidden bg-[#E8E0D5]">
                <img
                  src={withBasePath(activeArticle.imageUrl)}
                  alt={activeArticle.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-7 sm:p-10">
                <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#747B65] dark:text-[#B59B79]">
                  <span>{activeArticle.category}</span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                </div>
                <h3 className="mt-3 font-serif text-3xl font-light leading-tight sm:text-4xl">
                  {activeArticle.title}
                </h3>
                <p className="mt-4 border-l-2 border-[#B59B79] pl-4 font-serif text-lg italic leading-relaxed text-[#65685E] dark:text-[#B6B8AE]">
                  {activeArticle.excerpt}
                </p>
                <p className="mt-6 text-[15px] leading-[1.9] text-[#262923]/88 dark:text-[#F8F6F1]/85">
                  {activeArticle.body}
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-[#262923]/10 pt-5 dark:border-[#F8F6F1]/10">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#65685E]">
                    LOOMÉ Atelier Editorial
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="loome-btn-outline py-2.5 text-[11px]"
                  >
                    Close Essay
                  </button>
                </div>
              </div>
            </motion.article>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
