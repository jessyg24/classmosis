// Schedule Builder Types & Constants

// Legacy block types (kept for backwards compat with old schedules)
export type BlockType = string;

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

export const BLOCK_COLORS: Record<string, BlockColorConfig> = {
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
export const BLOCK_HEX: Record<string, { main: string; light: string; dark: string }> = {
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

// ============================================================
// Insert Types & Constants
// ============================================================

// Legacy insert types (kept for backwards compat)
export type InsertType = string;

export interface InsertConfig {
  label: string;
  icon: string; // lucide icon name
  defaultLabel: string;
  defaultDuration: number | null; // null = no default, inherits from parent
}

export const INSERT_CONFIG: Record<string, InsertConfig> = {
  teacher_instruction: {
    label: "Teacher Instruction",
    icon: "presentation",
    defaultLabel: "Mini-lesson",
    defaultDuration: 15,
  },
  reading: {
    label: "Reading",
    icon: "book-open",
    defaultLabel: "Read passage",
    defaultDuration: 10,
  },
  writing: {
    label: "Writing",
    icon: "pencil",
    defaultLabel: "Written response",
    defaultDuration: 15,
  },
  discussion: {
    label: "Discussion",
    icon: "message-circle",
    defaultLabel: "Class discussion",
    defaultDuration: 10,
  },
  practice: {
    label: "Practice",
    icon: "calculator",
    defaultLabel: "Practice problems",
    defaultDuration: 15,
  },
  exit_ticket: {
    label: "Exit Ticket",
    icon: "clipboard-check",
    defaultLabel: "Exit ticket",
    defaultDuration: 5,
  },
  video_media: {
    label: "Video / Media",
    icon: "play-circle",
    defaultLabel: "Watch video",
    defaultDuration: 10,
  },
  group_work: {
    label: "Group Work",
    icon: "users",
    defaultLabel: "Group activity",
    defaultDuration: 20,
  },
  independent_work: {
    label: "Independent Work",
    icon: "user",
    defaultLabel: "Independent work",
    defaultDuration: 20,
  },
  brain_break: {
    label: "Brain Break",
    icon: "sparkles",
    defaultLabel: "Brain break",
    defaultDuration: 5,
  },
  assessment: {
    label: "Assessment",
    icon: "file-check",
    defaultLabel: "Quiz / Check",
    defaultDuration: 10,
  },
  custom: {
    label: "Custom",
    icon: "plus",
    defaultLabel: "Activity",
    defaultDuration: null,
  },
};

export const INSERT_TYPES: InsertType[] = Object.keys(INSERT_CONFIG) as InsertType[];

// Wood colors for inserts — warm natural tones that cycle
export const INSERT_WOOD_COLORS = [
  { base: "#D4A880", dark: "#C4956B" }, // light maple
  { base: "#A39070", dark: "#8E7A5A" }, // walnut
  { base: "#C88E70", dark: "#B5785A" }, // cherry
  { base: "#AFA484", dark: "#9A8E6E" }, // driftwood
] as const;

// Wood colors for parent schedule blocks — tinted wood stains
export type WoodColor = "teal" | "blue" | "amber" | "purple" | "coral" | "pink";

export const BLOCK_WOOD: Record<WoodColor, { base: string; dark: string; grain: string }> = {
  teal:   { base: "#62A080", dark: "#4E8B6A", grain: "rgba(0,0,0,0.05)" },
  blue:   { base: "#7090B0", dark: "#5A7B9E", grain: "rgba(0,0,0,0.04)" },
  amber:  { base: "#C49B56", dark: "#B08840", grain: "rgba(0,0,0,0.05)" },
  purple: { base: "#9585B8", dark: "#7E6DA8", grain: "rgba(0,0,0,0.04)" },
  coral:  { base: "#C47E5E", dark: "#B06848", grain: "rgba(0,0,0,0.05)" },
  pink:   { base: "#B47890", dark: "#A0607A", grain: "rgba(0,0,0,0.04)" },
};

// Map BlockType → WoodColor for schedule builder rendering
export const BLOCK_TYPE_WOOD: Record<string, WoodColor> = {
  routine: "teal",
  academic: "blue",
  assessment: "amber",
  economy: "purple",
  flex: "coral",
  rotation: "pink",
};

/** Generate CSS wood grain texture from layered gradients */
export function woodGrain(grainOpacity: string): string {
  return [
    `repeating-linear-gradient(88deg, transparent, transparent 3px, ${grainOpacity} 3px, ${grainOpacity} 5px)`,
    `repeating-linear-gradient(91deg, transparent, transparent 11px, ${grainOpacity} 11px, ${grainOpacity} 13px)`,
    `repeating-linear-gradient(86deg, transparent, transparent 23px, rgba(255,255,255,0.04) 23px, rgba(255,255,255,0.04) 26px)`,
    `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 30%, rgba(0,0,0,0.08) 100%)`,
  ].join(", ");
}

/** Tab/socket connector dimensions */
export const CONNECTOR = {
  TAB_W: 36,
  TAB_H: 10,
  TAB_L: 24,
} as const;
