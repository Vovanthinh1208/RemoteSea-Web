import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

export const StarRating = ({
  value,
  size = 14,
  className,
}: StarRatingProps) => {
  const rounded = Math.round(value);
  return (
    <div
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className={cn("flex items-center gap-0.5", className)}
      role="img"
    >
      {STAR_VALUES.map((n) => (
        <Star
          className={
            n <= rounded ? "fill-amber-400 text-amber-400" : "text-neutral-200"
          }
          key={n}
          size={size}
        />
      ))}
    </div>
  );
};
