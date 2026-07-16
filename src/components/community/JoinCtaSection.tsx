import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

const JOIN_STEPS = [
  {
    num: "01",
    title: "Apply",
    desc: "4 questions about your role, time zone, and what you'd contribute.",
  },
  {
    num: "02",
    title: "Reviewed Fridays",
    desc: "Two existing members read each application. ~5% rejection rate.",
  },
  {
    num: "03",
    title: "Welcome thread",
    desc: "Intro yourself in #introductions. Lurk or contribute — both are fine.",
  },
];

export const JoinCtaSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-[720px] px-6 text-center">
      <Eyebrow className="mb-3">Apply</Eyebrow>
      <h2 className="mb-4 text-[36px] font-semibold text-neutral-900">
        Ready to join the{" "}
        <em className="font-serif text-brand-700" style={{ fontFamily: "var(--font-serif)" }}>
          family
        </em>
        ?
      </h2>
      <p className="mb-10 text-[15px] leading-relaxed text-neutral-500">
        One form, 4 questions, ~5 minutes. We review applications every Friday and reply by the
        following Tuesday — yes, even if the answer is &ldquo;not yet.&rdquo;
      </p>
      <div className="mb-10 grid gap-6 text-left sm:grid-cols-3">
        {JOIN_STEPS.map((s) => (
          <div className="flex gap-4" key={s.num}>
            <span className="mt-0.5 flex-shrink-0 font-mono text-[13px] font-semibold text-brand-600">
              {s.num}
            </span>
            <div>
              <div className="mb-1 text-[15px] font-semibold text-neutral-900">{s.title}</div>
              <div className="text-[13px] text-neutral-500">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button className="rounded-12 px-6" size="xl">
          Request invite <ArrowRight size={16} />
        </Button>
        <button className="inline-flex h-[52px] items-center gap-2 rounded-12 border border-neutral-200 bg-white px-6 text-[15px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
          Read the code of conduct
        </button>
      </div>
    </div>
  </section>
);
