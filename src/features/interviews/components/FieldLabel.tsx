import type { ReactNode } from "react";

export const FieldLabel = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) => (
  <label
    className="mb-1.5 block text-[12.5px] font-medium text-neutral-700"
    htmlFor={htmlFor}
  >
    {children}
  </label>
);
