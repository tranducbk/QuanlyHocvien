import { jwtDecode } from "jwt-decode";

/**
 * Giải mã Token JWT để lấy thông tin bên trong.
 * @param token - Chuỗi JWT cần giải mã
 * @returns Đối tượng chứa thông tin đã giải mã hoặc null nếu lỗi
 */
const decodeToken = <T>(token: string): T | null => {
  if (!token) return null;
  try {
    return jwtDecode<T>(token);
  } catch (error) {
    console.error("Lỗi khi giải mã Token:", error);
    return null;
  }
};

/**
 * Lấy ngày hết hạn của Token JWT.
 * @param token - Chuỗi JWT cần kiểm tra
 * @returns Đối tượng Date đại diện cho thời gian hết hạn hoặc null
 */
export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken<{ exp: number }>(token);
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }
  return null;
};

/**
 * Kiểm tra xem Token JWT đã hết hạn hay chưa.
 * @param token - Chuỗi JWT cần kiểm tra
 * @returns true nếu token đã hết hạn, false nếu còn hạn
 */
export const isTokenExpired = (token: string): boolean => {
  const expiry = getTokenExpiration(token);
  if (!expiry) return true;
  return expiry.getTime() < Date.now();
};

/**
 * Định dạng chuỗi ngày tháng sang dạng hh:mm:ss dd/mm/yyyy
 * @param dateString - Chuỗi ISO ngày tháng
 * @returns Chuỗi ngày tháng đã định dạng
 */
export const formatDateTime = (
  dateString: string | Date | null | undefined
): string => {
  if (!dateString) return "--:--:-- --/--/----";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "--:--:-- --/--/----";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
};

/**
 * Định dạng chuỗi ngày tháng sang dạng dd/mm/yyyy (chỉ lấy ngày)
 * @param dateString - Chuỗi ISO ngày tháng
 * @returns Chuỗi ngày đã định dạng
 */
export const formatDate = (
  dateString: string | Date | null | undefined
): string => {
  if (!dateString) return "--/--/----";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "--/--/----";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format điểm số với 2 chữ số thập phân; null/undefined hien thi "---".
 * @param value Điểm số chưa định dạng
 * @returns Điểm số đã định dạng
 */
export const formatScore = (value?: number | null) =>
  value === null || value === undefined ? "---" : value.toFixed(2);

/**
 * Chuẩn hóa chuỗi để tìm kiếm không phân biệt hoa/thường và dấu tiếng Việt.
 * Ví dụ: "Đại học" -> "dai hoc".
 * @param value Chuỗi cần chuẩn hóa
 * @returns Chuỗi đã bỏ dấu và chuyển về chữ thường
 */
export const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

/**
 * Định dạng tiền tệ VND.
 * @param value Số tiền cần định dạng
 * @returns Chuỗi tiền tệ đã định dạng
 */
export const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

/**
 * Hiển thị giá trị hoặc trả về "---" nếu null, undefined hoặc chuỗi rỗng.
 * @param value Giá trị cần hiển thị
 * @returns Giá trị ban đầu hoặc "---"
 */
export const textOrDash = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "---";
  return value;
};

/**
 * Định dạng học kỳ và năm học thành dạng "Học kỳ · Năm học".
 * @param semester Học kỳ
 * @param schoolYear Năm học
 * @returns Chuỗi định dạng hoặc "---" nếu cả hai đều trống
 */
export const formatSemesterYear = (
  semester?: string | number | null,
  schoolYear?: string | number | null
): string => {
  const parts = [semester ? `Học kỳ ${semester}` : "", schoolYear].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "---";
};

/**
 * Tải file từ đối tượng Blob.
 * @param blob - Đối tượng Blob cần tải xuống
 * @param fileName - Tên file lưu trữ
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


