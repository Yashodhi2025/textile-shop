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

  const resolvedUrl =
    ctaUrl.startsWith('#') || /^https?:\/\//i.test(ctaUrl)
      ? ctaUrl
      : withBasePath(ctaUrl);

  return (
    <section
      ref={sectionRef}
      id="featured-collection"
      data-design-section="featured-collection"
      className="relative flex min-h-[76vh] w-full items-center overflow-hidden bg-[#201C1A] py-24"
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
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#201C1A]/56" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#201C1A]/82 via-transparent to-[#201C1A]/35" />
      </motion.div>

      {/* Centered Frosted Espresso Editorial Card (18px rounded) */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14">
        <LuxuryReveal className="mx-auto max-w-2xl rounded-[18px] border border-[#C8A98B]/30 bg-[#201C1A]/68 px-7 py-12 text-center text-[#F2E9DE] backdrop-blur-md sm:px-14 sm:py-16">
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
                letterSpacing="0.28em"
                color="#C8A98B"
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
                size="clamp(2.35rem, 4.5vw, 3.85rem)"
                weight={800}
                lineHeight={1.04}
                letterSpacing="-0.03em"
                color="#F2E9DE"
                align="center"
                className="mt-4 mb-0"
              />
            </LuxuryStaggerItem>

            <LuxuryHairline
              origin="center"
              delay={0.22}
              className="mx-auto my-6 h-px w-14 bg-[#C8A98B]"
            />

            <LuxuryStaggerItem y={16}>
              <EditableText
                as="p"
                data-preview-field-path="home.featuredCollection.description"
                defaultValue={description}
                fontFamily="body"
                size="0.96875rem"
                weight={400}
                lineHeight={1.82}
                color="rgba(242, 233, 222, 0.9)"
                align="center"
                className="mx-auto m-0 max-w-lg"
              />
            </LuxuryStaggerItem>

            <LuxuryStaggerItem y={14}>
              <div className="mt-9 flex justify-center">
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
