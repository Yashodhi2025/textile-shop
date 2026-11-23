'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Play, RotateCcw, Sparkles } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import {
  contentObject,
  contentText,
  DENEB_PREVIEW_DATA_MESSAGE,
  DENEB_PREVIEW_FOCUS_MESSAGE,
  isPreviewValidation,
  LEGACY_PREVIEW_DATA_MESSAGE,
  LEGACY_PREVIEW_FOCUS_MESSAGE,
  PREVIEW_DATA_MESSAGE,
  PREVIEW_FOCUS_MESSAGE,
  useSiteData,
} from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { LUXURY_EASE } from '@/components/motion/LuxuryReveal';

const INTRO_STORAGE_KEY = 'loome_silk_veil_seen_v1';

type IntroPhase =
  | 'ssr'
  | 'editor-paused'
  | 'entering'
  | 'holding'
  | 'fading-copy'
  | 'lifting'
  | 'stage-complete'
  | 'done';

interface SilkVeilIntroProps {
  /** 'overlay' runs full-viewport on `/`; 'stage' renders inline for `/silk-intro-preview`. */
  mode?: 'overlay' | 'stage';
  onIntroStart?: () => void;
  onVeilLift?: () => void;
}

const PREVIEW_MESSAGE_TYPES = new Set<string>([
  PREVIEW_DATA_MESSAGE,
  DENEB_PREVIEW_DATA_MESSAGE,
  LEGACY_PREVIEW_DATA_MESSAGE,
  PREVIEW_FOCUS_MESSAGE,
  DENEB_PREVIEW_FOCUS_MESSAGE,
  LEGACY_PREVIEW_FOCUS_MESSAGE,
]);

