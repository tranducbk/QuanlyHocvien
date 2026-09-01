"use client";

import Button from "@/library/Button";
import Input from "@/library/Input";
import Textarea from "@/library/Textarea";
import Typography from "@/library/Typography";
import type { FamilyMember, ForeignRelation } from "@/types/user";
import {
  createEmptyFamilyMember,
  createEmptyForeignRelation,
  MAX_PROFILE_RELATION_RECORDS,
} from "@/utils/profile-relations";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import styles from "./ProfileRelationsEditor.module.css";

interface FieldError {
  message?: string;
}

interface FamilyMemberError {
  relationship?: FieldError;
  fullName?: FieldError;
  birthYear?: FieldError;
  occupation?: FieldError;
  workplace?: FieldError;
  address?: FieldError;
}

interface ForeignRelationError {
  relationship?: FieldError;
  fullName?: FieldError;
  nationality?: FieldError;
  country?: FieldError;
  occupation?: FieldError;
  address?: FieldError;
  notes?: FieldError;
}

interface ProfileRelationsEditorProps {
  familyMembers: FamilyMember[];
  foreignRelations: ForeignRelation[];
  onFamilyMembersChange: (value: FamilyMember[]) => void;
  onForeignRelationsChange: (value: ForeignRelation[]) => void;
  familyErrors?: FamilyMemberError[];
  foreignErrors?: ForeignRelationError[];
  isLoading?: boolean;
}

