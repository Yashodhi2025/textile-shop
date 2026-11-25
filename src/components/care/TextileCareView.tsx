'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Archive,
  ArrowRight,
  ChevronDown,
  Droplets,
  Feather,
  Flame,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import {
  LUXURY_EASE,
  LuxuryHairline,
  LuxuryImageReveal,
  LuxuryReveal,
  LuxuryStagger,
  LuxuryStaggerItem,
} from '@/components/motion/LuxuryReveal';

interface CareFabricItem {
  index: number;
  id: string;
  name: string;
  subtitle: string;
  fiberProfile: string;
  quickSummary: string;
  imageUrl: string;
  washing: string;
  drying: string;
  ironing: string;
  storage: string;
  maintenance: string;
  atelierNote: string;
}

interface CareTipItem {
  index: number;
  id: string;
  tag: string;
  question: string;
  answer: string;
}

interface LongevityPillarItem {
  index: number;
  id: string;
  title: string;
  detail: string;
}

export default function TextileCareView() {
  const siteData = useSiteData();
  const prefersReducedMotion = useReducedMotion();

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const carePage = contentObject(content.textileCarePage);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'cart',
        'checkout',
        'journal',
        'textile_care',
        'about_us',
        'services',
        'contact',
      ];
  const hasShopPage = requiredPages.includes('shop');

  const fabrics = useMemo<CareFabricItem[]>(
    () =>
      contentList(carePage.fabrics).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `fabric-${idx}`,
          name: contentText(obj.name) || 'Natural Fiber',
          subtitle: contentText(obj.subtitle),
          fiberProfile: contentText(obj.fiberProfile),
          quickSummary: contentText(obj.quickSummary),
          imageUrl: contentText(obj.imageUrl) || '/images/cat-bedding.jpg',
          washing: contentText(obj.washing),
          drying: contentText(obj.drying),
          ironing: contentText(obj.ironing),
          storage: contentText(obj.storage),
          maintenance: contentText(obj.maintenance),
          atelierNote: contentText(obj.atelierNote),
        };
      }),
    [carePage.fabrics],
  );

  const careTips = useMemo<CareTipItem[]>(
    () =>
      contentList(carePage.careTips).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `tip-${idx}`,
          tag: contentText(obj.tag) || 'Care Tip',
          question: contentText(obj.question) || 'Textile care guidance',
          answer: contentText(obj.answer),
        };
      }),
    [carePage.careTips],
  );

  const longevityPillars = useMemo<LongevityPillarItem[]>(
    () =>
      contentList(carePage.longevityPillars).map((raw, idx) => {
        const obj = contentObject(raw);
        return {
          index: idx,
          id: contentText(obj.id) || `pillar-${idx}`,
          title: contentText(obj.title) || 'Thoughtful Care',
          detail: contentText(obj.detail),
        };
      }),
    [carePage.longevityPillars],
  );

  const [selectedFabricId, setSelectedFabricId] = useState<string>('all');
  const [openTipIds, setOpenTipIds] = useState<Record<string, boolean>>({});

  const activeFabricId = useMemo(() => {
    if (selectedFabricId === 'all') return 'all';
    if (fabrics.some((f) => f.id === selectedFabricId)) {
      return selectedFabricId;
    }
    return 'all';
  }, [fabrics, selectedFabricId]);

  const visibleFabrics = useMemo(() => {
    if (activeFabricId === 'all') return fabrics;
    return fabrics.filter((f) => f.id === activeFabricId);
  }, [fabrics, activeFabricId]);

  // All tips start expanded so every answer is immediately visible & editable in Fivora,
  // while visitors can click any accordion trigger to collapse or re-expand smoothly.
  const isTipOpen = (tip: CareTipItem) => {
    if (Object.prototype.hasOwnProperty.call(openTipIds, tip.id)) {
      return Boolean(openTipIds[tip.id]);
    }
    return true;
  };

  const toggleTip = (tip: CareTipItem) => {
    setOpenTipIds((prev) => {
      const current = Object.prototype.hasOwnProperty.call(prev, tip.id)
        ? Boolean(prev[tip.id])
        : true;
      return { ...prev, [tip.id]: !current };
    });
  };

  // Editable page labels & copy
  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const textileCareNavLabel = contentText(navLabels.textile_care) || 'Textile Care';
  const eyebrow = contentText(carePage.eyebrow) || 'ATELIER CARE MANUAL';
  const heading = contentText(carePage.heading) || 'The Art of Textile Care';
  const intro =
    contentText(carePage.intro) ||
    'Natural fibers reward unhurried stewardship. Explore our atelier guidance for laundering, drying, steaming, storing, and preserving fine textiles.';

  const labelReminderHeading =
    contentText(carePage.labelReminderHeading) || 'Always Follow Your Product Care Label';
  const labelReminderBody =
    contentText(carePage.labelReminderBody) ||
    'This guide offers accurate general care advice for pure natural textiles. Always follow the individual care label sewn into your specific LOOMÉ piece.';

  const fabricsEyebrow = contentText(carePage.fabricsEyebrow) || 'BY FIBER & WEAVE';
  const fabricsHeading = contentText(carePage.fabricsHeading) || 'Fabric Care Directory';
  const allFabricsLabel = contentText(carePage.allFabricsLabel) || 'All Fabrics';

  const stepWashingLabel = contentText(carePage.stepWashingLabel) || 'Washing';
  const stepDryingLabel = contentText(carePage.stepDryingLabel) || 'Drying';
  const stepIroningLabel = contentText(carePage.stepIroningLabel) || 'Ironing & Steaming';
  const stepStorageLabel = contentText(carePage.stepStorageLabel) || 'Storage';
  const stepMaintenanceLabel = contentText(carePage.stepMaintenanceLabel) || 'Maintenance';
  const atelierNoteLabel = contentText(carePage.atelierNoteLabel) || 'Atelier Tip';

  const tipsEyebrow = contentText(carePage.tipsEyebrow) || 'ATELIER TECHNIQUES';
  const tipsHeading = contentText(carePage.tipsHeading) || 'Essential Care Rituals';
  const tipsIntro =
    contentText(carePage.tipsIntro) ||
    'Small, deliberate habits protect fiber integrity, subtle neutral tones, and tailored architectural drape across decades of daily living.';
  const legendWashLabel = contentText(carePage.legendWashLabel) || 'Cool Gentle Wash';
  const legendDryLabel = contentText(carePage.legendDryLabel) || 'Shade Line Dry';
  const legendSteamLabel = contentText(carePage.legendSteamLabel) || 'Reverse Steam';
  const legendStoreLabel = contentText(carePage.legendStoreLabel) || 'Breathable Storage';

  const longevityEyebrow = contentText(carePage.longevityEyebrow) || 'THE PATINA OF TIME';
  const longevityHeading =
    contentText(carePage.longevityHeading) || 'Woven to Soften, Made to Endure';
  const longevityBody =
    contentText(carePage.longevityBody) ||
    'Fine textiles are crafted to live beside you, softening with every season and gathering quiet character as light moves across a room.';
  const longevityImageUrl =
    contentText(carePage.longevityImageUrl) || '/images/craftsmanship-detail.jpg';
  const longevityCaption =
    contentText(carePage.longevityCaption) ||
    'Hand-Finished Champagne Selvedge · Long-Staple European Flax';

  const shopCtaEyebrow = contentText(carePage.shopCtaEyebrow) || 'EXPLORE THE COLLECTION';
  const shopCtaHeading =
    contentText(carePage.shopCtaHeading) || 'Bring Enduring Natural Textiles Home';
  const shopCtaDescription =
    contentText(carePage.shopCtaDescription) ||
    'Discover our Belgian flax drapery, stonewashed European linen bedding, washed velvet accents, and heirloom upholstery weaves.';
  const shopCtaLabel = contentText(carePage.shopCtaLabel) || 'Explore the Shop';

  return (
    <div
      data-preview-page-key="textile_care"
      className="loome-surface-cream min-h-[75vh] w-full bg-[#F2E9DE] text-[#201C1A]"
    >
      {/* Editorial Breadcrumb Strip */}
      <div className="border-b border-[#201C1A]/8 bg-[#FAF5EE]/95 dark:border-[#F2E9DE]/10 dark:bg-[#201C1A]">
        <nav className="mx-auto flex max-w-[1380px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] dark:text-[#C7B6A6] sm:px-8 lg:px-14">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] uppercase tracking-[0.2em] text-[#5E4E45] transition-colors hover:text-[#201C1A] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" className="text-[#C8A98B]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.textile_care"
            className="font-medium text-[#201C1A] dark:text-[#F2E9DE]"
          >
            {textileCareNavLabel}
          </span>
        </nav>
      </div>

      {/* Editorial Hero & Care Label Advisory */}
      <section
        data-design-section="textile-care-hero"
        className="border-b border-[#201C1A]/8 bg-gradient-to-b from-[#E6D9C9]/90 via-[#F2E9DE] to-[#F2E9DE] dark:border-[#F2E9DE]/10 dark:from-[#2B2320] dark:via-[#201C1A] dark:to-[#201C1A]"
      >
        <div className="mx-auto max-w-[1380px] px-4 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
            <LuxuryReveal className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-9 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="textileCarePage.eyebrow"
                  defaultValue={eyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.28em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h1"
                data-preview-field-path="textileCarePage.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(2.65rem, 5vw, 4.35rem)"
                weight={300}
                lineHeight={1.04}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-4 mb-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="textileCarePage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.975rem"
                lineHeight={1.82}
                color="muted"
                className="mt-5 mb-0 max-w-2xl"
              />
            </LuxuryReveal>

            {/* Product Care Label Advisory Card */}
            <LuxuryReveal delay={0.12} className="lg:col-span-5">
              <div className="border border-[#C8A98B]/35 bg-[#FAF5EE]/95 p-6 shadow-[0_14px_38px_rgba(38,41,35,0.04)] dark:border-[#C8A98B]/30 dark:bg-[#3B302B]/90 sm:p-7">
                <div className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[#C8A98B]/40 bg-[#E6D9C9]/75 text-[#8D7667] dark:bg-[#201C1A] dark:text-[#C8A98B]"
                  >
                    <ShieldCheck className="h-4 w-4 stroke-[1.6]" />
                  </span>
                  <div>
                    <EditableText
                      as="h2"
                      data-preview-field-path="textileCarePage.labelReminderHeading"
                      defaultValue={labelReminderHeading}
                      fontFamily="heading"
                      size="1.25rem"
                      weight={500}
                      lineHeight={1.25}
                      color="heading"
                      className="m-0"
                    />
                    <EditableText
                      as="p"
                      data-preview-field-path="textileCarePage.labelReminderBody"
                      defaultValue={labelReminderBody}
                      fontFamily="body"
                      size="0.8125rem"
                      lineHeight={1.72}
                      color="muted"
                      className="mt-2 mb-0"
                    />
                  </div>
                </div>
              </div>
            </LuxuryReveal>
          </div>
        </div>
      </section>

      {/* Interactive Fabric Care Directory */}
      <section
        data-design-section="textile-care-fabrics"
        className="mx-auto max-w-[1380px] px-4 py-14 sm:px-8 sm:py-18 lg:px-14 lg:py-22"
      >
        <LuxuryReveal className="flex flex-col justify-between gap-6 border-b border-[#201C1A]/10 pb-8 dark:border-[#F2E9DE]/10 md:flex-row md:items-end">
          <div>
            <EditableText
              as="p"
              data-preview-field-path="textileCarePage.fabricsEyebrow"
              defaultValue={fabricsEyebrow}
              fontFamily="body"
              size="0.6875rem"
              weight={600}
              transform="uppercase"
              letterSpacing="0.26em"
              color="primary"
              className="m-0"
            />
            <EditableText
              as="h2"
              id="textile-care-fabrics-heading"
              data-preview-field-path="textileCarePage.fabricsHeading"
              defaultValue={fabricsHeading}
              fontFamily="heading"
              size="clamp(2.15rem, 3.6vw, 3.2rem)"
              weight={300}
              lineHeight={1.08}
              letterSpacing="-0.015em"
              color="heading"
              className="mt-2.5 mb-0"
            />
          </div>

          {/* Interactive Fabric Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={activeFabricId === 'all'}
              onClick={() => setSelectedFabricId('all')}
              className={`cursor-pointer border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                activeFabricId === 'all'
                  ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] shadow-[0_6px_18px_rgba(38,41,35,0.12)] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                  : 'border-[#201C1A]/18 bg-[#FAF5EE] text-[#5E4E45] hover:border-[#C8A98B] hover:text-[#201C1A] dark:border-[#F2E9DE]/18 dark:bg-[#3B302B] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]'
              }`}
            >
              <EditableText
                as="span"
                data-preview-field-path="textileCarePage.allFabricsLabel"
                defaultValue={allFabricsLabel}
                fontFamily="body"
                size="0.6875rem"
                weight={500}
                transform="uppercase"
                letterSpacing="0.2em"
                color="inherit"
                className="inline"
              />
            </button>

            {fabrics.map((fabric) => {
              const isActive = fabric.id === activeFabricId;
              return (
                <button
                  key={fabric.id}
                  id={`care-tab-${fabric.id}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedFabricId(fabric.id)}
                  className={`cursor-pointer border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive
                      ? 'border-[#201C1A] bg-[#201C1A] text-[#F2E9DE] shadow-[0_6px_18px_rgba(38,41,35,0.12)] dark:border-[#C8A98B] dark:bg-[#C8A98B] dark:text-[#201C1A]'
                      : 'border-[#201C1A]/18 bg-[#FAF5EE] text-[#5E4E45] hover:border-[#C8A98B] hover:text-[#201C1A] dark:border-[#F2E9DE]/18 dark:bg-[#3B302B] dark:text-[#C7B6A6] dark:hover:text-[#F2E9DE]'
                  }`}
                >
                  <EditableText
                    as="span"
                    data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].name`}
                    defaultValue={fabric.name}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={500}
                    transform="uppercase"
                    letterSpacing="0.2em"
                    color="inherit"
                    className="inline"
                  />
                </button>
              );
            })}
          </div>
        </LuxuryReveal>

        {/* Always-mounted list container for Fivora strict validation */}
        <div data-preview-list-path="textileCarePage.fabrics" className="mt-10">
          {fabrics.length === 0 ? (
            <div className="border border-dashed border-[#201C1A]/20 px-6 py-16 text-center dark:border-[#F2E9DE]/20">
              <p
                data-preview-static="textile-care-fabrics-empty"
                className="m-0 text-sm text-[#65685E] dark:text-[#C7B6A6]"
              >
                Add fabric care categories in your Fivora editor to populate this directory.
              </p>
              {/* Keep step labels mounted in Fivora empty-state */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[10.5px] uppercase tracking-[0.2em] text-[#8D7667] dark:text-[#C8A98B]">
                <EditableText
                  as="span"
                  data-preview-field-path="textileCarePage.stepWashingLabel"
                  defaultValue={stepWashingLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <span aria-hidden="true">·</span>
                <EditableText
                  as="span"
                  data-preview-field-path="textileCarePage.stepDryingLabel"
                  defaultValue={stepDryingLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <span aria-hidden="true">·</span>
                <EditableText
                  as="span"
                  data-preview-field-path="textileCarePage.stepIroningLabel"
                  defaultValue={stepIroningLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <span aria-hidden="true">·</span>
                <EditableText
                  as="span"
                  data-preview-field-path="textileCarePage.stepStorageLabel"
                  defaultValue={stepStorageLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <span aria-hidden="true">·</span>
                <EditableText
                  as="span"
                  data-preview-field-path="textileCarePage.stepMaintenanceLabel"
                  defaultValue={stepMaintenanceLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <span aria-hidden="true">·</span>
                <EditableText
                  as="span"
                  data-preview-field-path="textileCarePage.atelierNoteLabel"
                  defaultValue={atelierNoteLabel}
                  fontFamily="body"
                  size="0.65625rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-12 lg:space-y-14">
              <AnimatePresence mode="popLayout">
                {visibleFabrics.map((fabric) => {
                  const reverseLayout = activeFabricId === 'all' && fabric.index % 2 === 1;
                  return (
                    <motion.article
                      key={fabric.id}
                      id={`care-panel-${fabric.id}`}
                      layout={!prefersReducedMotion}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.99 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 0.55, ease: LUXURY_EASE }
                      }
                      data-preview-item-path={`textileCarePage.fabrics[${fabric.index}]`}
                      className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#3B302B]/14 bg-[#FAF5EE] shadow-[0_14px_40px_rgba(32,28,26,0.045)] lg:grid-cols-12"
                    >
                      {/* Editorial Textile Visual */}
                      <div
                        className={`relative flex flex-col justify-between bg-[#E6D9C9]/55 dark:bg-[#2A2320] lg:col-span-5 ${
                          reverseLayout ? 'lg:order-2' : ''
                        }`}
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden lg:h-full lg:min-h-[520px] lg:aspect-auto">
                          <img
                            src={withBasePath(fabric.imageUrl)}
                            alt={fabric.name}
                            data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].imageUrl`}
                            className="h-full w-full object-cover"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2B2320]/72 via-[#2B2320]/12 to-transparent" />

                          {/* Fiber Profile Corner Badge */}
                          <span className="absolute left-5 top-5 z-10 bg-[#F2E9DE]/92 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#201C1A] backdrop-blur-sm">
                            <EditableText
                              as="span"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].fiberProfile`}
                              defaultValue={fabric.fiberProfile}
                              fontFamily="body"
                              size="0.625rem"
                              weight={500}
                              transform="uppercase"
                              letterSpacing="0.22em"
                              color="inherit"
                              className="inline"
                            />
                          </span>

                          {/* Quick Summary Overlay Footer */}
                          <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-[#F2E9DE] sm:p-7">
                            <EditableText
                              as="h3"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].name`}
                              defaultValue={fabric.name}
                              fontFamily="heading"
                              size="clamp(2rem, 3vw, 2.75rem)"
                              weight={300}
                              lineHeight={1.06}
                              color="#F2E9DE"
                              className="m-0"
                            />
                            <EditableText
                              as="p"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].subtitle`}
                              defaultValue={fabric.subtitle}
                              fontFamily="body"
                              size="0.875rem"
                              lineHeight={1.65}
                              color="rgba(248, 246, 241, 0.88)"
                              className="mt-2 mb-0 max-w-md"
                            />
                            <div className="mt-4 inline-flex items-center gap-2 border-t border-[#F2E9DE]/25 pt-3 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#E8DFC8]">
                              <Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0 stroke-[1.5] text-[#C8A98B]" />
                              <EditableText
                                as="span"
                                data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].quickSummary`}
                                defaultValue={fabric.quickSummary}
                                fontFamily="body"
                                size="0.65625rem"
                                weight={500}
                                transform="uppercase"
                                letterSpacing="0.18em"
                                color="#E8DFC8"
                                className="inline"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Structured 5-Stage Care Guidance */}
                      <div
                        className={`flex flex-col justify-between p-6 sm:p-8 lg:col-span-7 lg:p-10 ${
                          reverseLayout ? 'lg:order-1' : ''
                        }`}
                      >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          {/* 1. Washing */}
                          <div className="border border-[#201C1A]/8 bg-[#FAF5EE]/70 p-5 dark:border-[#F2E9DE]/10 dark:bg-[#191C17]">
                            <div className="flex items-center gap-2.5 text-[#8D7667] dark:text-[#C8A98B]">
                              <Droplets aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                              <EditableText
                                as="h4"
                                data-preview-field-path="textileCarePage.stepWashingLabel"
                                defaultValue={stepWashingLabel}
                                fontFamily="body"
                                size="0.6875rem"
                                weight={600}
                                transform="uppercase"
                                letterSpacing="0.22em"
                                color="inherit"
                                className="m-0"
                              />
                            </div>
                            <EditableText
                              as="p"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].washing`}
                              defaultValue={fabric.washing}
                              fontFamily="body"
                              size="0.84375rem"
                              lineHeight={1.74}
                              color="muted"
                              className="mt-3 mb-0"
                            />
                          </div>

                          {/* 2. Drying */}
                          <div className="border border-[#201C1A]/8 bg-[#FAF5EE]/70 p-5 dark:border-[#F2E9DE]/10 dark:bg-[#191C17]">
                            <div className="flex items-center gap-2.5 text-[#8D7667] dark:text-[#C8A98B]">
                              <Wind aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                              <EditableText
                                as="h4"
                                data-preview-field-path="textileCarePage.stepDryingLabel"
                                defaultValue={stepDryingLabel}
                                fontFamily="body"
                                size="0.6875rem"
                                weight={600}
                                transform="uppercase"
                                letterSpacing="0.22em"
                                color="inherit"
                                className="m-0"
                              />
                            </div>
                            <EditableText
                              as="p"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].drying`}
                              defaultValue={fabric.drying}
                              fontFamily="body"
                              size="0.84375rem"
                              lineHeight={1.74}
                              color="muted"
                              className="mt-3 mb-0"
                            />
                          </div>

                          {/* 3. Ironing & Steaming */}
                          <div className="border border-[#201C1A]/8 bg-[#FAF5EE]/70 p-5 dark:border-[#F2E9DE]/10 dark:bg-[#191C17]">
                            <div className="flex items-center gap-2.5 text-[#8D7667] dark:text-[#C8A98B]">
                              <Flame aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                              <EditableText
                                as="h4"
                                data-preview-field-path="textileCarePage.stepIroningLabel"
                                defaultValue={stepIroningLabel}
                                fontFamily="body"
                                size="0.6875rem"
                                weight={600}
                                transform="uppercase"
                                letterSpacing="0.22em"
                                color="inherit"
                                className="m-0"
                              />
                            </div>
                            <EditableText
                              as="p"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].ironing`}
                              defaultValue={fabric.ironing}
                              fontFamily="body"
                              size="0.84375rem"
                              lineHeight={1.74}
                              color="muted"
                              className="mt-3 mb-0"
                            />
                          </div>

                          {/* 4. Storage */}
                          <div className="border border-[#201C1A]/8 bg-[#FAF5EE]/70 p-5 dark:border-[#F2E9DE]/10 dark:bg-[#191C17]">
                            <div className="flex items-center gap-2.5 text-[#8D7667] dark:text-[#C8A98B]">
                              <Archive aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                              <EditableText
                                as="h4"
                                data-preview-field-path="textileCarePage.stepStorageLabel"
                                defaultValue={stepStorageLabel}
                                fontFamily="body"
                                size="0.6875rem"
                                weight={600}
                                transform="uppercase"
                                letterSpacing="0.22em"
                                color="inherit"
                                className="m-0"
                              />
                            </div>
                            <EditableText
                              as="p"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].storage`}
                              defaultValue={fabric.storage}
                              fontFamily="body"
                              size="0.84375rem"
                              lineHeight={1.74}
                              color="muted"
                              className="mt-3 mb-0"
                            />
                          </div>

                          {/* 5. Maintenance (Full Width) */}
                          <div className="border border-[#201C1A]/8 bg-[#FAF5EE]/70 p-5 dark:border-[#F2E9DE]/10 dark:bg-[#191C17] sm:col-span-2">
                            <div className="flex items-center gap-2.5 text-[#8D7667] dark:text-[#C8A98B]">
                              <Feather aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                              <EditableText
                                as="h4"
                                data-preview-field-path="textileCarePage.stepMaintenanceLabel"
                                defaultValue={stepMaintenanceLabel}
                                fontFamily="body"
                                size="0.6875rem"
                                weight={600}
                                transform="uppercase"
                                letterSpacing="0.22em"
                                color="inherit"
                                className="m-0"
                              />
                            </div>
                            <EditableText
                              as="p"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].maintenance`}
                              defaultValue={fabric.maintenance}
                              fontFamily="body"
                              size="0.84375rem"
                              lineHeight={1.74}
                              color="muted"
                              className="mt-3 mb-0"
                            />
                          </div>
                        </div>

                        {/* Atelier Tip Whisper Banner */}
                        <div className="mt-6 border-t border-[#C8A98B]/35 pt-5">
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
                            <EditableText
                              as="span"
                              data-preview-field-path="textileCarePage.atelierNoteLabel"
                              defaultValue={atelierNoteLabel}
                              fontFamily="body"
                              size="0.65625rem"
                              weight={600}
                              transform="uppercase"
                              letterSpacing="0.22em"
                              color="primary"
                              className="inline shrink-0"
                            />
                            <EditableText
                              as="p"
                              data-preview-field-path={`textileCarePage.fabrics[${fabric.index}].atelierNote`}
                              defaultValue={fabric.atelierNote}
                              fontFamily="heading"
                              size="1.125rem"
                              weight={400}
                              lineHeight={1.5}
                              color="heading"
                              className="m-0 italic"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Expandable Care-Tip Accordions & Care Icon Legend */}
      <section
        data-design-section="textile-care-tips"
        className="border-t border-[#201C1A]/8 bg-[#FAF5EE] py-16 dark:border-[#F2E9DE]/10 dark:bg-[#191C17] sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1380px] px-4 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Sticky Editorial Intro + Care Icons Legend */}
            <LuxuryReveal className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="textileCarePage.tipsEyebrow"
                  defaultValue={tipsEyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.26em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h2"
                data-preview-field-path="textileCarePage.tipsHeading"
                defaultValue={tipsHeading}
                fontFamily="heading"
                size="clamp(2.1rem, 3.3vw, 2.9rem)"
                weight={300}
                lineHeight={1.08}
                letterSpacing="-0.015em"
                color="heading"
                className="mt-3 mb-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="textileCarePage.tipsIntro"
                defaultValue={tipsIntro}
                fontFamily="body"
                size="0.9125rem"
                lineHeight={1.8}
                color="muted"
                className="mt-4 mb-0"
              />

              {/* Care Icon Visual Legend */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 border border-[#201C1A]/10 bg-[#FAF5EE] px-3.5 py-3 dark:border-[#F2E9DE]/10 dark:bg-[#3B302B]">
                  <Droplets aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[1.5] text-[#8D7667] dark:text-[#C8A98B]" />
                  <EditableText
                    as="span"
                    data-preview-field-path="textileCarePage.legendWashLabel"
                    defaultValue={legendWashLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={500}
                    letterSpacing="0.06em"
                    color="heading"
                    className="inline"
                  />
                </div>

                <div className="flex items-center gap-2.5 border border-[#201C1A]/10 bg-[#FAF5EE] px-3.5 py-3 dark:border-[#F2E9DE]/10 dark:bg-[#3B302B]">
                  <Wind aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[1.5] text-[#8D7667] dark:text-[#C8A98B]" />
                  <EditableText
                    as="span"
                    data-preview-field-path="textileCarePage.legendDryLabel"
                    defaultValue={legendDryLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={500}
                    letterSpacing="0.06em"
                    color="heading"
                    className="inline"
                  />
                </div>

                <div className="flex items-center gap-2.5 border border-[#201C1A]/10 bg-[#FAF5EE] px-3.5 py-3 dark:border-[#F2E9DE]/10 dark:bg-[#3B302B]">
                  <Flame aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[1.5] text-[#8D7667] dark:text-[#C8A98B]" />
                  <EditableText
                    as="span"
                    data-preview-field-path="textileCarePage.legendSteamLabel"
                    defaultValue={legendSteamLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={500}
                    letterSpacing="0.06em"
                    color="heading"
                    className="inline"
                  />
                </div>

                <div className="flex items-center gap-2.5 border border-[#201C1A]/10 bg-[#FAF5EE] px-3.5 py-3 dark:border-[#F2E9DE]/10 dark:bg-[#3B302B]">
                  <Archive aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[1.5] text-[#8D7667] dark:text-[#C8A98B]" />
                  <EditableText
                    as="span"
                    data-preview-field-path="textileCarePage.legendStoreLabel"
                    defaultValue={legendStoreLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={500}
                    letterSpacing="0.06em"
                    color="heading"
                    className="inline"
                  />
                </div>
              </div>
            </LuxuryReveal>

            {/* Right Expandable Accordions */}
            <div className="lg:col-span-8">
              <div
                data-preview-list-path="textileCarePage.careTips"
                className="divide-y divide-[#201C1A]/12 border-y border-[#201C1A]/12 dark:divide-[#F2E9DE]/12 dark:border-[#F2E9DE]/12"
              >
                {careTips.length === 0 ? (
                  <p
                    data-preview-static="textile-care-tips-empty"
                    className="py-12 text-center text-sm text-[#65685E] dark:text-[#C7B6A6]"
                  >
                    Add expandable care tips in your Fivora editor.
                  </p>
                ) : (
                  careTips.map((tip) => {
                    const open = isTipOpen(tip);
                    const panelId = `care-tip-panel-${tip.id}`;
                    const triggerId = `care-tip-trigger-${tip.id}`;
                    return (
                      <div
                        key={tip.id}
                        data-preview-item-path={`textileCarePage.careTips[${tip.index}]`}
                        className="py-5 sm:py-6"
                      >
                        <button
                          id={triggerId}
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => toggleTip(tip)}
                          className="group flex w-full cursor-pointer items-start justify-between gap-4 border-0 bg-transparent p-0 text-left"
                        >
                          <div className="space-y-1.5">
                            <EditableText
                              as="span"
                              data-preview-field-path={`textileCarePage.careTips[${tip.index}].tag`}
                              defaultValue={tip.tag}
                              fontFamily="body"
                              size="0.625rem"
                              weight={600}
                              transform="uppercase"
                              letterSpacing="0.24em"
                              color="primary"
                              className="inline-block"
                            />
                            <EditableText
                              as="h3"
                              data-preview-field-path={`textileCarePage.careTips[${tip.index}].question`}
                              defaultValue={tip.question}
                              fontFamily="heading"
                              size="clamp(1.3rem, 2vw, 1.65rem)"
                              weight={400}
                              lineHeight={1.25}
                              color="heading"
                              className="m-0 transition-colors group-hover:text-[#8D7667] dark:group-hover:text-[#C8A98B]"
                            />
                          </div>

                          <span
                            aria-hidden="true"
                            className={`mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#201C1A]/15 text-[#201C1A] transition-all duration-300 motion-reduce:transition-none group-hover:border-[#C8A98B] dark:border-[#F2E9DE]/18 dark:text-[#F2E9DE] ${
                              open ? 'rotate-180 bg-[#201C1A] text-[#F2E9DE] dark:bg-[#C8A98B] dark:text-[#201C1A]' : ''
                            }`}
                          >
                            <ChevronDown className="h-4 w-4 stroke-[1.6]" />
                          </span>
                        </button>

                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={triggerId}
                          className={`grid transition-[grid-template-rows,opacity] duration-400 ease-out motion-reduce:transition-none ${
                            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <EditableText
                              as="p"
                              data-preview-field-path={`textileCarePage.careTips[${tip.index}].answer`}
                              defaultValue={tip.answer}
                              fontFamily="body"
                              size="0.9375rem"
                              lineHeight={1.82}
                              color="muted"
                              className="mt-4 mb-0 max-w-3xl pb-1"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Editorial Image & Text Section: Textile Longevity */}
      <section
        data-design-section="textile-care-longevity"
        className="border-t border-[#201C1A]/8 bg-[#E6D9C9]/70 py-16 dark:border-[#F2E9DE]/10 dark:bg-[#1C1F19] sm:py-22 lg:py-24"
      >
        <div className="mx-auto max-w-[1380px] px-4 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Editorial Longevity Image */}
            <div className="lg:col-span-6">
              <LuxuryImageReveal tone="beige" className="aspect-[4/3] w-full bg-[#E6D9C9]/70">
                <img
                  src={withBasePath(longevityImageUrl)}
                  alt={longevityHeading}
                  loading="lazy"
                  data-preview-field-path="textileCarePage.longevityImageUrl"
                  className="h-full w-full object-cover"
                />
              </LuxuryImageReveal>
              <div className="mt-3.5 flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-8 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="textileCarePage.longevityCaption"
                  defaultValue={longevityCaption}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="muted"
                  className="m-0"
                />
              </div>
            </div>

            {/* Editorial Longevity Narrative & Pillars */}
            <LuxuryReveal delay={0.08} className="lg:col-span-6">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-9 bg-[#C8A98B]" />
                <EditableText
                  as="p"
                  data-preview-field-path="textileCarePage.longevityEyebrow"
                  defaultValue={longevityEyebrow}
                  fontFamily="body"
                  size="0.6875rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.28em"
                  color="primary"
                  className="m-0"
                />
              </div>

              <EditableText
                as="h2"
                data-preview-field-path="textileCarePage.longevityHeading"
                defaultValue={longevityHeading}
                fontFamily="heading"
                size="clamp(2.25rem, 3.8vw, 3.4rem)"
                weight={300}
                lineHeight={1.06}
                letterSpacing="-0.02em"
                color="heading"
                className="mt-3.5 mb-0"
              />

              <EditableText
                as="p"
                data-preview-field-path="textileCarePage.longevityBody"
                defaultValue={longevityBody}
                fontFamily="body"
                size="0.95rem"
                lineHeight={1.86}
                color="muted"
                className="mt-5 mb-0 whitespace-pre-line"
              />

              {/* Longevity Pillars */}
              <div
                data-preview-list-path="textileCarePage.longevityPillars"
                className="mt-9 border-t border-[#201C1A]/12 pt-7 dark:border-[#F2E9DE]/12"
              >
                {longevityPillars.length > 0 && (
                  <LuxuryStagger className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {longevityPillars.map((pillar) => (
                      <LuxuryStaggerItem key={pillar.id}>
                        <div data-preview-item-path={`textileCarePage.longevityPillars[${pillar.index}]`}>
                          <EditableText
                            as="h3"
                            data-preview-field-path={`textileCarePage.longevityPillars[${pillar.index}].title`}
                            defaultValue={pillar.title}
                            fontFamily="heading"
                            size="1.25rem"
                            weight={500}
                            lineHeight={1.2}
                            color="heading"
                            className="m-0"
                          />
                          <EditableText
                            as="p"
                            data-preview-field-path={`textileCarePage.longevityPillars[${pillar.index}].detail`}
                            defaultValue={pillar.detail}
                            fontFamily="body"
                            size="0.8125rem"
                            lineHeight={1.7}
                            color="muted"
                            className="mt-2 mb-0"
                          />
                        </div>
                      </LuxuryStaggerItem>
                    ))}
                  </LuxuryStagger>
                )}
              </div>
            </LuxuryReveal>
          </div>
        </div>
      </section>

      {/* Editorial Shop Invitation CTA */}
      <section
        data-design-section="textile-care-cta"
        className="border-t border-[#201C1A]/8 bg-[#F2E9DE] py-16 dark:border-[#F2E9DE]/10 dark:bg-[#201C1A] sm:py-20"
      >
        <div className="mx-auto max-w-[1140px] px-4 sm:px-8 lg:px-14">
          <LuxuryReveal className="flex flex-col items-center justify-between gap-8 border border-[#201C1A]/12 bg-[#FAF5EE] px-7 py-12 text-center shadow-[0_18px_50px_rgba(38,41,35,0.04)] dark:border-[#F2E9DE]/12 dark:bg-[#3B302B] sm:px-12 md:flex-row md:text-left">
            <div className="max-w-xl">
              <EditableText
                as="p"
                data-preview-field-path="textileCarePage.shopCtaEyebrow"
                defaultValue={shopCtaEyebrow}
                fontFamily="body"
                size="0.65625rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.26em"
                color="primary"
                className="m-0"
              />
              <EditableText
                as="h2"
                data-preview-field-path="textileCarePage.shopCtaHeading"
                defaultValue={shopCtaHeading}
                fontFamily="heading"
                size="clamp(1.9rem, 3vw, 2.65rem)"
                weight={300}
                lineHeight={1.12}
                color="heading"
                className="mt-2.5 mb-0"
              />
              <EditableText
                as="p"
                data-preview-field-path="textileCarePage.shopCtaDescription"
                defaultValue={shopCtaDescription}
                fontFamily="body"
                size="0.9125rem"
                lineHeight={1.76}
                color="muted"
                className="mt-3 mb-0"
              />
            </div>

            {hasShopPage ? (
              <button
                type="button"
                onClick={() => window.location.assign(withBasePath('/shop/'))}
                data-target-page="shop"
                className="group loome-btn-primary shrink-0 cursor-pointer"
              >
                <EditableText
                  as="span"
                  data-preview-field-path="textileCarePage.shopCtaLabel"
                  defaultValue={shopCtaLabel}
                  fontFamily="body"
                  size="0.75rem"
                  weight={500}
                  transform="uppercase"
                  letterSpacing="0.2em"
                  color="inherit"
                  className="inline"
                />
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            ) : (
              <span
                data-target-page="shop"
                data-preview-field-path="textileCarePage.shopCtaLabel"
                className="unavailable loome-btn-primary shrink-0"
              >
                {shopCtaLabel}
              </span>
            )}
          </LuxuryReveal>
        </div>
      </section>
    </div>
  );
}
