'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';

export default function NotFound() {
  const siteData = useSiteData();
  const common = contentObject(contentObject(siteData.content).common);
  const notFound = contentObject(common.notFound);

  const eyebrow = contentText(notFound.eyebrow) || '404 · Page Not Found';
  const heading = contentText(notFound.heading) || 'This Page Could Not Be Found';
  const description =
    contentText(notFound.description) ||
    'The textile edition or atelier page you requested may have been moved or is no longer available.';
  const ctaLabel = contentText(notFound.ctaLabel) || 'Return to Storefront';

  return (
    <section className="loome-surface-espresso flex min-h-[68vh] w-full flex-col items-center justify-center bg-[#201C1A] px-6 py-20 text-center text-[#F2E9DE]">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#C8A98B]" aria-hidden="true" />
          <EditableText
            as="span"
            data-preview-field-path="common.notFound.eyebrow"
            defaultValue={eyebrow}
            fontFamily="body"
            size="0.6875rem"
            weight={600}
            transform="uppercase"
            letterSpacing="0.28em"
            color="#C8A98B"
          />
          <span className="h-px w-8 bg-[#C8A98B]" aria-hidden="true" />
        </div>

        <EditableText
          as="h1"
          data-preview-field-path="common.notFound.heading"
          defaultValue={heading}
          fontFamily="heading"
          size="clamp(2.1rem, 4.5vw, 3rem)"
          weight={800}
          lineHeight={1.06}
          letterSpacing="-0.03em"
          color="#F2E9DE"
          align="center"
          className="mt-5 mb-0"
        />

        <EditableText
          as="p"
          data-preview-field-path="common.notFound.description"
          defaultValue={description}
          fontFamily="body"
          size="0.9rem"
          lineHeight={1.8}
          color="#C7B6A6"
          align="center"
          className="mx-auto mt-5 mb-0 max-w-md"
        />

        <div className="mt-9 flex justify-center">
          <Link
            href="/"
            data-testid="not-found-home-link"
            className="group loome-btn-primary no-underline"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:-translate-x-1" />
            <span data-preview-field-path="common.notFound.ctaLabel">{ctaLabel}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
