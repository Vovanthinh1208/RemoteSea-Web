import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

interface StarRatingInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
  size?: number;
}

export const StarRatingInput = ({
  value,
  onChange,
  label,
  size = 22,
}: StarRatingInputProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-neutral-700">{label}</p>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {STAR_VALUES.map((n) => (
          <button
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            aria-pressed={value === n}
            className="rounded-4 p-0.5 transition-colors focus-visible:shadow-focus focus-visible:outline-none"
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
          >
            <Star
              className={cn(
                "transition-colors",
                n <= display
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-200"
              )}
              size={size}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
