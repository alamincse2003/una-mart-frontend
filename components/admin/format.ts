// Fixed locale + Dhaka time so admin dates read the same on every machine.
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });
}

/** +8801712345678 → 01712345678 */
export const localPhone = (e164: string) => e164.replace(/^\+88/, "");
