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
      className="loome-surface-ivory w-full py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-10">
        {/* Left: Layered Editorial Loom & Weave Photography with Curtain Mask & Desktop Parallax */}
        <div className="relative lg:col-span-6">
          <LuxuryImageReveal tone="ivory" className="overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--loome-beige)]">
            <motion.div
              style={parallaxActive ? { y: mainImageY } : undefined}
              className="aspect-square w-full will-change-transform"
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
            className="absolute -bottom-6 -right-3 z-20 hidden w-40 overflow-hidden rounded-2xl border-4 border-[var(--loome-ivory)] bg-[var(--card-bg)] shadow-[0_14px_32px_rgba(73,56,44,0.14)] sm:block md:w-44 lg:-right-6"
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
            className="mt-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]"
          >
            {caption}
          </p>
        </div>

        {/* Right: Luxury Editorial Storytelling */}
        <div className="lg:col-span-6 lg:pl-6">
          <LuxuryStagger staggerDelay={0.11} delayChildren={0.05}>
            <LuxuryStaggerItem y={16}>
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[var(--brand-accent)]" />
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
                size="clamp(1.85rem, 3vw, 2.5rem)"
                weight={800}
                lineHeight={1.08}
                letterSpacing="-0.025em"
                color="heading"
                className="mt-2.5 mb-0"
              />
            </LuxuryStaggerItem>

            <LuxuryStaggerItem y={18}>
              <EditableText
                as="p"
                data-preview-field-path="home.introBody"
                defaultValue={body}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.75}
                color="muted"
                className="mt-4 mb-0 max-w-xl"
              />
            </LuxuryStaggerItem>

            {/* Provenance Pillars */}
            <LuxuryStaggerItem y={18}>
              <div className="mt-7 grid grid-cols-3 gap-4 border-y border-[var(--loome-border)] py-5">
                {ATELIER_METRICS.map((metric) => (
                  <div key={metric.label}>
                    <p
                      data-preview-static={`craft-metric-val-${metric.label}`}
                      className="m-0 font-heading text-lg font-extrabold tracking-tight text-[var(--heading-color)] sm:text-xl"
                    >
                      {metric.value}
                    </p>
                    <p
                      data-preview-static={`craft-metric-lbl-${metric.label}`}
                      className="mt-1 m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent)]"
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
                className="mt-7 flex flex-wrap items-center gap-3.5"
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
