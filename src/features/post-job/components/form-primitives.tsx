import { Children, cloneElement, isValidElement, useId } from "react";
import {
  SELECT_INPUT_CLASS,
  TEXT_INPUT_CLASS,
  TEXTAREA_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { SkillTagEditor } from "@/components/shared/SkillTagEditor";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  /** Shows a required marker next to the label — this wizard has no other
   *  indication of which ~10 fields per step are mandatory until "Continue" fails. */
  required?: boolean;
}

interface AssociableFieldProps {
  id?: string;
  "aria-required"?: boolean;
}

export const Field = ({
  label,
  children,
  hint,
  required,
}: FieldProps) => {
  const generatedId = useId();
  const child = Children.only(children);
  const canAssociate =
    isValidElement<AssociableFieldProps>(child) &&
    (child.type === Input ||
      child.type === Select ||
      child.type === Textarea ||
      child.type === SkillTagEditor ||
      child.type === "input" ||
      child.type === "select" ||
      child.type === "textarea");

  const fieldId = canAssociate
    ? (child.props.id ?? generatedId)
    : undefined;
  const associatedChild = canAssociate
    ? cloneElement(child, {
        id: fieldId,
        "aria-required": required || undefined,
      })
    : children;

  return (
    <div className="space-y-1.5">
      <label
        className="block text-[13px] font-medium text-neutral-700"
        htmlFor={fieldId}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-red-500">
            *
          </span>
        )}
      </label>
      {associatedChild}
      {hint && (
        <p className="text-[11.5px] text-neutral-400">{hint}</p>
      )}
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
  "aria-required"?: boolean;
}

export const Input = ({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  "aria-required": ariaRequired,
}: InputProps) => (
  <input
    aria-required={ariaRequired}
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
  "aria-required"?: boolean;
}

export const Select = ({
  id,
  value,
  onChange,
  options,
  "aria-required": ariaRequired,
}: SelectProps) => (
  <select
    aria-required={ariaRequired}
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
  "aria-required"?: boolean;
}

export const Textarea = ({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  "aria-required": ariaRequired,
}: TextareaProps) => (
  <textarea
    aria-required={ariaRequired}
    className={TEXTAREA_INPUT_CLASS}
    id={id}
    placeholder={placeholder}
    rows={rows}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);
