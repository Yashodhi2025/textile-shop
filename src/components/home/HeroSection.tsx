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
import { EditableImage, EditableText } from '@deneb-ui/ui';
import {
  contentList,
  contentObject,
  contentText,
  DENEB_PREVIEW_DATA_MESSAGE,
  DENEB_PREVIEW_FOCUS_MESSAGE,
  LEGACY_PREVIEW_DATA_MESSAGE,
  LEGACY_PREVIEW_FOCUS_MESSAGE,
  PREVIEW_DATA_MESSAGE,
  PREVIEW_FOCUS_MESSAGE,
  useSiteData,
} from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { useParallaxActive } from '@/components/motion/LuxuryReveal';
import SilkWaveOverlay from '@/components/home/SilkWaveOverlay';

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
  'collections',
  'wishlist',
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

const STORY_PATH_REGEX = /home\.fabricStories\.stories\[(\d+)\]/;

function normalizeColor(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;
  if (/^(?:rgb|hsl)a?\(/i.test(trimmed)) return trimmed;
  return fallback;
}

function colorMix(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/**
 * Inspects URL query parameters, Fivora Studio bridge cache, and DOM markers to distinguish
 * interactive Edit mode (autoplay paused, manual navigation active) from Preview mode and
 * the published storefront (automatic configurable fabric-wave transitions active).
 */
function detectRuntimeEditMode(): 'edit' | 'preview' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';

  try {
    const params = new URLSearchParams(window.location.search);
    const modeParam = (
      params.get('mode') ||
      params.get('editorMode') ||
      params.get('fivoraMode') ||
      ''
    )
      .trim()
      .toLowerCase();
    const editParam = (params.get('edit') || params.get('visualEditor') || '')
      .trim()
      .toLowerCase();
    const previewParam = (params.get('preview') || '').trim().toLowerCase();

    if (
      modeParam === 'preview' ||
      editParam === 'false' ||
      editParam === '0' ||
      previewParam === 'true' ||
      previewParam === '1'
    ) {
      return 'preview';
    }
    if (
      modeParam === 'edit' ||
      editParam === 'true' ||
      editParam === '1'
    ) {
      return 'edit';
    }
  } catch {
    // Ignore URL parsing errors
  }

  try {
    const html = document.documentElement;
    const body = document.body;
    const attrMode = (
      html.getAttribute('data-fivora-mode') ||
      html.getAttribute('data-editor-mode') ||
      body?.getAttribute('data-fivora-mode') ||
      body?.getAttribute('data-editor-mode') ||
      ''
    )
      .trim()
      .toLowerCase();

    if (attrMode === 'preview') return 'preview';
    if (attrMode === 'edit') return 'edit';

    const editFlag =
      html.getAttribute('data-fivora-edit-mode') ||
      html.getAttribute('data-edit-mode') ||
      body?.getAttribute('data-fivora-edit-mode') ||
      body?.getAttribute('data-edit-mode');
    if (editFlag === 'true' || editFlag === '1') return 'edit';
    if (editFlag === 'false' || editFlag === '0') return 'preview';

    if (
      html.classList.contains('fivora-edit-mode') ||
      html.classList.contains('deneb-edit-mode') ||
      body?.classList.contains('fivora-edit-mode') ||
      body?.classList.contains('deneb-edit-mode') ||
      Boolean(
        document.querySelector(
          '[data-fivora-editor-overlay], [data-fivora-highlight], [data-preview-field-path][contenteditable="true"]',
        ),
      )
    ) {
      return 'edit';
    }

    // Inside a Fivora Studio editor iframe, SiteDataProvider populates global/session caches
    if (window.parent !== window) {
      const win = window as unknown as Record<string, unknown>;
      const hasStudioSiteData =
        Boolean(win.__FIVORA_PREVIEW_SITE_DATA__) ||
        Boolean(window.sessionStorage.getItem('__FIVORA_PREVIEW_SITE_DATA_CACHE__')) ||
        Boolean(window.sessionStorage.getItem('__FIVORA_PREVIEW_PARENT_ORIGIN__'));
      if (hasStudioSiteData) {
        return 'edit';
      }
    }
  } catch {
    // Ignore DOM / storage inspection errors
  }

  return 'unknown';
}

function extractStoryIndexFromMessage(data: Record<string, unknown>): number | null {
  const candidates = [
    data.fieldPath,
    data.itemPath,
    data.targetPath,
    data.selectedPath,
    data.path,
  ];
  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const match = value.match(STORY_PATH_REGEX);
    if (match) {
      const idx = Number.parseInt(match[1], 10);
      if (Number.isFinite(idx) && idx >= 0) return idx;
    }
  }
  return null;
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
  const mediaParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '6%']);
  const copyParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '-3%']);

  const home = contentObject(contentObject(siteData.content).home);
  const fabricStoriesConfig = contentObject(home.fabricStories);

  // Merchant-editable Fabric Stories settings (defaults to 4000ms when unset)
  const autoplaySetting = fabricStoriesConfig.autoplay !== false;
  const rawInterval = Number(fabricStoriesConfig.transitionDurationMs);
  const autoplayIntervalMs =
    Number.isFinite(rawInterval) && rawInterval >= 1500 && rawInterval <= 15000
      ? rawInterval
      : 4000;

  const rawSpeed = Number(fabricStoriesConfig.transitionSpeedMs);
  const transitionSpeedMs =
    Number.isFinite(rawSpeed) && rawSpeed >= 400 && rawSpeed <= 3200
      ? rawSpeed
      : 1400;

  const rawStyle = contentText(fabricStoriesConfig.animationStyle).toLowerCase();
  const animationStyle: 'fabric-wave' | 'crossfade' | 'static' =
    rawStyle === 'static'
      ? 'static'
      : rawStyle === 'crossfade'
        ? 'crossfade'
        : 'fabric-wave';

  const overlayColor = normalizeColor(
    contentText(fabricStoriesConfig.overlayColor),
    '#C8A98B',
  );
  const backgroundFrom = normalizeColor(
    contentText(fabricStoriesConfig.backgroundFrom),
    '#201C1A',
  );
  const backgroundTo = normalizeColor(
    contentText(fabricStoriesConfig.backgroundTo),
    '#3B302B',
  );

  const isStaticMode = animationStyle === 'static' || Boolean(prefersReducedMotion);
  const enableWaveReveal = animationStyle === 'fabric-wave' && !isStaticMode;

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
            'collections',
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
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [transitionTick, setTransitionTick] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [copyPhase, setCopyPhase] = useState<CopyPhase>('visible');
  const [isPaused, setIsPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const displayedIndexRef = useRef(0);
  const activeIndexRef = useRef(0);
  const remainingMsRef = useRef(autoplayIntervalMs);
  const timerStartRef = useRef<number | null>(null);
  const prevStoriesRef = useRef<FabricStoryItem[]>(stories);
  const lastControlNavAtRef = useRef(0);

  const count = stories.length;
  const safeIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0;
  const safeDisplayedIndex = count > 0 ? Math.min(displayedIndex, count - 1) : 0;
  const safePreviousIndex =
    previousIndex !== null && count > 0 && previousIndex < count
      ? previousIndex
      : null;

  useEffect(() => {
    activeIndexRef.current = safeIndex;
  }, [safeIndex]);

  // Reset remaining interval whenever autoplay duration or active slide changes
  useEffect(() => {
    remainingMsRef.current = autoplayIntervalMs;
  }, [autoplayIntervalMs, safeIndex, transitionTick]);

  const commitStoryChange = useCallback(
    (nextIndex: number, instant = false) => {
      if (count <= 1) return;
      const current = activeIndexRef.current % count;
      const normalized = ((nextIndex % count) + count) % count;
      if (normalized === current) return;
      setPreviousIndex(current);
      setActiveIndex(normalized);
      if (instant) {
        displayedIndexRef.current = normalized;
        setDisplayedIndex(normalized);
        setCopyPhase('visible');
      } else {
        setTransitionTick((tick) => tick + 1);
      }
    },
    [count],
  );

  const goNext = useCallback(() => {
    if (count <= 1) return;
    commitStoryChange(activeIndexRef.current + 1, isEditMode);
  }, [count, commitStoryChange, isEditMode]);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    commitStoryChange(activeIndexRef.current - 1, isEditMode);
  }, [count, commitStoryChange, isEditMode]);

  const triggerManualControl = useCallback(
    (action: string) => {
      const now = Date.now();
      if (now - lastControlNavAtRef.current < 260) return;
      lastControlNavAtRef.current = now;

      if (action === 'prev') {
        goPrev();
        return;
      }
      if (action === 'next') {
        goNext();
        return;
      }
      if (action.startsWith('story-')) {
        const parsed = Number.parseInt(action.slice('story-'.length), 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          commitStoryChange(parsed, isEditMode);
        }
      }
    },
    [goPrev, goNext, commitStoryChange, isEditMode],
  );

  // Window capture-phase listener so 01/02/03, prev/next arrows, and progress bars work
  // reliably inside Fivora Edit mode even when the visual-editor bridge intercepts document clicks.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const findHeroControl = (target: EventTarget | null): string | null => {
      const el = target instanceof Element ? target.closest('[data-loome-hero-control]') : null;
      if (!el || !sectionRef.current?.contains(el)) return null;
      return el.getAttribute('data-loome-hero-control');
    };

    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const action = findHeroControl(e.target);
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      triggerManualControl(action);
    };

    const onClickCapture = (e: MouseEvent) => {
      const action = findHeroControl(e.target);
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      // Handles keyboard activation (Enter/Space) and non-pointer synthetic clicks
      triggerManualControl(action);
    };

    window.addEventListener('pointerdown', onPointerDownCapture, true);
    window.addEventListener('click', onClickCapture, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDownCapture, true);
      window.removeEventListener('click', onClickCapture, true);
    };
  }, [triggerManualControl]);

  // Detect Fivora Edit mode vs Preview mode & published storefront, and sync Inspector focus to the active story
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const evaluateMode = () => {
      const detected = detectRuntimeEditMode();
      if (detected === 'edit') {
        setIsEditMode(true);
      } else if (detected === 'preview') {
        setIsEditMode(false);
      }
    };

    evaluateMode();

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      const rec = data as Record<string, unknown>;
      const type = typeof rec.type === 'string' ? rec.type : '';

      // Explicit Edit / Preview mode messages from Fivora Studio host
      const modeVal = typeof rec.mode === 'string' ? rec.mode.toLowerCase() : '';
      if (modeVal === 'preview' || rec.editMode === false) {
        setIsEditMode(false);
        return;
      }
      if (modeVal === 'edit' || rec.editMode === true) {
        setIsEditMode(true);
      }

      // Live SiteData updates from Fivora Visual Editor confirm active Edit session
      // unless the URL/DOM explicitly declares preview mode.
      const isDataMsg =
        type === DENEB_PREVIEW_DATA_MESSAGE ||
        type === PREVIEW_DATA_MESSAGE ||
        type === LEGACY_PREVIEW_DATA_MESSAGE;
      if (isDataMsg && detectRuntimeEditMode() !== 'preview') {
        setIsEditMode(true);
      }

      // If any Inspector message targets a specific Fabric Story path (focus, select, or style patch),
      // jump straight to that story so the merchant can see and edit it immediately.
      const isFocusMsg =
        type === DENEB_PREVIEW_FOCUS_MESSAGE ||
        type === PREVIEW_FOCUS_MESSAGE ||
        type === LEGACY_PREVIEW_FOCUS_MESSAGE;
      if (isFocusMsg && detectRuntimeEditMode() !== 'preview') {
        setIsEditMode(true);
      }
      const targetStoryIdx = extractStoryIndexFromMessage(rec);
      if (targetStoryIdx !== null) {
        commitStoryChange(targetStoryIdx, true);
      }
    };

    window.addEventListener('message', onMessage);

    // Watch for Fivora bridge attributes/classes toggled on <html> or <body>
    const observer = new MutationObserver(() => {
      evaluateMode();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        'class',
        'data-fivora-mode',
        'data-editor-mode',
        'data-fivora-edit-mode',
        'data-edit-mode',
      ],
    });
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: [
          'class',
          'data-fivora-mode',
          'data-editor-mode',
          'data-fivora-edit-mode',
          'data-edit-mode',
        ],
      });
    }

    return () => {
      window.removeEventListener('message', onMessage);
      observer.disconnect();
    };
  }, [commitStoryChange]);

  // Keep active story valid when merchant adds, removes, reorders, or edits stories in Fivora
  useEffect(() => {
    const prev = prevStoriesRef.current;
    prevStoriesRef.current = stories;

    if (stories.length === 0) {
      setActiveIndex(0);
      setDisplayedIndex(0);
      displayedIndexRef.current = 0;
      setPreviousIndex(null);
      return;
    }

    // Clamp cleanly if a story was deleted
    if (activeIndexRef.current >= stories.length) {
      const clamped = stories.length - 1;
      setActiveIndex(clamped);
      setDisplayedIndex(clamped);
      displayedIndexRef.current = clamped;
      setPreviousIndex(null);
      return;
    }

    if (!isEditMode) return;

    // If the merchant just added a new story in Edit mode, show it immediately
    if (stories.length > prev.length) {
      const addedIdx = stories.length - 1;
      setActiveIndex(addedIdx);
      setDisplayedIndex(addedIdx);
      displayedIndexRef.current = addedIdx;
      setCopyPhase('visible');
      return;
    }

    // If a non-active story's image or copy was edited in the Inspector, jump to it instantly
    if (stories.length === prev.length) {
      for (let i = 0; i < stories.length; i += 1) {
        const curr = stories[i];
        const old = prev[i];
        if (!old) continue;
        const changed =
          curr.imageUrl !== old.imageUrl ||
          curr.heading !== old.heading ||
          curr.headingAccent !== old.headingAccent ||
          curr.eyebrow !== old.eyebrow ||
          curr.description !== old.description ||
          curr.primaryCtaLabel !== old.primaryCtaLabel ||
          curr.secondaryCtaLabel !== old.secondaryCtaLabel;
        if (changed && i !== activeIndexRef.current) {
          setActiveIndex(i);
          setDisplayedIndex(i);
          displayedIndexRef.current = i;
          setCopyPhase('visible');
          break;
        }
      }
    }
  }, [stories, isEditMode]);

  // Synchronized 3-phase copy choreography: soft exit -> clean swap -> staggered fade-up entrance
  useEffect(() => {
    if (count === 0) return;
    const currentDisplayed = Math.min(displayedIndexRef.current, count - 1);

    if (safeIndex === currentDisplayed) {
      setCopyPhase('visible');
      return;
    }

    if (isStaticMode || isEditMode) {
      displayedIndexRef.current = safeIndex;
      setDisplayedIndex(safeIndex);
      setCopyPhase('visible');
      return;
    }

    setCopyPhase('exiting');

    let rafId1: number | null = null;
    let rafId2: number | null = null;
    const exitDelayMs = Math.min(280, Math.round(transitionSpeedMs * 0.2));

    const swapTimer = window.setTimeout(() => {
      displayedIndexRef.current = safeIndex;
      setDisplayedIndex(safeIndex);
      setCopyPhase('entering');

      rafId1 = window.requestAnimationFrame(() => {
        rafId2 = window.requestAnimationFrame(() => {
          setCopyPhase('visible');
        });
      });
    }, exitDelayMs);

    return () => {
      window.clearTimeout(swapTimer);
      if (rafId1 !== null) window.cancelAnimationFrame(rafId1);
      if (rafId2 !== null) window.cancelAnimationFrame(rafId2);
    };
  }, [safeIndex, count, isStaticMode, isEditMode, transitionSpeedMs]);

  // Pause autoplay when browser tab is backgrounded
  useEffect(() => {
    const onVisibilityChange = () => {
      setIsTabHidden(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const isAutoplayActive =
    autoplaySetting &&
    !isStaticMode &&
    !isEditMode &&
    !isPaused &&
    !isTabHidden &&
    count > 1 &&
    shouldAnimateIn;

  // Autoplay timer synchronized with the CSS progress bar so pause-on-hover resumes accurately
  useEffect(() => {
    if (!isAutoplayActive) {
      if (timerStartRef.current !== null) {
        const elapsed = Date.now() - timerStartRef.current;
        remainingMsRef.current = Math.max(200, remainingMsRef.current - elapsed);
        timerStartRef.current = null;
      }
      return;
    }

    const waitMs = Math.max(200, remainingMsRef.current);
    timerStartRef.current = Date.now();

    const timer = window.setTimeout(() => {
      timerStartRef.current = null;
      remainingMsRef.current = autoplayIntervalMs;
      commitStoryChange(activeIndexRef.current + 1);
    }, waitMs);

    return () => {
      window.clearTimeout(timer);
      if (timerStartRef.current !== null) {
        const elapsed = Date.now() - timerStartRef.current;
        remainingMsRef.current = Math.max(200, remainingMsRef.current - elapsed);
        timerStartRef.current = null;
      }
    };
  }, [isAutoplayActive, autoplayIntervalMs, safeIndex, transitionTick, commitStoryChange]);

  // Focus handling — stays paused while keyboard focus moves between internal hero controls
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

  const copyEnterDurationMs = Math.min(920, Math.max(520, Math.round(transitionSpeedMs * 0.56)));

  const getCopyPartProps = (isDisplayed: boolean, staggerMs: number) => {
    if (!isDisplayed || isStaticMode || isEditMode) {
      return {
        className: 'opacity-100 translate-y-0',
        style: undefined,
      };
    }
    if (copyPhase === 'exiting') {
      return {
        className: '-translate-y-2.5 opacity-0',
        style: {
          transitionProperty: 'opacity, transform',
          transitionDuration: '240ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 1, 1)',
          transitionDelay: '0ms',
        },
      };
    }
    if (copyPhase === 'entering') {
      return {
        className: 'translate-y-4 opacity-0',
        style: {
          transitionProperty: 'none',
        },
      };
    }
    return {
      className: 'translate-y-0 opacity-100',
      style: {
        transitionProperty: 'opacity, transform',
        transitionDuration: `${copyEnterDurationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${staggerMs}ms`,
      },
    };
  };

  const allowParallax = parallaxActive && !isStaticMode && !isEditMode;

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
        background: `radial-gradient(ellipse 68% 66% at 14% 24%, ${colorMix(backgroundTo, 40)} 0%, transparent 64%), linear-gradient(120deg, ${backgroundFrom} 0%, #171311 52%, ${backgroundFrom} 100%)`,
      }}
      className="relative flex min-h-[640px] w-full items-center overflow-hidden text-[#F2E9DE] sm:min-h-[82vh] lg:min-h-[88vh]"
    >
      {/* Unified list container (no z-index stacking context so silk overlay layers cleanly between image & copy) */}
      <div
        data-preview-list-path="home.fabricStories.stories"
        className="relative flex min-h-[640px] w-full items-center sm:min-h-[82vh] lg:min-h-[88vh]"
      >
        {stories.length === 0 ? (
          <div className="relative z-30 mx-auto max-w-[1440px] px-5 py-28 text-center sm:px-8 lg:px-14">
            <div
              data-preview-static="fabric-stories-empty"
              className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#C8A98B]/30 bg-[#3B302B]/30 px-8 py-14 text-sm text-[#C7B6A6]"
            >
              Add Fabric Stories in your Fivora editor to populate the animated textile hero.
            </div>
          </div>
        ) : (
          <>
            {/* Per-story unified item containers: each story binds BOTH its EditableImage and editorial copy inside data-preview-item-path */}
            {stories.map((story) => {
              const isActive = story.index === safeIndex;
              const isDisplayed = story.index === safeDisplayedIndex;
              const isOutgoing =
                safePreviousIndex !== null &&
                story.index === safePreviousIndex &&
                !isActive;
              const shouldPlayWave =
                isActive && transitionTick > 0 && enableWaveReveal && !isEditMode;
              const shouldPlayCrossfade =
                isActive &&
                transitionTick > 0 &&
                animationStyle === 'crossfade' &&
                !isStaticMode &&
                !isEditMode;

              const layerZIndex = isActive ? 15 : isOutgoing ? 10 : 1;

              const eyebrowAnim = getCopyPartProps(isDisplayed, 0);
              const headingAnim = getCopyPartProps(isDisplayed, 90);
              const descAnim = getCopyPartProps(isDisplayed, 180);
              const ctaAnim = getCopyPartProps(isDisplayed, 270);

              return (
                <div
                  key={story.id}
                  data-preview-item-path={`home.fabricStories.stories[${story.index}]`}
                  className="pointer-events-none absolute inset-0"
                >
                  {/* LAYER 1 (z-1..15): Directly clickable full-bleed textile image with Fabric-Wave Mask Reveal */}
                  <motion.div
                    style={{
                      zIndex: layerZIndex,
                      ...(allowParallax ? { y: mediaParallaxY } : undefined),
                    }}
                    className={`absolute -inset-y-[5%] inset-x-0 overflow-hidden ${
                      isActive ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    <div
                      className="absolute inset-0 lg:left-[18%]"
                      style={{
                        WebkitMaskImage:
                          'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.45) 14%, #000 34%, #000 100%)',
                        maskImage:
                          'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.45) 14%, #000 34%, #000 100%)',
                      }}
                    >
                      <div
                        key={isActive ? `reveal-${transitionTick}` : 'resting'}
                        style={
                          shouldPlayWave || shouldPlayCrossfade
                            ? { animationDuration: `${transitionSpeedMs}ms` }
                            : undefined
                        }
                        className={`relative h-full w-full ${
                          shouldPlayWave
                            ? 'loome-fabric-wave-mask'
                            : shouldPlayCrossfade
                              ? 'loome-fabric-crossfade-in'
                              : ''
                        }`}
                      >
                        <EditableImage
                          id={`home.fabricStories.stories[${story.index}].imageUrl`}
                          data-preview-field-path={`home.fabricStories.stories[${story.index}].imageUrl`}
                          data-preview-style-target={`home.fabricStories.stories[${story.index}].imageUrl`}
                          data-preview-style-type="image"
                          src={story.imageUrl}
                          fallbackSrc="/images/prod-fabric-herringbone.jpg"
                          alt={`${story.heading} ${story.headingAccent}`.trim()}
                          fit="cover"
                          style={
                            shouldPlayWave || shouldPlayCrossfade
                              ? { animationDuration: `${transitionSpeedMs}ms` }
                              : undefined
                          }
                          className={`h-full w-full object-cover object-center ${
                            shouldPlayWave || shouldPlayCrossfade
                              ? 'loome-fabric-image-settle'
                              : ''
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* LAYER 3 (z-30): Editorial Copy & Rounded CTAs (outer container pointer-events-none so right image stays directly clickable) */}
                  <motion.div
                    style={allowParallax ? { y: copyParallaxY } : undefined}
                    className="pointer-events-none absolute inset-0 z-30 flex items-center"
                  >
                    <div className="pointer-events-none mx-auto w-full max-w-[1440px] px-5 pb-28 pt-16 sm:px-8 sm:pb-32 sm:pt-20 lg:px-14 lg:py-24">
                      <div
                        className={`max-w-[560px] ${
                          isDisplayed ? 'pointer-events-auto' : 'pointer-events-none'
                        }`}
                      >
                        {/* Negative margin + matching inner padding prevents italic swash or button shadow clipping */}
                        <div className="-mx-4 overflow-hidden py-3 sm:-mx-5">
                          <div
                            style={{
                              transform: `translate3d(${(story.index - safeDisplayedIndex) * 100}%, 0, 0)`,
                            }}
                            className="w-full px-4 sm:px-5"
                          >
                            {/* Hairline + Tracked Eyebrow */}
                            <div
                              style={eyebrowAnim.style}
                              className={`flex items-center gap-3.5 ${eyebrowAnim.className}`}
                            >
                              <span
                                aria-hidden="true"
                                style={{ backgroundColor: overlayColor }}
                                className="h-px w-9 shrink-0 opacity-80"
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
                                color={overlayColor}
                                className="m-0"
                              />
                            </div>

                            {/* Dual-Typography Fashion-Editorial Headline */}
                            <div
                              style={headingAnim.style}
                              className={`mt-5 pr-2 ${headingAnim.className}`}
                            >
                              <EditableText
                                as={story.index === 0 ? 'h1' : 'h2'}
                                data-preview-field-path={`home.fabricStories.stories[${story.index}].heading`}
                                defaultValue={story.heading}
                                fontFamily="heading"
                                size="clamp(2.75rem, 5.2vw, 4.9rem)"
                                weight={800}
                                lineHeight={1.01}
                                letterSpacing="-0.035em"
                                color="#F2E9DE"
                                className="m-0 drop-shadow-[0_6px_28px_rgba(14,10,8,0.45)]"
                              />
                              <EditableText
                                as="p"
                                data-preview-field-path={`home.fabricStories.stories[${story.index}].headingAccent`}
                                defaultValue={story.headingAccent}
                                fontFamily="body"
                                size="clamp(3.05rem, 5.8vw, 5.4rem)"
                                weight={400}
                                lineHeight={0.96}
                                letterSpacing="-0.01em"
                                color={overlayColor}
                                className="m-0 mt-0.5 pb-1 font-serif italic drop-shadow-[0_6px_24px_rgba(14,10,8,0.45)]"
                              />
                            </div>

                            {/* Editorial Description */}
                            <div
                              style={descAnim.style}
                              className={`mt-5 max-w-[430px] ${descAnim.className}`}
                            >
                              <EditableText
                                as="p"
                                data-preview-field-path={`home.fabricStories.stories[${story.index}].description`}
                                defaultValue={story.description}
                                fontFamily="body"
                                size="clamp(0.9375rem, 1.05vw, 1.025rem)"
                                weight={400}
                                lineHeight={1.76}
                                color="rgba(242, 233, 222, 0.86)"
                                className="m-0"
                              />
                            </div>

                            {/* Softly Rounded Rectangular CTAs (11px) */}
                            <div
                              style={ctaAnim.style}
                              className={`mt-8 flex flex-wrap items-center gap-3.5 sm:mt-9 ${ctaAnim.className}`}
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
                                className="group inline-flex h-[48px] items-center justify-center rounded-[11px] border border-[#C8A98B]/45 bg-[#201C1A]/52 px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F2E9DE] no-underline backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8A98B] hover:bg-[#3B302B]/90"
                              >
                                <span
                                  data-preview-field-path={`home.fabricStories.stories[${story.index}].secondaryCtaLabel`}
                                >
                                  {story.secondaryCtaLabel}
                                </span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}

            {/* ATMOSPHERIC SCRIMS (z-[18], pointer-events-none so clicks always pass through to the active EditableImage) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[18]"
              style={{
                background: `linear-gradient(96deg, ${backgroundFrom} 0%, ${colorMix(backgroundFrom, 95)} 26%, ${colorMix(backgroundFrom, 77)} 42%, ${colorMix(backgroundFrom, 28)} 60%, rgba(20, 16, 14, 0.14) 84%, rgba(20, 16, 14, 0.32) 100%)`,
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[18] lg:hidden"
              style={{
                background: `linear-gradient(180deg, ${colorMix(backgroundFrom, 80)} 0%, ${colorMix(backgroundFrom, 54)} 45%, ${colorMix(backgroundFrom, 85)} 100%)`,
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[18]"
              style={{
                background: `radial-gradient(ellipse 46% 42% at 64% 18%, ${colorMix(overlayColor, 16)} 0%, transparent 72%)`,
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-[18] h-24 bg-gradient-to-b from-[#161210]/55 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[18] h-32 bg-gradient-to-t from-[#161210]/78 via-[#161210]/30 to-transparent"
            />

            {/* LAYER 2 (z-20): Separate Reusable Translucent Silk Wave Overlay (pointer-events-none — never blocks image clicks) */}
            <SilkWaveOverlay
              overlayColor={overlayColor}
              baseColor={backgroundFrom}
              transitionKey={transitionTick}
              transitionSpeedMs={transitionSpeedMs}
              isPaused={isPaused || isTabHidden}
              reducedMotion={isStaticMode}
              className="z-20"
            />
          </>
        )}
      </div>

      {/* LAYER 4 (z-40): Editorial Slide Controls mounted OUTSIDE data-preview-list-path
          so clicking 01/02/03, prev/next arrows, or progress bars always switches stories in Fivora Edit mode */}
      {count > 1 && (
        <>
          {/* Right-Edge Vertical Numbered Slide Navigation (01, 02, 03) */}
          <div className="pointer-events-auto absolute right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 sm:flex sm:right-8 lg:right-[max(3.5rem,calc((100vw-1440px)/2+3.5rem))]">
            {stories.map((story) => {
              const isActive = story.index === safeIndex;
              const labelNumber = String(story.index + 1).padStart(2, '0');
              return (
                <button
                  key={story.id}
                  type="button"
                  data-loome-hero-control={`story-${story.index}`}
                  onClick={() => triggerManualControl(`story-${story.index}`)}
                  aria-label={`View fabric story ${labelNumber}: ${story.heading} ${story.headingAccent}`}
                  aria-current={isActive ? 'true' : undefined}
                  data-preview-static={`hero-story-num-${story.index}`}
                  className="group flex cursor-pointer flex-col items-end gap-1.5 border-0 bg-transparent p-1 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B]"
                >
                  <span
                    className={`font-body text-xs tracking-[0.22em] transition-colors duration-300 ${
                      isActive
                        ? 'font-semibold text-[#F2E9DE]'
                        : 'font-normal text-[#F2E9DE]/45 group-hover:text-[#F2E9DE]/85'
                    }`}
                  >
                    {labelNumber}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: overlayColor }}
                    className={`block h-[1.5px] transition-all duration-500 ${
                      isActive
                        ? 'w-5 opacity-100'
                        : 'w-2.5 opacity-0 group-hover:opacity-60'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Bottom Controls Bar: Left Manual Arrows + Right Animated Progress Indicators */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 sm:bottom-8 lg:bottom-10">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-14">
              {/* Bottom-Left Circular Prev / Next Arrows */}
              <div className="pointer-events-auto flex items-center gap-2.5">
                <button
                  type="button"
                  data-loome-hero-control="prev"
                  onClick={() => triggerManualControl('prev')}
                  aria-label="Previous fabric story"
                  data-preview-static="hero-story-prev"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#F2E9DE]/26 bg-[#201C1A]/52 text-[#F2E9DE] shadow-[0_8px_22px_rgba(10,7,5,0.38)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B]"
                >
                  <ChevronLeft className="h-4 w-4 stroke-[1.75]" />
                </button>
                <button
                  type="button"
                  data-loome-hero-control="next"
                  onClick={() => triggerManualControl('next')}
                  aria-label="Next fabric story"
                  data-preview-static="hero-story-next"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#F2E9DE]/26 bg-[#201C1A]/52 text-[#F2E9DE] shadow-[0_8px_22px_rgba(10,7,5,0.38)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#C8A98B] hover:bg-[#C8A98B] hover:text-[#201C1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B]"
                >
                  <ChevronRight className="h-4 w-4 stroke-[1.75]" />
                </button>
              </div>

              {/* Bottom-Right Animated Progress Bars */}
              <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3">
                {stories.map((story) => {
                  const isActive = story.index === safeIndex;
                  const labelNumber = String(story.index + 1).padStart(2, '0');
                  return (
                    <button
                      key={story.id}
                      type="button"
                      data-loome-hero-control={`story-${story.index}`}
                      onClick={() => triggerManualControl(`story-${story.index}`)}
                      aria-label={`Jump to story ${labelNumber}: ${story.heading} ${story.headingAccent}`}
                      aria-current={isActive ? 'true' : undefined}
                      data-preview-static={`hero-story-dot-${story.index}`}
                      className="group relative flex h-6 w-11 cursor-pointer items-center border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A98B] sm:w-16"
                    >
                      <span className="relative block h-[2.5px] w-full overflow-hidden rounded-full bg-[#F2E9DE]/24 transition-colors group-hover:bg-[#F2E9DE]/40">
                        {isActive &&
                          (autoplaySetting && !isStaticMode && !isEditMode ? (
                            <span
                              key={`progress-${safeIndex}-${transitionTick}-${autoplayIntervalMs}`}
                              style={{
                                backgroundColor: overlayColor,
                                animationDuration: `${autoplayIntervalMs}ms`,
                                animationPlayState: isAutoplayActive ? 'running' : 'paused',
                              }}
                              className="loome-hero-progress-fill block h-full w-full rounded-full"
                            />
                          ) : (
                            <span
                              style={{ backgroundColor: overlayColor }}
                              className="block h-full w-full rounded-full"
                            />
                          ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
