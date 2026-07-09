import { Children, cloneElement, isValidElement, useId } from "react";
import {
  SELECT_INPUT_CLASS,
  TEXT_INPUT_CLASS,
  TEXTAREA_INPUT_CLASS,
} from "@/components/shared/input-styles";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

interface AssociableFieldProps {
  id?: string;
}

export const Field = ({ label, children, hint }: FieldProps) => {
  const generatedId = useId();
  const child = Children.only(children);
  const canAssociate =
    isValidElement<AssociableFieldProps>(child) &&
    (child.type === Input ||
      child.type === Select ||
      child.type === Textarea ||
      child.type === "input" ||
      child.type === "select" ||
      child.type === "textarea");

  const fieldId = canAssociate ? (child.props.id ?? generatedId) : undefined;
  const associatedChild = canAssociate ? cloneElement(child, { id: fieldId }) : children;

  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-neutral-700" htmlFor={fieldId}>
        {label}
      </label>
      {associatedChild}
      {hint && <p className="text-[11.5px] text-neutral-400">{hint}</p>}
    </div>
  );
};

interface InputProps {
  id?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
}

export const Input = ({ id, value, onChange, placeholder, type = "text", min }: InputProps) => (
  <input
    className={TEXT_INPUT_CLASS}
    id={id}
    min={min}
    placeholder={placeholder}
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

interface SelectProps {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}

export const Select = ({ id, value, onChange, options }: SelectProps) => (
  <select
    className={SELECT_INPUT_CLASS}
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

interface TextareaProps {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export const Textarea = ({ id, value, onChange, placeholder, rows = 4 }: TextareaProps) => (
  <textarea
    className={TEXTAREA_INPUT_CLASS}
    id={id}
    placeholder={placeholder}
    rows={rows}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);
