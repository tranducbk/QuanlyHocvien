import type { FamilyMember, ForeignRelation } from "@/types/user";
import { z } from "zod";

export const MAX_PROFILE_RELATION_RECORDS = 30;

const optionalText = (maxLength: number) =>
  z.string().max(maxLength, `Tối đa ${maxLength} ký tự`).nullable().optional();

export const familyMemberSchema = z.object({
  relationship: z
    .string()
    .min(1, "Quan hệ gia đình là bắt buộc")
    .max(50, "Tối đa 50 ký tự"),
  fullName: z
    .string()
    .min(1, "Họ tên thành viên là bắt buộc")
    .max(100, "Tối đa 100 ký tự"),
  birthYear: z.number().int().min(1900).max(2100).nullable().optional(),
  occupation: optionalText(150),
  workplace: optionalText(255),
  address: optionalText(255),
});

export const foreignRelationSchema = z.object({
  relationship: z
    .string()
    .min(1, "Mối quan hệ là bắt buộc")
    .max(50, "Tối đa 50 ký tự"),
  fullName: z
    .string()
    .min(1, "Họ tên người liên quan là bắt buộc")
    .max(100, "Tối đa 100 ký tự"),
  nationality: z
    .string()
    .min(1, "Quốc tịch là bắt buộc")
    .max(100, "Tối đa 100 ký tự"),
  country: z
    .string()
    .min(1, "Quốc gia cư trú là bắt buộc")
    .max(100, "Tối đa 100 ký tự"),
  occupation: optionalText(150),
  address: optionalText(255),
  notes: optionalText(500),
});

export const profileRelationValidationFields = {
  familyMember: z
    .array(familyMemberSchema)
    .max(
      MAX_PROFILE_RELATION_RECORDS,
      `Tối đa ${MAX_PROFILE_RELATION_RECORDS} thành viên gia đình`
    )
    .nullable()
    .optional(),
  foreignRelations: z
    .array(foreignRelationSchema)
    .max(
      MAX_PROFILE_RELATION_RECORDS,
      `Tối đa ${MAX_PROFILE_RELATION_RECORDS} quan hệ nước ngoài`
    )
    .nullable()
    .optional(),
};

export const createEmptyFamilyMember = (): FamilyMember => ({
  relationship: "",
  fullName: "",
  birthYear: null,
  occupation: "",
  workplace: "",
  address: "",
});

export const createEmptyForeignRelation = (): ForeignRelation => ({
  relationship: "",
  fullName: "",
  nationality: "",
  country: "",
  occupation: "",
  address: "",
  notes: "",
});

export const getProfileRelationFormDefaults = (profile: {
  familyMember?: unknown;
  foreignRelations?: unknown;
}) => ({
  familyMember: Array.isArray(profile.familyMember)
    ? (profile.familyMember as FamilyMember[])
    : undefined,
  foreignRelations: Array.isArray(profile.foreignRelations)
    ? (profile.foreignRelations as ForeignRelation[])
    : undefined,
});
