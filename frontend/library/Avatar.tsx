"use client";

import React, { useState } from "react";
import { HiOutlineUser } from "react-icons/hi";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number | string;
  className?: string;
  iconSize?: number;
}

const getValidImageSrc = (src?: string | null) => {
  const value = String(src || "").trim();
  if (!value) return null;
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL)
      : null;

    const isApiFile =
      apiUrl &&
      url.protocol === apiUrl.protocol &&
      url.host === apiUrl.host &&
      url.pathname.startsWith("/api/files/");
    const isAllowedStaticHost =
      url.protocol === "https:" && url.hostname === "i.pinimg.com";

    return isApiFile || isAllowedStaticHost ? value : null;
  } catch {
    return null;
  }
};

/**
 * Component hiển thị ảnh đại diện hoặc icon mặc định.
 * Được thiết kế theo phong cách "Tactical Transparency" với bo góc đặc trưng.
 *
 * @param src - Đường dẫn ảnh đại diện (URL). Nếu null hoặc undefined sẽ hiện icon mặc định.
 * @param alt - Văn bản thay thế cho ảnh đại diện.
 * @param size - Kích thước của container (ví dụ: "3rem" hoặc 44). Mặc định là 2.75rem (w-11).
 * @param className - Các class Tailwind bổ sung cho container bên ngoài.
 * @param iconSize - Kích thước của icon người dùng mặc định.
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "2.75rem",
  className = "",
  iconSize = 22,
}) => {
  const imageSrc = getValidImageSrc(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const shouldShowImage = Boolean(imageSrc) && failedSrc !== imageSrc;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-neutral-900 p-0.5 shrink-0 shadow-sm overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="size-full rounded-[14px] flex items-center justify-center text-primary-700 bg-primary-50 overflow-hidden">
        {shouldShowImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc ?? undefined}
            alt={alt}
            className="size-full object-cover rounded-[14px]"
            onError={() => setFailedSrc(imageSrc)}
          />
        ) : (
          <HiOutlineUser size={iconSize} />
        )}
      </div>
    </div>
  );
};

export default Avatar;
