"use client";

import { FormEvent, useState } from "react";
import Button from "@/library/Button";
import Input from "@/library/Input";
import Select from "@/library/Select";
import Textarea from "@/library/Textarea";
import { useModalStore } from "@/store/useModalStore";

export type MilitaryFormField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "time" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
  maxLength?: number;
  options?: Array<{ value: string; label: string }>;
};

export default function MilitaryEntityForm({
  fields,
  initialValues = {},
  submitLabel,
  onSubmit,
}: {
  fields: MilitaryFormField[];
  initialValues?: Record<string, string>;
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const { closeModal } = useModalStore();
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [field.name, initialValues[field.name] || ""])
    )
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      closeModal();
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const value = values[field.name] || "";
          const setValue = (nextValue: string | number) =>
            setValues((current) => ({
              ...current,
              [field.name]: String(nextValue),
            }));
          const labelProps = {
            label: field.label,
            required: field.required,
            floatingLabel: false,
            variant: "filled" as const,
            fullWidth: true,
          };
          return (
            <div
              key={field.name}
              className={field.type === "textarea" ? "md:col-span-2" : ""}
            >
              {field.type === "select" ? (
                <Select
                  {...labelProps}
                  options={field.options || []}
                  value={value}
                  onChange={setValue}
                  placeholder={field.placeholder || "Chọn"}
                />
              ) : field.type === "textarea" ? (
                <Textarea
                  {...labelProps}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              ) : (
                <Input
                  {...labelProps}
                  type={field.type || "text"}
                  maxLength={field.maxLength}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          Không thể lưu thông tin. Vui lòng kiểm tra lại dữ liệu.
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <Button type="button" variant="outline" onClick={closeModal}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
