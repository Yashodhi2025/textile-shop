'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

export const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EDITORIAL_CURTAIN_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

/**
 * Enables scroll-linked parallax only on desktop-width viewports when the user
 * does not prefer reduced motion, keeping mobile scrolling fluid at 60fps.
 */
export function useParallaxActive(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return isDesktop && !prefersReducedMotion;
}

interface LuxuryRevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}

export function LuxuryReveal({
  children,
  delay = 0,
  duration = 0.82,
  y = 20,
  once = true,
  className = '',
  ...rest
}: LuxuryRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.14 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration, delay, ease: LUXURY_EASE }
      }
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface LuxuryStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export function LuxuryStagger({
  children,
  className = '',
  staggerDelay = 0.1,
  delayChildren = 0.05,
}: LuxuryStaggerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
            delayChildren: prefersReducedMotion ? 0 : delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LuxuryStaggerItem({
  children,
  className = '',
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.78, ease: LUXURY_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface LuxuryImageRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  tone?: 'ivory' | 'beige' | 'charcoal';
}

const CURTAIN_TONES: Record<'ivory' | 'beige' | 'charcoal', string> = {
  ivory: 'bg-[#F8F6F1] dark:bg-[#171915]',
  beige: 'bg-[#E8E0D5] dark:bg-[#20231D]',
  charcoal: 'bg-[#262923] dark:bg-[#141612]',
};

/**
 * Editorial image-mask reveal: glides a soft woven veil upward while the
 * photograph settles gently from 1.07x to 1.0x. Keeps the underlying image
 * unclipped in static HTML for Fivora visual-editing compatibility.
 */
export function LuxuryImageReveal({
  children,
  className = '',
  delay = 0,
  tone = 'beige',
}: LuxuryImageRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={prefersReducedMotion ? false : { scale: 1.07 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.16 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 1.15, delay, ease: LUXURY_EASE }
        }
        className="h-full w-full will-change-transform"
      >
        {children}
      </motion.div>

      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={{ once: true, amount: 0.16 }}
          transition={{ duration: 0.96, delay, ease: EDITORIAL_CURTAIN_EASE }}
          style={{ transformOrigin: 'top' }}
          className={`pointer-events-none absolute inset-0 z-10 will-change-transform ${CURTAIN_TONES[tone]}`}
        />
      )}
    </div>
  );
}

export function LuxuryHairline({
  className = '',
  delay = 0.12,
  origin = 'left',
}: {
  className?: string;
  delay?: number;
  origin?: 'left' | 'center';
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      initial={prefersReducedMotion ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.9, delay, ease: LUXURY_EASE }
      }
      style={{ transformOrigin: origin }}
      className={`block will-change-transform ${className}`}
    />
  );
}
