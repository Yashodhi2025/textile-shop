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
  const contact = contentObject(contentObject(siteData.content).contact);
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
    <div data-preview-page-key="contact" className="w-full overflow-x-clip">
      {/* Compact Editorial Page Header */}
      <section
        data-design-section="contact-heading"
        className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 sm:px-8 lg:px-14 lg:pb-10 lg:pt-16"
      >
        <LuxuryReveal className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B59B79]" aria-hidden="true" />
            <p
              data-preview-static="contact-eyebrow"
              className="m-0 text-[11px] font-medium uppercase tracking-[0.26em] text-[#747B65] dark:text-[#B59B79]"
            >
              Private Client Concierge
            </p>
          </div>

          <EditableText
            as="h1"
            data-preview-field-path="contact.heading"
            defaultValue={contentText(contact.heading)}
            fontFamily="heading"
            size="clamp(2.6rem, 4.6vw, 4.15rem)"
            weight={300}
            lineHeight={1.04}
            letterSpacing="-0.02em"
            color="heading"
            className="mt-4 mb-0"
          />

          <EditableText
            as="p"
            data-preview-field-path="contact.intro"
            defaultValue={contentText(contact.intro)}
            fontFamily="body"
            size="1rem"
            lineHeight={1.8}
            color="muted"
            className="mt-4 mb-0 max-w-2xl"
          />
        </LuxuryReveal>
      </section>

      {/* Contact Details + Private Consultation Form */}
      <section
        data-design-section="contact-details"
        className="w-full border-t border-[#262923]/8 bg-[#E8E0D5]/32 py-12 dark:border-[#F8F6F1]/8 dark:bg-[#20231D] lg:py-16"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-14">
          <LuxuryReveal className="lg:col-span-5">
            <EditableBox
              stylePath="contact.informationCard"
              className="border border-[#262923]/12 bg-[#FCFBF8] p-7 dark:border-[#F8F6F1]/12 dark:bg-[#171915] sm:p-9"
              balance
              radius="none"
            >
              <EditableText
                as="h2"
                data-preview-field-path="contact.directInformationTitle"
                defaultValue={contentText(contact.directInformationTitle ?? 'Atelier Concierge')}
                placeholder="Add an information heading"
                fontFamily="heading"
                size="1.85rem"
                weight={400}
                lineHeight={1.15}
                color="heading"
                className="m-0"
              />

              <div className="mt-6 flex flex-col gap-5 border-t border-[#262923]/10 pt-6 text-sm dark:border-[#F8F6F1]/10">
                <div className="flex items-start gap-3.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#B59B79]" aria-hidden="true" />
                  <a
                    href={phone ? `tel:${phone}` : ''}
                    data-preview-field-path="contact.phone"
                    className="font-medium text-[#262923] no-underline transition-colors hover:text-[#747B65] dark:text-[#F8F6F1]"
                  >
                    {phone}
                  </a>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#B59B79]" aria-hidden="true" />
                  <a
                    href={email ? `mailto:${email}` : ''}
                    data-preview-field-path="contact.email"
                    className="break-all font-medium text-[#262923] no-underline transition-colors hover:text-[#747B65] dark:text-[#F8F6F1]"
                  >
                    {email}
                  </a>
                </div>

                <div className="flex items-start gap-3.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.5] text-[#B59B79]" aria-hidden="true" />
                  <EditableText
                    as="p"
                    data-preview-field-path="contact.address"
                    defaultValue={address}
                    fontFamily="body"
                    size="0.9rem"
                    lineHeight={1.7}
                    color="muted"
                    className="m-0"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-[#262923]/10 pt-6 dark:border-[#F8F6F1]/10">
                <a
                  href={directionsUrl || '#'}
                  data-preview-field-path="contact.directionsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="loome-btn-outline px-5 py-3 text-[11px]"
                >
                  <MapPin className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
                  <span data-preview-field-path="contact.directionsLabel">{directionsLabel}</span>
                </a>
                <a
                  href={whatsappHref || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="contact.whatsapp"
                  className="loome-btn-primary px-5 py-3 text-[11px]"
                >
                  <span data-preview-field-path="contact.directMessageText">
                    {directMessageText}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
                </a>
              </div>
            </EditableBox>
          </LuxuryReveal>

          <LuxuryReveal delay={0.1} className="lg:col-span-7">
            <EditableBox
              stylePath="contact.formCard"
              className="border border-[#262923]/12 bg-[#FCFBF8] p-7 dark:border-[#F8F6F1]/12 dark:bg-[#171915] sm:p-9"
              balance
              radius="none"
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
                  size="1.85rem"
                  weight={400}
                  lineHeight={1.15}
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
                      weight={500}
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
                      weight={500}
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
                    weight={500}
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
                    className="group loome-btn-primary disabled:opacity-60"
                  >
                    <span data-preview-field-path="contact.submitLabel">
                      {contentText(contact.submitLabel)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                {statusMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mt-2 flex items-start gap-2.5 border px-4 py-3 text-xs leading-relaxed ${
                      submitState === 'success'
                        ? 'border-[#747B65]/40 bg-[#F8F6F1] text-[#262923] dark:bg-[#20231D] dark:text-[#F8F6F1]'
                        : 'border-[#B59B79]/50 bg-[#F8F6F1] text-[#262923] dark:bg-[#20231D] dark:text-[#F8F6F1]'
                    }`}
                  >
                    {submitState === 'success' ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#747B65]" aria-hidden="true" />
                    ) : (
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#B59B79]" aria-hidden="true" />
                    )}
                    <div className="space-y-1.5">
                      <p className="m-0">{statusMessage}</p>
                      {submitState === 'error' && (email || whatsappHref) && (
                        <div className="flex flex-wrap gap-4 pt-0.5">
                          {email && (
                            <a
                              href={`mailto:${email}?subject=${encodeURIComponent('LOOMÉ Atelier Inquiry')}`}
                              className="font-medium underline underline-offset-4 hover:text-[#747B65]"
                            >
                              Email {email}
                            </a>
                          )}
                          {whatsappHref && (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium underline underline-offset-4 hover:text-[#747B65]"
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
