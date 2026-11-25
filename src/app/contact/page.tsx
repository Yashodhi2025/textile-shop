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
        className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-8 lg:px-14 lg:pb-12 lg:pt-16"
      >
        <LuxuryReveal className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B28B65] dark:bg-[#C8A98B]" aria-hidden="true" />
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
            size="clamp(2.4rem, 4.4vw, 3.85rem)"
            weight={800}
            lineHeight={1.05}
            letterSpacing="-0.03em"
            color="heading"
            className="mt-3.5 mb-0"
          />

          <EditableText
            as="p"
            data-preview-field-path="contact.intro"
            defaultValue={contentText(contact.intro)}
            fontFamily="body"
            size="0.96875rem"
            lineHeight={1.8}
            color="muted"
            className="mt-4 mb-0 max-w-2xl"
          />
        </LuxuryReveal>
      </section>

      {/* Contact Details + Consultation Form */}
      <section
        data-design-section="contact-details"
        className="loome-surface-beige w-full border-t border-[#49382D]/12 py-14 dark:border-[#C8A98B]/16 lg:py-20"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-14">
          <LuxuryReveal className="lg:col-span-5">
            <EditableBox
              stylePath="contact.informationCard"
              className="rounded-2xl border border-[#49382D]/12 bg-white p-7 shadow-[0_4px_20px_rgba(73,56,45,0.05)] dark:border-[#C8A98B]/20 dark:bg-[#28211D] dark:shadow-none sm:p-9"
              balance
              radius="lg"
            >
              <EditableText
                as="h2"
                data-preview-field-path="contact.directInformationTitle"
                defaultValue={contentText(contact.directInformationTitle ?? 'Showroom & Contact')}
                placeholder="Add an information heading"
                fontFamily="heading"
                size="1.65rem"
                weight={800}
                lineHeight={1.15}
                color="heading"
                className="m-0"
              />

              <div className="mt-6 flex flex-col gap-5 border-t border-[#49382D]/12 pt-6 text-sm dark:border-[#C8A98B]/16">
                <div className="flex items-start gap-3.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-[#B28B65] dark:text-[#C8A98B]" aria-hidden="true" />
                  <a
                    href={phone ? `tel:${phone}` : ''}
                    data-preview-field-path="contact.phone"
                    className="font-medium text-[#2C211B] no-underline transition-colors hover:text-[#B28B65] dark:text-[#F5EEE6] dark:hover:text-[#C8A98B]"
                  >
                    {phone}
                  </a>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-[#B28B65] dark:text-[#C8A98B]" aria-hidden="true" />
                  <a
                    href={email ? `mailto:${email}` : ''}
                    data-preview-field-path="contact.email"
                    className="break-all font-medium text-[#2C211B] no-underline transition-colors hover:text-[#B28B65] dark:text-[#F5EEE6] dark:hover:text-[#C8A98B]"
                  >
                    {email}
                  </a>
                </div>

                <div className="flex items-start gap-3.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 stroke-[1.6] text-[#B28B65] dark:text-[#C8A98B]" aria-hidden="true" />
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

              <div className="mt-8 flex flex-wrap gap-3 border-t border-[#49382D]/12 pt-6 dark:border-[#C8A98B]/16">
                <a
                  href={directionsUrl || '#'}
                  data-preview-field-path="contact.directionsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[11px] border border-[#49382D]/25 bg-transparent px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#49382D] no-underline transition-colors hover:border-[#B28B65] hover:text-[#B28B65] dark:border-[#C8A98B]/40 dark:text-[#F5EEE6] dark:hover:border-[#C8A98B]"
                >
                  <MapPin className="h-3.5 w-3.5 stroke-[1.6]" aria-hidden="true" />
                  <span data-preview-field-path="contact.directionsLabel">{directionsLabel}</span>
                </a>
                <a
                  href={whatsappHref || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-field-path="contact.whatsapp"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-[#49382D] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F7F3ED] no-underline transition-colors hover:bg-[#B28B65] hover:text-white dark:bg-[#C8A98B] dark:text-[#201C1A] dark:hover:bg-[#D8BFA4]"
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
              className="rounded-2xl border border-[#49382D]/12 bg-white p-7 shadow-[0_4px_20px_rgba(73,56,45,0.05)] dark:border-[#C8A98B]/20 dark:bg-[#28211D] dark:shadow-none sm:p-9"
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
                  size="1.65rem"
                  weight={800}
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
                    className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-[11px] bg-[#49382D] px-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#F7F3ED] transition-colors hover:bg-[#B28B65] hover:text-white disabled:opacity-60 dark:bg-[#C8A98B] dark:text-[#201C1A] dark:hover:bg-[#D8BFA4]"
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
                    className="mt-2 flex items-start gap-2.5 rounded-[11px] border border-[#B28B65]/40 bg-[#F7F3ED] px-4 py-3 text-xs leading-relaxed text-[#49382D] dark:border-[#C8A98B]/45 dark:bg-[#3B302B]/70 dark:text-[#F5EEE6]"
                  >
                    {submitState === 'success' ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B28B65] dark:text-[#C8A98B]" aria-hidden="true" />
                    ) : (
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#B28B65] dark:text-[#C8A98B]" aria-hidden="true" />
                    )}
                    <div className="space-y-1.5">
                      <p className="m-0">{statusMessage}</p>
                      {submitState === 'error' && (email || whatsappHref) && (
                        <div className="flex flex-wrap gap-4 pt-0.5">
                          {email && (
                            <a
                              href={`mailto:${email}?subject=${encodeURIComponent(`${siteTitle} Inquiry`)}`}
                              className="font-semibold text-[#B28B65] underline underline-offset-4 hover:text-[#2C211B] dark:text-[#C8A98B] dark:hover:text-[#F5EEE6]"
                            >
                              Email {email}
                            </a>
                          )}
                          {whatsappHref && (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-[#B28B65] underline underline-offset-4 hover:text-[#2C211B] dark:text-[#C8A98B] dark:hover:text-[#F5EEE6]"
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
