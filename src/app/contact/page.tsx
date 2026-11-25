'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Info, Mail, MapPin, Phone } from 'lucide-react';
import { EditableBox, EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteApi, useSiteData } from '@/lib/siteDataContext';
import { LuxuryReveal } from '@/components/motion/LuxuryReveal';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const siteData = useSiteData();
  const siteApi = useSiteApi();
  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const siteTitle = contentText(common.websiteTitle) || 'LOOMÉ';
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const directionsLabel = contentText(contact.directionsLabel) || 'Atelier Directions';
  const directionsUrl =
    contentText(contact.directionsUrl) ||
    contentText(contact.mapUrl) ||
    contentText(contact.addressUrl);
  const address = contentText(contact.address);
  const phone = contentText(contact.phone);
  const email = contentText(contact.email);
  const whatsapp = contentText(contact.whatsapp);
  const directMessageText = contentText(contact.directMessageText) || 'Concierge via WhatsApp';
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : '';

  const contactEndpoint =
    contentText(siteApi?.contactUrl) || contentText(siteData.api?.contactUrl) || '/site-contact';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const projectId = siteData.project?.id?.trim();

    if (!projectId || !contactEndpoint) {
      setSubmitState('error');
      setStatusMessage(
        'Online form delivery is not connected to a live storefront backend yet. Please reach our atelier directly via email or WhatsApp below.',
      );
      return;
    }

    const formData = new FormData(form);
    const payload = {
      projectId,
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    };

    setSubmitState('submitting');
    setStatusMessage('Sending your inquiry to our atelier...');

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      form.reset();
      setSubmitState('success');
      setStatusMessage('Thank you — your message has been delivered to our atelier.');
    } catch {
      setSubmitState('error');
      setStatusMessage(
        'We could not deliver your form automatically right now. Please contact our atelier directly via email or WhatsApp.',
      );
    }
  }

  return (
    <div
      data-preview-page-key="contact"
      className="loome-surface-ivory w-full overflow-x-clip"
    >
      {/* Compact Editorial Page Header */}
      <section
        data-design-section="contact-heading"
        className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-9 sm:px-8 lg:px-10 lg:pb-10 lg:pt-12"
      >
        <LuxuryReveal className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--brand-accent)]" aria-hidden="true" />
            <EditableText
              as="p"
              data-preview-field-path="contact.eyebrow"
              defaultValue={contentText(contact.eyebrow) || 'Contact Us'}
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
            data-preview-field-path="contact.heading"
            defaultValue={contentText(contact.heading)}
            fontFamily="heading"
            size="clamp(1.9rem, 3.1vw, 2.65rem)"
            weight={800}
            lineHeight={1.08}
            letterSpacing="-0.025em"
            color="heading"
            className="mt-2.5 mb-0"
          />

          <EditableText
            as="p"
            data-preview-field-path="contact.intro"
            defaultValue={contentText(contact.intro)}
            fontFamily="body"
            size="0.9375rem"
            lineHeight={1.72}
            color="muted"
            className="mt-3.5 mb-0 max-w-2xl"
          />
        </LuxuryReveal>
      </section>

      {/* Contact Details + Consultation Form */}
      <section
        data-design-section="contact-details"
        className="loome-surface-beige w-full border-t border-[var(--loome-border)] py-12 lg:py-16"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-7 px-4 sm:px-8 lg:grid-cols-12 lg:gap-9 lg:px-10">
          <LuxuryReveal className="lg:col-span-5">
            <EditableBox
              stylePath="contact.informationCard"
              className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-6 shadow-[0_4px_18px_rgba(73,56,44,0.05)] dark:shadow-none sm:p-8"
              balance
              radius="lg"
            >
              <EditableText
                as="h2"
                data-preview-field-path="contact.directInformationTitle"
                defaultValue={contentText(contact.directInformationTitle ?? 'Showroom & Contact')}
                placeholder="Add an information heading"
                fontFamily="heading"
                size="1.4rem"
                weight={800}
                lineHeight={1.2}
                color="heading"
                className="m-0"
              />

              <div className="mt-5 flex flex-col gap-4 border-t border-[var(--loome-border)] pt-5 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-[var(--brand-accent)]" aria-hidden="true" />
                  <a
                    href={phone ? `tel:${phone}` : ''}
                    data-preview-field-path="contact.phone"
                    className="font-medium text-[var(--heading-color)] no-underline transition-colors hover:text-[var(--brand-accent)]"
                  >
                    {phone}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-[var(--brand-accent)]" aria-hidden="true" />
                  <a
                    href={email ? `mailto:${email}` : ''}
                    data-preview-field-path="contact.email"
                    className="break-all font-medium text-[var(--heading-color)] no-underline transition-colors hover:text-[var(--brand-accent)]"
                  >
                    {email}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-[var(--brand-accent)]" aria-hidden="true" />
                  <EditableText
                    as="p"
                    data-preview-field-path="contact.address"
                    defaultValue={address}
                    fontFamily="body"
                    size="0.9rem"
                    lineHeight={1.68}
                    color="muted"
                    className="m-0"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--loome-border)] pt-5">
                <a
                  href={directionsUrl || '#'}
                  data-preview-field-path="contact.directionsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[11px] border border-[var(--loome-border)] bg-transparent px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--heading-color)] no-underline transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                >
                  <MapPin className="h-3.5 w-3.5 stroke-[1.6]" aria-hidden="true" />
                  <span data-preview-field-path="contact.directionsLabel">{directionsLabel}</span>
                </a>
                <a
                  href={whatsappHref || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="contact.whatsapp"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-[var(--loome-btn-primary-bg)] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--loome-btn-primary-text)] no-underline transition-colors hover:bg-[var(--loome-btn-primary-hover)]"
                >
                  <span data-preview-field-path="contact.directMessageText">
                    {directMessageText}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.6]" aria-hidden="true" />
                </a>
              </div>
            </EditableBox>
          </LuxuryReveal>

          <LuxuryReveal delay={0.1} className="lg:col-span-7">
            <EditableBox
              stylePath="contact.formCard"
              className="rounded-2xl border border-[var(--loome-border)] bg-[var(--card-bg)] p-6 shadow-[0_4px_18px_rgba(73,56,44,0.05)] dark:shadow-none sm:p-8"
              balance
              radius="lg"
            >
              <form
                className="contact-form"
                onSubmit={handleSubmit}
                data-fivora-contact-disabled
              >
                <EditableText
                  as="h2"
                  data-preview-field-path="contact.formTitle"
                  defaultValue={contentText(contact.formTitle)}
                  fontFamily="heading"
                  size="1.4rem"
                  weight={800}
                  lineHeight={1.2}
                  color="heading"
                  className="mb-2"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label>
                    <EditableText
                      as="span"
                      data-preview-field-path="contact.nameLabel"
                      defaultValue={contentText(contact.nameLabel ?? 'Full Name')}
                      placeholder="Full Name"
                      fontFamily="body"
                      size="0.6875rem"
                      weight={600}
                      transform="uppercase"
                      letterSpacing="0.18em"
                      color="muted"
                    />
                    <input type="text" name="name" autoComplete="name" required />
                  </label>

                  <label>
                    <EditableText
                      as="span"
                      data-preview-field-path="contact.emailLabel"
                      defaultValue={contentText(contact.emailLabel ?? 'Email Address')}
                      placeholder="Email Address"
                      fontFamily="body"
                      size="0.6875rem"
                      weight={600}
                      transform="uppercase"
                      letterSpacing="0.18em"
                      color="muted"
                    />
                    <input type="email" name="email" autoComplete="email" required />
                  </label>
                </div>

                <label>
                  <EditableText
                    as="span"
                    data-preview-field-path="contact.messageLabel"
                    defaultValue={contentText(contact.messageLabel ?? 'Project Details or Swatch Request')}
                    placeholder="Message"
                    fontFamily="body"
                    size="0.6875rem"
                    weight={600}
                    transform="uppercase"
                    letterSpacing="0.18em"
                    color="muted"
                  />
                  <textarea name="message" rows={4} required />
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitState === 'submitting'}
                    className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-[11px] bg-[var(--loome-btn-primary-bg)] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loome-btn-primary-text)] transition-colors hover:bg-[var(--loome-btn-primary-hover)] disabled:opacity-60"
                  >
                    <span data-preview-field-path="contact.submitLabel">
                      {contentText(contact.submitLabel)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                {statusMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-2 flex items-start gap-2.5 rounded-[11px] border border-[var(--brand-accent)]/40 bg-[var(--loome-ivory)] px-4 py-3 text-xs leading-relaxed text-[var(--heading-color)]"
                  >
                    {submitState === 'success' ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
                    ) : (
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
                    )}
                    <div className="space-y-1.5">
                      <p className="m-0">{statusMessage}</p>
                      {submitState === 'error' && (email || whatsappHref) && (
                        <div className="flex flex-wrap gap-4 pt-0.5">
                          {email && (
                            <a
                              href={`mailto:${email}?subject=${encodeURIComponent(`${siteTitle} Inquiry`)}`}
                              className="font-semibold text-[var(--brand-accent)] underline underline-offset-4 hover:text-[var(--heading-color)]"
                            >
                              Email {email}
                            </a>
                          )}
                          {whatsappHref && (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-[var(--brand-accent)] underline underline-offset-4 hover:text-[var(--heading-color)]"
                            >
                              Message on WhatsApp
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </EditableBox>
          </LuxuryReveal>
        </div>
      </section>
    </div>
  );
}
