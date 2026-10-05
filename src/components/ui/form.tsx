import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Form Field Context
// ---------------------------------------------------------------------------

interface FormFieldContextValue {
  id: string;
  errorId: string;
  descriptionId: string;
  error?: string;
  required?: boolean;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null
);

export const useFormField = () => {
  return React.useContext(FormFieldContext);
};

// ---------------------------------------------------------------------------
// FormField Container
// ---------------------------------------------------------------------------

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  error?: string;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ id: explicitId, error, required, className, children, ...props }, ref) => {
    const generatedId = React.useId();
    const id = explicitId ?? generatedId;
    const errorId = `${id}-error`;
    const descriptionId = `${id}-desc`;

    const contextValue = React.useMemo<FormFieldContextValue>(
      () => ({ id, errorId, descriptionId, error, required }),
      [id, errorId, descriptionId, error, required]
    );

    return (
      <FormFieldContext.Provider value={contextValue}>
        <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
          {children}
        </div>
      </FormFieldContext.Provider>
    );
  }
);
FormField.displayName = "FormField";

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, htmlFor, required: explicitRequired, ...props }, ref) => {
    const field = useFormField();
    const id = htmlFor ?? field?.id;
    const isRequired = explicitRequired ?? field?.required;

    return (
      <label
        ref={ref}
        htmlFor={id}
        className={cn(
          "block text-[13px] font-medium text-neutral-700",
          className
        )}
        {...props}
      >
        {children}
        {isRequired && (
          <span aria-hidden="true" className="ml-0.5 text-danger-500">
            *
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = "Label";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError: explicitHasError, id: explicitId, ...props }, ref) => {
    const field = useFormField();
    const id = explicitId ?? field?.id;
    const hasError = explicitHasError ?? !!field?.error;
    const errorId = field?.error ? field.errorId : undefined;

    return (
      <input
        ref={ref}
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId}
        className={cn(
          "h-10 w-full rounded-10 border border-neutral-200 bg-white px-3.5 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150",
          "focus:border-brand-600 focus:shadow-focus",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
          hasError && "border-danger-400 focus:border-danger-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError: explicitHasError, id: explicitId, ...props }, ref) => {
    const field = useFormField();
    const id = explicitId ?? field?.id;
    const hasError = explicitHasError ?? !!field?.error;
    const errorId = field?.error ? field.errorId : undefined;

    return (
      <textarea
        ref={ref}
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId}
        className={cn(
          "w-full rounded-10 resize-none border border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150",
          "focus:border-brand-600 focus:shadow-focus",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
          hasError && "border-danger-400 focus:border-danger-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError: explicitHasError, id: explicitId, ...props }, ref) => {
    const field = useFormField();
    const id = explicitId ?? field?.id;
    const hasError = explicitHasError ?? !!field?.error;
    const errorId = field?.error ? field.errorId : undefined;

    return (
      <select
        ref={ref}
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId}
        className={cn(
          "h-10 w-full rounded-10 border border-neutral-200 bg-white px-3.5 text-[13.5px] text-neutral-900 outline-none transition-all duration-150",
          "focus:border-brand-600 focus:shadow-focus",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
          hasError && "border-danger-400 focus:border-danger-600",
          className
        )}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  count?: number;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onCheckedChange,
      onChange,
      label,
      count,
      disabled,
      className,
      id: explicitId,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = explicitId ?? generatedId;

    const handleToggle = () => {
      if (disabled) return;
      const next = !checked;
      onCheckedChange?.(next);
      onChange?.(next);
    };

    return (
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer select-none items-center gap-2.5 py-1.5 text-[13.5px] transition-colors",
          disabled && "cursor-not-allowed opacity-60",
          checked ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900",
          className
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleToggle}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "grid h-4 w-4 flex-shrink-0 place-items-center rounded-4 border transition-all",
            "peer-focus-visible:shadow-focus",
            checked
              ? "border-brand-600 bg-brand-600"
              : "border-neutral-300 bg-white"
          )}
        >
          {checked && <Check className="text-white" size={10} strokeWidth={3} />}
        </span>
        {label && <span className="flex-1">{label}</span>}
        {count !== undefined && (
          <span className="text-[11px] tabular-nums text-neutral-400">{count}</span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

// ---------------------------------------------------------------------------
// Description & Error
// ---------------------------------------------------------------------------

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const field = useFormField();
  return (
    <p
      ref={ref}
      id={field?.descriptionId}
      className={cn("text-[11.5px] text-neutral-500", className)}
      {...props}
    >
      {children}
    </p>
  );
});
FieldDescription.displayName = "FieldDescription";

export interface FormFieldErrorProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string;
}

export const FormFieldError = React.forwardRef<
  HTMLParagraphElement,
  FormFieldErrorProps
>(({ className, message, children, ...props }, ref) => {
  const field = useFormField();
  const text = message ?? (typeof children === "string" ? children : undefined) ?? field?.error;
  if (!text) return null;

  return (
    <p
      ref={ref}
      id={field?.errorId}
      role="alert"
      className={cn("mt-1 text-[12px] text-danger-600", className)}
      {...props}
    >
      {text}
    </p>
  );
});
FormFieldError.displayName = "FormFieldError";
