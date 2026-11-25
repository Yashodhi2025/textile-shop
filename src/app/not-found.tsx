import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="loome-surface-espresso flex min-h-[68vh] w-full flex-col items-center justify-center bg-[#201C1A] px-6 py-20 text-center text-[#F2E9DE]">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#C8A98B]" aria-hidden="true" />
          <span
            data-preview-static="not-found-eyebrow"
            className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C8A98B]"
          >
            404 · Page Not Found
          </span>
          <span className="h-px w-8 bg-[#C8A98B]" aria-hidden="true" />
        </div>

        <h1
          data-preview-static="not-found-heading"
          className="mt-5 font-heading text-4xl font-extrabold leading-[1.06] tracking-[-0.03em] text-[#F2E9DE] sm:text-5xl"
        >
          This Page Could Not Be Found
        </h1>

        <p
          data-preview-static="not-found-copy"
          className="mx-auto mt-5 max-w-md text-sm leading-[1.85] text-[#C7B6A6]"
        >
          The textile edition or atelier page you requested may have been moved or is no longer available.
        </p>

        <div className="mt-9 flex justify-center">
          <Link
            href="/"
            data-preview-static="not-found-home-link"
            className="group loome-btn-primary no-underline"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[1.6] transition-transform duration-300 group-hover:-translate-x-1" />
            Return to Storefront
          </Link>
        </div>
      </div>
    </section>
  );
}
