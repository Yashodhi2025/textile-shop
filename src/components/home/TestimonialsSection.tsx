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
      className="loome-surface-beige w-full border-b border-[var(--loome-border)] py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-[1040px] px-4 sm:px-8 lg:px-10">
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
            size="clamp(1.85rem, 3vw, 2.4rem)"
            weight={800}
            lineHeight={1.08}
            letterSpacing="-0.025em"
            color="heading"
            align="center"
            className="mt-2 mb-0"
          />
        </LuxuryReveal>

        <LuxuryReveal delay={0.1} className="mt-9">
          <div className="relative mx-auto max-w-3xl rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-8 text-center shadow-[0_6px_22px_rgba(73,56,44,0.05)] dark:shadow-none sm:px-10 sm:py-10">
            <p
              aria-hidden="true"
              data-preview-static="testimonial-quote-mark"
              className="pointer-events-none m-0 select-none font-heading text-5xl font-bold leading-none text-[var(--brand-accent)]/55"
            >
              &ldquo;
            </p>

            <p
              data-preview-static="testimonial-stars"
              className="mt-1.5 mb-0 flex items-center justify-center gap-1.5"
              aria-label="5 out of 5 stars"
            >
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="h-3.5 w-3.5 fill-[var(--brand-accent)] text-[var(--brand-accent)]" />
              ))}
            </p>

            {/* Smooth horizontal slider track — keeps all slides visible & clickable for Fivora */}
            <div className="relative mt-5 overflow-hidden">
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
                    className="w-full shrink-0 rounded-2xl border border-dashed border-[var(--loome-border)] py-12 text-center text-sm text-[var(--muted-color)]"
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
                        className="font-heading text-lg font-medium leading-[1.6] text-[var(--heading-color)] sm:text-[1.3rem]"
                      >
                        &ldquo;{review.quote}&rdquo;
                      </p>

                      <footer className="mt-6 flex flex-col items-center gap-1">
                        <cite className="not-italic">
                          <span
                            data-preview-field-path={`home.testimonials[${review.index}].author`}
                            className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--heading-color)]"
                          >
                            {review.author}
                          </span>
                        </cite>
                        <p className="m-0 text-xs text-[var(--muted-color)]">
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
                          className="mt-1 m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent)]"
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
              <div className="mt-7 flex items-center justify-center gap-5">
                <button
                  type="button"
                  data-preview-static="testimonial-prev"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + count) % count)}
                  aria-label="Previous testimonial"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] text-[var(--heading-color)] transition-all hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent)] hover:text-white dark:hover:text-[#1A1614]"
                >
                  <ChevronLeft className="h-4 w-4 stroke-[1.6]" />
                </button>

                <div className="flex items-center gap-2">
                  {reviews.map((rev, idx) => (
                    <button
                      key={rev.id}
                      type="button"
                      data-preview-static={`testimonial-dot-${idx}`}
                      aria-label={`View review by ${rev.author}`}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-[3px] rounded-full transition-all duration-300 ${
                        idx === safeIndex
                          ? 'w-9 bg-[var(--brand-accent)]'
                          : 'w-4 bg-[var(--loome-border)] hover:bg-[var(--brand-accent)]/70'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  data-preview-static="testimonial-next"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % count)}
                  aria-label="Next testimonial"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--loome-border)] bg-[var(--loome-ivory)] text-[var(--heading-color)] transition-all hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent)] hover:text-white dark:hover:text-[#1A1614]"
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
