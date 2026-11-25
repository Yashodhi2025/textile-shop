'use client';

import { useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, ArrowUp, Check, Info } from 'lucide-react';
import { EditableIcon, EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteApi, useSiteData } from '@/lib/siteDataContext';
import { useLoomeStore } from '@/lib/storeContext';
import { pageRoute, withBasePath } from '@/lib/utils';

const PENDING_CATEGORY_KEY = 'loome_pending_category_v1';

const FOOTER_NAV = [
  { id: 'home', fallbackLabel: 'Home', route: '/' },
  { id: 'shop', fallbackLabel: 'Shop', route: '/shop' },
  { id: 'services', fallbackLabel: 'Collections', route: '/services' },
  { id: 'journal', fallbackLabel: 'Journal', route: '/journal' },
  { id: 'about_us', fallbackLabel: 'About', route: '/about_us' },
  { id: 'contact', fallbackLabel: 'Contact', route: '/contact' },
] as const;

const SHOP_SHORTCUTS = [
  { label: 'Curtains & Drapery', category: 'Curtains' },
  { label: 'European Flax Bedding', category: 'Bedding' },
  { label: 'Upholstery Weaves', category: 'Upholstery' },
  { label: 'Fabrics by the Yard', category: 'Fabrics' },
  { label: 'Cushions & Throws', category: 'Cushions' },
];

function renderSocialSvg(platform: string) {
  const key = platform.toLowerCase();
  if (key === 'instagram') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }
  if (key === 'twitter' || key === 'x') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (key === 'linkedin') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

type NewsletterState = 'idle' | 'submitting' | 'success' | 'unavailable' | 'error';

