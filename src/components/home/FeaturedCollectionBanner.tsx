'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { LuxuryReveal } from '@/components/motion/LuxuryReveal';

export default function FeaturedCollectionBanner() {
  const siteData = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const home = contentObject(contentObject(siteData.content).home);
  const featured = contentObject(home.featuredCollection);

  const eyebrow = contentText(featured.eyebrow) || 'AUTUMN / WINTER 2026 EDIT';
  const title = contentText(featured.title) || 'The Solitude Collection';
  const description =
    contentText(featured.description) ||
    'Sun-warmed limestone neutrals, sage olive merino throws, and translucent linen drapes designed to soften architectural light.';
  const imageUrl = contentText(featured.imageUrl) || '/images/featured-collection.jpg';
  const ctaLabel = contentText(featured.ctaLabel) || 'Discover the Edit';
  const ctaUrl = contentText(featured.ctaUrl) || '#bestsellers';

  const resolvedUrl =
    ctaUrl.startsWith('#') || /^https?:\/\//i.test(ctaUrl)
      ? ctaUrl
      : withBasePath(ctaUrl);

  return (
    <section
      ref={sectionRef}
      id="featured-collection"
      data-design-section="featured-collection"
      className="relative flex min-h-[76vh] w-full items-center overflow-hidden bg-[#262923] py-24"
    >
      {/* Parallax Immersive Editorial Photography */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -top-[10%] h-[120%] w-full will-change-transform"
      >
        <img
          src={withBasePath(imageUrl)}
          alt={title}
          loading="lazy"
          data-preview-field-path="home.featuredCollection.imageUrl"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#262923]/48" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#262923]/72 via-transparent to-[#262923]/25" />
      </motion.div>

      {/* Centered Glass-Veiled Editorial Messaging */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
        <LuxuryReveal className="mx-auto max-w-2xl border border-[#F8F6F1]/22 bg-[#262923]/42 px-7 py-12 text-center text-[#F8F6F1] backdrop-blur-md sm:px-14 sm:py-16">
          <EditableText
            as="p"
            data-preview-field-path="home.featuredCollection.eyebrow"
            defaultValue={eyebrow}
            fontFamily="body"
            className="m-0 text-[11px] font-medium uppercase tracking-[0.28em] text-[#E8E0D5]"
          />

          <EditableText
            as="h2"
            data-preview-field-path="home.featuredCollection.title"
            defaultValue={title}
            fontFamily="heading"
            className="mt-4 font-serif text-4xl font-light leading-[1.04] tracking-tight text-[#F8F6F1] sm:text-5xl lg:text-6xl"
          />

          <div className="mx-auto my-6 h-px w-14 bg-[#B59B79]" aria-hidden="true" />

          <EditableText
            as="p"
            data-preview-field-path="home.featuredCollection.description"
            defaultValue={description}
            fontFamily="body"
            className="mx-auto m-0 max-w-lg text-sm font-light leading-[1.85] text-[#F8F6F1]/86 sm:text-[15px]"
          />

          <div className="mt-9 flex justify-center">
            <a
              href={resolvedUrl}
              data-preview-field-path="home.featuredCollection.ctaUrl"
              className="group loome-btn-ivory"
            >
              <span data-preview-field-path="home.featuredCollection.ctaLabel">{ctaLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </LuxuryReveal>
      </div>
    </section>
  );
}
