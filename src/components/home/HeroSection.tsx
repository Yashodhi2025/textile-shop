'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type TouchEvent,
} from 'react';
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

type CopyPhase = 'visible' | 'exiting' | 'entering';

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
  const panelsParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);
  const copyParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '-3%']);

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
    Number.isFinite(rawRadius) && rawRadius >= 0 && rawRadius <= 56 ? rawRadius : 30;
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
  const enableVerticalStagger = animationStyle === 'editorial-drift' && !isStaticMode;

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
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [copyPhase, setCopyPhase] = useState<CopyPhase>('visible');
  const [isPaused, setIsPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const displayedIndexRef = useRef(0);

  const count = stories.length;
  const safeIndex = count > 0 ? activeIndex % count : 0;
  const safeDisplayedIndex = count > 0 ? displayedIndex % count : 0;

  // Atomic 3-phase sequential transition: clean exit -> invisible swap -> staggered editorial entrance
  useEffect(() => {
    if (count === 0) return;
    const currentDisplayed = displayedIndexRef.current % count;

    if (safeIndex === currentDisplayed) {
      setCopyPhase('visible');
      return;
    }

    if (isStaticMode) {
      displayedIndexRef.current = safeIndex;
      setDisplayedIndex(safeIndex);
      setCopyPhase('visible');
      return;
    }

    setCopyPhase('exiting');

    let rafId1: number | null = null;
    let rafId2: number | null = null;

    const swapTimer = window.setTimeout(() => {
      displayedIndexRef.current = safeIndex;
      setDisplayedIndex(safeIndex);
      setCopyPhase('entering');

      rafId1 = window.requestAnimationFrame(() => {
        rafId2 = window.requestAnimationFrame(() => {
          setCopyPhase('visible');
        });
      });
    }, 250);

    return () => {
      window.clearTimeout(swapTimer);
      if (rafId1 !== null) window.cancelAnimationFrame(rafId1);
      if (rafId2 !== null) window.cancelAnimationFrame(rafId2);
    };
  }, [safeIndex, count, isStaticMode]);

  const selectStory = useCallback(
    (nextIndex: number) => {
      if (count <= 1) return;
      const normalized = ((nextIndex % count) + count) % count;
      if (normalized === safeIndex) return;
      setActiveIndex(normalized);
    },
    [count, safeIndex],
  );

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Pause autoplay when browser tab is backgrounded
  useEffect(() => {
    const onVisibilityChange = () => {
      setIsTabHidden(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // Autoplay timer — resets cleanly after every manual navigation/swipe and pauses on hover/focus/static/reduced-motion
  useEffect(() => {
    if (
      !autoplaySetting ||
      isStaticMode ||
      isPaused ||
      isTabHidden ||
      count <= 1 ||
      !shouldAnimateIn
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, transitionDurationMs);
    return () => window.clearTimeout(timer);
  }, [
    autoplaySetting,
    isStaticMode,
    isPaused,
    isTabHidden,
    count,
    shouldAnimateIn,
    transitionDurationMs,
    safeIndex,
  ]);

  // Focus handling — stays paused while focus moves between internal hero controls
  const handleBlurCapture = (e: FocusEvent<HTMLElement>) => {
    const nextFocused = e.relatedTarget as Node | null;
    if (!nextFocused || !e.currentTarget.contains(nextFocused)) {
      setIsPaused(false);
    }
  };

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

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // Balanced 3-panel cascading depth geometry (0 = Front-Right Active, 1 = Mid, 2 = Back-Left, 3+ = Deep stack)
  const getPanelSlotStyle = (slot: number) => {
    if (slot === 0) {
      return {
        left: '35%',
        right: '-9%',
        top: '0%',
        zIndex: 30,
        filter: 'brightness(1.04) contrast(1.03)',
        boxShadow:
          '-30px 10px 64px rgba(10, 7, 5, 0.78), -8px 0 22px rgba(10, 7, 5, 0.52)',
      };
    }
    if (slot === 1) {
      return {
        left: '17.5%',
        right: '21%',
        top: '5.5%',
        zIndex: 20,
        filter: 'brightness(0.84) contrast(1.02) saturate(0.96)',
        boxShadow:
          '-22px 8px 46px rgba(10, 7, 5, 0.66), -6px 0 16px rgba(10, 7, 5, 0.45)',
      };
    }
    if (slot === 2) {
      return {
        left: '1.5%',
        right: '38%',
        top: '11.5%',
        zIndex: 10,
        filter: 'brightness(0.68) contrast(1.01) saturate(0.9)',
        boxShadow: '-16px 6px 34px rgba(10, 7, 5, 0.54)',
      };
    }
    return {
      left: '2%',
      right: '40%',
      top: '12.5%',
      zIndex: 5,
      filter: 'brightness(0.55)',
      boxShadow: 'none',
    };
  };

  // Compute crisp editorial transition classes for the active slide's staggered elements
  const getCopyPartClass = (isDisplayed: boolean, delayClass: string) => {
    if (!isDisplayed || isStaticMode) {
      return 'opacity-100 translate-y-0 transition-none';
    }
    if (copyPhase === 'exiting') {
      return `${
        enableVerticalStagger ? '-translate-y-2.5' : 'translate-y-0'
      } opacity-0 transition-[opacity,transform] duration-[230ms] ease-in`;
    }
    if (copyPhase === 'entering') {
      return `${
        enableVerticalStagger ? 'translate-y-3.5' : 'translate-y-0'
      } opacity-0 transition-none`;
    }
    return `opacity-100 translate-y-0 transition-[opacity,transform] duration-[580ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${delayClass}`;
  };

  return (
    <section
      ref={sectionRef}
      data-design-section="home-hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={handleBlurCapture}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        background: `radial-gradient(ellipse 68% 62% at 12% 94%, ${backgroundTo} 0%, transparent 66%), radial-gradient(ellipse 56% 68% at 82% 42%, ${backgroundTo}88 0%, transparent 72%), linear-gradient(125deg, ${backgroundFrom} 0%, #191513 54%, ${backgroundFrom} 100%)`,
      }}
      className="relative flex min-h-[76vh] w-full items-center overflow-hidden text-[#F2E9DE] lg:min-h-[84vh]"
    >
      {/* Subtle atmospheric flowing silk light accents along bottom-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-24 h-[400px] w-[680px] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(141, 118, 103, 0.4) 0%, rgba(59, 48, 43, 0.16) 55%, transparent 76%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#161210]/70 to-transparent"
      />

      {/* Unified list wrapper for Fivora strict visual editing */}
      <div
        data-preview-list-path="home.fabricStories.stories"
        className="relative z-10 w-full"
      >
        {stories.length === 0 ? (
          <div className="mx-auto max-w-[1440px] px-5 py-28 text-center sm:px-8 lg:px-14">
            <div
              data-preview-static="fabric-stories-empty"
              className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#C8A98B]/30 bg-[#3B302B]/30 px-8 py-14 text-sm text-[#C7B6A6]"
            >
              Add Fabric Stories in your Fivora editor to populate the animated textile hero.
            </div>
          </div>
        ) : (
          <div className="grid min-h-[76vh] grid-cols-1 items-center lg:min-h-[84vh] lg:grid-cols-12">
            {/* LEFT COLUMN: Active-Only Editorial Copy with Zero-Overlap Exit/Enter Choreography */}
            <motion.div
              style={parallaxActive && !isStaticMode ? { y: copyParallaxY } : undefined}
              className="relative z-20 px-5 pb-6 pt-12 sm:px-8 sm:pt-16 lg:col-span-5 lg:py-20 lg:pl-[max(3.5rem,calc((100vw-1440px)/2+3.5rem))] lg:pr-6"
            >
              {/* Generous outer negative margin + matching inner slide padding prevents any italic or button shadow clipping */}
              <div className="-mx-4 overflow-hidden py-3 sm:-mx-5">
                <div
                  style={{
                    transform: `translate3d(-${safeDisplayedIndex * 100}%, 0, 0)`,
                  }}
                  className="flex w-full"
                >
                  {stories.map((story) => {
                    const isDisplayed = story.index === safeDisplayedIndex;

                    return (
                      <div
                        key={story.id}
                        data-preview-item-path={`home.fabricStories.stories[${story.index}]`}
                        className="w-full shrink-0 px-4 sm:px-5"
                      >
                        {/* Hairline + Tracked Eyebrow */}
                        <div
                          className={`flex items-center gap-3.5 ${getCopyPartClass(
                            isDisplayed,
                            'delay-0',
                          )}`}
                        >
                          <span
                            aria-hidden="true"
                            className="h-px w-9 shrink-0 bg-[#C8A98B]/85"
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
                        <div
                          className={`mt-5 pr-2 ${getCopyPartClass(
                            isDisplayed,
                            'delay-[65ms]',
                          )}`}
                        >
                          <EditableText
                            as={story.index === 0 ? 'h1' : 'h2'}
                            data-preview-field-path={`home.fabricStories.stories[${story.index}].heading`}
                            defaultValue={story.heading}
                            fontFamily="heading"
                            size="clamp(2.45rem, 4.7vw, 4.35rem)"
                            weight={800}
                            lineHeight={1.02}
                            letterSpacing="-0.035em"
                            color="#F2E9DE"
                            className="m-0"
                          />
                          <EditableText
                            as="p"
                            data-preview-field-path={`home.fabricStories.stories[${story.index}].headingAccent`}
                            defaultValue={story.headingAccent}
                            fontFamily="body"
                            size="clamp(2.75rem, 5.2vw, 4.85rem)"
                            weight={400}
                            lineHeight={0.98}
                            letterSpacing="-0.01em"
                            color="#C8A98B"
                            className="m-0 mt-0.5 pb-1 font-serif italic"
                          />
                        </div>

                        {/* Editorial Description */}
                        <div
                          className={`mt-5 max-w-[430px] ${getCopyPartClass(
                            isDisplayed,
                            'delay-[130ms]',
                          )}`}
                        >
                          <EditableText
                            as="p"
                            data-preview-field-path={`home.fabricStories.stories[${story.index}].description`}
                            defaultValue={story.description}
                            fontFamily="body"
                            size="clamp(0.9375rem, 1.05vw, 1.025rem)"
                            weight={400}
                            lineHeight={1.76}
                            color="rgba(242, 233, 222, 0.84)"
                            className="m-0"
                          />
                        </div>

                        {/* Softly Rounded Rectangular CTAs (11px) */}
                        <div
                          className={`mt-8 flex flex-wrap items-center gap-3.5 sm:mt-9 ${getCopyPartClass(
                            isDisplayed,
                            'delay-[195ms]',
                          )}`}
                        >
                          <a
                            href={resolveStoryHref(story.primaryCtaUrl)}
                            tabIndex={isDisplayed ? undefined : -1}
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
                              className="h-3.5 w-3.5 stroke-[1.85] transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </a>

                          <a
                            href={resolveStoryHref(story.secondaryCtaUrl)}
                            tabIndex={isDisplayed ? undefined : -1}
                            data-preview-field-path={`home.fabricStories.stories[${story.index}].secondaryCtaUrl`}
                            className="group inline-flex h-[48px] items-center justify-center rounded-[11px] border border-[#C8A98B]/50 bg-[#201C1A]/50 px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F2E9DE] no-underline backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8A98B] hover:bg-[#3B302B]/90"
                          >
                            <span
                              data-preview-field-path={`home.fabricStories.stories[${story.index}].secondaryCtaLabel`}
                            >
                              {story.secondaryCtaLabel}
                            </span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: 3 Overlapping Curved Dramatic Fabric Panels */}
            <motion.div
              style={parallaxActive && !isStaticMode ? { y: panelsParallaxY } : undefined}
              className="loome-hero-panel-stage relative h-[330px] w-full sm:h-[440px] md:h-[500px] lg:col-span-7 lg:h-[84vh] lg:min-h-[600px]"
            >
              {/* Soft espresso feather fade on desktop left boundary so rear panel emerges organically */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-20 bg-gradient-to-r from-[#201C1A]/65 via-[#201C1A]/20 to-transparent lg:block"
              />

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
                        if (!isFront) selectStory(story.index);
                      }}
                      initial={false}
                      animate={{
                        left: slotStyle.left,
                        right: slotStyle.right,
                        top: slotStyle.top,
                        zIndex: slotStyle.zIndex,
                      }}
                      transition={
                        isStaticMode
                          ? { duration: 0 }
                          : { duration: 0.88, ease: LUXURY_EASE }
                      }
                      style={{
                        position: 'absolute',
                        bottom: '-2%',
                        transform: 'skewX(var(--loome-panel-skew, -10.5deg))',
                        transformOrigin: 'bottom left',
                        borderTopLeftRadius: `${panelRadius}px`,
                        borderBottomLeftRadius: `${Math.round(panelRadius * 0.5)}px`,
                        boxShadow: slotStyle.boxShadow,
                        filter: slotStyle.filter,
                        willChange: 'left, right, top',
                      }}
                      className={`overflow-hidden bg-[#2A221E] transition-[filter,box-shadow] duration-700 ${
                        isFront
                          ? 'cursor-default'
                          : 'cursor-pointer hover:brightness-95'
                      }`}
                    >
                      <div className={`relative h-full w-full ${floatClass}`}>
                        {/* Oversized counter-skewed wrapper prevents any sheared corner gaps at every viewport ratio */}
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isStaticMode ? 1.04 : isFront ? 1.02 : 1.08,
                          }}
                          transition={
                            isStaticMode
                              ? { duration: 0 }
                              : { duration: 1.25, ease: LUXURY_EASE }
                          }
                          style={{
                            transform: 'skewX(var(--loome-panel-unskew, 10.5deg))',
                            transformOrigin: 'center center',
                          }}
                          className="absolute -inset-x-[18%] -inset-y-[5%]"
                        >
                          <img
                            src={withBasePath(story.imageUrl)}
                            alt={`${story.heading} ${story.headingAccent}`.trim()}
                            data-preview-field-path={`home.fabricStories.stories[${story.index}].imageUrl`}
                            className="h-full w-full object-cover object-center"
                          />
                        </motion.div>

                        {/* Dramatic chiaroscuro edge lighting & warm espresso depth shading */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#171210]/48 via-transparent to-[#171210]/22"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171210]/58 via-transparent to-[#201C1A]/18"
                        />
                        {/* Delicate curved top-left champagne catchlight rim */}
                        <div
                          aria-hidden="true"
                          style={{ borderTopLeftRadius: `${panelRadius}px` }}
                          className={`pointer-events-none absolute inset-0 border-l border-t transition-opacity duration-700 ${
                            isFront
                              ? 'border-[#C8A98B]/32 opacity-100'
                              : 'border-[#C8A98B]/14 opacity-80'
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right-Edge Stacked Circular Navigation Arrows — anchored cleanly to the panel stage */}
              {count > 1 && (
                <div className="absolute right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2.5 sm:right-6 lg:right-8">
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next fabric story"
                    data-preview-static="hero-story-next"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F2E9DE]/38 bg-[#201C1A]/52 text-[#F2E9DE] shadow-[0_8px_24px_rgba(10,7,5,0.4)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B] sm:h-11 sm:w-11"
                  >
                    <ChevronRight className="h-4 w-4 stroke-[1.8]" />
                  </button>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous fabric story"
                    data-preview-static="hero-story-prev"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F2E9DE]/38 bg-[#201C1A]/52 text-[#F2E9DE] shadow-[0_8px_24px_rgba(10,7,5,0.4)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B] sm:h-11 sm:w-11"
                  >
                    <ChevronLeft className="h-4 w-4 stroke-[1.8]" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom-Center Pagination Dots */}
      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#201C1A]/42 px-3.5 py-2 backdrop-blur-sm sm:bottom-7">
          {stories.map((story) => {
            const isActive = story.index === safeIndex;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => selectStory(story.index)}
                aria-label={`View fabric story: ${story.heading} ${story.headingAccent}`}
                aria-current={isActive ? 'true' : undefined}
                data-preview-static={`hero-story-dot-${story.index}`}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#201C1A] ${
                  isActive
                    ? 'scale-110 bg-[#C8A98B] shadow-[0_0_12px_rgba(200,169,139,0.65)]'
                    : 'border border-[#C8A98B]/55 bg-transparent hover:border-[#C8A98B] hover:bg-[#C8A98B]/30'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