export default function SilkVeilIntro({
  mode = 'overlay',
  onIntroStart,
  onVeilLift,
}: SilkVeilIntroProps) {
  const isStage = mode === 'stage';
  const siteData = useSiteData();
  const prefersReducedMotion = useReducedMotion();

  // Start in 'ssr' so server HTML and initial client render match 100% with zero
  // homepage flash before hydration (visibility on repeat/reduced-motion visits is
  // handled before first paint by the <head> boot script + globals.css).
  const [phase, setPhase] = useState<IntroPhase>('ssr');
  const [isEditorMode, setIsEditorMode] = useState(isStage);
  const [editorDismissed, setEditorDismissed] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [previewRunId, setPreviewRunId] = useState(0);

  const timersRef = useRef<number[]>([]);
  const prevOverflowRef = useRef<string>('');
  const liftedRef = useRef(false);
  const editorModeRef = useRef(isStage);

  const home = contentObject(contentObject(siteData.content).home);
  const common = contentObject(contentObject(siteData.content).common);
  const silkIntro = contentObject(home.silkIntro);

  const isEnabled = silkIntro.enabled !== false;
  const brandTitle =
    contentText(silkIntro.brandTitle) || contentText(common.websiteTitle) || 'LOOMÉ';
  const tagline = contentText(silkIntro.tagline) || 'The Art of Fine Textiles';
  const backgroundImageUrl =
    contentText(silkIntro.backgroundImageUrl) || '/images/silk-veil-bg.jpg';
  const skipLabel = contentText(silkIntro.skipLabel) || 'Skip Intro';
  const fabricStoriesObj = contentObject(home.fabricStories);
  const firstFabricStory = Array.isArray(fabricStoriesObj.stories)
    ? contentObject(fabricStoriesObj.stories[0])
    : {};
  const heroPreviewImage =
    contentText(firstFabricStory.imageUrl) ||
    contentText(home.bannerImageUrl) ||
    '/images/prod-fabric-herringbone.jpg';
  const heroPreviewTitle =
    [contentText(firstFabricStory.heading), contentText(firstFabricStory.headingAccent)]
      .filter(Boolean)
      .join(' ') ||
    contentText(home.heroTitle) ||
    'The Living Fabric';

  const rawDuration = Number(silkIntro.durationMs);
  const totalDurationMs =
    Number.isFinite(rawDuration) && rawDuration >= 1800 && rawDuration <= 6000
      ? rawDuration
      : 2800;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const setHtmlIntroState = useCallback(
    (state: 'pending' | 'editor' | 'skip' | 'done') => {
      if (!isStage && typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-silk-intro', state);
      }
    },
    [isStage],
  );

  const restoreScroll = useCallback(() => {
    if (!isStage && typeof document !== 'undefined') {
      document.body.style.overflow = prevOverflowRef.current;
    }
  }, [isStage]);

  const triggerLift = useCallback(
    (fast = false) => {
      if (liftedRef.current) return;
      liftedRef.current = true;
      clearTimers();
      restoreScroll();
      setHtmlIntroState(editorModeRef.current ? 'editor' : 'done');
      setIsSkipping(fast);
      setPhase('lifting');
      onVeilLift?.();

      if (!editorModeRef.current && !isStage) {
        try {
          window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
        } catch {
          // Ignore restricted storage environments
        }
      }

      const liftDuration = fast ? 480 : 960;
      const finishTimer = window.setTimeout(() => {
        if (isStage) {
          setPhase('stage-complete');
        } else if (editorModeRef.current) {
          setEditorDismissed(true);
          setPhase('editor-paused');
        } else {
          setPhase('done');
        }
      }, liftDuration);
      timersRef.current.push(finishTimer);
    },
    [clearTimers, isStage, onVeilLift, restoreScroll, setHtmlIntroState],
  );

  const schedulePlayback = useCallback(
    (accountForPreHydration: boolean) => {
      clearTimers();
      liftedRef.current = false;
      setIsSkipping(false);
      setEditorDismissed(false);

      // Scale hold/fade/lift milestones cleanly around configured totalDurationMs (~2800ms)
      const liftDuration = 960;
      const elapsed =
        accountForPreHydration && typeof performance !== 'undefined'
          ? Math.min(Math.max(0, performance.now()), 420)
          : 0;
      const liftAt = Math.max(900, totalDurationMs - liftDuration - elapsed);
      const fadeAt = Math.max(600, liftAt - 400);
      const holdAt = Math.max(300, Math.round(fadeAt * 0.65));

      onIntroStart?.();
      setPhase('entering');

      timersRef.current.push(
        window.setTimeout(() => setPhase('holding'), holdAt),
        window.setTimeout(() => setPhase('fading-copy'), fadeAt),
        window.setTimeout(() => triggerLift(false), liftAt),
      );
    },
    [clearTimers, onIntroStart, totalDurationMs, triggerLift],
  );

  // Detect Fivora visual editor / preview mode via official @deneb-ui/ui APIs
  // and initialize either persistent paused mode or once-per-session playback.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dedicated `/silk-intro-preview` stage always opens paused & ready for editing
    if (isStage) {
      editorModeRef.current = true;
      setIsEditorMode(true);
      setPhase('editor-paused');
      return () => {
        clearTimers();
      };
    }

    const inEditor = isPreviewValidation(siteData);
    editorModeRef.current = inEditor;

    if (inEditor) {
      setIsEditorMode(true);
      setHtmlIntroState('editor');
      restoreScroll();
      setPhase('editor-paused');
      onVeilLift?.();
      return;
    }

    const reduced =
      prefersReducedMotion ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(INTRO_STORAGE_KEY) === '1';
    } catch {
      alreadySeen = false;
    }

    if (!isEnabled || reduced || alreadySeen) {
      setHtmlIntroState('skip');
      restoreScroll();
      setPhase('done');
      onVeilLift?.();
      return;
    }

    try {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
    } catch {
      // Proceed gracefully if sessionStorage is unavailable
    }

    prevOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setHtmlIntroState('pending');

    schedulePlayback(true);

    return () => {
      clearTimers();
      restoreScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStage]);

  // Listen for live DENEB / Fivora editor postMessage events in overlay mode
  useEffect(() => {
    if (isStage || typeof window === 'undefined') return;
    const onMessage = (event: MessageEvent) => {
      const data = event?.data;
      if (!data || typeof data !== 'object') return;
      const msgType =
        typeof (data as { type?: unknown }).type === 'string'
          ? (data as { type: string }).type
          : '';
      if (!PREVIEW_MESSAGE_TYPES.has(msgType)) return;
      if (!editorModeRef.current) {
        editorModeRef.current = true;
        clearTimers();
        restoreScroll();
        setIsEditorMode(true);
        setHtmlIntroState('editor');
        setPhase('editor-paused');
        onVeilLift?.();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [clearTimers, isStage, onVeilLift, restoreScroll, setHtmlIntroState]);

  // Allow Escape key to skip intro (normal mode) or dismiss veil (overlay editor mode)
  useEffect(() => {
    if (isStage || phase === 'done' || phase === 'lifting' || editorDismissed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (editorModeRef.current) {
        clearTimers();
        restoreScroll();
        setEditorDismissed(true);
        setPhase('editor-paused');
        onVeilLift?.();
      } else {
        triggerLift(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clearTimers, editorDismissed, isStage, onVeilLift, phase, restoreScroll, triggerLift]);

  // Shared preview controls
  const handlePreviewAnimation = () => {
    setPreviewRunId((id) => id + 1);
    schedulePlayback(false);
  };

  const handleResetPreview = () => {
    clearTimers();
    restoreScroll();
    liftedRef.current = false;
    try {
      window.sessionStorage.removeItem(INTRO_STORAGE_KEY);
    } catch {
      // Ignore restricted storage environments
    }
    setEditorDismissed(false);
    setIsSkipping(false);
    setPreviewRunId((id) => id + 1);
    setPhase('editor-paused');
    if (!isStage) {
      onVeilLift?.();
    }
  };

  const handleEditorDismiss = () => {
    clearTimers();
    restoreScroll();
    liftedRef.current = false;
    setEditorDismissed(true);
    setPhase('editor-paused');
    onVeilLift?.();
  };

  // Normal visitor finished — completely unmount
  if (!isStage && !isEditorMode && phase === 'done') {
    return null;
  }

  // Overlay editor mode with veil manually dismissed — compact non-blocking re-open bar
  if (!isStage && isEditorMode && editorDismissed) {
    return (
      <div className="fixed bottom-5 left-5 z-[60] flex flex-wrap items-center gap-2 border border-[#262923]/18 bg-[#F8F6F1]/95 px-3.5 py-2 text-[#262923] shadow-[0_12px_32px_rgba(38,41,35,0.16)] backdrop-blur-md dark:border-[#F8F6F1]/20 dark:bg-[#20231D]/95 dark:text-[#F8F6F1]">
        <button
          type="button"
          onClick={handleResetPreview}
          data-preview-static="silk-editor-reopen"
          className="inline-flex items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:text-[#B59B79]"
        >
          <Eye className="h-3.5 w-3.5 stroke-[1.6]" />
          Edit Silk Veil
        </button>
        <span aria-hidden="true" className="h-3.5 w-px bg-[#262923]/20 dark:bg-[#F8F6F1]/20" />
        <button
          type="button"
          onClick={handlePreviewAnimation}
          data-preview-static="silk-editor-replay-pill"
          className="inline-flex items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#747B65] transition-colors hover:text-[#262923] dark:text-[#B59B79] dark:hover:text-[#F8F6F1]"
        >
          <Play className="h-3 w-3 stroke-[1.75]" />
          Preview Animation
        </button>
      </div>
    );
  }

  const isLifting = phase === 'lifting' || phase === 'stage-complete';
  const isPausedFrame = phase === 'ssr' || phase === 'editor-paused';
  const isAnimatingFlow =
    phase === 'entering' || phase === 'holding' || phase === 'fading-copy' || phase === 'lifting';
  const showCopy =
    phase === 'ssr' || phase === 'editor-paused' || phase === 'entering' || phase === 'holding';
  const isReplaying = previewRunId > 0 && isAnimatingFlow && !prefersReducedMotion;

  const silkVeilPanel = (
    <motion.div
      key={`silk-veil-root-${previewRunId}`}
      role="region"
      aria-labelledby="loome-silk-veil-title"
      initial={false}
      animate={isLifting ? { y: '-106%', opacity: 0 } : { y: '0%', opacity: 1 }}
      transition={{
        y: {
          duration: isSkipping ? 0.48 : 0.96,
          ease: [0.42, 0, 0.18, 1],
        },
        opacity: {
          duration: isSkipping ? 0.42 : 0.88,
          delay: isSkipping ? 0.04 : 0.1,
          ease: LUXURY_EASE,
        },
      }}
      className={
        isStage
          ? `absolute inset-0 z-20 select-none overflow-visible ${
              isLifting ? 'pointer-events-none' : 'pointer-events-auto'
            }`
          : `loome-silk-veil-root fixed inset-0 z-[70] select-none overflow-visible ${
              isLifting ? 'pointer-events-none' : 'pointer-events-auto'
            }`
      }
    >
      {/* Main Airy Champagne-Ivory Floating Silk Stage */}
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#F7F4EE]">
        {/* Base Warm Ivory Studio Atmosphere */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 110% 88% at 50% 48%, #FCFBF8 0%, #F5F0E7 48%, #EBE1D2 100%)',
          }}
        />

        {/* Primary Lightweight Floating Silk Veil — paused in editor/stage mode, drifting organically on playback */}
        <motion.div
          initial={
            isReplaying ? { scale: 1.07, x: '-1.8%', y: '1.6%', rotate: -0.6 } : false
          }
          animate={
            isAnimatingFlow && !prefersReducedMotion
              ? { scale: 1.13, x: '1.8%', y: '-2%', rotate: 0.6 }
              : { scale: 1.07, x: '-1.2%', y: '1%', rotate: -0.4 }
          }
          transition={
            isAnimatingFlow && !prefersReducedMotion
              ? { duration: 3.0, ease: [0.25, 0.1, 0.25, 1] }
              : { duration: 0.4, ease: LUXURY_EASE }
          }
          className="absolute -inset-8 will-change-transform"
        >
          <img
            src={withBasePath(backgroundImageUrl)}
            alt="LOOMÉ floating champagne-ivory silk veil"
            loading="eager"
            data-preview-field-path="home.silkIntro.backgroundImageUrl"
            className="h-full w-full object-cover object-center opacity-[0.94]"
          />
        </motion.div>

        {/* Gossamer Counter-Drifting Organza Echo Layer — translucent floating depth */}
        <motion.div
          aria-hidden="true"
          initial={
            isReplaying ? { scale: 1.16, x: '2.5%', y: '-1.5%', opacity: 0.16 } : false
          }
          animate={
            isAnimatingFlow && !prefersReducedMotion
              ? { scale: 1.1, x: '-2.5%', y: '1.8%', opacity: 0.24 }
              : { scale: 1.15, x: '2%', y: '-1%', opacity: 0.16 }
          }
          transition={
            isAnimatingFlow && !prefersReducedMotion
              ? { duration: 3.1, ease: [0.25, 0.1, 0.25, 1] }
              : { duration: 0.4, ease: LUXURY_EASE }
          }
          className="pointer-events-none absolute -inset-10 will-change-transform"
        >
          <img
            src={withBasePath(backgroundImageUrl)}
            alt=""
            data-preview-static="silk-veil-echo-layer"
            className="h-full w-full -scale-x-100 object-cover object-center blur-[3px] mix-blend-soft-light"
          />
        </motion.div>

        {/* Flowing Pearlescent Light Reflection — glides softly across the silk crests */}
        <motion.div
          aria-hidden="true"
          initial={
            isReplaying ? { x: '-36%', y: '-6%', skewY: -4, opacity: 0.48 } : false
          }
          animate={
            isAnimatingFlow && !prefersReducedMotion
              ? { x: '32%', y: '4%', skewY: 2, opacity: 0.82 }
              : { x: '-12%', y: '-2%', skewY: -2, opacity: 0.52 }
          }
          transition={
            isAnimatingFlow && !prefersReducedMotion
              ? { duration: 2.75, ease: [0.33, 0.08, 0.28, 1] }
              : { duration: 0.4, ease: LUXURY_EASE }
          }
          className="pointer-events-none absolute -inset-[28%] will-change-transform"
          style={{
            background:
              'linear-gradient(112deg, transparent 22%, rgba(255, 254, 250, 0.68) 43%, rgba(181, 155, 121, 0.14) 53%, rgba(255, 253, 248, 0.42) 63%, transparent 78%)',
          }}
        />

        {/* Soft Center Luminance Halo — keeps wordmark & tagline crisp across all viewports */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 54% 42% at 50% 50%, rgba(251, 249, 245, 0.68) 0%, rgba(251, 249, 245, 0.26) 56%, transparent 100%)',
          }}
        />

        {/* Whisper-Soft Perimeter Depth Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, transparent 50%, rgba(38, 41, 35, 0.06) 100%)',
          }}
        />

        {/* Centered Editorial Wordmark & Tagline (fully editable via Fivora) */}
        <motion.div
          initial={isReplaying ? { opacity: 0, y: 14 } : false}
          animate={showCopy ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{
            duration: showCopy ? 0.72 : 0.38,
            delay: isReplaying && showCopy ? 0.14 : 0,
            ease: LUXURY_EASE,
          }}
          className={`${isStage ? '' : 'loome-silk-veil-copy '}relative z-10 flex flex-col items-center px-6 text-center`}
        >
          <div id="loome-silk-veil-title">
            <EditableText
              as="span"
              data-preview-field-path="home.silkIntro.brandTitle"
              defaultValue={brandTitle}
              fontFamily="heading"
              size="clamp(2.85rem, 6.4vw, 4.9rem)"
              weight={300}
              lineHeight={1}
              letterSpacing="0.34em"
              color="#262923"
              align="center"
              className="inline-block pl-[0.34em]"
            />
          </div>

          <motion.span
            aria-hidden="true"
            initial={false}
            animate={showCopy ? { scaleX: 1, opacity: 1 } : { scaleX: 0.4, opacity: 0 }}
            transition={{
              duration: showCopy ? 0.65 : 0.32,
              ease: LUXURY_EASE,
            }}
            style={{ transformOrigin: 'center' }}
            className="my-5 block h-px w-16 bg-[#B59B79]"
          />

          <EditableText
            as="p"
            data-preview-field-path="home.silkIntro.tagline"
            defaultValue={tagline}
            fontFamily="body"
            size="0.75rem"
            weight={500}
            transform="uppercase"
            letterSpacing="0.32em"
            color="#595C52"
            align="center"
            className="m-0"
          />
        </motion.div>

        {/* Understated Skip Intro Action (merchant-editable label) */}
        <motion.button
          type="button"
          onClick={() =>
            isStage
              ? triggerLift(true)
              : isEditorMode
                ? handleEditorDismiss()
                : triggerLift(true)
          }
          initial={false}
          animate={isLifting ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="absolute bottom-7 right-6 z-20 border-0 border-b border-[#262923]/25 bg-transparent px-0 pb-1 text-[10px] font-medium uppercase tracking-[0.26em] text-[#595C52] transition-colors duration-300 hover:border-[#262923] hover:text-[#262923] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#B59B79] sm:bottom-9 sm:right-10"
        >
          <span data-preview-field-path="home.silkIntro.skipLabel">{skipLabel}</span>
        </motion.button>

        {/* Overlay Editor Controls — mounted ONLY in overlay Fivora editor mode */}
        {!isStage && isEditorMode && !isLifting && (
          <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 border border-[#262923]/15 bg-[#F8F6F1]/95 px-4 py-2 text-[#262923] shadow-[0_14px_36px_rgba(38,41,35,0.14)] backdrop-blur-md sm:bottom-8">
            <span
              data-preview-static="silk-editor-status"
              className="inline-flex items-center gap-1.5 pr-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#747B65]"
            >
              <Sparkles className="h-3 w-3 stroke-[1.6]" />
              {!isEnabled
                ? 'Intro Disabled on Live Site'
                : isPausedFrame
                  ? 'Silk Veil Editor · Paused'
                  : 'Playing Preview…'}
            </span>

            <span
              aria-hidden="true"
              className="hidden h-3.5 w-px bg-[#262923]/18 sm:inline-block"
            />

            <button
              type="button"
              onClick={handlePreviewAnimation}
              data-preview-static="silk-editor-play"
              className="inline-flex items-center gap-1.5 border border-[#262923]/20 bg-[#262923] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#F8F6F1] transition-colors hover:bg-[#747B65]"
            >
              <Play className="h-3 w-3 stroke-[1.75]" />
              Preview Animation
            </button>

            <button
              type="button"
              onClick={handleResetPreview}
              data-preview-static="silk-editor-reset"
              className="inline-flex items-center gap-1.5 border border-[#262923]/20 bg-transparent px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#262923] transition-colors hover:border-[#262923] hover:bg-[#262923]/6"
            >
              <RotateCcw className="h-3 w-3 stroke-[1.6]" />
              Reset Preview
            </button>

            <button
              type="button"
              onClick={handleEditorDismiss}
              data-preview-static="silk-editor-dismiss"
              className="inline-flex items-center gap-1.5 border border-transparent bg-transparent px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#595C52] transition-colors hover:text-[#262923]"
            >
              <EyeOff className="h-3 w-3 stroke-[1.6]" />
              Dismiss to Edit Page
            </button>
          </div>
        )}
      </div>

      {/* Gossamer Trailing Silk Edge — softens the veil's upward dissolve */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-28 w-full sm:h-36"
        style={{
          background:
            'linear-gradient(to bottom, #EFE9DE 0%, rgba(247, 244, 238, 0.74) 45%, rgba(248, 246, 241, 0) 100%)',
        }}
      />
    </motion.div>
  );

  // Overlay mode (used on `/`)
  if (!isStage) {
    return silkVeilPanel;
  }

  // Stage mode (used on `/silk-intro-preview` dedicated Fivora preview page)
  return (
    <div className="w-full">
      {/* Live Interactive Silk Veil Stage with Hero Reveal Backdrop Behind */}
      <div className="relative h-[68vh] min-h-[480px] max-h-[760px] w-full overflow-hidden border-y border-[#262923]/12 bg-[#262923] dark:border-[#F8F6F1]/14">
        {/* Static Hero Reveal Reference Layer (revealed when Preview Animation lifts the veil) */}
        <div className="absolute inset-0 z-10 flex items-end">
          <img
            src={withBasePath(heroPreviewImage)}
            alt=""
            data-preview-static="silk-stage-hero-backdrop"
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E211B]/82 via-[#1E211B]/34 to-[#1E211B]/18" />
          <div className="relative z-10 w-full px-6 pb-10 sm:px-10 sm:pb-12">
            <span
              data-preview-static="silk-stage-revealed-badge"
              className="inline-block border border-[#F8F6F1]/30 bg-[#262923]/55 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#E8E0D5] backdrop-blur-sm"
            >
              Homepage Hero Revealed
            </span>
            <p
              data-preview-static="silk-stage-revealed-title"
              className="mt-3 mb-0 font-serif text-3xl font-light text-[#F8F6F1] sm:text-5xl"
            >
              {heroPreviewTitle}
            </p>
          </div>
        </div>

        {/* Reusable Silk Veil Panel */}
        {silkVeilPanel}
      </div>

      {/* Dedicated Stage Control Bar — always visible and never obscured */}
      <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-8 lg:px-14">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#595C52] dark:text-[#B6B8AE] sm:justify-start">
          <span
            data-preview-static="silk-stage-status"
            className="inline-flex items-center gap-1.5 font-medium text-[#747B65] dark:text-[#B59B79]"
          >
            <Sparkles className="h-3.5 w-3.5 stroke-[1.6]" />
            {phase === 'stage-complete'
              ? 'Preview Complete'
              : isPausedFrame
                ? 'Paused for Editing'
                : 'Playing Silk Veil…'}
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-[#262923]/20 dark:bg-[#F8F6F1]/20" />
          <span data-preview-static="silk-stage-live-status">
            Live Storefront: {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-[#262923]/20 dark:bg-[#F8F6F1]/20" />
          <span data-preview-static="silk-stage-duration">
            Duration: {(totalDurationMs / 1000).toFixed(1)}s
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handlePreviewAnimation}
            data-preview-static="silk-stage-play"
            className="inline-flex items-center gap-2 border border-[#262923] bg-[#262923] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#F8F6F1] transition-colors hover:border-[#747B65] hover:bg-[#747B65] dark:border-[#F8F6F1] dark:bg-[#F8F6F1] dark:text-[#262923] dark:hover:bg-[#E8E0D5]"
          >
            <Play className="h-3.5 w-3.5 stroke-[1.75]" />
            Preview Animation
          </button>

          <button
            type="button"
            onClick={handleResetPreview}
            data-preview-static="silk-stage-reset"
            className="inline-flex items-center gap-2 border border-[#262923]/25 bg-transparent px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#262923] transition-colors hover:border-[#262923] hover:bg-[#262923]/6 dark:border-[#F8F6F1]/25 dark:text-[#F8F6F1] dark:hover:border-[#F8F6F1]"
          >
            <RotateCcw className="h-3.5 w-3.5 stroke-[1.6]" />
            Reset Preview
          </button>
        </div>
      </div>
    </div>
  );
}
