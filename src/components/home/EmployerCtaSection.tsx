import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROUTES } from "@/constants/routes";

const EMPLOYER_POINTS = [
  "Every job is human-reviewed before going live",
  "Salary range required — attracts serious applicants",
  "30-day listing · Renewable · Featured slot available",
  "Direct line to founder. Real human, not a ticket system.",
];

export const EmployerCtaSection = () => (
  <section className="py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="flex flex-col items-center gap-10 rounded-24 bg-neutral-900 p-10 md:flex-row">
        <div className="flex-1">
          <Eyebrow className="mb-3">For employers</Eyebrow>
          <h2 className="mb-3 text-[28px] font-semibold leading-tight text-white">
            Looking for remote talent in Vietnam?
          </h2>
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-neutral-400">
            Post your job and reach 500+ qualified VN professionals. Verified listings, salary range
            required, results in two weeks or money back.
          </p>
          <div className="flex gap-3">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-12 bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              to={ROUTES.employer}
            >
              Post a job — from $150 <ArrowRight size={14} />
            </Link>
            {/* Same mailto the employer-marketing CTAs use — this was a dead
                to="#" link that just scrolled to the top. */}
            <a
              className="inline-flex h-11 items-center px-5 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
              href="mailto:hello@remotesea.io"
            >
              Talk to founder
            </a>
          </div>
        </div>
        <div className="space-y-3">
          {EMPLOYER_POINTS.map((item) => (
            <div className="flex items-start gap-2.5 text-sm text-neutral-400" key={item}>
              <span className="mt-0.5 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-brand-600">
                <Star className="text-white" fill="white" size={9} />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
