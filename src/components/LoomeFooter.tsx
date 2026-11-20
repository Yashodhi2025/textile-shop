'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUp, Check } from 'lucide-react';
import { EditableIcon, EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { pageRoute, withBasePath } from '@/lib/utils';

const FOOTER_NAV = [
  { id: 'home', fallbackLabel: 'Shop', route: '/' },
  { id: 'services', fallbackLabel: 'Collections', route: '/services' },
  { id: 'about_us', fallbackLabel: 'About', route: '/about_us' },
  { id: 'contact', fallbackLabel: 'Contact', route: '/contact' },
] as const;

const SHOP_SHORTCUTS = [
  { label: 'Curtains & Drapery', href: '#categories' },
  { label: 'European Flax Bedding', href: '#categories' },
  { label: 'Upholstery Weaves', href: '#categories' },
  { label: 'Fabrics by the Yard', href: '#categories' },
  { label: 'Cushions & Throws', href: '#categories' },
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

export default function LoomeFooter() {
  const siteData = useSiteData();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
    : siteData.template?.structure?.pages || ['home', 'services', 'about_us', 'contact'];

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  const navigate = (route: string) => {
    window.location.href = withBasePath(route);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer data-design-section="footer" className="w-full">
      {/* Editorial Pre-Footer Newsletter Band */}
      <section className="border-t border-[#262923]/10 bg-[#E8E0D5]/65 px-4 py-20 text-[#262923] dark:border-[#F8F6F1]/10 dark:bg-[#20231D] dark:text-[#F8F6F1] sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p
              data-preview-static="newsletter-eyebrow"
              className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
            >
              Private Correspondence
            </p>
            <h2
              data-preview-field-path="common.footerHeading"
              className="mt-3 font-serif text-4xl font-light leading-[1.08] tracking-tight sm:text-5xl"
            >
              {footerHeading}
            </h2>
            <p
              data-preview-field-path="common.newsletterDescription"
              className="mt-4 max-w-lg text-sm leading-relaxed text-[#65685E] dark:text-[#B6B8AE]"
            >
              {newsletterDescription}
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div
                role="status"
                data-preview-static="newsletter-success"
                className="flex items-center gap-3 border border-[#747B65]/40 bg-[#F8F6F1] px-5 py-4 text-sm text-[#262923] dark:bg-[#171915] dark:text-[#F8F6F1]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#747B65] text-[#F8F6F1]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>Welcome to the LOOMÉ Atelier list. Seasonal editions await.</span>
              </div>
            ) : (
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
                    onChange={(e) => setEmail(e.target.value)}
                    data-preview-field-path="common.newsletterEmailPlaceholder"
                    placeholder={newsletterPlaceholder}
                    className="w-full border-0 border-b border-[#262923]/30 bg-transparent px-1 py-3.5 text-sm text-[#262923] placeholder:text-[#65685E]/75 focus:border-[#B59B79] focus:outline-none dark:border-[#F8F6F1]/25 dark:text-[#F8F6F1] dark:placeholder:text-[#B6B8AE]/70"
                  />
                </div>
                <button type="submit" className="loome-btn-primary shrink-0">
                  <span data-preview-field-path="common.newsletterSubscribeLabel">
                    {newsletterButtonLabel}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
              </form>
            )}
            <p
              data-preview-static="newsletter-footnote"
              className="mt-3 text-[11px] tracking-wide text-[#65685E]/80 dark:text-[#B6B8AE]/70"
            >
              Thoughtful dispatches only. Unsubscribe effortlessly at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Deep Charcoal Multi-Column Luxury Footer */}
      <div className="bg-[#262923] px-4 pb-12 pt-20 text-[#F8F6F1] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid grid-cols-1 gap-12 border-b border-[#F8F6F1]/12 pb-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
            {/* Column 1: Brand Identity */}
            <div className="lg:col-span-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-3 border-0 bg-transparent p-0 text-[#F8F6F1]"
              >
                <img
                  src={withBasePath(logoUrl)}
                  alt={siteTitle}
                  data-preview-field-path="common.logoUrl"
                  className="h-8 w-8 rounded-sm object-contain"
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
                className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[#B59B79]"
              >
                The Art of Fine Textiles
              </p>
              <p
                data-preview-field-path="common.shortDescription"
                className="mt-5 max-w-sm text-sm leading-relaxed text-[#E8E0D5]/75"
              >
                {shortDescription}
              </p>

              {/* Social Icons — always mounted with literal field paths for strict Fivora contract */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <a
                  href={contentText(rawSocial.instagram) || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="common.socialMedia.instagram"
                  aria-label="Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#F8F6F1]/15 text-[#E8E0D5]/80 transition-colors hover:border-[#B59B79] hover:text-[#B59B79]"
                >
                  {renderSocialSvg('instagram')}
                </a>
                <a
                  href={contentText(rawSocial.twitter) || 'https://twitter.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="common.socialMedia.twitter"
                  aria-label="Twitter"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#F8F6F1]/15 text-[#E8E0D5]/80 transition-colors hover:border-[#B59B79] hover:text-[#B59B79]"
                >
                  {renderSocialSvg('twitter')}
                </a>
                <a
                  href={contentText(rawSocial.linkedin) || 'https://linkedin.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="common.socialMedia.linkedin"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#F8F6F1]/15 text-[#E8E0D5]/80 transition-colors hover:border-[#B59B79] hover:text-[#B59B79]"
                >
                  {renderSocialSvg('linkedin')}
                </a>
                <a
                  href={contentText(rawSocial.facebook) || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="common.socialMedia.facebook"
                  aria-label="Facebook"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#F8F6F1]/15 text-[#E8E0D5]/80 transition-colors hover:border-[#B59B79] hover:text-[#B59B79]"
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
                className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59B79]"
                fontFamily="body"
              />
              <ul className="mt-6 space-y-3.5 text-sm text-[#E8E0D5]/80">
                {FOOTER_NAV.map((item) => {
                  const enabled = item.id === 'home' || requiredPages.includes(item.id);
                  const label = contentText(navLabels[item.id]) || item.fallbackLabel;
                  const labelEl =
                    item.id === 'home' ? (
                      <span data-preview-field-path="common.navLabels.home">{label}</span>
                    ) : item.id === 'services' ? (
                      <span data-preview-field-path="common.navLabels.services">{label}</span>
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
                            className="inline-block border-0 bg-transparent p-0 text-left text-inherit transition-colors hover:text-[#B59B79]"
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

            {/* Column 3: Collections Shortcuts */}
            <div className="lg:col-span-3">
              <h3
                data-preview-static="footer-collections-heading"
                className="font-sans text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59B79]"
              >
                Collections
              </h3>
              <ul className="mt-6 space-y-3.5 text-sm text-[#E8E0D5]/80">
                {SHOP_SHORTCUTS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      data-preview-static={`footer-shortcut-${link.label}`}
                      className="inline-block transition-colors hover:text-[#B59B79]"
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
                className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59B79]"
                fontFamily="body"
              />
              <div className="mt-6 space-y-4 text-sm text-[#E8E0D5]/80">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#B59B79]">
                    <EditableIcon name="mail" fieldPath="common.footerEmailIcon" size={15} />
                  </span>
                  <a
                    href={contactEmail ? `mailto:${contactEmail}` : '#'}
                    data-preview-field-path="contact.email"
                    className="break-all transition-colors hover:text-[#F8F6F1]"
                  >
                    {contactEmail || 'atelier@loometextiles.com'}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#B59B79]">
                    <EditableIcon name="phone" fieldPath="common.footerPhoneIcon" size={15} />
                  </span>
                  <a
                    href={contactPhone ? `tel:${contactPhone}` : '#'}
                    data-preview-field-path="contact.phone"
                    className="transition-colors hover:text-[#F8F6F1]"
                  >
                    {contactPhone || '+1 (212) 555-0194'}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#B59B79]">
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
                    className="inline-flex items-center gap-2 border-b border-[#B59B79]/60 pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#B59B79] transition-colors hover:border-[#F8F6F1] hover:text-[#F8F6F1]"
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
          <div className="flex flex-col items-center justify-between gap-5 pt-8 text-xs text-[#E8E0D5]/60 sm:flex-row">
            <p data-preview-field-path="common.copyright" className="m-0">
              {copyright}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              {requiredPages.includes('about_us') && (
                <a
                  href={withBasePath('/about_us')}
                  data-target-page="about_us"
                  data-preview-static="footer-legal-care"
                  className="transition-colors hover:text-[#F8F6F1]"
                >
                  Textile Care
                </a>
              )}
              {requiredPages.includes('services') && (
                <a
                  href={withBasePath('/services')}
                  data-target-page="services"
                  data-preview-static="footer-legal-trade"
                  className="transition-colors hover:text-[#F8F6F1]"
                >
                  Trade Program
                </a>
              )}
              {requiredPages.includes('contact') && (
                <a
                  href={withBasePath('/contact')}
                  data-target-page="contact"
                  data-preview-static="footer-legal-shipping"
                  className="transition-colors hover:text-[#F8F6F1]"
                >
                  Shipping & Returns
                </a>
              )}
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                data-preview-static="back-to-top"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F8F6F1]/18 text-[#E8E0D5] transition-colors hover:border-[#B59B79] hover:text-[#B59B79]"
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
