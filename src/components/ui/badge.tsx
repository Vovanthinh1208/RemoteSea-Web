import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 text-[11.5px] font-medium px-2 py-0.5 rounded-full leading-tight whitespace-nowrap",
  {
    variants: {
      variant: {
        verified: "bg-brand-50 text-brand-700",
        featured: "bg-amber-100 text-amber-700",
        vn: "bg-blue-50 text-blue-700",
        new: "bg-brand-100 text-brand-700",
        muted: "bg-neutral-100 text-neutral-600",
        info: "border border-blue-100 bg-blue-50 text-blue-700",
        warning: "border border-amber-100 bg-amber-50 text-amber-700",
        positive: "border border-brand-100 bg-brand-50 text-brand-700",
        // Darker/more saturated brand, not a second green hue (was
        // emerald-*, outside this project's own brand/neutral/amber/danger
        // scale — tailwind.config.ts) — "success" is meant to read as a
        // stronger version of "positive" below (e.g. a scorecard's
        // STRONG_YES vs. YES, or a final "Offer" outcome vs. an in-progress
        // one), so it stays in the same hue family and gets its emphasis
        // from shade instead. Matches TIER_BADGE_CLASS's "high" tier
        // (src/utils/color.ts) for the same reason in a different context.
        success: "border border-brand-300 bg-brand-100 text-brand-900",
      },
    },
    defaultVariants: { variant: "muted" },
  }
);

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;

interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
