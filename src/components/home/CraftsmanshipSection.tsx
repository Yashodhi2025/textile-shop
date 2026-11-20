'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { LuxuryReveal } from '@/components/motion/LuxuryReveal';

const ATELIER_METRICS = [
  { value: '100%', label: 'European Flax' },
  { value: '60K+', label: 'Martindale Rubs' },
  { value: 'OEKO-TEX', label: 'Standard 100' },
];

export default function CraftsmanshipSection() {
  const siteData = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const mainImageY = useTransform(scrollYProgress, [0, 1], ['-4%', '5%']);
  const insetY = useTransform(scrollYProgress, [0, 1], ['8%', '-10%']);

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
      className="w-full border-y border-[#262923]/8 bg-[#E8E0D5]/42 py-16 dark:border-[#F8F6F1]/8 dark:bg-[#20231D] sm:py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-14 px-4 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-14">
        {/* Left: Layered Editorial Loom & Weave Photography */}
        <div className="relative lg:col-span-6">
          <LuxuryReveal className="relative overflow-hidden bg-[#E8E0D5]">
            <motion.div style={{ y: mainImageY }} className="aspect-[4/5] w-full will-change-transform">
              <img
                src={withBasePath(mainImage)}
                alt="LOOMÉ heritage loom weaving craftsmanship"
                loading="lazy"
                data-preview-field-path="home.craftsmanshipImageUrl"
                className="h-full w-full scale-[1.06] object-cover"
              />
            </motion.div>
          </LuxuryReveal>

          {/* Overlapping Macro Weave Detail Inset */}
          <motion.div
            style={{ y: insetY }}
            className="absolute -bottom-8 -right-3 hidden w-44 border-4 border-[#F8F6F1] bg-[#F8F6F1] shadow-[0_24px_50px_rgba(38,41,35,0.16)] dark:border-[#171915] dark:bg-[#171915] sm:block md:w-52 lg:-right-8"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={withBasePath(detailImage)}
                alt="Close-up macro texture of woven Belgian flax linen"
                loading="lazy"
                data-preview-field-path="home.craftsmanshipDetailImageUrl"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>

          <p
            data-preview-field-path="home.craftsmanshipCaption"
            className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[#65685E] dark:text-[#B6B8AE]"
          >
            {caption}
          </p>
        </div>

        {/* Right: Luxury Editorial Storytelling */}
        <div className="lg:col-span-6 lg:pl-8">
          <LuxuryReveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B59B79]" aria-hidden="true" />
              <EditableText
                as="p"
                data-preview-field-path="home.introEyebrow"
                defaultValue={eyebrow}
                fontFamily="body"
                size="0.6875rem"
                weight={500}
                transform="uppercase"
                letterSpacing="0.26em"
                color="primary"
                className="m-0"
              />
            </div>

            <EditableText
              as="h2"
              data-preview-field-path="home.introTitle"
              defaultValue={title}
              fontFamily="heading"
              size="clamp(2.4rem, 4.4vw, 3.75rem)"
              weight={300}
              lineHeight={1.04}
              letterSpacing="-0.02em"
              color="heading"
              className="mt-4 mb-0"
            />

            <EditableText
              as="p"
              data-preview-field-path="home.introBody"
              defaultValue={body}
              fontFamily="body"
              size="0.96875rem"
              lineHeight={1.85}
              color="muted"
              className="mt-6 mb-0 max-w-xl"
            />

            {/* Provenance Pillars */}
            <div className="mt-10 grid grid-cols-3 gap-6 border-y border-[#262923]/12 py-6 dark:border-[#F8F6F1]/12">
              {ATELIER_METRICS.map((metric) => (
                <div key={metric.label}>
                  <p
                    data-preview-static={`craft-metric-val-${metric.label}`}
                    className="m-0 font-serif text-2xl font-normal text-[#262923] dark:text-[#F8F6F1] sm:text-3xl"
                  >
                    {metric.value}
                  </p>
                  <p
                    data-preview-static={`craft-metric-lbl-${metric.label}`}
                    className="mt-1 m-0 text-[10px] uppercase tracking-[0.2em] text-[#747B65] dark:text-[#B59B79]"
                  >
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Always-mounted Fivora editable CTA list */}
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
                    <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                );
              })}
            </div>
          </LuxuryReveal>
        </div>
      </div>
    </section>
  );
}
