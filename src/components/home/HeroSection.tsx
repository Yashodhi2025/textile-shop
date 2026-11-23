'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { LUXURY_EASE, useParallaxActive } from '@/components/motion/LuxuryReveal';

interface HeroSectionProps {
  revealReady?: boolean;
}

interface FabricStoryItem {
  index: number;
  id: string;
  eyebrow: string;
  heading: string;
  headingAccent: string;
  description: string;
  imageUrl: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
}

const KNOWN_INTERNAL_PAGES = new Set([
  'shop',
  'cart',
  'checkout',
  'journal',
  'textile_care',
  'shipping_returns',
  'faq',
  'about_us',
  'services',
  'contact',
]);

function normalizeColor(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) return trimmed;
  if (/^(?:rgb|hsl)a?\(/i.test(trimmed)) return trimmed;
  return fallback;
}

export default function HeroSection({ revealReady = true }: HeroSectionProps) {
  const siteData = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const parallaxActive = useParallaxActive();
  const shouldAnimateIn = prefersReducedMotion || revealReady;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const panelsParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '6%']);
  const copyParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '-4%']);

  const home = contentObject(contentObject(siteData.content).home);
  const fabricStoriesConfig = contentObject(home.fabricStories);

  // Merchant-editable Fabric Stories settings
  const autoplaySetting = fabricStoriesConfig.autoplay !== false;
  const rawDuration = Number(fabricStoriesConfig.transitionDurationMs);
  const transitionDurationMs =
    Number.isFinite(rawDuration) && rawDuration >= 2400 && rawDuration <= 15000
      ? rawDuration
      : 5600;
  const rawStyle = contentText(fabricStoriesConfig.animationStyle).toLowerCase();
  const animationStyle: 'editorial-drift' | 'crossfade' | 'static' =
    rawStyle === 'static'
      ? 'static'
      : rawStyle === 'crossfade'
        ? 'crossfade'
        : 'editorial-drift';
  const rawRadius = Number(fabricStoriesConfig.panelRadius);
  const panelRadius =
    Number.isFinite(rawRadius) && rawRadius >= 0 && rawRadius <= 56 ? rawRadius : 28;
  const backgroundFrom = normalizeColor(
    contentText(fabricStoriesConfig.backgroundFrom),
    '#201C1A',
  );
  const backgroundTo = normalizeColor(
    contentText(fabricStoriesConfig.backgroundTo),
    '#3B302B',
  );

  const isStaticMode = animationStyle === 'static' || Boolean(prefersReducedMotion);
  const enableDrift = animationStyle === 'editorial-drift' && !isStaticMode;

  const stories = useMemo<FabricStoryItem[]>(
    () =>
      contentList(fabricStoriesConfig.stories).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `story-${idx}`,
          eyebrow: contentText(obj.eyebrow) || 'THE ART OF FINE TEXTILES',
          heading: contentText(obj.heading) || 'The Living',
          headingAccent: contentText(obj.headingAccent) || 'Fabric',
          description:
            contentText(obj.description) ||
            'Refined linens, natural weaves and bespoke textiles for timeless, beautifully lived spaces.',
          imageUrl: contentText(obj.imageUrl) || '/images/prod-fabric-herringbone.jpg',
          primaryCtaLabel: contentText(obj.primaryCtaLabel) || 'Explore Collection',
          primaryCtaUrl: contentText(obj.primaryCtaUrl) || '#new-arrivals',
          secondaryCtaLabel: contentText(obj.secondaryCtaLabel) || 'Our Craft',
          secondaryCtaUrl: contentText(obj.secondaryCtaUrl) || '/about_us',
        };
      }),
    [fabricStoriesConfig.stories],
  );

  const requiredPages = useMemo(
    () =>
      Array.isArray(siteData.requirements?.requiredPages)
        ? siteData.requirements.requiredPages
        : siteData.template?.structure?.pages || [
          'home',
          'shop',
          'cart',
          'checkout',
          'journal',
          'textile_care',
          'shipping_returns',
          'faq',
          'about_us',
          'services',
          'contact',
        ],
    [siteData.requirements?.requiredPages, siteData.template?.structure?.pages],
  );

  const resolveStoryHref = useCallback(
    (href: string) => {
      const cleaned = href.trim();
      if (!cleaned) return '#new-arrivals';
      if (cleaned.startsWith('#') || /^https?:\/\//i.test(cleaned)) return cleaned;
      const slug = cleaned.replace(/^\/+|\/+$/g, '');
      const normalizedPageKey =
        slug === 'textile-care'
          ? 'textile_care'
          : slug === 'shipping-returns'
            ? 'shipping_returns'
            : slug;
      if (
        KNOWN_INTERNAL_PAGES.has(normalizedPageKey) &&
        !requiredPages.includes(normalizedPageKey)
      ) {
        return '#new-arrivals';
      }
      return withBasePath(cleaned);
    },
    [requiredPages],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const count = stories.length;
  const safeIndex = count > 0 ? activeIndex % count : 0;

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Autoplay interval — pauses on hover, focus, static mode, reduced motion, or single story
  useEffect(() => {
    if (!autoplaySetting || isStaticMode || isPaused || count <= 1 || !shouldAnimateIn) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, transitionDurationMs);
    return () => window.clearInterval(timer);
  }, [autoplaySetting, isStaticMode, isPaused, count, shouldAnimateIn, transitionDurationMs]);

  // Touch swipe handlers for mobile/tablet
  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || count <= 1) {
      return;
    }
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartXRef.current;
    const dy = touch.clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // Compute panel visual slot (0 = Front-Right Active, 1 = Middle, 2 = Back-Left, 3+ = Deep Stack)
  const getPanelSlotStyle = (slot: number) => {
    if (slot === 0) {
      return {
        left: '34%',
        right: '-9%',
        top: '0%',
        zIndex: 30,
        filter: 'brightness(1.03) contrast(1.03)',
        boxShadow: '-26px 0 58px rgba(10, 7, 6, 0.72)',
      };
    }
    if (slot === 1) {
      return {
        left: '16%',
        right: '24%',
        top: '5.5%',
        zIndex: 20,
        filter: 'brightness(0.82) contrast(1.02)',
        boxShadow: '-20px 0 44px rgba(10, 7, 6, 0.62)',
      };
    }
    if (slot === 2) {
      return {
        left: '0%',
        right: '42%',
        top: '11%',
        zIndex: 10,
        filter: 'brightness(0.66) saturate(0.92)',
        boxShadow: '-14px 0 32px rgba(10, 7, 6, 0.5)',
      };
    }
    return {
      left: '-3%',
      right: '48%',
      top: '14%',
      zIndex: 5,
      filter: 'brightness(0.55)',
      boxShadow: 'none',
    };
  };

  return (
    <section
      ref={sectionRef}
      data-design-section="home-hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        background: `radial-gradient(ellipse 72% 65% at 14% 92%, ${backgroundTo} 0%, transparent 65%), radial-gradient(ellipse 60% 70% at 80% 45%, ${backgroundTo}90 0%, transparent 72%), linear-gradient(125deg, ${backgroundFrom} 0%, #191513 55%, ${backgroundFrom} 100%)`,
      }}
      className="relative flex min-h-[78vh] w-full items-center overflow-hidden text-[#F2E9DE] lg:min-h-[85vh]"
    >
      {/* Subtle atmospheric flowing silk light accents along bottom-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-[380px] w-[640px] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(141, 118, 103, 0.42) 0%, rgba(59, 48, 43, 0.16) 55%, transparent 75%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#161210]/65 to-transparent"
      />

      {/* Unified list wrapper for Fivora strict visual editing */}
      <div
        data-preview-list-path="home.fabricStories.stories"
        className="relative z-10 mx-auto w-full max-w-[1440px]"
      >
        {stories.length === 0 ? (
          <div className="px-5 py-28 text-center sm:px-8 lg:px-14">
            <div
              data-preview-static="fabric-stories-empty"
              className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#C8A98B]/30 bg-[#3B302B]/30 px-8 py-14 text-sm text-[#C7B6A6]"
            >
              Add Fabric Stories in your Fivora editor to populate the animated textile hero.
            </div>
          </div>
        ) : (
          <div className="grid min-h-[78vh] grid-cols-1 items-center lg:min-h-[85vh] lg:grid-cols-12">
            {/* LEFT COLUMN: Editorial Story Copy & Softly Rounded CTAs */}
            <motion.div
              style={parallaxActive && !isStaticMode ? { y: copyParallaxY } : undefined}
              className="relative z-20 px-5 pb-8 pt-14 sm:px-8 sm:pt-16 lg:col-span-5 lg:py-20 lg:pl-14 lg:pr-4"
            >
              <div className="overflow-hidden">
                <motion.div
                  animate={{ x: `-${safeIndex * 100}%` }}
                  transition={
                    isStaticMode
                      ? { duration: 0 }
                      : { duration: 0.78, ease: LUXURY_EASE }
                  }
                  className="flex w-full"
                >
                  {stories.map((story) => {
                    const isCurrent = story.index === safeIndex;
                    return (
                      <div
                        key={story.id}
                        data-preview-item-path={`home.fabricStories.stories[${story.index}]`}
                        className="w-full shrink-0 pr-2"
                      >
                        <motion.div
                          initial={false}
                          animate={
                            isStaticMode
                              ? { opacity: 1, y: 0 }
                              : isCurrent && shouldAnimateIn
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0.72, y: 8 }
                          }
                          transition={
                            isStaticMode
                              ? { duration: 0 }
                              : { duration: 0.65, ease: LUXURY_EASE }
                          }
                        >
                          {/* Hairline + Tracked Eyebrow */}
                          <div className="flex items-center gap-3.5">
                            <span
                              aria-hidden="true"
                              className="h-px w-8 shrink-0 bg-[#C8A98B]"
                            />
                            <EditableText
                              as="p"
                              data-preview-field-path={`home.fabricStories.stories[${story.index}].eyebrow`}
                              defaultValue={story.eyebrow}
                              fontFamily="body"
                              size="0.6875rem"
                              weight={600}
                              transform="uppercase"
                              letterSpacing="0.26em"
                              color="#C8A98B"
                              className="m-0"
                            />
                          </div>

                          {/* Dual-Typography Fashion-Editorial Headline */}
                          <div className="mt-5">
                            <EditableText
                              as="h1"
                              data-preview-field-path={`home.fabricStories.stories[${story.index}].heading`}
                              defaultValue={story.heading}
                              fontFamily="heading"
                              size="clamp(2.65rem, 4.9vw, 4.45rem)"
                              weight={800}
                              lineHeight={0.98}
                              letterSpacing="-0.035em"
                              color="#F2E9DE"
                              className="m-0"
                            />
                            <EditableText
                              as="p"
                              data-preview-field-path={`home.fabricStories.stories[${story.index}].headingAccent`}
                              defaultValue={story.headingAccent}
                              fontFamily="body"
                              size="clamp(2.9rem, 5.4vw, 4.9rem)"
                              weight={400}
                              lineHeight={0.96}
                              letterSpacing="-0.01em"
                              color="#C8A98B"
                              className="m-0 mt-1 font-serif italic"
                            />
                          </div>

                          {/* Editorial Description */}
                          <EditableText
                            as="p"
                            data-preview-field-path={`home.fabricStories.stories[${story.index}].description`}
                            defaultValue={story.description}
                            fontFamily="body"
                            size="clamp(0.9375rem, 1.05vw, 1.025rem)"
                            weight={400}
                            lineHeight={1.78}
                            color="rgba(242, 233, 222, 0.84)"
                            className="mt-6 mb-0 max-w-md"
                          />

                          {/* Softly Rounded Rectangular CTAs (11px) */}
                          <div className="mt-9 flex flex-wrap items-center gap-3.5">
                            <a
                              href={resolveStoryHref(story.primaryCtaUrl)}
                              data-preview-field-path={`home.fabricStories.stories[${story.index}].primaryCtaUrl`}
                              className="group loome-btn-primary h-[48px] px-7 no-underline"
                            >
                              <span
                                data-preview-field-path={`home.fabricStories.stories[${story.index}].primaryCtaLabel`}
                              >
                                {story.primaryCtaLabel}
                              </span>
                              <ArrowRight
                                aria-hidden="true"
                                className="h-3.5 w-3.5 stroke-[1.8] transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </a>

                            <a
                              href={resolveStoryHref(story.secondaryCtaUrl)}
                              data-preview-field-path={`home.fabricStories.stories[${story.index}].secondaryCtaUrl`}
                              className="group inline-flex h-[48px] items-center justify-center rounded-[11px] border border-[#C8A98B]/48 bg-[#201C1A]/45 px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F2E9DE] no-underline backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8A98B] hover:bg-[#3B302B]/85"
                            >
                              <span
                                data-preview-field-path={`home.fabricStories.stories[${story.index}].secondaryCtaLabel`}
                              >
                                {story.secondaryCtaLabel}
                              </span>
                            </a>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: 3 Overlapping Softly Curved Dramatic Fabric Panels */}
            <motion.div
              style={parallaxActive && !isStaticMode ? { y: panelsParallaxY } : undefined}
              className="relative h-[400px] w-full sm:h-[480px] lg:col-span-7 lg:h-[85vh] lg:min-h-[600px]"
            >
              <div className="relative h-full w-full">
                {stories.map((story) => {
                  const slot = (story.index - safeIndex + count) % count;
                  const slotStyle = getPanelSlotStyle(slot);
                  const isFront = slot === 0;
                  const floatClass =
                    enableDrift && slot < 3 ? `loome-fabric-float-${slot}` : '';

                  return (
                    <motion.div
                      key={story.id}
                      onClick={() => {
                        if (!isFront) setActiveIndex(story.index);
                      }}
                      animate={{
                        left: slotStyle.left,
                        right: slotStyle.right,
                        top: slotStyle.top,
                        zIndex: slotStyle.zIndex,
                      }}
                      transition={
                        isStaticMode
                          ? { duration: 0 }
                          : { duration: 0.9, ease: LUXURY_EASE }
                      }
                      style={{
                        position: 'absolute',
                        bottom: '-2%',
                        transform: 'skewX(-11deg)',
                        transformOrigin: 'bottom left',
                        borderTopLeftRadius: `${panelRadius}px`,
                        borderBottomLeftRadius: `${Math.round(panelRadius * 0.45)}px`,
                        boxShadow: slotStyle.boxShadow,
                        filter: slotStyle.filter,
                      }}
                      className={`overflow-hidden bg-[#2A221E] transition-[filter] duration-700 ${isFront ? 'cursor-default' : 'cursor-pointer hover:brightness-100'
                        }`}
                    >
                      <div className={`relative h-full w-full ${floatClass}`}>
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isStaticMode ? 1.24 : isFront ? 1.22 : 1.28,
                          }}
                          transition={
                            isStaticMode
                              ? { duration: 0 }
                              : { duration: 1.35, ease: LUXURY_EASE }
                          }
                          style={{
                            transform: 'skewX(11deg)',
                            transformOrigin: 'center',
                          }}
                          className="h-full w-full"
                        >
                          <img
                            src={withBasePath(story.imageUrl)}
                            alt={`${story.heading} ${story.headingAccent}`.trim()}
                            data-preview-field-path={`home.fabricStories.stories[${story.index}].imageUrl`}
                            className="h-full w-full object-cover object-center"
                          />
                        </motion.div>

                        {/* Dramatic chiaroscuro edge lighting & warm espresso vignette */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#181311]/45 via-transparent to-[#181311]/25"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#181311]/55 via-transparent to-[#201C1A]/20"
                        />
                        {/* Subtle top-left champagne highlight rim on active panel */}
                        {isFront && (
                          <div
                            aria-hidden="true"
                            style={{ borderTopLeftRadius: `${panelRadius}px` }}
                            className="pointer-events-none absolute inset-0 border-l border-t border-[#C8A98B]/28"
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Right-Edge Stacked Circular Navigation Arrows (Matching Reference) */}
      {count > 1 && (
        <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5 sm:right-6 lg:right-8">
          <button
            type="button"
            onClick={goNext}
            aria-label="Next fabric story"
            data-preview-static="hero-story-next"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F2E9DE]/38 bg-[#201C1A]/45 text-[#F2E9DE] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B]"
          >
            <ChevronRight className="h-4 w-4 stroke-[1.7]" />
          </button>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous fabric story"
            data-preview-static="hero-story-prev"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F2E9DE]/38 bg-[#201C1A]/45 text-[#F2E9DE] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B]"
          >
            <ChevronLeft className="h-4 w-4 stroke-[1.7]" />
          </button>
        </div>
      )}

      {/* Bottom-Center Pagination Dots (Matching Reference) */}
      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 sm:bottom-7">
          {stories.map((story) => {
            const isActive = story.index === safeIndex;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => setActiveIndex(story.index)}
                aria-label={`View fabric story: ${story.heading} ${story.headingAccent}`}
                aria-current={isActive ? 'true' : undefined}
                data-preview-static={`hero-story-dot-${story.index}`}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B] ${isActive
                  ? 'scale-110 bg-[#C8A98B] shadow-[0_0_12px_rgba(200,169,139,0.55)]'
                  : 'border border-[#C8A98B]/50 bg-transparent hover:border-[#C8A98B] hover:bg-[#C8A98B]/30'
                  }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
