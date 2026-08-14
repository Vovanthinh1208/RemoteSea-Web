import { NewsletterForm } from "@/components/shared/NewsletterForm";

export const NewsletterCtaSection = () => (
  <section className="pb-20 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="rounded-24 border border-brand-100 bg-brand-50 p-10 text-center">
        <h2 className="mb-2 text-[28px] font-semibold text-neutral-900">
          Don&apos;t miss the{" "}
          <em
            className="font-serif text-brand-700"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            next
          </em>{" "}
          opportunity.
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-neutral-500">
          Every Friday: top 8 remote jobs curated for VN/SEA talent, salary
          tips, and remote work insights you won&apos;t find on LinkedIn.
        </p>
        <NewsletterForm />
        <p className="mt-3 text-xs text-neutral-400">
          Join 1,200+ subscribers · No spam · Unsubscribe anytime
        </p>
      </div>
    </div>
  </section>
);
