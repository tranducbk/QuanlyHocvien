"use client";

import { HiOutlineDocumentDownload, HiOutlineUpload } from "react-icons/hi";
import Button from "@/library/Button";

export default function AchievementToolbarActions({ onImport, onExport, exporting }: {
  onImport: () => void;
  onExport: () => void;
  exporting?: boolean;
}) {
  return <div className="flex flex-wrap items-center gap-2">
    <Button type="button" onClick={onImport} icon={HiOutlineUpload} className="flex h-auto items-center gap-2 rounded-xl border border-primary-600 bg-primary-600 px-4 py-2 text-[11px]! font-black! uppercase tracking-wider text-white shadow-lg shadow-primary-500/20 transition-all hover:border-primary-700 hover:bg-primary-700 active:scale-95">Nhập Excel</Button>
    <Button type="button" onClick={onExport} isLoading={exporting} icon={HiOutlineDocumentDownload} className="flex h-auto items-center gap-2 rounded-xl border border-secondary-500 bg-secondary-500 px-4 py-2 text-[11px]! font-black! uppercase tracking-wider text-white shadow-lg shadow-secondary-500/20 transition-all hover:border-secondary-600 hover:bg-secondary-600 active:scale-95">Xuất báo cáo</Button>
  </div>;
}
