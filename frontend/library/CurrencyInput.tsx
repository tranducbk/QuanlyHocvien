import type { ChangeEvent, ReactNode } from "react";
import Input, { type InputProps } from "./Input";

export interface CurrencyInputProps extends Omit<
  InputProps,
  "value" | "onChange" | "type" | "inputMode"
> {
  /** Giá trị số tiền theo đơn vị đồng (VND). null/undefined khi chưa nhập. */
  value?: number | null;

  /** Trả về số tiền đã chuẩn hóa thành number, null khi ô trống. */
  onChange?: (value: number | null) => void;

  /** Hậu tố hiển thị bên phải ô nhập, mặc định là "₫". */
  currencySuffix?: ReactNode;
}

/** Chỉ giữ lại các chữ số trong chuỗi người dùng nhập. */
const toDigits = (raw: string) => raw.replace(/\D/g, "");

/**
 * Ô nhập tiền tệ VND: hiển thị số có dấu phân cách hàng nghìn theo định dạng
 * Việt Nam (vd: 2.500.000) nhưng luôn trả về một `number` thuần cho form.
 *
 * Dùng được cả với `Controller` lẫn `register` của react-hook-form.
 */
export default function CurrencyInput({
  value,
  onChange,
  currencySuffix = "₫",
  suffixIcon,
  ...props
}: CurrencyInputProps) {
  const numeric = value == null ? null : Number(value);
  const display =
    numeric == null || Number.isNaN(numeric)
      ? ""
      : numeric.toLocaleString("vi-VN");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = toDigits(event.target.value);
    onChange?.(digits ? Number(digits) : null);
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      suffixIcon={suffixIcon ?? currencySuffix}
    />
  );
}
