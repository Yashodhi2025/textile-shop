'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import {
  LUXURY_EASE,
  LuxuryHairline,
  LuxuryImageReveal,
  LuxuryReveal,
} from '@/components/motion/LuxuryReveal';

interface FaqCategoryItem {
  index: number;
  id: string;
  label: string;
}

interface FaqEntryItem {
  index: number;
  id: string;
  categoryId: string;
  categoryLabel: string;
  question: string;
  answer: string;
}

function slugifyFaqKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveFaqItemCategoryKey(
  item: FaqEntryItem,
  categories: FaqCategoryItem[],
): string {
  const normalizedLabel = item.categoryLabel.trim().toLowerCase();
  const byLabel = categories.find(
    (cat) => cat.label.trim().toLowerCase() === normalizedLabel,
  );
  if (byLabel) return byLabel.id;

  const normalizedId = item.categoryId.trim().toLowerCase();
  if (normalizedId) {
    const byId = categories.find(
      (cat) => cat.id.trim().toLowerCase() === normalizedId,
    );
    if (byId) return byId.id;
  }

  return slugifyFaqKey(item.categoryLabel) || normalizedId;
}

export default function FaqPageView() {
  const siteData = useSiteData();
  const prefersReducedMotion = useReducedMotion();

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const contact = contentObject(content.contact);
  const page = contentObject(content.faqPage);

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'cart',
        'checkout',
        'journal',
        'textile_care',
        'shipping_returns',
        'faq',
        'about_us',
        'services',
        'contact',
      ];
  const hasContactPage = requiredPages.includes('contact');

  const categories = useMemo<FaqCategoryItem[]>(
    () =>
      contentList(page.categories)
        .map((raw, idx) => {
          const obj = contentObject(raw);
          const label = contentText(obj.label);
          const id = contentText(obj.id) || slugifyFaqKey(label) || `cat-${idx}`;
          return {
            index: idx,
            id,
            label: label || id,
          };
        })
        .filter((cat) => Boolean(cat.label)),
    [page.categories],
  );

  const items = useMemo<FaqEntryItem[]>(
    () =>
      contentList(page.items).map((raw, idx) => {
        const obj = contentObject(raw);
        const categoryLabel = contentText(obj.categoryLabel) || 'General';
        const categoryId = contentText(obj.categoryId) || slugifyFaqKey(categoryLabel);
        return {
          index: idx,
          id: contentText(obj.id) || `faq-${idx}`,
          categoryId,
          categoryLabel,
          question: contentText(obj.question) || 'Frequently asked question',
          answer: contentText(obj.answer),
        };
      }),
    [page.items],
  );

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [whatsappFallbackNotice, setWhatsappFallbackNotice] = useState<string | null>(null);

  const validCategoryKeys = useMemo(() => {
    const keys = new Set<string>(['all']);
    categories.forEach((cat) => keys.add(cat.id.toLowerCase()));
    return keys;
  }, [categories]);

  const activeCategoryKey = validCategoryKeys.has(selectedCategoryKey.toLowerCase())
    ? selectedCategoryKey
    : 'all';

  const countByCategoryId = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const key = resolveFaqItemCategoryKey(item, categories).toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [items, categories]);

  const filteredItems = useMemo(() => {
    if (activeCategoryKey === 'all') return items;
    const target = activeCategoryKey.toLowerCase();
    return items.filter(
      (item) => resolveFaqItemCategoryKey(item, categories).toLowerCase() === target,
    );
  }, [items, categories, activeCategoryKey]);

  // All accordions start open on initial SSR render so every answer is visible & directly
  // editable in Fivora, while visitors can collapse/expand individual items or toggle all.
  const isItemOpen = (item: FaqEntryItem) => {
    if (Object.prototype.hasOwnProperty.call(openMap, item.id)) {
      return Boolean(openMap[item.id]);
    }
    return true;
  };

  const toggleItem = (item: FaqEntryItem) => {
    setOpenMap((prev) => {
      const current = Object.prototype.hasOwnProperty.call(prev, item.id)
        ? Boolean(prev[item.id])
        : true;
      return { ...prev, [item.id]: !current };
    });
  };

  const allFilteredOpen =
    filteredItems.length === 0 || filteredItems.every((item) => isItemOpen(item));

  const toggleAllVisible = () => {
    const nextOpen = !allFilteredOpen;
    setOpenMap((prev) => {
      const updated = { ...prev };
      filteredItems.forEach((item) => {
        updated[item.id] = nextOpen;
      });
      return updated;
    });
  };

  // Dynamic merchant WhatsApp configuration (never hardcoded)
  const rawWhatsapp = contentText(contact.whatsapp) || contentText(contact.phone);
  const whatsappDigits = rawWhatsapp.replace(/[^\d]/g, '');
  const contactEmail = contentText(contact.email);
  const contactWhatsappMessage =
    contentText(page.contactWhatsappMessage) ||
    'Hello LOOMÉ Atelier, I have a question from your FAQ page.';
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(contactWhatsappMessage)}`
    : '';

  const handleWhatsAppClick = () => {
    setWhatsappFallbackNotice(null);
    if (!whatsappHref) {
      if (hasContactPage) {
        window.location.assign(withBasePath('/contact/'));
        return;
      }
      setWhatsappFallbackNotice(
        contactEmail
          ? `WhatsApp concierge is not configured yet. Please email us at ${contactEmail}.`
          : 'WhatsApp concierge number is not configured yet.',
      );
      return;
    }

    const popup = window.open(whatsappHref, '_blank');
    if (popup) {
      try {
        popup.opener = null;
      } catch {
        // Ignore cross-origin opener restriction
      }
      return;
    }
    window.location.assign(whatsappHref);
  };

  // Editable page copy
  const homeNavLabel = contentText(navLabels.home) || 'Home';
  const faqNavLabel = contentText(navLabels.faq) || 'FAQ';

  const eyebrow = contentText(page.eyebrow) || 'ATELIER ANSWERS';
  const heading = contentText(page.heading) || 'Frequently Asked Questions';
  const intro =
    contentText(page.intro) ||
    'Thoughtful guidance on ordering LOOMÉ textiles, delivery coordination, return and exchange care, natural fiber upkeep, and made-to-measure drapery commissions.';

  const categoriesHeading = contentText(page.categoriesHeading) || 'Browse by Topic';
  const allQuestionsLabel = contentText(page.allQuestionsLabel) || 'All Questions';
  const questionsLabel = contentText(page.questionsLabel) || 'Questions';
  const questionSingularLabel = contentText(page.questionSingularLabel) || 'Question';
  const collapseAllLabel = contentText(page.collapseAllLabel) || 'Collapse All';
  const expandAllLabel = contentText(page.expandAllLabel) || 'Expand All';
  const policyNote =
    contentText(page.policyNote) ||
    'Delivery lead times, shipping charges, and return terms are configured by our atelier and confirmed personally with every order.';

  const editorialImageUrl = contentText(page.editorialImageUrl) || '/images/cat-fabrics.jpg';
  const editorialEyebrow = contentText(page.editorialEyebrow) || 'ATELIER GUIDANCE';
  const editorialTitle =
    contentText(page.editorialTitle) || 'Curated Swatches & Personal Advice';
  const editorialCaption =
    contentText(page.editorialCaption) ||
    'Unsure about drapery fullness, fiber weight, or palette harmony? Our textile advisors are always delighted to guide your selection.';

  const contactEyebrow = contentText(page.contactEyebrow) || 'DIRECT CONCIERGE';
  const contactHeading = contentText(page.contactHeading) || 'Still Have Questions?';
  const contactDescription =
    contentText(page.contactDescription) ||
    'Our textile specialists are here to assist with orders, delivery quotes, fabric care advice, and bespoke commissions.';
  const contactWhatsappLabel =
    contentText(page.contactWhatsappLabel) || 'Contact via WhatsApp';
  const contactPageLabel = contentText(page.contactPageLabel) || 'Visit Contact Page';

  return (
    <div
      data-preview-page-key="faq"
      className="loome-surface-ivory min-h-[75vh] w-full"
    >
      {/* Breadcrumb Strip */}
      <div className="border-b border-[var(--loome-border)] bg-[var(--loome-surface-subtle)]">
        <nav className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.location.assign(withBasePath('/'))}
            className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-color)] transition-colors hover:text-[var(--heading-color)]"
          >
            <span data-preview-field-path="common.navLabels.home">{homeNavLabel}</span>
          </button>
          <span aria-hidden="true" data-preview-static="faq-bc-sep" className="text-[var(--brand-accent)]">
            /
          </span>
          <span
            aria-current="page"
            data-preview-field-path="common.navLabels.faq"
            className="font-semibold text-[var(--heading-color)]"
          >
            {faqNavLabel}
          </span>
        </nav>
      </div>

      {/* 1. Editorial Hero */}
      <section
        data-design-section="faq-hero"
        className="w-full border-b border-[var(--loome-border)]"
      >
        <div className="mx-auto max-w-[1280px] px-4 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-12">
          <LuxuryReveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <LuxuryHairline className="h-px w-8 bg-[var(--brand-accent)]" />
                <EditableText
                  as="p"
                  data-preview-field-path="faqPage.eyebrow"
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

              <EditableText
                as="h1"
                data-preview-field-path="faqPage.heading"
                defaultValue={heading}
                fontFamily="heading"
                size="clamp(1.9rem, 3.1vw, 2.65rem)"
                weight={800}
                lineHeight={1.08}
                letterSpacing="-0.025em"
                color="heading"
                className="mt-2.5 mb-0"
              />
            </div>

            <div className="max-w-md lg:text-right">
              <EditableText
                as="p"
                data-preview-field-path="faqPage.intro"
                defaultValue={intro}
                fontFamily="body"
                size="0.9375rem"
                lineHeight={1.7}
                color="muted"
                className="m-0"
              />
            </div>
          </LuxuryReveal>
        </div>
      </section>

      {/* 2, 3, 4 & 5. Refined Two-Column Desktop Layout: Category Nav + Editorial Image | FAQ Accordions */}
      <section
        data-design-section="faq-directory"
        className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Sticky Sidebar: Category Tabs + Small Editorial Textile Image */}
          <aside className="space-y-7 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <div>
              <EditableText
                as="p"
                data-preview-field-path="faqPage.categoriesHeading"
                defaultValue={categoriesHeading}
                fontFamily="body"
                size="0.65625rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.24em"
                color="primary"
                className="m-0"
              />

              {/* Responsive Category Tabs: Horizontal wrap on mobile, clean editorial stack on desktop */}
              <div className="mt-3.5 flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
                <button
                  type="button"
                  aria-pressed={activeCategoryKey === 'all'}
                  onClick={() => setSelectedCategoryKey('all')}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 lg:w-full ${
                    activeCategoryKey === 'all'
                      ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                      : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--muted-color)] hover:border-[var(--brand-accent)] hover:text-[var(--heading-color)]'
                  }`}
                >
                  <EditableText
                    as="span"
                    data-preview-field-path="faqPage.allQuestionsLabel"
                    defaultValue={allQuestionsLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.16em"
                    color="inherit"
                    className="inline"
                  />
                  <span
                    data-preview-static="faq-all-count"
                    className="text-[10px] tabular-nums opacity-75"
                  >
                    {items.length}
                  </span>
                </button>

                <div data-preview-list-path="faqPage.categories" className="contents">
                  {categories.map((cat) => {
                    const isActive = activeCategoryKey.toLowerCase() === cat.id.toLowerCase();
                    const catCount = countByCategoryId.get(cat.id.toLowerCase()) ?? 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        data-preview-item-path={`faqPage.categories[${cat.index}]`}
                        aria-pressed={isActive}
                        onClick={() => setSelectedCategoryKey(cat.id)}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 lg:w-full ${
                          isActive
                            ? 'border-[var(--loome-btn-primary-bg)] bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                            : 'border-[var(--loome-border)] bg-[var(--card-bg)] text-[var(--muted-color)] hover:border-[var(--brand-accent)] hover:text-[var(--heading-color)]'
                        }`}
                      >
                        <EditableText
                          as="span"
                          data-preview-field-path={`faqPage.categories[${cat.index}].label`}
                          defaultValue={cat.label}
                          fontFamily="body"
                          size="0.6875rem"
                          weight={600}
                          transform="uppercase"
                          letterSpacing="0.16em"
                          color="inherit"
                          className="inline"
                        />
                        <span
                          data-preview-static={`faq-cat-count-${cat.index}`}
                          className="text-[10px] tabular-nums opacity-75"
                        >
                          {catCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. Small Editorial Textile Image Card */}
            <LuxuryReveal delay={0.08} className="overflow-hidden rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] shadow-[0_3px_14px_rgba(73,56,44,0.04)] dark:shadow-none">
              <LuxuryImageReveal tone="ivory" className="aspect-[4/3] w-full bg-[var(--loome-beige)]">
                <img
                  src={withBasePath(editorialImageUrl)}
                  alt={editorialTitle}
                  loading="lazy"
                  data-preview-field-path="faqPage.editorialImageUrl"
                  className="h-full w-full object-cover"
                />
              </LuxuryImageReveal>
              <div className="p-5">
                <EditableText
                  as="p"
                  data-preview-field-path="faqPage.editorialEyebrow"
                  defaultValue={editorialEyebrow}
                  fontFamily="body"
                  size="0.625rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.22em"
                  color="primary"
                  className="m-0"
                />
                <EditableText
                  as="h2"
                  data-preview-field-path="faqPage.editorialTitle"
                  defaultValue={editorialTitle}
                  fontFamily="heading"
                  size="1.2rem"
                  weight={700}
                  lineHeight={1.25}
                  color="heading"
                  className="mt-1.5 mb-0"
                />
                <EditableText
                  as="p"
                  data-preview-field-path="faqPage.editorialCaption"
                  defaultValue={editorialCaption}
                  fontFamily="body"
                  size="0.825rem"
                  lineHeight={1.68}
                  color="muted"
                  className="mt-2 mb-0"
                />
              </div>
            </LuxuryReveal>
          </aside>

          {/* Right Column: Dynamic Count Header, Policy Note & Animated Accordions */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--loome-border)] pb-4">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-color)]">
                <span data-preview-static="faq-visible-count" className="tabular-nums text-[var(--heading-color)]">
                  {filteredItems.length}
                </span>
                {filteredItems.length === 1 ? (
                  <EditableText
                    as="span"
                    data-preview-field-path="faqPage.questionSingularLabel"
                    defaultValue={questionSingularLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.18em"
                    color="inherit"
                    className="inline"
                  />
                ) : (
                  <EditableText
                    as="span"
                    data-preview-field-path="faqPage.questionsLabel"
                    defaultValue={questionsLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.18em"
                    color="inherit"
                    className="inline"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={toggleAllVisible}
                className="cursor-pointer border-0 bg-transparent p-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)] transition-colors hover:text-[var(--heading-color)]"
              >
                {allFilteredOpen ? (
                  <EditableText
                    as="span"
                    data-preview-field-path="faqPage.collapseAllLabel"
                    defaultValue={collapseAllLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.18em"
                    color="inherit"
                    className="inline"
                  />
                ) : (
                  <EditableText
                    as="span"
                    data-preview-field-path="faqPage.expandAllLabel"
                    defaultValue={expandAllLabel}
                    fontFamily="body"
                    size="0.6875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.18em"
                    color="inherit"
                    className="inline"
                  />
                )}
              </button>
            </div>

            {/* Merchant-Configurable Policy Note */}
            <div className="mt-5 rounded-xl border border-[var(--loome-border)] border-l-2 border-l-[var(--brand-accent)] bg-[var(--card-bg)] px-4 py-3.5">
              <EditableText
                as="p"
                data-preview-field-path="faqPage.policyNote"
                defaultValue={policyNote}
                fontFamily="body"
                size="0.8125rem"
                lineHeight={1.68}
                color="muted"
                className="m-0"
              />
            </div>

            {/* Animated Accessible FAQ Accordions */}
            <div data-preview-list-path="faqPage.items" className="mt-5">
              {filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--loome-border)] bg-[var(--card-bg)] px-6 py-14 text-center">
                  <p
                    data-preview-static="faq-empty-message"
                    className="m-0 text-sm text-[var(--muted-color)]"
                  >
                    {items.length === 0
                      ? 'Add FAQ questions and answers in your Fivora editor.'
                      : 'No questions currently belong to this category.'}
                  </p>
                  {items.length > 0 && activeCategoryKey !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryKey('all')}
                      className="mt-5 inline-flex cursor-pointer items-center rounded-[10px] border border-[var(--loome-border)] bg-transparent px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--heading-color)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                    >
                      <EditableText
                        as="span"
                        data-preview-field-path="faqPage.allQuestionsLabel"
                        defaultValue={allQuestionsLabel}
                        fontFamily="body"
                        size="0.65625rem"
                        weight={600}
                        transform="uppercase"
                        letterSpacing="0.18em"
                        color="inherit"
                        className="inline"
                      />
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[var(--loome-border)] rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-6">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                      const open = isItemOpen(item);
                      const triggerId = `faq-trigger-${item.id}`;
                      const panelId = `faq-panel-${item.id}`;
                      return (
                        <motion.article
                          key={item.id}
                          layout={!prefersReducedMotion}
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.99 }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0 }
                              : { duration: 0.45, ease: LUXURY_EASE }
                          }
                          data-preview-item-path={`faqPage.items[${item.index}]`}
                          className="py-5"
                        >
                          <button
                            id={triggerId}
                            type="button"
                            aria-expanded={open}
                            aria-controls={panelId}
                            onClick={() => toggleItem(item)}
                            className="group flex w-full cursor-pointer items-start justify-between gap-4 border-0 bg-transparent p-0 text-left"
                          >
                            <div className="space-y-1">
                              <EditableText
                                as="span"
                                data-preview-field-path={`faqPage.items[${item.index}].categoryLabel`}
                                defaultValue={item.categoryLabel}
                                fontFamily="body"
                                size="0.625rem"
                                weight={600}
                                transform="uppercase"
                                letterSpacing="0.22em"
                                color="primary"
                                className="inline-block"
                              />
                              <EditableText
                                as="h3"
                                data-preview-field-path={`faqPage.items[${item.index}].question`}
                                defaultValue={item.question}
                                fontFamily="heading"
                                size="1.125rem"
                                weight={700}
                                lineHeight={1.3}
                                color="heading"
                                className="m-0 transition-colors group-hover:text-[var(--brand-accent)]"
                              />
                            </div>

                            <span
                              aria-hidden="true"
                              className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--loome-border)] text-[var(--heading-color)] transition-all duration-300 motion-reduce:transition-none group-hover:border-[var(--brand-accent)] ${
                                open
                                  ? 'rotate-180 bg-[var(--loome-btn-primary-bg)] text-[var(--loome-btn-primary-text)]'
                                  : ''
                              }`}
                            >
                              <ChevronDown className="h-4 w-4 stroke-[1.6]" />
                            </span>
                          </button>

                          <div
                            id={panelId}
                            role="region"
                            aria-labelledby={triggerId}
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                              open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <EditableText
                                as="p"
                                data-preview-field-path={`faqPage.items[${item.index}].answer`}
                                defaultValue={item.answer}
                                fontFamily="body"
                                size="0.9rem"
                                lineHeight={1.74}
                                color="muted"
                                className="mt-3 mb-0 max-w-3xl pb-1"
                              />
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Premium "Still Have Questions?" Contact Section */}
      <section
        data-design-section="faq-contact-cta"
        className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-12 lg:py-14"
      >
        <div className="mx-auto max-w-[1040px] px-4 sm:px-8 lg:px-10">
          <LuxuryReveal className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] px-7 py-10 text-center shadow-[0_6px_22px_rgba(73,56,44,0.05)] dark:shadow-none sm:px-10 sm:py-12">
            <div className="flex items-center justify-center gap-3">
              <LuxuryHairline origin="center" className="h-px w-8 bg-[var(--brand-accent)]" />
              <EditableText
                as="p"
                data-preview-field-path="faqPage.contactEyebrow"
                defaultValue={contactEyebrow}
                fontFamily="body"
                size="0.65625rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.24em"
                color="primary"
                className="m-0"
              />
              <LuxuryHairline origin="center" className="h-px w-8 bg-[var(--brand-accent)]" />
            </div>

            <EditableText
              as="h2"
              data-preview-field-path="faqPage.contactHeading"
              defaultValue={contactHeading}
              fontFamily="heading"
              size="clamp(1.65rem, 2.6vw, 2.2rem)"
              weight={800}
              lineHeight={1.12}
              letterSpacing="-0.02em"
              color="heading"
              className="mt-2.5 mb-0"
            />

            <EditableText
              as="p"
              data-preview-field-path="faqPage.contactDescription"
              defaultValue={contactDescription}
              fontFamily="body"
              size="0.9375rem"
              lineHeight={1.72}
              color="muted"
              className="mx-auto mt-3 mb-0 max-w-xl"
            />

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="group loome-btn-primary h-12 cursor-pointer px-7"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                <EditableText
                  as="span"
                  data-preview-field-path="faqPage.contactWhatsappLabel"
                  defaultValue={contactWhatsappLabel}
                  fontFamily="body"
                  size="0.75rem"
                  weight={600}
                  transform="uppercase"
                  letterSpacing="0.16em"
                  color="inherit"
                  className="inline"
                />
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              {hasContactPage ? (
                <button
                  type="button"
                  onClick={() => window.location.assign(withBasePath('/contact/'))}
                  data-target-page="contact"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[11px] border border-[var(--loome-border)] bg-transparent px-6 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[var(--heading-color)] transition-all duration-300 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                >
                  <Mail aria-hidden="true" className="h-3.5 w-3.5 stroke-[1.5]" />
                  <EditableText
                    as="span"
                    data-preview-field-path="faqPage.contactPageLabel"
                    defaultValue={contactPageLabel}
                    fontFamily="body"
                    size="0.71875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.16em"
                    color="inherit"
                    className="inline"
                  />
                </button>
              ) : (
                <span
                  data-target-page="contact"
                  data-preview-field-path="faqPage.contactPageLabel"
                  className="unavailable inline-flex h-[50px] items-center border border-[#201C1A]/20 px-7 text-[11.5px] uppercase tracking-[0.2em] text-[#201C1A]"
                >
                  {contactPageLabel}
                </span>
              )}
            </div>

            {whatsappFallbackNotice && (
              <div
                role="status"
                aria-live="polite"
                className="mx-auto mt-5 inline-flex items-start gap-2.5 border border-[#C8A98B]/50 bg-[#F2E9DE] px-4 py-3 text-xs text-[#201C1A] dark:bg-[#201C1A] dark:text-[#F2E9DE]"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A98B]" />
                <span>{whatsappFallbackNotice}</span>
              </div>
            )}
          </LuxuryReveal>
        </div>
      </section>
    </div>
  );
}
