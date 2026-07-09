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
        // Status-pill tones shared by applicant/listing/application status displays
        // (previously each feature hand-rolled its own Record<Status, className> map).
        info: "border border-blue-100 bg-blue-50 text-blue-700",
        warning: "border border-amber-100 bg-amber-50 text-amber-700",
        positive: "border border-brand-100 bg-brand-50 text-brand-700",
        success: "border border-emerald-100 bg-emerald-50 text-emerald-700",
      },
    },
    defaultVariants: { variant: "muted" },
  }
);

<<<<<<< HEAD
interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
=======
export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
>>>>>>> f72df65 (Fix reliability gaps and consolidate duplicated UI/utils in remotesea-web)

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
