import { Toggle } from "@/features/talent/components/profile-form/Toggle";
import { Badge } from "@/components/ui/badge";

interface ToggleRowProps {
  title: React.ReactNode;
  desc: string;
  on: boolean;
  onChange: (value: boolean) => void;
  /** Marks a preference with nothing behind it yet — disables the switch and
   *  shows a "Coming soon" pill instead of letting it imply the feature works. */
  disabled?: boolean;
}

export const ToggleRow = ({
  title,
  desc,
  on,
  onChange,
  disabled,
}: ToggleRowProps) => (
  <div className="flex items-start justify-between gap-4 border-b border-neutral-50 py-4 last:border-none">
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-2 text-[13.5px] font-medium text-neutral-800">
        {title}
        {disabled && (
          <Badge className="px-1.5 py-0" variant="muted">
            Coming soon
          </Badge>
        )}
      </p>
      <p className="mt-0.5 text-[12.5px] text-neutral-500">{desc}</p>
    </div>
    <Toggle disabled={disabled} on={on} onChange={onChange} />
  </div>
);
