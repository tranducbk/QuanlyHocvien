export type TimeMode = "HH" | "HH:mm" | "HH:mm:ss";

export const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);

export const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

export const seconds = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

export function parseTime(
  value: string,
  mode: TimeMode
): { h: string; m: string; s: string } {
  const parts = value.split(":");
  return {
    h: parts[0] || "",
    m: mode !== "HH" ? parts[1] || "" : "",
    s: mode === "HH:mm:ss" ? parts[2] || "" : "",
  };
}

export function buildTime(
  h: string,
  m: string,
  s: string,
  mode: TimeMode
): string {
  if (!h) return "";
  if (mode === "HH") return h;
  if (mode === "HH:mm") return `${h}:${m || "00"}`;
  return `${h}:${m || "00"}:${s || "00"}`;
}