export default function ProfileRelationsEditor({
  familyMembers,
  foreignRelations,
  onFamilyMembersChange,
  onForeignRelationsChange,
  familyErrors,
  foreignErrors,
  isLoading,
}: ProfileRelationsEditorProps) {
  const updateFamilyMember = (index: number, patch: Partial<FamilyMember>) => {
    onFamilyMembersChange(
      familyMembers.map((member, memberIndex) =>
        memberIndex === index ? { ...member, ...patch } : member
      )
    );
  };

  const updateForeignRelation = (
    index: number,
    patch: Partial<ForeignRelation>
  ) => {
    onForeignRelationsChange(
      foreignRelations.map((relation, relationIndex) =>
        relationIndex === index ? { ...relation, ...patch } : relation
      )
    );
  };

  return (
    <div className={styles.editor}>
      <RelationGroup
        title="Thông tin gia đình"
        description="Quản lý cha, mẹ, vợ/chồng, con và các thành viên liên quan."
        onAdd={() =>
          onFamilyMembersChange([...familyMembers, createEmptyFamilyMember()])
        }
        isAddDisabled={familyMembers.length >= MAX_PROFILE_RELATION_RECORDS}
        isLoading={isLoading}
      >
        {familyMembers.length === 0 ? (
          <EmptyState text="Chưa có thông tin thành viên gia đình." />
        ) : (
          familyMembers.map((member, index) => (
            <RelationCard
              key={index}
              title={`Thành viên ${index + 1}`}
              onRemove={() =>
                onFamilyMembersChange(
                  familyMembers.filter((_, itemIndex) => itemIndex !== index)
                )
              }
              isLoading={isLoading}
            >
              <Input
                label="Quan hệ"
                placeholder="Ví dụ: Cha"
                value={member.relationship}
                required
                error={familyErrors?.[index]?.relationship?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateFamilyMember(index, {
                    relationship: event.target.value,
                  })
                }
              />
              <Input
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={member.fullName}
                required
                error={familyErrors?.[index]?.fullName?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateFamilyMember(index, { fullName: event.target.value })
                }
              />
              <Input
                label="Năm sinh"
                type="number"
                min={1900}
                max={2100}
                placeholder="Ví dụ: 1970"
                value={member.birthYear ?? ""}
                error={familyErrors?.[index]?.birthYear?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateFamilyMember(index, {
                    birthYear: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
              />
              <Input
                label="Nghề nghiệp"
                placeholder="Nhập nghề nghiệp"
                value={member.occupation ?? ""}
                error={familyErrors?.[index]?.occupation?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateFamilyMember(index, { occupation: event.target.value })
                }
              />
              <Input
                label="Cơ quan/đơn vị công tác"
                placeholder="Nhập cơ quan hoặc đơn vị"
                value={member.workplace ?? ""}
                error={familyErrors?.[index]?.workplace?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateFamilyMember(index, { workplace: event.target.value })
                }
              />
              <Input
                label="Nơi cư trú"
                placeholder="Nhập nơi cư trú"
                value={member.address ?? ""}
                error={familyErrors?.[index]?.address?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateFamilyMember(index, { address: event.target.value })
                }
              />
            </RelationCard>
          ))
        )}
      </RelationGroup>

      <RelationGroup
        title="Yếu tố nước ngoài"
        description="Khai báo người thân hoặc mối quan hệ đang cư trú, làm việc ở nước ngoài. Để trống nếu không có."
        onAdd={() =>
          onForeignRelationsChange([
            ...foreignRelations,
            createEmptyForeignRelation(),
          ])
        }
        isAddDisabled={foreignRelations.length >= MAX_PROFILE_RELATION_RECORDS}
        isLoading={isLoading}
      >
        {foreignRelations.length === 0 ? (
          <EmptyState text="Không có yếu tố nước ngoài được khai báo." />
        ) : (
          foreignRelations.map((relation, index) => (
            <RelationCard
              key={index}
              title={`Quan hệ nước ngoài ${index + 1}`}
              onRemove={() =>
                onForeignRelationsChange(
                  foreignRelations.filter((_, itemIndex) => itemIndex !== index)
                )
              }
              isLoading={isLoading}
            >
              <Input
                label="Mối quan hệ"
                placeholder="Ví dụ: Anh ruột"
                value={relation.relationship}
                required
                error={foreignErrors?.[index]?.relationship?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateForeignRelation(index, {
                    relationship: event.target.value,
                  })
                }
              />
              <Input
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={relation.fullName}
                required
                error={foreignErrors?.[index]?.fullName?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateForeignRelation(index, { fullName: event.target.value })
                }
              />
              <Input
                label="Quốc tịch"
                placeholder="Nhập quốc tịch"
                value={relation.nationality}
                required
                error={foreignErrors?.[index]?.nationality?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateForeignRelation(index, {
                    nationality: event.target.value,
                  })
                }
              />
              <Input
                label="Quốc gia cư trú"
                placeholder="Nhập quốc gia"
                value={relation.country}
                required
                error={foreignErrors?.[index]?.country?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateForeignRelation(index, { country: event.target.value })
                }
              />
              <Input
                label="Nghề nghiệp"
                placeholder="Nhập nghề nghiệp"
                value={relation.occupation ?? ""}
                error={foreignErrors?.[index]?.occupation?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateForeignRelation(index, {
                    occupation: event.target.value,
                  })
                }
              />
              <Input
                label="Địa chỉ"
                placeholder="Nhập địa chỉ ở nước ngoài"
                value={relation.address ?? ""}
                error={foreignErrors?.[index]?.address?.message}
                isLoading={isLoading}
                onChange={(event) =>
                  updateForeignRelation(index, { address: event.target.value })
                }
              />
              <div className={styles.fullWidthField}>
                <Textarea
                  label="Ghi chú"
                  placeholder="Nhập nội dung cần lưu ý"
                  value={relation.notes ?? ""}
                  error={foreignErrors?.[index]?.notes?.message}
                  maxLength={500}
                  isLoading={isLoading}
                  onChange={(event) =>
                    updateForeignRelation(index, { notes: event.target.value })
                  }
                />
              </div>
            </RelationCard>
          ))
        )}
      </RelationGroup>
    </div>
  );
}

function RelationGroup({
  title,
  description,
  onAdd,
  isAddDisabled,
  isLoading,
  children,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  isAddDisabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.group}>
      <div className={styles.groupHeader}>
        <div className={styles.groupContent}>
          <Typography variant="h4" weight="bold">
            {title}
          </Typography>
          <Typography variant="caption" color="gray">
            {description}
          </Typography>
        </div>
        <div className={styles.addAction}>
          <Button
          type="button"
          variant="outline"
          size="sm"
          icon={HiOutlinePlus}
          onClick={onAdd}
          disabled={isAddDisabled}
          isLoading={isLoading}
        >
          Thêm thông tin
          </Button>
        </div>
      </div>
      <div className={styles.cardList}>{children}</div>
    </section>
  );
}

function RelationCard({
  title,
  onRemove,
  isLoading,
  children,
}: {
  title: string;
  onRemove: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Typography variant="label" weight="bold">
          {title}
        </Typography>
        <Button
          type="button"
          variant="danger"
          size="sm"
          icon={HiOutlineTrash}
          onClick={onRemove}
          isLoading={isLoading}
        >
          Xóa
        </Button>
      </div>
      <div className={styles.fields}>{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className={styles.emptyState}>
      <Typography variant="body" color="gray">
        {text}
      </Typography>
    </div>
  );
}
