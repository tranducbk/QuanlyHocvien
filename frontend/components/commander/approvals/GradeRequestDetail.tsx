"use client";

import { IconType } from "react-icons";
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineScale,
  HiOutlineUser,
} from "react-icons/hi";
import Badge from "@/library/Badge";
import Button from "@/library/Button";
import Typography from "@/library/Typography";
import { GradeRequest, requestTypeMap, statusMap } from "@/types/student-academic";
import { formatDateTime, formatScore, formatSemesterYear } from "@/utils/fn-common";
import { useAuthStore } from "@/store/useAuthStore";

interface GradeRequestDetailProps {
  request: GradeRequest;
}


const getSemesterLabel = (request: GradeRequest) => {
  const semester = request.subjectResult?.semesterResult;
  return formatSemesterYear(semester?.semester, semester?.schoolYear);
};

export default function GradeRequestDetail({ request }: GradeRequestDetailProps) {
  return (
    <div className="max-h-[85vh] space-y-4 overflow-y-auto pb-6 pr-1">
      <div className="flex flex-col gap-5 rounded-4xl border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60 dark:shadow-none md:flex-row md:items-center md:justify-between ">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-500/10 dark:text-primary-300">
            <HiOutlineClipboardList size={28} />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant="h3" weight="black" transform="uppercase" className="tracking-tight">
                {requestTypeMap[request.requestType]}
              </Typography>
              <Badge variant={statusMap[request.status].variant}>
                {statusMap[request.status].label}
              </Badge>
            </div>
            <Typography variant="body" color="gray" className="font-medium">
              {request.user?.profile?.fullName} · {request.subjectResult?.subjectName || "Chưa có môn học"}
            </Typography>
          </div>
        </div>

        {request.attachmentUrl && (
          <Button
            type="button"
            variant="primary"
            className="rounded-2xl px-6"
            onClick={() => {
              if (request.attachmentUrl) {
                const token = useAuthStore.getState().accessToken;
                const url = request.attachmentUrl.includes("?") 
                  ? `${request.attachmentUrl}&token=${token}` 
                  : `${request.attachmentUrl}?token=${token}`;
                window.open(url, "_blank");
              }
            }}
          >
            <HiOutlineExternalLink size={20} className="mr-2" />
            Minh chứng
          </Button>
        )}
      </div>

      <DetailSection title="Thông tin cần xét duyệt" accent="bg-primary-500">
        <InfoGrid>
          <InfoItem icon={HiOutlineUser} label="Học viên" value={request.user?.profile?.fullName} />
          <InfoItem icon={HiOutlineAcademicCap} label="Môn học" value={request.subjectResult?.subjectName} />
          <InfoItem icon={HiOutlineCalendar} label="Học kỳ" value={getSemesterLabel(request)} />
          <InfoItem icon={HiOutlineCalendar} label="Ngày gửi" value={formatDateTime(request.createdAt)} />
          <InfoItem icon={HiOutlineScale} label="Điểm hiện tại" value={formatScore(request.subjectResult?.gradePoint10)} />
          <InfoItem icon={HiOutlineScale} label="Điểm đề xuất" value={formatScore(request.proposedGradePoint10)} />
        </InfoGrid>

        <div className="mt-4 rounded-2xl border border-neutral-100/50 bg-white/50 p-4 transition-all dark:border-neutral-800 dark:bg-neutral-950/70">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
              <HiOutlineDocumentText size={20} />
            </div>
            <Typography variant="label" color="gray">
              Lý do đề xuất
            </Typography>
          </div>
          <Typography variant="body" weight="semibold" className="whitespace-pre-line text-neutral-800 dark:text-neutral-100">
            {request.reason || "---"}
          </Typography>
        </div>
      </DetailSection>

      {(request.reviewNote || request.reviewedAt || request.reviewer) && (
        <DetailSection title="Phản hồi xét duyệt" accent="bg-secondary-500">
          <InfoGrid>
            <InfoItem icon={HiOutlineCheckCircle} label="Trạng thái" value={statusMap[request.status].label} />
            <InfoItem icon={HiOutlineCalendar} label="Ngày xét duyệt" value={formatDateTime(request.reviewedAt)} />
          </InfoGrid>

          <div className="mt-4 rounded-2xl border border-neutral-100/50 bg-white/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/70">
            <Typography variant="label" color="gray" className="mb-2">
              Ghi chú phản hồi
            </Typography>
            <Typography variant="body" weight="semibold" className="whitespace-pre-line text-neutral-800 dark:text-neutral-100">
              {request.reviewNote || "---"}
            </Typography>
          </div>
        </DetailSection>
      )}
    </div>
  );
}

const DetailSection = ({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) => (
  <section className="dark:bg-neutral-900/60 ">
    <div className="mb-6 flex items-center gap-3">
      <div className={`h-8 w-2 rounded-full ${accent}`} />
      <Typography variant="h3" weight="black" transform="uppercase">
        {title}
      </Typography>
    </div>
    {children}
  </section>
);

const InfoGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value?: string | number | null;
}) => (
  <div className="group flex items-start gap-3 rounded-2xl border border-neutral-100/50 bg-white/50 p-4 transition-all hover:bg-white hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950/70 dark:hover:bg-neutral-900 dark:hover:shadow-none">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600 dark:bg-neutral-900 dark:text-neutral-500 dark:group-hover:bg-primary-500/10 dark:group-hover:text-primary-300">
      <Icon size={20} />
    </div>
    <div className="flex min-w-0 flex-col">
      <Typography variant="label" color="gray" className="mb-0.5">
        {label}
      </Typography>
      <Typography variant="body" weight="semibold" className="break-words text-neutral-800 dark:text-neutral-100">
        {value || "---"}
      </Typography>
    </div>
  </div>
);