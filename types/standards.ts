import type { MasteryLevel } from "./database";

export const MASTERY_LEVELS: Array<{
  value: MasteryLevel;
  label: string;
  color: string;
  bgColor: string;
  min: number;
  max: number;
}> = [
  { value: "building", label: "Building", color: "text-cm-coral", bgColor: "bg-cm-coral-light", min: 0, max: 49 },
  { value: "almost_there", label: "Almost there", color: "text-cm-amber", bgColor: "bg-cm-amber-light", min: 50, max: 74 },
  { value: "got_it", label: "Got it!", color: "text-cm-green", bgColor: "bg-cm-green-light", min: 75, max: 89 },
  { value: "crushed_it", label: "Crushed it!", color: "text-cm-green-dark", bgColor: "bg-cm-green-light", min: 90, max: 100 },
];

export function getMasteryLevel(avgPct: number | null): MasteryLevel {
  if (avgPct === null || avgPct < 50) return "building";
  if (avgPct < 75) return "almost_there";
  if (avgPct < 90) return "got_it";
  return "crushed_it";
}

export function getMasteryConfig(level: MasteryLevel) {
  return MASTERY_LEVELS.find((m) => m.value === level) ?? MASTERY_LEVELS[0];
}
