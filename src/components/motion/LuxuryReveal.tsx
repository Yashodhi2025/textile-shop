'use client';

import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
  duration = 0.78,
  y = 26,
  once = true,
  className = '',
  ...rest
}: LuxuryRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.14 }}
      transition={{ duration, delay, ease: LUXURY_EASE }}
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
  staggerDelay = 0.09,
  delayChildren = 0.05,
}: LuxuryStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.72, ease: LUXURY_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