export default function LoomeFooter() {
  const siteData = useSiteData();
  const siteApi = useSiteApi();
  const pathname = usePathname() || '/';
  const { setActiveCategory } = useLoomeStore();

  const [email, setEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<NewsletterState>('idle');

  const isHome = pathname === '/' || pathname === '';
  const isShopPage = pathname === '/shop' || pathname === '/shop/';
  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const navLabels = contentObject(common.navLabels);
  const rawSocial = contentObject(common.socialMedia);

  const siteTitle = contentText(common.websiteTitle) || 'LOOMÉ';
  const logoUrl = contentText(common.logoUrl) || '/loome-monogram.svg';
  const shortDescription = contentText(common.shortDescription);
  const footerHeading = contentText(common.footerHeading) || 'Letters from the Atelier';
  const newsletterDescription = contentText(common.newsletterDescription);
  const newsletterPlaceholder =
    contentText(common.newsletterEmailPlaceholder) || 'Enter your email address';
  const newsletterButtonLabel = contentText(common.newsletterSubscribeLabel) || 'Join List';
  const copyright =
    contentText(common.copyright) || `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved.`;

  const contactEmail = contentText(contact.email);
  const contactPhone = contentText(contact.phone);
  const contactAddress = contentText(contact.address);
  const whatsappRaw = contentText(contact.whatsapp) || contactPhone;
  const whatsappDigits = whatsappRaw.replace(/[^\d]/g, '');
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '#';
  const directMessageText = contentText(contact.directMessageText) || 'Concierge via WhatsApp';

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || [
        'home',
        'shop',
        'services',
        'journal',
        'textile_care',
        'shipping_returns',
        'faq',
        'about_us',
        'contact',
      ];
  const hasShopPage = requiredPages.includes('shop');

  const configuredNewsletterUrl = contentText(
    (siteApi as Record<string, unknown> | undefined)?.newsletterUrl ??
      (siteData.api as Record<string, unknown> | undefined)?.newsletterUrl,
  );

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    if (!configuredNewsletterUrl) {
      setNewsletterState('unavailable');
      return;
    }

    setNewsletterState('submitting');
    try {
      const response = await fetch(configuredNewsletterUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: siteData.project?.id?.trim() || undefined,
          email: trimmed,
        }),
      });
      if (!response.ok) throw new Error('Newsletter service error');
      setEmail('');
      setNewsletterState('success');
    } catch {
      setNewsletterState('error');
    }
  };

  const navigate = (route: string) => {
    window.location.href = withBasePath(route);
  };

  const handleShortcutClick = (category: string) => {
    if (isShopPage) {
      setActiveCategory(category);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!hasShopPage && isHome) {
      setActiveCategory(category);
      const target = document.getElementById('new-arrivals') || document.getElementById('categories');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    try {
      window.sessionStorage.setItem(PENDING_CATEGORY_KEY, category);
    } catch {
      // Ignore storage errors
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const collectionShortcutHref = hasShopPage
    ? withBasePath('/shop')
    : isHome
      ? '#new-arrivals'
      : `${withBasePath('/')}#new-arrivals`;

  return (
    <footer data-design-section="footer" className="w-full">
      {/* Editorial Pre-Footer Newsletter Band — Dark Mocha */}
      <section className="border-t border-[#C8A98B]/20 bg-[var(--brand-secondary,#3B302B)] px-4 py-20 text-[#F2E9DE] sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p
              data-preview-static="newsletter-eyebrow"
              className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C8A98B]"
            >
              Private Correspondence
            </p>
            <h2
              data-preview-field-path="common.footerHeading"
              className="mt-3 font-heading text-4xl font-extrabold leading-[1.06] tracking-[-0.025em] text-[#F2E9DE] sm:text-5xl"
            >
              {footerHeading}
            </h2>
            <p
              data-preview-field-path="common.newsletterDescription"
              className="mt-4 max-w-lg text-sm leading-relaxed text-[#C7B6A6]"
            >
              {newsletterDescription}
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="loome-newsletter-email"
                  data-preview-static="newsletter-email-label"
                  className="sr-only"
                >
                  Email address
                </label>
                <input
                  id="loome-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (newsletterState !== 'idle') setNewsletterState('idle');
                  }}
                  data-preview-field-path="common.newsletterEmailPlaceholder"
                  placeholder={newsletterPlaceholder}
                  className="w-full rounded-[11px] border border-[#C8A98B]/30 bg-[#201C1A]/55 px-4 py-3.5 text-sm text-[#F2E9DE] placeholder:text-[#C7B6A6]/75 focus:border-[#C8A98B] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={newsletterState === 'submitting'}
                className="group loome-btn-primary shrink-0 disabled:opacity-60"
              >
                <span data-preview-field-path="common.newsletterSubscribeLabel">
                  {newsletterButtonLabel}
                </span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>

            {newsletterState === 'success' && (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 flex items-center gap-3 rounded-[11px] border border-[#C8A98B]/40 bg-[#201C1A]/85 px-4 py-3 text-xs text-[#F2E9DE]"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8A98B] text-[#201C1A]">
                  <Check className="h-3 w-3" />
                </span>
                <span>You are subscribed to {siteTitle} Atelier correspondence.</span>
              </div>
            )}

            {(newsletterState === 'unavailable' || newsletterState === 'error') && (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 flex items-start gap-2.5 rounded-[11px] border border-[#C8A98B]/45 bg-[#201C1A]/85 px-4 py-3 text-xs leading-relaxed text-[#F2E9DE]"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-[#C8A98B]" aria-hidden="true" />
                <span>
                  {newsletterState === 'unavailable'
                    ? 'Automated newsletter signup is not connected to a mailing service yet.'
                    : 'We could not register your email right now.'}{' '}
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}?subject=${encodeURIComponent('Newsletter Subscription Request')}&body=${encodeURIComponent(`Please add ${email.trim()} to the ${siteTitle} mailing list.`)}`}
                      className="font-medium text-[#C8A98B] underline underline-offset-4 hover:text-[#F2E9DE]"
                    >
                      Email {contactEmail} to join directly
                    </a>
                  )}
                </span>
              </div>
            )}

            <p
              data-preview-static="newsletter-footnote"
              className="mt-3 text-[11px] tracking-wide text-[#C7B6A6]/80"
            >
              Thoughtful dispatches only. Unsubscribe effortlessly at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Deep Espresso Multi-Column Luxury Footer */}
      <div className="border-t border-[#C8A98B]/14 bg-[var(--page-background,#201C1A)] px-4 pb-12 pt-20 text-[#F2E9DE] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid grid-cols-1 gap-12 border-b border-[#C8A98B]/16 pb-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
            {/* Column 1: Brand Identity */}
            <div className="lg:col-span-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-3 border-0 bg-transparent p-0 text-[#F2E9DE]"
              >
                <img
                  src={withBasePath(logoUrl)}
                  alt={siteTitle}
                  data-preview-field-path="common.logoUrl"
                  className="h-8 w-8 rounded-[6px] object-contain"
                />
                <span
                  data-preview-field-path="common.websiteTitle"
                  className="font-serif text-3xl font-normal tracking-[0.28em]"
                >
                  {siteTitle}
                </span>
              </button>
              <p
                data-preview-static="footer-tagline"
                className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C8A98B]"
              >
                The Art of Fine Textiles
              </p>
              <p
                data-preview-field-path="common.shortDescription"
                className="mt-5 max-w-sm text-sm leading-relaxed text-[#C7B6A6]"
              >
                {shortDescription}
              </p>

              {/* Social Icons — softly rounded 10px corners */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <a
                  href={contentText(rawSocial.instagram) || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="common.socialMedia.instagram"
                  aria-label="Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C8A98B]/25 bg-[#3B302B]/45 text-[#F2E9DE]/85 transition-all hover:-translate-y-0.5 hover:border-[#C8A98B] hover:text-[#C8A98B]"
                >
                  {renderSocialSvg('instagram')}
                </a>
                <a
                  href={contentText(rawSocial.twitter) || 'https://twitter.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="common.socialMedia.twitter"
                  aria-label="Twitter"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C8A98B]/25 bg-[#3B302B]/45 text-[#F2E9DE]/85 transition-all hover:-translate-y-0.5 hover:border-[#C8A98B] hover:text-[#C8A98B]"
                >
                  {renderSocialSvg('twitter')}
                </a>
                <a
                  href={contentText(rawSocial.linkedin) || 'https://linkedin.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="common.socialMedia.linkedin"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C8A98B]/25 bg-[#3B302B]/45 text-[#F2E9DE]/85 transition-all hover:-translate-y-0.5 hover:border-[#C8A98B] hover:text-[#C8A98B]"
                >
                  {renderSocialSvg('linkedin')}
                </a>
                <a
                  href={contentText(rawSocial.facebook) || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="common.socialMedia.facebook"
                  aria-label="Facebook"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C8A98B]/25 bg-[#3B302B]/45 text-[#F2E9DE]/85 transition-all hover:-translate-y-0.5 hover:border-[#C8A98B] hover:text-[#C8A98B]"
                >
                  {renderSocialSvg('facebook')}
                </a>
              </div>
            </div>

            {/* Column 2: Maison Navigation */}
            <div className="lg:col-span-2">
              <EditableText
                as="h3"
                data-preview-field-path="common.footerExploreHeading"
                defaultValue={contentText(common.footerExploreHeading) || 'Maison'}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.24em"
                color="#C8A98B"
                className="m-0"
              />
              <ul className="mt-6 space-y-3.5 text-sm text-[#F2E9DE]/80">
                {FOOTER_NAV.map((item) => {
                  const enabled = item.id === 'home' || requiredPages.includes(item.id);
                  const label = contentText(navLabels[item.id]) || item.fallbackLabel;
                  const labelEl =
                    item.id === 'home' ? (
                      <span data-preview-field-path="common.navLabels.home">{label}</span>
                    ) : item.id === 'shop' ? (
                      <span data-preview-field-path="common.navLabels.shop">{label}</span>
                    ) : item.id === 'services' ? (
                      <span data-preview-field-path="common.navLabels.services">{label}</span>
                    ) : item.id === 'journal' ? (
                      <span data-preview-field-path="common.navLabels.journal">{label}</span>
                    ) : item.id === 'about_us' ? (
                      <span data-preview-field-path="common.navLabels.about_us">{label}</span>
                    ) : (
                      <span data-preview-field-path="common.navLabels.contact">{label}</span>
                    );
                  return (
                    <li key={item.id}>
                      <span data-target-page={item.id}>
                        {enabled ? (
                          <button
                            type="button"
                            onClick={() => navigate(pageRoute(item.id))}
                            className="inline-block border-0 bg-transparent p-0 text-left text-inherit transition-colors hover:text-[#C8A98B]"
                          >
                            {labelEl}
                          </button>
                        ) : (
                          <span className="unavailable">{labelEl}</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Collections Shortcuts — Cross-Page Working Category Links */}
            <div className="lg:col-span-3">
              <h3
                data-preview-static="footer-collections-heading"
                className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C8A98B]"
              >
                Collections
              </h3>
              <ul className="mt-6 space-y-3.5 text-sm text-[#F2E9DE]/80">
                {SHOP_SHORTCUTS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={collectionShortcutHref}
                      data-target-page={hasShopPage ? 'shop' : undefined}
                      onClick={(e) => {
                        if (isShopPage || (!hasShopPage && isHome)) e.preventDefault();
                        handleShortcutClick(link.category);
                      }}
                      data-preview-static={`footer-shortcut-${link.label}`}
                      className="inline-block transition-colors hover:text-[#C8A98B]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Atelier & Care */}
            <div className="lg:col-span-3">
              <EditableText
                as="h3"
                data-preview-field-path="common.footerContactHeading"
                defaultValue={contentText(common.footerContactHeading) || 'Atelier & Care'}
                fontFamily="body"
                size="0.6875rem"
                weight={600}
                transform="uppercase"
                letterSpacing="0.24em"
                color="#C8A98B"
                className="m-0"
              />
              <div className="mt-6 space-y-4 text-sm text-[#F2E9DE]/80">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#C8A98B]">
                    <EditableIcon name="mail" fieldPath="common.footerEmailIcon" size={15} />
                  </span>
                  <a
                    href={contactEmail ? `mailto:${contactEmail}` : '#'}
                    data-preview-field-path="contact.email"
                    className="break-all transition-colors hover:text-[#F2E9DE]"
                  >
                    {contactEmail || 'atelier@loometextiles.com'}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#C8A98B]">
                    <EditableIcon name="phone" fieldPath="common.footerPhoneIcon" size={15} />
                  </span>
                  <a
                    href={contactPhone ? `tel:${contactPhone}` : '#'}
                    data-preview-field-path="contact.phone"
                    className="transition-colors hover:text-[#F2E9DE]"
                  >
                    {contactPhone || '+1 (212) 555-0194'}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#C8A98B]">
                    <EditableIcon name="map-pin" fieldPath="common.footerLocationIcon" size={15} />
                  </span>
                  <span data-preview-field-path="contact.address" className="leading-relaxed">
                    {contactAddress || 'SoHo Textile Atelier, New York'}
                  </span>
                </div>

                <div className="pt-2">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-field-path="contact.whatsapp"
                    className="inline-flex items-center gap-2 border-b border-[#C8A98B]/60 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8A98B] transition-colors hover:border-[#F2E9DE] hover:text-[#F2E9DE]"
                  >
                    <span data-preview-field-path="contact.directMessageText">
                      {directMessageText}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Legal & Back-to-Top Row */}
          <div className="flex flex-col items-center justify-between gap-5 pt-8 text-xs text-[#C7B6A6]/80 sm:flex-row">
            <p data-preview-field-path="common.copyright" className="m-0">
              {copyright}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <span data-target-page="textile_care">
                {requiredPages.includes('textile_care') ? (
                  <button
                    type="button"
                    onClick={() => navigate(pageRoute('textile_care'))}
                    className="cursor-pointer border-0 bg-transparent p-0 text-xs text-inherit transition-colors hover:text-[#F2E9DE]"
                  >
                    <span data-preview-field-path="common.navLabels.textile_care">
                      {contentText(navLabels.textile_care) || 'Textile Care'}
                    </span>
                  </button>
                ) : (
                  <span className="unavailable">
                    <span data-preview-field-path="common.navLabels.textile_care">
                      {contentText(navLabels.textile_care) || 'Textile Care'}
                    </span>
                  </span>
                )}
              </span>
              {requiredPages.includes('services') && (
                <a
                  href={withBasePath('/services')}
                  data-target-page="services"
                  data-preview-static="footer-legal-trade"
                  className="transition-colors hover:text-[#F2E9DE]"
                >
                  Trade Program
                </a>
              )}
              <span data-target-page="shipping_returns">
                {requiredPages.includes('shipping_returns') ? (
                  <button
                    type="button"
                    onClick={() => navigate(pageRoute('shipping_returns'))}
                    className="cursor-pointer border-0 bg-transparent p-0 text-xs text-inherit transition-colors hover:text-[#F2E9DE]"
                  >
                    <span data-preview-field-path="common.navLabels.shipping_returns">
                      {contentText(navLabels.shipping_returns) || 'Shipping & Returns'}
                    </span>
                  </button>
                ) : (
                  <span className="unavailable">
                    <span data-preview-field-path="common.navLabels.shipping_returns">
                      {contentText(navLabels.shipping_returns) || 'Shipping & Returns'}
                    </span>
                  </span>
                )}
              </span>
              <span data-target-page="faq">
                {requiredPages.includes('faq') ? (
                  <button
                    type="button"
                    onClick={() => navigate(pageRoute('faq'))}
                    className="cursor-pointer border-0 bg-transparent p-0 text-xs text-inherit transition-colors hover:text-[#F2E9DE]"
                  >
                    <span data-preview-field-path="common.navLabels.faq">
                      {contentText(navLabels.faq) || 'FAQ'}
                    </span>
                  </button>
                ) : (
                  <span className="unavailable">
                    <span data-preview-field-path="common.navLabels.faq">
                      {contentText(navLabels.faq) || 'FAQ'}
                    </span>
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                data-preview-static="back-to-top"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C8A98B]/28 bg-[#3B302B]/55 text-[#F2E9DE] transition-all hover:-translate-y-0.5 hover:border-[#C8A98B] hover:text-[#C8A98B]"
              >
                <ArrowUp className="h-3.5 w-3.5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
