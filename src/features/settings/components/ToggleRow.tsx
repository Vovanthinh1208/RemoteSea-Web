import { Toggle } from "@/features/talent/components/profile-form/Toggle";

interface ToggleRowProps {
  title: React.ReactNode;
  desc: string;
  on: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleRow = ({
  title,
  desc,
  on,
  onChange,
}: ToggleRowProps) => (
  <div className="flex items-start justify-between gap-4 border-b border-neutral-50 py-4 last:border-none">
    <div className="min-w-0 flex-1">
      <p className="text-[13.5px] font-medium text-neutral-800">
        {title}
      </p>
      <p className="mt-0.5 text-[12.5px] text-neutral-500">{desc}</p>
    </div>
    <Toggle on={on} onChange={onChange} />
  </div>
);
