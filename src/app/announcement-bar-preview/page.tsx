export default function AnnouncementBarPreviewPage() {
  return (
    <section
      id="preview-details"
      data-preview-page-key="announcement_bar_preview"
      className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28"
    >
      <p
        data-preview-static="announcement-preview-eyebrow"
        className="mb-4 text-[11px] font-medium uppercase tracking-[0.26em] text-[#8D7667] dark:text-[#C8A98B]"
      >
        LOOMÉ Atelier Preview
      </p>
      <h1
        data-preview-static="announcement-preview-heading"
        className="mb-6 font-serif text-4xl font-light leading-[1.08] tracking-tight text-[#201C1A] dark:text-[#F2E9DE] sm:text-5xl"
      >
        Good things, thoughtfully woven.
      </h1>
      <p
        data-preview-static="announcement-preview-copy"
        className="mx-auto max-w-lg text-sm leading-[1.85] text-[#5E4E45] dark:text-[#C7B6A6]"
      >
        Preview your rotating storefront announcements above. Edit badges, promotional copy, and destination links live from the Fivora editor.
      </p>
    </section>
  );
}
