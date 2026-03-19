import { create } from "zustand";

interface OnboardingStore {
  step: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step data
  displayName: string;
  schoolName: string;
  state: string;
  classId: string | null;
  className: string;
  subject: string;
  gradeBand: string;
  gradingScaleType: string;

  setDisplayName: (name: string) => void;
  setSchoolName: (name: string) => void;
  setState: (state: string) => void;
  setClassData: (data: { classId: string; className: string; subject: string; gradeBand: string }) => void;
  setGradingScaleType: (type: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),

  displayName: "",
  schoolName: "",
  state: "",
  classId: null,
  className: "",
  subject: "",
  gradeBand: "",
  gradingScaleType: "percentage",

  setDisplayName: (name) => set({ displayName: name }),
  setSchoolName: (name) => set({ schoolName: name }),
  setState: (state) => set({ state }),
  setClassData: (data) => set({
    classId: data.classId,
    className: data.className,
    subject: data.subject,
    gradeBand: data.gradeBand,
  }),
  setGradingScaleType: (type) => set({ gradingScaleType: type }),
  reset: () => set({
    step: 1,
    displayName: "",
    schoolName: "",
    state: "",
    classId: null,
    className: "",
    subject: "",
    gradeBand: "",
    gradingScaleType: "percentage",
  }),
}));
