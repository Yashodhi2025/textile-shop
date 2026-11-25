'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  const prefersReducedMotion = useReducedMotion();

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
      className="loome-surface-beige w-full border-b border-[#49382D]/10 py-16 dark:border-[#C8A98B]/16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8 lg:px-14">
        <LuxuryReveal className="text-center">
          <EditableText
            as="p"
            data-preview-field-path="home.testimonialsEyebrow"
            defaultValue={contentText(home.testimonialsEyebrow) || 'CUSTOMER REVIEWS'}
            fontFamily="body"
            size="0.6875rem"
            weight={600}
            transform="uppercase"
            letterSpacing="0.24em"
            color="primary"
            align="center"
            className="m-0"
          />
          <EditableText
            as="h2"
            data-preview-field-path="home.testimonialsHeading"
            defaultValue={contentText(home.testimonialsHeading) || 'Lived With & Loved'}
            fontFamily="heading"
            size="clamp(2.2rem, 3.8vw, 3.15rem)"
            weight={800}
            lineHeight={1.06}
            letterSpacing="-0.03em"
            color="heading"
            align="center"
            className="mt-2.5 mb-0"
          />
        </LuxuryReveal>

        <LuxuryReveal delay={0.1} className="mt-12">
          <div className="relative mx-auto max-w-3xl rounded-2xl border border-[#49382D]/12 bg-white px-6 py-10 text-center shadow-[0_6px_26px_rgba(73,56,45,0.06)] dark:border-[#C8A98B]/20 dark:bg-[#28211D] dark:shadow-none sm:px-12 sm:py-12">
            <p
              aria-hidden="true"
              data-preview-static="testimonial-quote-mark"
              className="pointer-events-none m-0 select-none font-serif text-7xl leading-none text-[#B28B65]/50 dark:text-[#C8A98B]/55"
            >
              &ldquo;
            </p>

            <p
              data-preview-static="testimonial-stars"
              className="mt-2 mb-0 flex items-center justify-center gap-1.5"
              aria-label="5 out of 5 stars"
            >
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="h-3.5 w-3.5 fill-[#B28B65] text-[#B28B65] dark:fill-[#C8A98B] dark:text-[#C8A98B]" />
              ))}
            </p>

            {/* Smooth horizontal slider track — keeps all slides visible & clickable for Fivora */}
            <div className="relative mt-7 overflow-hidden">
              <motion.div
                data-preview-list-path="home.testimonials"
                animate={{ x: `-${safeIndex * 100}%` }}
                transition={
                  prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: LUXURY_EASE }
                }
                className="flex w-full"
              >
                {reviews.length === 0 ? (
                  <div
                    data-preview-static="testimonials-empty"
                    className="w-full shrink-0 rounded-2xl border border-dashed border-[#49382D]/20 py-14 text-center text-sm text-[#6E5B4E] dark:border-[#C8A98B]/25 dark:text-[#C9B9AA]"
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
                        className="font-serif text-2xl font-normal italic leading-[1.45] text-[#2C211B] dark:text-[#F5EEE6] sm:text-[1.9rem]"
                      >
                        &ldquo;{review.quote}&rdquo;
                      </p>

                      <footer className="mt-8 flex flex-col items-center gap-1.5">
                        <cite className="not-italic">
                          <span
                            data-preview-field-path={`home.testimonials[${review.index}].author`}
                            className="text-xs font-bold uppercase tracking-[0.2em] text-[#2C211B] dark:text-[#F5EEE6]"
                          >
                            {review.author}
                          </span>
                        </cite>
                        <p className="m-0 text-xs text-[#6E5B4E] dark:text-[#C9B9AA]">
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
                          className="mt-1 m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B28B65] dark:text-[#C8A98B]"
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
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#49382D]/20 bg-[#F7F3ED] text-[#49382D] transition-all hover:border-[#B28B65] hover:bg-[#B28B65] hover:text-white dark:border-[#C8A98B]/30 dark:bg-[#201C1A]/60 dark:text-[#F5EEE6] dark:hover:bg-[#C8A98B] dark:hover:text-[#201C1A]"
                >
                  <ChevronLeft className="h-4 w-4 stroke-[1.6]" />
                </button>

                <div className="flex items-center gap-2.5">
                  {reviews.map((rev, idx) => (
                    <button
                      key={rev.id}
                      type="button"
                      data-preview-static={`testimonial-dot-${idx}`}
                      aria-label={`View review by ${rev.author}`}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-[3px] rounded-full transition-all duration-300 ${
                        idx === safeIndex
                          ? 'w-10 bg-[#B28B65] dark:bg-[#C8A98B]'
                          : 'w-5 bg-[#49382D]/20 hover:bg-[#B28B65]/70 dark:bg-[#F5EEE6]/25 dark:hover:bg-[#C8A98B]/70'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  data-preview-static="testimonial-next"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % count)}
                  aria-label="Next testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#49382D]/20 bg-[#F7F3ED] text-[#49382D] transition-all hover:border-[#B28B65] hover:bg-[#B28B65] hover:text-white dark:border-[#C8A98B]/30 dark:bg-[#201C1A]/60 dark:text-[#F5EEE6] dark:hover:bg-[#C8A98B] dark:hover:text-[#201C1A]"
                >
                  <ChevronRight className="h-4 w-4 stroke-[1.6]" />
                </button>
              </div>
            )}
          </div>
        </LuxuryReveal>
      </div>
    </section>
  );
}
