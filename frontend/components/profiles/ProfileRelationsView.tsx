import Typography from "@/library/Typography";
import type { FamilyMember, ForeignRelation } from "@/types/user";
import styles from "./ProfileRelationsView.module.css";

export function FamilyMembersView({
  members,
}: {
  members: FamilyMember[] | null | undefined;
}) {
  if (!Array.isArray(members) || members.length === 0)
    return <EmptyValue text="Chưa cập nhật thông tin gia đình" />;

  return (
    <div className={styles.list}>
      {members.map((member, index) => (
        <RelationViewCard
          key={index}
          title={`${member.relationship}: ${member.fullName}`}
        >
          {[
            member.birthYear && `Sinh năm ${member.birthYear}`,
            member.occupation,
            member.workplace,
            member.address,
          ]
            .filter(Boolean)
            .join(" • ") || "Chưa có thông tin bổ sung"}
        </RelationViewCard>
      ))}
    </div>
  );
}

export function ForeignRelationsView({
  relations,
}: {
  relations: ForeignRelation[] | null | undefined;
}) {
  if (!Array.isArray(relations) || relations.length === 0)
    return <EmptyValue text="Không có yếu tố nước ngoài" />;

  return (
    <div className={styles.list}>
      {relations.map((relation, index) => (
        <RelationViewCard
          key={index}
          title={`${relation.relationship}: ${relation.fullName}`}
        >
          {[
            relation.nationality,
            relation.country,
            relation.occupation,
            relation.address,
            relation.notes,
          ]
            .filter(Boolean)
            .join(" • ") || "Chưa có thông tin bổ sung"}
        </RelationViewCard>
      ))}
    </div>
  );
}

function RelationViewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      <Typography variant="body" weight="bold" className={styles.title}>
        {title}
      </Typography>
      <Typography
        variant="caption"
        color="gray"
        className={styles.description}
      >
        {children}
      </Typography>
    </div>
  );
}

function EmptyValue({ text }: { text: string }) {
  return (
    <Typography variant="body" color="gray">
      {text}
    </Typography>
  );
}
