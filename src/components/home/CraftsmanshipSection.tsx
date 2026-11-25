'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import {
  LuxuryHairline,
  LuxuryImageReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
  useParallaxActive,
} from '@/components/motion/LuxuryReveal';

const ATELIER_METRICS = [
  { value: '100%', label: 'Natural Flax & Cotton' },
  { value: '10+ Yrs', label: 'Everyday Durability' },
  { value: 'Certified', label: 'Skin-Safe Dyes' },
];

export default function CraftsmanshipSection() {
  const siteData = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxActive = useParallaxActive();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const mainImageY = useTransform(scrollYProgress, [0, 1], ['-4%', '5%']);
  const insetY = useTransform(scrollYProgress, [0, 1], ['8%', '-9%']);

  const home = contentObject(contentObject(siteData.content).home);
  const eyebrow = contentText(home.introEyebrow) || 'HERITAGE & ATELIER';
  const title = contentText(home.introTitle) || 'The Beauty Is in the Details';
  const body = contentText(home.introBody);
  const mainImage = contentText(home.craftsmanshipImageUrl) || '/images/craftsmanship-loom.jpg';
  const detailImage =
    contentText(home.craftsmanshipDetailImageUrl) || '/images/craftsmanship-detail.jpg';
  const caption =
    contentText(home.craftsmanshipCaption) || 'Shuttle-Woven Belgian Flax · Atelier Loom No. 04';
  const ctaList = contentList(home.demoPreOrderCta);
  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'about_us', 'services', 'contact'];

  const resolveHref = (href: string) => {
    if (!href) return '#';
    if (href.startsWith('#') || /^https?:\/\//i.test(href)) return href;
    const clean = href.replace(/^\/+|\/+$/g, '');
    if (['about_us', 'services', 'contact'].includes(clean) && !requiredPages.includes(clean)) {
      return '#featured-collection';
    }
    return withBasePath(href);
  };

  return (
    <section
      ref={sectionRef}
      id="craftsmanship"
      data-design-section="home-introduction"
      className="loome-surface-ivory w-full py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-14">
        {/* Left: Layered Editorial Loom & Weave Photography with Curtain Mask & Desktop Parallax */}
        <div className="relative lg:col-span-6">
          <LuxuryImageReveal tone="ivory" className="overflow-hidden rounded-2xl border border-[#49382D]/12 bg-[#E8DDD0] dark:border-[#C8A98B]/20 dark:bg-[#28211D]">
            <motion.div
              style={parallaxActive ? { y: mainImageY } : undefined}
              className="aspect-[4/5] w-full will-change-transform"
            >
              <img
                src={withBasePath(mainImage)}
                alt="LOOMÉ heritage loom weaving craftsmanship"
                loading="lazy"
                data-preview-field-path="home.craftsmanshipImageUrl"
                className="h-full w-full scale-[1.06] object-cover"
              />
            </motion.div>
          </LuxuryImageReveal>

          {/* Overlapping Macro Weave Detail Inset */}
          <motion.div
            style={parallaxActive ? { y: insetY } : undefined}
            className="absolute -bottom-8 -right-3 z-20 hidden w-44 overflow-hidden rounded-2xl border-4 border-[#F7F3ED] bg-white shadow-[0_16px_36px_rgba(73,56,45,0.16)] dark:border-[#1A1614] dark:bg-[#28211D] sm:block md:w-52 lg:-right-8"
          >
            <LuxuryImageReveal delay={0.22} tone="ivory" className="aspect-square">
              <img
                src={withBasePath(detailImage)}
                alt="Close-up macro texture of woven Belgian flax linen"
                loading="lazy"
                data-preview-field-path="home.craftsmanshipDetailImageUrl"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-luxury hover:scale-[1.05]"
              />
            </LuxuryImageReveal>
          </motion.div>

          <p
            data-preview-field-path="home.craftsmanshipCaption"
            className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B28B65] dark:text-[#C8A98B]"
          >
            {caption}
          </p>
        </div>

        {/* Right: Luxury Editorial Storytelling */}
        <div className="lg:col-span-6 lg:pl-8">
          <LuxuryStagger staggerDelay={0.11} delayChildren={0.05}>
            <LuxuryStaggerItem y={16}>
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[#B28B65] dark:bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="home.introEyebrow"
                  defaultValue={eyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.24em"
                  color="primary"
                  className="m-0"
                />
              </div>
            </LuxuryStaggerItem>

            <LuxuryStaggerItem y={22}>
              <EditableText
                as="h2"
                data-preview-field-path="home.introTitle"
                defaultValue={title}
                fontFamily="heading"
                size="clamp(2.2rem, 4vw, 3.4rem)"
                weight={800}
                lineHeight={1.06}
                letterSpacing="-0.03em"
                color="heading"
                className="mt-3.5 mb-0"
              />
            </LuxuryStaggerItem>

            <LuxuryStaggerItem y={18}>
              <EditableText
                as="p"
                data-preview-field-path="home.introBody"
                defaultValue={body}
                fontFamily="body"
                size="0.96875rem"
                lineHeight={1.82}
                color="muted"
                className="mt-5 mb-0 max-w-xl"
              />
            </LuxuryStaggerItem>

            {/* Provenance Pillars */}
            <LuxuryStaggerItem y={18}>
              <div className="mt-9 grid grid-cols-3 gap-5 border-y border-[#49382D]/14 py-6 dark:border-[#C8A98B]/20">
                {ATELIER_METRICS.map((metric) => (
                  <div key={metric.label}>
                    <p
                      data-preview-static={`craft-metric-val-${metric.label}`}
                      className="m-0 font-heading text-xl font-extrabold tracking-tight text-[#2C211B] dark:text-[#F5EEE6] sm:text-2xl"
                    >
                      {metric.value}
                    </p>
                    <p
                      data-preview-static={`craft-metric-lbl-${metric.label}`}
                      className="mt-1 m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B28B65] dark:text-[#C8A98B]"
                    >
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </LuxuryStaggerItem>

            {/* Always-mounted Fivora editable CTA list */}
            <LuxuryStaggerItem y={16}>
              <div
                data-preview-list-path="home.demoPreOrderCta"
                className="mt-9 flex flex-wrap items-center gap-4"
              >
                {ctaList.map((rawCta, index) => {
                  const cta = contentObject(rawCta);
                  const label = contentText(cta.buttonLabel) || 'Order Complimentary Swatches';
                  const url = contentText(cta.buttonUrl) || '/contact';
                  return (
                    <a
                      key={index}
                      href={resolveHref(url)}
                      data-preview-item-path={`home.demoPreOrderCta[${index}]`}
                      data-preview-field-path={`home.demoPreOrderCta[${index}].buttonUrl`}
                      className="group loome-btn-primary"
                    >
                      <span data-preview-field-path={`home.demoPreOrderCta[${index}].buttonLabel`}>
                        {label}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 stroke-[1.7] transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  );
                })}
              </div>
            </LuxuryStaggerItem>
          </LuxuryStagger>
        </div>
      </div>
    </section>
  );
}
