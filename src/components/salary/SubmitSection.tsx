import { Link } from "react-router-dom";
import {
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROUTES } from "@/constants/routes";

export const SubmitSection = () => {
  return (
    <section className="py-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-2">Contribute</Eyebrow>
            <h2 className="mb-3 text-[28px] font-semibold tracking-tight text-neutral-900">
              Submit your salary,{" "}
              <em className="font-serif-italic text-brand-700">
                anonymously
              </em>
              .
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-neutral-500">
              It takes 90 seconds. No name, no email required. Your
              data point makes the next person&apos;s negotiation a
              little bit fairer.
            </p>

            <div className="mb-6 space-y-2.5">
              {[
                {
                  icon: ShieldCheck,
                  label: "Encrypted & anonymized",
                },
                { icon: Users, label: "612 submissions so far" },
                {
                  icon: RefreshCw,
                  label: "Reviewed weekly by our team",
                },
              ].map(({ icon: Icon, label }) => (
                <div
                  className="flex items-center gap-2.5 text-[13px] text-neutral-500"
                  key={label}
                >
                  <Icon className="text-brand-600" size={14} />
                  {label}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button className="rounded-12 px-5" size="lg">
                Submit a data point <ArrowRight size={14} />
              </Button>
              <Link
                className="inline-flex h-11 items-center gap-2 px-5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                to={ROUTES.jobs}
              >
                See live jobs
              </Link>
            </div>
          </div>

          {/* Form preview */}
          <div className="rounded-20 border border-neutral-200 bg-neutral-50 p-6">
            {[
              { k: "Role", v: "Senior Frontend Engineer" },
              { k: "Company HQ", v: "🇸🇬 Singapore" },
              { k: "Years exp.", v: "6" },
              { k: "Base / month", v: "$5,200", highlight: true },
              { k: "Equity", v: "0.05% @ $40M" },
            ].map(({ k, v, highlight }) => (
              <div
                className="flex items-center justify-between border-b border-neutral-200/60 py-3 last:border-none"
                key={k}
              >
                <span className="text-[12.5px] text-neutral-500">
                  {k}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    highlight
                      ? "font-semibold text-brand-700"
                      : "text-neutral-900"
                  )}
                >
                  {v}
                </span>
              </div>
            ))}
            <div className="mt-3 flex items-center gap-2 border-t border-neutral-200 pt-3 text-[12px] text-neutral-400">
              <ShieldCheck className="text-brand-600" size={13} />
              Anonymous · One field at a time
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
