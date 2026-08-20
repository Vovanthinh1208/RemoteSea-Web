import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import type { HiringPipeline } from "@/features/employer/hiring/hiring-stage.utils";

interface HiringProgressStepperProps {
  pipeline: HiringPipeline;
}

export const HiringProgressStepper = ({
  pipeline,
}: HiringProgressStepperProps) => {
  if (pipeline.terminal) {
    return (
      <div className="rounded-10 border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[12.5px] font-medium text-neutral-500">
        {pipeline.terminal === "REJECTED"
          ? "This application was rejected."
          : "The candidate withdrew this application."}
      </div>
    );
  }

  return (
    <ol className="flex items-center">
      {pipeline.steps.map((step, i) => (
        <li className="flex flex-1 items-center last:flex-none" key={step.key}>
          <div className="flex flex-col items-center gap-1.5">
            <span
              aria-current={step.current ? "step" : undefined}
              className={cn(
                "grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border-2 text-[10px] font-semibold transition-colors",
                step.reached
                  ? "border-brand-600 bg-brand-600 text-white"
                  : step.current
                    ? "border-brand-600 bg-white text-brand-600"
                    : "border-neutral-200 bg-white text-neutral-300"
              )}
            >
              {step.reached ? <Check size={12} /> : i + 1}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-[11px] font-medium",
                step.reached || step.current
                  ? "text-neutral-900"
                  : "text-neutral-400"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < pipeline.steps.length - 1 && (
            <span
              className={cn(
                "mx-1.5 mb-4 h-[2px] flex-1 rounded-full transition-colors",
                pipeline.steps[i + 1]?.reached
                  ? "bg-brand-600"
                  : "bg-neutral-200"
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
};
