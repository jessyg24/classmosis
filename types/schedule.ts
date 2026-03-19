// Schedule Builder Types & Constants

export type BlockType = "routine" | "academic" | "assessment" | "economy" | "flex" | "rotation";

export type DayType = "normal" | "minimum_day" | "testing" | "field_trip" | "assembly" | "substitute";

export type TimerBehavior = "auto_start" | "manual" | "none";

export interface BlockColorConfig {
  color: string;      // Tailwind class for main color
  light: string;      // Tailwind class for light bg
  dark: string;       // Tailwind class for dark text
  label: string;      // Human-readable label
  defaultLabel: string;
  defaultDuration: number;
}

export const BLOCK_COLORS: Record<BlockType, BlockColorConfig> = {
  routine: {
    color: "bg-cm-teal",
    light: "bg-cm-teal-light",
    dark: "text-cm-teal-dark",
    label: "Routine",
    defaultLabel: "Routine",
    defaultDuration: 15,
  },
  academic: {
    color: "bg-cm-blue",
    light: "bg-cm-blue-light",
    dark: "text-cm-blue-dark",
    label: "Academic",
    defaultLabel: "Lesson",
    defaultDuration: 45,
  },
  assessment: {
    color: "bg-cm-amber",
    light: "bg-cm-amber-light",
    dark: "text-cm-amber-dark",
    label: "Assessment",
    defaultLabel: "Assessment",
    defaultDuration: 20,
  },
  economy: {
    color: "bg-cm-purple",
    light: "bg-cm-purple-light",
    dark: "text-cm-purple-dark",
    label: "Economy",
    defaultLabel: "Economy",
    defaultDuration: 10,
  },
  flex: {
    color: "bg-cm-coral",
    light: "bg-cm-coral-light",
    dark: "text-cm-coral-dark",
    label: "Flex",
    defaultLabel: "Flex Time",
    defaultDuration: 30,
  },
  rotation: {
    color: "bg-cm-pink",
    light: "bg-cm-pink-light",
    dark: "text-cm-pink-dark",
    label: "Rotation",
    defaultLabel: "Rotation",
    defaultDuration: 20,
  },
};

// Raw hex values for inline styles (borders, etc.)
export const BLOCK_HEX: Record<BlockType, { main: string; light: string; dark: string }> = {
  routine:    { main: "#1D9E75", light: "#E1F5EE", dark: "#085041" },
  academic:   { main: "#185FA5", light: "#E6F1FB", dark: "#0C447C" },
  assessment: { main: "#BA7517", light: "#FAEEDA", dark: "#633806" },
  economy:    { main: "#534AB7", light: "#EEEDFE", dark: "#3C3489" },
  flex:       { main: "#D85A30", light: "#FAECE7", dark: "#712B13" },
  rotation:   { main: "#993556", light: "#FBEAF0", dark: "#72243E" },
};

export const DAY_TYPES: { value: DayType; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "minimum_day", label: "Minimum Day" },
  { value: "testing", label: "Testing" },
  { value: "field_trip", label: "Field Trip" },
  { value: "assembly", label: "Assembly" },
  { value: "substitute", label: "Substitute" },
];

/** Default schedule start time (8:00 AM) */
export const DEFAULT_START_HOUR = 8;
export const DEFAULT_START_MINUTE = 0;

/** Format minutes to HH:MM display */
export function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

/** Format a duration as "Xh Ym" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
