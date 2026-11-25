'use client';

import { useId } from 'react';

export interface SilkWaveOverlayProps {
  /** Merchant-editable silk sheen / overlay tint color (hex/rgb). Defaults to Champagne #C8A98B. */
  overlayColor?: string;
  /** Deep shadow base color for silk undersides. Defaults to Midnight Espresso #201C1A. */
  baseColor?: string;
  /** Increments on each slide transition to trigger a synchronized luminous silk crest sweep. */
  transitionKey?: number;
  /** Duration (ms) for the synchronized transition silk crest sweep. Defaults to 1400ms. */
  transitionSpeedMs?: number;
  /** Pauses subtle breeze motion when desired. */
  isPaused?: boolean;
  /** Disables animations when prefers-reduced-motion or static mode is active. */
  reducedMotion?: boolean;
  className?: string;
}

/**
 * Reusable, image-independent translucent silk wave overlay.
 * Renders multi-layered gossamer silk drapes sweeping across the lower foreground
 * and rising organically along the right edge, flowing gently like fabric in a soft breeze.
 * Built completely independently from hero photography so merchants can swap images freely.
 */
export default function SilkWaveOverlay({
  overlayColor = '#C8A98B',
  baseColor = '#201C1A',
  transitionKey = 0,
  transitionSpeedMs = 1400,
  isPaused = false,
  reducedMotion = false,
  className = '',
}: SilkWaveOverlayProps) {
  const uid = useId().replace(/:/g, '');
  const backGradId = `silk-back-${uid}`;
  const midGradId = `silk-mid-${uid}`;
  const crestGradId = `silk-crest-${uid}`;
  const highlightGradId = `silk-highlight-${uid}`;
  const foldShadowId = `silk-shadow-${uid}`;
  const blurFilterId = `silk-blur-${uid}`;
  const sweepGradId = `silk-sweep-${uid}`;

  const pauseStyle = isPaused ? ({ animationPlayState: 'paused' } as const) : undefined;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Warm luminous ambient mist rising from lower-right silk fold */}
      <div
        className={`absolute -bottom-[18%] right-[-8%] h-[68%] w-[74%] rounded-full blur-3xl ${
          reducedMotion ? '' : 'loome-silk-glow-breathe'
        }`}
        style={{
          background: `radial-gradient(ellipse 68% 58% at 64% 68%, color-mix(in srgb, ${overlayColor} 20%, transparent) 0%, color-mix(in srgb, ${overlayColor} 8%, transparent) 46%, transparent 74%)`,
          ...pauseStyle,
        }}
      />

      {/* Main multi-layered translucent silk organza drapes */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        <defs>
          {/* Back sweeping translucent silk veil */}
          <linearGradient id={backGradId} x1="8%" y1="95%" x2="96%" y2="18%">
            <stop offset="0%" stopColor={baseColor} stopOpacity="0.18" />
            <stop offset="28%" stopColor={overlayColor} stopOpacity="0.22" />
            <stop offset="56%" stopColor="#F2E9DE" stopOpacity="0.28" />
            <stop offset="78%" stopColor={overlayColor} stopOpacity="0.26" />
            <stop offset="100%" stopColor={baseColor} stopOpacity="0.34" />
          </linearGradient>

          {/* Mid billowing organza ribbon */}
          <linearGradient id={midGradId} x1="0%" y1="88%" x2="100%" y2="28%">
            <stop offset="0%" stopColor={overlayColor} stopOpacity="0.06" />
            <stop offset="22%" stopColor="#F2E9DE" stopOpacity="0.22" />
            <stop offset="48%" stopColor={overlayColor} stopOpacity="0.32" />
            <stop offset="74%" stopColor="#F2E9DE" stopOpacity="0.34" />
            <stop offset="92%" stopColor={overlayColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={baseColor} stopOpacity="0.14" />
          </linearGradient>

          {/* Luminous foreground specular silk wave */}
          <linearGradient id={crestGradId} x1="12%" y1="98%" x2="95%" y2="38%">
            <stop offset="0%" stopColor={overlayColor} stopOpacity="0.04" />
            <stop offset="30%" stopColor="#F2E9DE" stopOpacity="0.26" />
            <stop offset="58%" stopColor={overlayColor} stopOpacity="0.36" />
            <stop offset="82%" stopColor="#F2E9DE" stopOpacity="0.24" />
            <stop offset="100%" stopColor={overlayColor} stopOpacity="0.06" />
          </linearGradient>

          {/* Fine champagne-ivory highlight edge mimicking sunlit silk folds */}
          <linearGradient id={highlightGradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F2E9DE" stopOpacity="0" />
            <stop offset="26%" stopColor="#F2E9DE" stopOpacity="0.52" />
            <stop offset="54%" stopColor={overlayColor} stopOpacity="0.62" />
            <stop offset="82%" stopColor="#F2E9DE" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#F2E9DE" stopOpacity="0" />
          </linearGradient>

          {/* Soft recessed fold shadow */}
          <linearGradient id={foldShadowId} x1="0%" y1="100%" x2="100%" y2="40%">
            <stop offset="0%" stopColor={baseColor} stopOpacity="0.46" />
            <stop offset="50%" stopColor={baseColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={baseColor} stopOpacity="0.08" />
          </linearGradient>

          {/* Soft feather blur for organza depth */}
          <filter id={blurFilterId} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="5.5" />
          </filter>

          {/* Synchronized transition shimmer wave */}
          <linearGradient id={sweepGradId} x1="0%" y1="0%" x2="100%" y2="20%">
            <stop offset="0%" stopColor={overlayColor} stopOpacity="0" />
            <stop offset="38%" stopColor={overlayColor} stopOpacity="0.2" />
            <stop offset="52%" stopColor="#F2E9DE" stopOpacity="0.42" />
            <stop offset="68%" stopColor={overlayColor} stopOpacity="0.16" />
            <stop offset="100%" stopColor={overlayColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* LAYER 1: Back diagonal sheer silk sweep rising smoothly along the right */}
        <g
          className={reducedMotion ? '' : 'loome-silk-breeze-1'}
          style={{ transformOrigin: '65% 75%', ...pauseStyle }}
        >
          <path
            d="M -120 790 C 180 860, 440 715, 760 725 C 1090 735, 1340 520, 1660 110 L 1660 960 L -120 960 Z"
            fill={`url(#${backGradId})`}
            filter={`url(#${blurFilterId})`}
          />
          <path
            d="M -100 810 C 210 872, 470 725, 790 736 C 1110 748, 1360 540, 1650 155"
            fill="none"
            stroke={`url(#${highlightGradId})`}
            strokeWidth="2.2"
            opacity="0.45"
          />
        </g>

        {/* LAYER 2: Mid undulating translucent silk veil with volumetric shadow fold */}
        <g
          className={reducedMotion ? '' : 'loome-silk-breeze-2'}
          style={{ transformOrigin: '50% 82%', ...pauseStyle }}
        >
          {/* Soft recessed shadow beneath the fold */}
          <path
            d="M -100 880 C 220 740, 520 785, 860 830 C 1180 872, 1390 660, 1660 320 L 1660 960 L -100 960 Z"
            fill={`url(#${foldShadowId})`}
          />
          {/* Primary billowing silk body */}
          <path
            d="M -120 845 C 160 700, 460 735, 770 805 C 1095 878, 1355 685, 1660 285 L 1660 960 L -120 960 Z"
            fill={`url(#${midGradId})`}
          />
          {/* Sunlit silk ridge highlight */}
          <path
            d="M -120 845 C 160 700, 460 735, 770 805 C 1095 878, 1355 685, 1660 285"
            fill="none"
            stroke={`url(#${highlightGradId})`}
            strokeWidth="2.6"
            opacity="0.62"
          />
          {/* Secondary delicate sheer crease */}
          <path
            d="M 80 870 C 370 748, 630 785, 920 830 C 1200 874, 1420 705, 1660 385"
            fill="none"
            stroke={`url(#${highlightGradId})`}
            strokeWidth="1.4"
            opacity="0.38"
          />
        </g>

        {/* LAYER 3: Foreground gossamer silk ribbon catching warm specular highlights */}
        <g
          className={reducedMotion ? '' : 'loome-silk-breeze-3'}
          style={{ transformOrigin: '55% 88%', mixBlendMode: 'screen', ...pauseStyle }}
        >
          <path
            d="M -100 930 C 210 835, 490 900, 860 805 C 1170 725, 1385 695, 1660 565 L 1660 960 L -100 960 Z"
            fill={`url(#${crestGradId})`}
          />
          <path
            d="M -80 922 C 225 832, 505 896, 872 802 C 1180 723, 1392 692, 1660 564"
            fill="none"
            stroke={`url(#${highlightGradId})`}
            strokeWidth="2"
            opacity="0.55"
          />
          <path
            d="M 120 935 C 420 855, 695 882, 1020 792 C 1270 722, 1455 712, 1660 632"
            fill="none"
            stroke={`url(#${highlightGradId})`}
            strokeWidth="1.15"
            opacity="0.34"
          />
        </g>
      </svg>

      {/* LAYER 4: Synchronized luminous fabric-wave shimmer crest during slide transitions */}
      {!reducedMotion && transitionKey > 0 && (
        <div
          key={transitionKey}
          className="loome-silk-transition-crest absolute inset-y-0 -left-[35%] w-[65%]"
          style={{
            background: `linear-gradient(106deg, transparent 0%, color-mix(in srgb, ${overlayColor} 16%, transparent) 38%, rgba(242, 233, 222, 0.34) 50%, color-mix(in srgb, ${overlayColor} 12%, transparent) 62%, transparent 100%)`,
            mixBlendMode: 'screen',
            animationDuration: `${transitionSpeedMs}ms`,
          }}
        />
      )}
    </div>
  );
}
