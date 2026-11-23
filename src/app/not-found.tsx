import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="flex min-h-[68vh] w-full flex-col items-center justify-center bg-[#F8F6F1] px-6 py-20 text-center text-[#262923] dark:bg-[#171915] dark:text-[#F8F6F1]">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#B59B79]" aria-hidden="true" />
          <span
            data-preview-static="not-found-eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#747B65] dark:text-[#B59B79]"
          >
            404 · Page Not Found
          </span>
          <span className="h-px w-8 bg-[#B59B79]" aria-hidden="true" />
        </div>

        <h1
          data-preview-static="not-found-heading"
          className="mt-5 font-serif text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl"
        >
          This Page Could Not Be Found
        </h1>

        <p
          data-preview-static="not-found-copy"
          className="mx-auto mt-5 max-w-md text-sm leading-[1.85] text-[#595C52] dark:text-[#B6B8AE]"
        >
          The textile edition or atelier page you requested may have been moved or is no longer available.
        </p>

        <div className="mt-9 flex justify-center">
          <Link
            href="/"
            data-preview-static="not-found-home-link"
            className="group loome-btn-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:-translate-x-1" />
            Return to Storefront
          </Link>
        </div>
      </div>
    </section>
  );
}
