'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { pageRoute, withBasePath } from '@/lib/utils';
import { LUXURY_EASE } from '@/components/motion/LuxuryReveal';

export default function HeroSection() {
  const siteData = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0.2]);

  const home = contentObject(contentObject(siteData.content).home);
  const heroEyebrow = contentText(home.heroEyebrow) || 'LOOMÉ — THE ART OF FINE TEXTILES';
  const heroTitle = contentText(home.heroTitle) || 'Woven for Beautiful Living';
  const heroSummary =
    contentText(home.heroSummary) ||
    'Heirloom Belgian flax curtains, stonewashed linen bedding, and architectural upholstery—loomed in small batches for calm, luminous interiors.';
  const bannerImage = contentText(home.bannerImageUrl) || '/images/hero-linen.jpg';
  const primaryCtaLabel = contentText(home.primaryCtaLabel) || 'Explore Collection';
  const secondaryCtaLabel = contentText(home.secondaryCtaLabel) || 'Our Craft';

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'about_us', 'services', 'contact'];

  const scrollToCollection = () => {
    const el = document.getElementById('new-arrivals') || document.getElementById('categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      data-design-section="home-hero"
      className="relative flex min-h-[82vh] w-full items-end overflow-hidden bg-[#262923] sm:min-h-[86vh] lg:min-h-[88vh]"
    >
      {/* Full-Bleed Editorial Background with Subtle Ken-Burns & Scroll Parallax */}
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        initial={{ scale: 1.09, opacity: 0.88 }}
        animate={{ scale: 1.04, opacity: 1 }}
        transition={{ duration: 1.4, ease: LUXURY_EASE }}
        className="absolute inset-0 h-full w-full will-change-transform"
      >
        <img
          src={withBasePath(bannerImage)}
          alt="LOOMÉ luxury Belgian linen drapery and serene living space"
          data-preview-field-path="home.bannerImageUrl"
          className="h-full w-full object-cover object-center"
        />
        {/* Warm layered atmospheric contrast veils */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E211B]/84 via-[#1E211B]/34 to-[#1E211B]/14" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E211B]/68 via-[#1E211B]/28 to-transparent" />
      </motion.div>

      {/* Hero Editorial Copy */}
      <motion.div
        style={{ opacity: copyOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:px-14 lg:pb-24"
      >
        <div className="max-w-4xl text-[#F8F6F1]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.14, ease: LUXURY_EASE }}
            className="flex items-center gap-3.5"
          >
            <span className="h-px w-10 bg-[#B59B79]" aria-hidden="true" />
            <EditableText
              as="p"
              data-preview-field-path="home.heroEyebrow"
              defaultValue={heroEyebrow}
              fontFamily="body"
              size="0.6875rem"
              weight={500}
              transform="uppercase"
              letterSpacing="0.28em"
              color="#E8E0D5"
              className="m-0"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.26, ease: LUXURY_EASE }}
            className="mt-5"
          >
            <EditableText
              as="h1"
              data-preview-field-path="home.heroTitle"
              defaultValue={heroTitle}
              fontFamily="heading"
              size="clamp(3.15rem, 5.8vw, 5.15rem)"
              weight={300}
              lineHeight={0.98}
              letterSpacing="-0.025em"
              color="#F8F6F1"
              className="m-0 max-w-[14ch] drop-shadow-[0_2px_24px_rgba(24,27,22,0.28)]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.4, ease: LUXURY_EASE }}
            className="mt-6 max-w-xl"
          >
            <EditableText
              as="p"
              data-preview-field-path="home.heroSummary"
              defaultValue={heroSummary}
              fontFamily="body"
              size="clamp(0.975rem, 1.15vw, 1.075rem)"
              weight={400}
              lineHeight={1.78}
              color="rgba(248, 246, 241, 0.92)"
              className="m-0"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.54, ease: LUXURY_EASE }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={scrollToCollection}
              className="group loome-btn-ivory h-[52px] px-8"
            >
              <span data-preview-field-path="home.primaryCtaLabel">{primaryCtaLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {requiredPages.includes('about_us') ? (
              <button
                type="button"
                onClick={() => {
                  window.location.href = withBasePath(pageRoute('about_us'));
                }}
                data-target-page="about_us"
                className="group inline-flex h-[52px] items-center justify-center gap-2.5 border border-[#F8F6F1]/55 bg-[#262923]/35 px-8 text-[12px] font-medium uppercase tracking-[0.2em] text-[#F8F6F1] backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-[#F8F6F1] hover:bg-[#F8F6F1]/18"
              >
                <span data-preview-field-path="home.secondaryCtaLabel">{secondaryCtaLabel}</span>
              </button>
            ) : (
              <span
                data-target-page="about_us"
                data-preview-field-path="home.secondaryCtaLabel"
                className="unavailable inline-flex h-[52px] items-center border border-[#F8F6F1]/30 px-8 text-[12px] uppercase tracking-[0.2em] text-[#F8F6F1]"
              >
                {secondaryCtaLabel}
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Refined Animated Scroll Indicator */}
      <motion.button
        type="button"
        onClick={scrollToCollection}
        aria-label="Scroll to discover collections"
        data-preview-static="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.95, duration: 0.8 }}
        className="absolute bottom-7 right-6 z-10 hidden flex-col items-center gap-3 border-0 bg-transparent text-[#F8F6F1]/80 transition-colors hover:text-[#F8F6F1] md:flex lg:right-14"
      >
        <span
          data-preview-static="hero-scroll-text"
          className="text-[9px] uppercase tracking-[0.28em] [writing-mode:vertical-rl]"
        >
          Scroll
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-[#F8F6F1]/28">
          <span className="loome-scroll-line absolute inset-0 bg-[#B59B79]" />
        </span>
      </motion.button>
    </section>
  );
}
