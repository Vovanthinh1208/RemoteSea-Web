import { Checkbox } from "@/components/ui/form";

interface CheckRowProps {
  checked: boolean;
  label: string;
  count?: number;
  onToggle: () => void;
}

export const CheckRow = ({
  checked,
  label,
  count,
  onToggle,
}: CheckRowProps) => (
  <Checkbox
    checked={checked}
    count={count}
    label={label}
    onCheckedChange={onToggle}
  />
);
