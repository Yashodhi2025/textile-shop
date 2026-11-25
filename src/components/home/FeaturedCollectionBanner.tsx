'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import {
  LuxuryHairline,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
  useParallaxActive,
} from '@/components/motion/LuxuryReveal';

export default function FeaturedCollectionBanner() {
  const siteData = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxActive = useParallaxActive();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.0]);

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

  const requiredPages: string[] = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [];

  const resolvedUrl = (() => {
    const clean = ctaUrl.trim();
    if (!clean) return '#bestsellers';
    if (clean.startsWith('#') || /^https?:\/\//i.test(clean)) return clean;
    const pageKey = clean.replace(/^\/+/, '').split(/[/?#]/)[0].replace(/-/g, '_');
    if (pageKey && pageKey !== 'home' && !requiredPages.includes(pageKey)) {
      return '#bestsellers';
    }
    return withBasePath(clean);
  })();

  return (
    <section
      ref={sectionRef}
      id="featured-collection"
      data-design-section="featured-collection"
      className="loome-surface-espresso relative flex min-h-[54vh] w-full items-center overflow-hidden bg-[#2D2722] py-14 lg:py-16"
    >
      {/* Parallax Immersive Editorial Photography (desktop-only parallax for mobile smoothness) */}
      <motion.div
        style={parallaxActive ? { y: bgY, scale: bgScale } : undefined}
        className="absolute inset-0 -top-[10%] h-[120%] w-full will-change-transform"
      >
        <img
          src={withBasePath(imageUrl)}
          alt={title}
          loading="lazy"
          data-preview-field-path="home.featuredCollection.imageUrl"
          data-preview-style-target="home.featuredCollection.imageUrl"
          data-preview-style-type="image"
          className="h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-[#2D2722]/58" />
      </motion.div>

      {/* Centered Frosted Walnut Editorial Card */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        <LuxuryReveal className="mx-auto max-w-2xl rounded-2xl border border-[#B18D69]/35 bg-[#2D2722]/78 px-6 py-9 text-center text-[#F7F4EF] backdrop-blur-md sm:px-12 sm:py-12">
          <LuxuryStagger staggerDelay={0.1} delayChildren={0.08}>
            <LuxuryStaggerItem y={14}>
              <EditableText
                as="p"
                data-preview-field-path="home.featuredCollection.eyebrow"
                defaultValue={eyebrow}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.26em"
                color="#C7A684"
                align="center"
                className="m-0"
              />
            </LuxuryStaggerItem>

            <LuxuryStaggerItem y={20}>
              <EditableText
                as="h2"
                data-preview-field-path="home.featuredCollection.title"
                defaultValue={title}
                fontFamily="heading"
                size="clamp(1.9rem, 3.2vw, 2.7rem)"
                weight={800}
                lineHeight={1.08}
                letterSpacing="-0.025em"
                color="#F7F4EF"
                align="center"
                className="mt-3 mb-0"
              />
            </LuxuryStaggerItem>

            <LuxuryHairline
              origin="center"
              delay={0.22}
              className="mx-auto my-5 h-px w-12 bg-[#B18D69]"
            />

            <LuxuryStaggerItem y={16}>
              <EditableText
                as="p"
                data-preview-field-path="home.featuredCollection.description"
                defaultValue={description}
                fontFamily="body"
                size="0.9375rem"
                weight={400}
                lineHeight={1.75}
                color="rgba(247, 244, 239, 0.9)"
                align="center"
                className="mx-auto m-0 max-w-lg"
              />
            </LuxuryStaggerItem>

            <LuxuryStaggerItem y={14}>
              <div className="mt-7 flex justify-center">
                <a
                  href={resolvedUrl}
                  data-preview-field-path="home.featuredCollection.ctaUrl"
                  className="group loome-btn-primary"
                >
                  <span data-preview-field-path="home.featuredCollection.ctaLabel">{ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.7] transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </LuxuryStaggerItem>
          </LuxuryStagger>
        </LuxuryReveal>
      </div>
    </section>
  );
}
