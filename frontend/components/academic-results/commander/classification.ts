import type { BadgeVariant } from "@/library/Badge";

const classifications = ["XUẤT SẮC", "GIỎI", "KHÁ", "TRUNG BÌNH", "YẾU", "KÉM"];

export const getAcademicClassification = (averageGrade10: number | string | null | undefined, storedStatus?: string | null) => {
  const stored = storedStatus?.trim().toUpperCase();
  if (stored && classifications.includes(stored)) return stored;
  if (averageGrade10 === null || averageGrade10 === undefined) return null;
  const grade = Number(averageGrade10);
  if (!Number.isFinite(grade)) return null;
  if (grade >= 9) return "XUẤT SẮC";
  if (grade >= 8) return "GIỎI";
  if (grade >= 6.5) return "KHÁ";
  if (grade >= 5) return "TRUNG BÌNH";
  return "YẾU";
};

export const getClassificationVariant = (classification: string | null): BadgeVariant => {
  switch (classification) {
    case "XUẤT SẮC": return "primary";
    case "GIỎI": return "success";
    case "KHÁ": return "secondary";
    case "TRUNG BÌNH": return "warning";
    case "YẾU":
    case "KÉM": return "error";
    default: return "neutral";
  }
};
