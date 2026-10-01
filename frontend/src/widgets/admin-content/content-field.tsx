"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContentFieldProps {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export function ContentField({
  label,
  name,
  defaultValue = "",
  type = "text",
  textarea = false,
  required = false,
  disabled = false,
  min,
  max,
}: ContentFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {textarea ? (
        <Textarea
          id={name}
          name={name}
          defaultValue={defaultValue ?? ""}
          required={required}
          disabled={disabled}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
        />
      )}
    </div>
  );
}