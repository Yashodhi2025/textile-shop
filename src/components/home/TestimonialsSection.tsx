'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { LUXURY_EASE, LuxuryReveal } from '@/components/motion/LuxuryReveal';

export default function TestimonialsSection() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData.content).home);
  const rawReviews = contentList(home.testimonials);

  const reviews = rawReviews.map((raw, idx) => {
    const obj = contentObject(raw);
    return {
      index: idx,
      id: contentText(obj.id) || `rev-${idx}`,
      quote: contentText(obj.quote),
      author: contentText(obj.author),
      role: contentText(obj.role),
      location: contentText(obj.location),
      productMention: contentText(obj.productMention),
    };
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = reviews.length;
  const safeIndex = count > 0 ? activeIndex % count : 0;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 6800);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  return (
    <section
      id="testimonials"
      data-design-section="home-testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="w-full border-y border-[#262923]/8 bg-[#E8E0D5]/45 py-16 dark:border-[#F8F6F1]/8 dark:bg-[#20231D] sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8 lg:px-14">
        <LuxuryReveal className="text-center">
          <EditableText
            as="p"
            data-preview-field-path="home.testimonialsEyebrow"
            defaultValue={contentText(home.testimonialsEyebrow) || 'ATELIER VOICES'}
            fontFamily="body"
            size="0.6875rem"
            weight={500}
            transform="uppercase"
            letterSpacing="0.26em"
            color="primary"
            align="center"
            className="m-0"
          />
          <EditableText
            as="h2"
            data-preview-field-path="home.testimonialsHeading"
            defaultValue={contentText(home.testimonialsHeading) || 'Lived With & Loved'}
            fontFamily="heading"
            size="clamp(2.35rem, 4vw, 3.25rem)"
            weight={300}
            lineHeight={1.08}
            letterSpacing="-0.02em"
            color="heading"
            align="center"
            className="mt-3 mb-0"
          />
        </LuxuryReveal>

        <div className="mt-14">
          <div className="relative mx-auto max-w-3xl text-center">
            <div
              aria-hidden="true"
              data-preview-static="testimonial-quote-mark"
              className="pointer-events-none select-none font-serif text-7xl leading-none text-[#B59B79]/55"
            >
              &ldquo;
            </div>

            <div
              data-preview-static="testimonial-stars"
              className="mt-2 flex items-center justify-center gap-1.5"
              aria-label="5 out of 5 stars"
            >
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="h-3.5 w-3.5 fill-[#B59B79] text-[#B59B79]" />
              ))}
            </div>

            {/* Smooth horizontal slider track — keeps all slides visible & clickable for Fivora */}
            <div className="relative mt-7 overflow-hidden">
              <motion.div
                data-preview-list-path="home.testimonials"
                animate={{ x: `-${safeIndex * 100}%` }}
                transition={{ duration: 0.65, ease: LUXURY_EASE }}
                className="flex w-full"
              >
                {reviews.length === 0 ? (
                  <div
                    data-preview-static="testimonials-empty"
                    className="w-full shrink-0 border border-dashed border-[#262923]/20 py-14 text-center text-sm text-[#65685E]"
                  >
                    Add client testimonials in your Fivora editor.
                  </div>
                ) : (
                  reviews.map((review) => (
                    <blockquote
                      key={review.id}
                      data-preview-item-path={`home.testimonials[${review.index}]`}
                      className="m-0 w-full shrink-0 px-2"
                    >
                      <p
                        data-preview-field-path={`home.testimonials[${review.index}].quote`}
                        className="font-serif text-2xl font-light italic leading-[1.45] text-[#262923] dark:text-[#F8F6F1] sm:text-[1.95rem]"
                      >
                        &ldquo;{review.quote}&rdquo;
                      </p>

                      <footer className="mt-8 flex flex-col items-center gap-1.5">
                        <cite className="not-italic">
                          <span
                            data-preview-field-path={`home.testimonials[${review.index}].author`}
                            className="text-xs font-semibold uppercase tracking-[0.22em] text-[#262923] dark:text-[#F8F6F1]"
                          >
                            {review.author}
                          </span>
                        </cite>
                        <p className="m-0 text-xs text-[#65685E] dark:text-[#B6B8AE]">
                          <span data-preview-field-path={`home.testimonials[${review.index}].role`}>
                            {review.role}
                          </span>
                          <span data-preview-static="testimonial-loc-sep">
                            {review.location ? ' · ' : ''}
                          </span>
                          <span
                            data-preview-field-path={`home.testimonials[${review.index}].location`}
                          >
                            {review.location}
                          </span>
                        </p>
                        <p
                          data-preview-field-path={`home.testimonials[${review.index}].productMention`}
                          className="mt-1 m-0 text-[10px] uppercase tracking-[0.2em] text-[#747B65] dark:text-[#B59B79]"
                        >
                          {review.productMention}
                        </p>
                      </footer>
                    </blockquote>
                  ))
                )}
              </motion.div>
            </div>

            {count > 1 && (
              <div className="mt-10 flex items-center justify-center gap-6">
                <button
                  type="button"
                  data-preview-static="testimonial-prev"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + count) % count)}
                  aria-label="Previous testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#262923]/18 text-[#262923] transition-colors hover:border-[#B59B79] hover:bg-[#262923] hover:text-[#F8F6F1] dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1]"
                >
                  <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
                </button>

                <div className="flex items-center gap-2.5">
                  {reviews.map((rev, idx) => (
                    <button
                      key={rev.id}
                      type="button"
                      data-preview-static={`testimonial-dot-${idx}`}
                      aria-label={`View review by ${rev.author}`}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-[2px] transition-all duration-300 ${
                        idx === safeIndex
                          ? 'w-10 bg-[#262923] dark:bg-[#B59B79]'
                          : 'w-5 bg-[#262923]/25 hover:bg-[#B59B79] dark:bg-[#F8F6F1]/25'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  data-preview-static="testimonial-next"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % count)}
                  aria-label="Next testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#262923]/18 text-[#262923] transition-colors hover:border-[#B59B79] hover:bg-[#262923] hover:text-[#F8F6F1] dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1]"
                >
                  <ChevronRight className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
