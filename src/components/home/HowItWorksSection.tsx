import { Eyebrow } from "@/components/ui/eyebrow";

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Browse verified jobs",
    desc: "Each job shows the salary range, timezone fit, and which Vietnamese talent already work at the company. No more guessing.",
  },
  {
    num: "02",
    title: "Track applications in one place",
    desc: "A simple tracker that replaces your Google Sheet. Move from saved → applied → interviewing → offer.",
  },
  {
    num: "03",
    title: "Land your first remote offer",
    desc: "Your profile is visible to employers actively looking for VN talent. Inbound matters as much as outbound.",
  },
];

export const HowItWorksSection = () => (
  <section className="py-20 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="mb-12 text-center">
        <Eyebrow className="mb-3">How it works</Eyebrow>
        <h2 className="text-[36px] font-semibold tracking-tight text-neutral-900">
          Simple. Curated.{" "}
          <em
            className="font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Built for you.
          </em>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-neutral-500">
          Every job is reviewed before it goes live. Salary range required.
          Employer verified. No ghost listings.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {HOW_IT_WORKS.map((step) => (
          <div
            className="rounded-16 border border-neutral-100 bg-white p-6"
            key={step.num}
          >
            <div className="mb-3 text-[13px] font-semibold text-brand-600">
              {step.num}
            </div>
            <h3 className="mb-2 text-[17px] font-semibold text-neutral-900">
              {step.title}
            </h3>
            <p className="text-[14px] leading-relaxed text-neutral-500">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
