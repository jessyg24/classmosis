// Classmosis Main Block Catalog — 44 pre-built blocks + custom
// These are TypeScript constants, NOT database rows.
// The block library UI reads from this catalog.

export type BlockCategory =
  | "core_academic"
  | "language_arts_supplemental"
  | "electives_specials"
  | "support_intervention"
  | "social_emotional"
  | "non_instructional"
  | "free_flexible";

export interface MainBlockDef {
  key: string;
  label: string;
  category: BlockCategory;
  defaultColor: string;
  defaultDurationMin: number;
  defaultDurationMax: number;
  subjectDescription: string;
  standardsFramework: string | null;
  isInstructional: boolean;
  nonInstructionalMessage: string | null;
  icon: string;
}

export const BLOCK_CATEGORIES: Array<{ key: BlockCategory; label: string; color: string }> = [
  { key: "core_academic", label: "Core Academic", color: "cm-blue" },
  { key: "language_arts_supplemental", label: "Language Arts", color: "cm-blue" },
  { key: "electives_specials", label: "Electives & Specials", color: "cm-pink" },
  { key: "support_intervention", label: "Support & Intervention", color: "cm-purple" },
  { key: "social_emotional", label: "Social-Emotional", color: "cm-teal" },
  { key: "non_instructional", label: "Non-Instructional", color: "cm-amber" },
  { key: "free_flexible", label: "Free & Flexible", color: "cm-coral" },
];

export const MAIN_BLOCK_CATALOG: Record<string, MainBlockDef> = {
  // ── Core Academic (5) ──────────────────────────────────
  reading: { key: "reading", label: "Reading", category: "core_academic", defaultColor: "teal", defaultDurationMin: 30, defaultDurationMax: 60, subjectDescription: "Literacy, comprehension, fluency, phonics, guided reading", standardsFramework: "Common Core ELA", isInstructional: true, nonInstructionalMessage: null, icon: "BookOpen" },
  writing: { key: "writing", label: "Writing", category: "core_academic", defaultColor: "blue", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Writing workshop, grammar, conventions, author's craft", standardsFramework: "Common Core ELA", isInstructional: true, nonInstructionalMessage: null, icon: "PenTool" },
  math: { key: "math", label: "Math", category: "core_academic", defaultColor: "purple", defaultDurationMin: 45, defaultDurationMax: 75, subjectDescription: "Number sense, operations, fractions, geometry, measurement", standardsFramework: "Common Core Math", isInstructional: true, nonInstructionalMessage: null, icon: "Calculator" },
  science: { key: "science", label: "Science", category: "core_academic", defaultColor: "green", defaultDurationMin: 30, defaultDurationMax: 60, subjectDescription: "Life science, earth science, physical science, inquiry", standardsFramework: "NGSS", isInstructional: true, nonInstructionalMessage: null, icon: "FlaskConical" },
  social_studies: { key: "social_studies", label: "Social Studies", category: "core_academic", defaultColor: "amber", defaultDurationMin: 30, defaultDurationMax: 45, subjectDescription: "History, geography, civics, economics, cultural studies", standardsFramework: "State frameworks", isInstructional: true, nonInstructionalMessage: null, icon: "Globe" },

  // ── Language Arts Supplemental (5) ─────────────────────
  ela_combined: { key: "ela_combined", label: "ELA (Combined)", category: "language_arts_supplemental", defaultColor: "teal", defaultDurationMin: 60, defaultDurationMax: 120, subjectDescription: "Full English Language Arts block", standardsFramework: "Common Core ELA", isInstructional: true, nonInstructionalMessage: null, icon: "BookOpen" },
  phonics: { key: "phonics", label: "Phonics / Foundational Skills", category: "language_arts_supplemental", defaultColor: "teal", defaultDurationMin: 15, defaultDurationMax: 30, subjectDescription: "Letter sounds, blends, digraphs, decoding, encoding", standardsFramework: "Common Core ELA Foundational", isInstructional: true, nonInstructionalMessage: null, icon: "Abc" },
  vocabulary: { key: "vocabulary", label: "Vocabulary / Word Study", category: "language_arts_supplemental", defaultColor: "blue", defaultDurationMin: 15, defaultDurationMax: 30, subjectDescription: "Academic vocabulary, word relationships, morphology", standardsFramework: "Common Core ELA Language", isInstructional: true, nonInstructionalMessage: null, icon: "BookA" },
  spelling: { key: "spelling", label: "Spelling", category: "language_arts_supplemental", defaultColor: "blue", defaultDurationMin: 15, defaultDurationMax: 25, subjectDescription: "Spelling patterns, high-frequency words, word sorts", standardsFramework: "Common Core ELA Language", isInstructional: true, nonInstructionalMessage: null, icon: "Spellcheck" },
  handwriting: { key: "handwriting", label: "Handwriting / Keyboarding", category: "language_arts_supplemental", defaultColor: "blue", defaultDurationMin: 10, defaultDurationMax: 20, subjectDescription: "Letter formation, cursive, typing skills", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Keyboard" },

  // ── Electives & Specials (16) ──────────────────────────
  music: { key: "music", label: "Music", category: "electives_specials", defaultColor: "pink", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Songs, instruments, rhythm, melody, music theory", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Music" },
  art: { key: "art", label: "Art", category: "electives_specials", defaultColor: "pink", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Drawing, painting, sculpture, art history, design", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Palette" },
  pe: { key: "pe", label: "Physical Education", category: "electives_specials", defaultColor: "coral", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Movement, sports, fitness, team games, health", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Dumbbell" },
  drama: { key: "drama", label: "Drama / Theater", category: "electives_specials", defaultColor: "pink", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Performance, scripts, improvisation, storytelling", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Theater" },
  dance: { key: "dance", label: "Dance", category: "electives_specials", defaultColor: "pink", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Movement, rhythm, choreography, cultural dances", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Footprints" },
  steam: { key: "steam", label: "STEAM", category: "electives_specials", defaultColor: "green", defaultDurationMin: 45, defaultDurationMax: 90, subjectDescription: "Integrated Science + Technology + Engineering + Art + Math", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Lightbulb" },
  technology: { key: "technology", label: "Technology / Computer Lab", category: "electives_specials", defaultColor: "blue", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Coding, digital literacy, typing, digital citizenship", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Monitor" },
  library: { key: "library", label: "Library", category: "electives_specials", defaultColor: "amber", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Book selection, research skills, information literacy", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Library" },
  makerspace: { key: "makerspace", label: "Makerspace", category: "electives_specials", defaultColor: "green", defaultDurationMin: 30, defaultDurationMax: 60, subjectDescription: "Building, designing, prototyping, tinkering", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Wrench" },
  foreign_language: { key: "foreign_language", label: "Foreign Language", category: "electives_specials", defaultColor: "teal", defaultDurationMin: 20, defaultDurationMax: 45, subjectDescription: "Language acquisition, vocabulary, conversation, culture", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Languages" },
  journalism: { key: "journalism", label: "Journalism / Media", category: "electives_specials", defaultColor: "blue", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Writing, reporting, media literacy, publishing", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Newspaper" },
  debate: { key: "debate", label: "Debate / Public Speaking", category: "electives_specials", defaultColor: "amber", defaultDurationMin: 30, defaultDurationMax: 50, subjectDescription: "Argumentation, research, oral communication", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "MessageSquare" },
  robotics: { key: "robotics", label: "Robotics", category: "electives_specials", defaultColor: "green", defaultDurationMin: 45, defaultDurationMax: 60, subjectDescription: "Programming, engineering, problem solving", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Bot" },
  financial_literacy: { key: "financial_literacy", label: "Financial Literacy", category: "electives_specials", defaultColor: "amber", defaultDurationMin: 20, defaultDurationMax: 40, subjectDescription: "Money concepts, budgeting, saving, economic decisions", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Banknote" },
  health: { key: "health", label: "Health", category: "electives_specials", defaultColor: "green", defaultDurationMin: 20, defaultDurationMax: 40, subjectDescription: "Body systems, nutrition, hygiene, mental health, safety", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Heart" },
  specials_combined: { key: "specials_combined", label: "Specials", category: "electives_specials", defaultColor: "pink", defaultDurationMin: 30, defaultDurationMax: 60, subjectDescription: "PE / Art / Music / Library rotation", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Star" },

  // ── Support & Intervention (4) ─────────────────────────
  intervention: { key: "intervention", label: "Intervention / Support", category: "support_intervention", defaultColor: "coral", defaultDurationMin: 20, defaultDurationMax: 45, subjectDescription: "Pull-out or push-in academic support, re-teaching", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "LifeBuoy" },
  enrichment: { key: "enrichment", label: "Enrichment / GATE", category: "support_intervention", defaultColor: "purple", defaultDurationMin: 20, defaultDurationMax: 45, subjectDescription: "Above-grade extension, independent research, gifted programming", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Rocket" },
  speech_therapy: { key: "speech_therapy", label: "Speech / Language Therapy", category: "support_intervention", defaultColor: "pink", defaultDurationMin: 20, defaultDurationMax: 30, subjectDescription: "Speech sounds, language development, communication skills", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "MessageCircle" },
  occupational_therapy: { key: "occupational_therapy", label: "Occupational Therapy", category: "support_intervention", defaultColor: "pink", defaultDurationMin: 20, defaultDurationMax: 30, subjectDescription: "Fine motor, sensory processing, self-regulation", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Hand" },

  // ── Social-Emotional & Community (4) ───────────────────
  sel: { key: "sel", label: "Social-Emotional Learning", category: "social_emotional", defaultColor: "pink", defaultDurationMin: 15, defaultDurationMax: 30, subjectDescription: "Emotions, self-regulation, empathy, relationships", standardsFramework: "CASEL", isInstructional: true, nonInstructionalMessage: null, icon: "HeartHandshake" },
  advisory: { key: "advisory", label: "Advisory / Homeroom", category: "social_emotional", defaultColor: "teal", defaultDurationMin: 15, defaultDurationMax: 30, subjectDescription: "Morning meeting, announcements, goal setting, community rituals", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Users" },
  class_meeting: { key: "class_meeting", label: "Class Meeting", category: "social_emotional", defaultColor: "teal", defaultDurationMin: 10, defaultDurationMax: 20, subjectDescription: "Whole-class discussion, community problem solving, sharing circle", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "CircleDot" },
  mindfulness: { key: "mindfulness", label: "Mindfulness / Wellness", category: "social_emotional", defaultColor: "pink", defaultDurationMin: 5, defaultDurationMax: 15, subjectDescription: "Breathing exercises, meditation, yoga, gratitude practice", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Flower2" },

  // ── Non-Instructional (7) ──────────────────────────────
  lunch: { key: "lunch", label: "Lunch", category: "non_instructional", defaultColor: "amber", defaultDurationMin: 20, defaultDurationMax: 35, subjectDescription: "", standardsFramework: null, isInstructional: false, nonInstructionalMessage: "Enjoy your lunch!", icon: "UtensilsCrossed" },
  recess: { key: "recess", label: "Recess", category: "non_instructional", defaultColor: "amber", defaultDurationMin: 10, defaultDurationMax: 20, subjectDescription: "", standardsFramework: null, isInstructional: false, nonInstructionalMessage: "Go play — see you soon!", icon: "Sun" },
  snack: { key: "snack", label: "Snack", category: "non_instructional", defaultColor: "amber", defaultDurationMin: 5, defaultDurationMax: 10, subjectDescription: "", standardsFramework: null, isInstructional: false, nonInstructionalMessage: "Snack time!", icon: "Apple" },
  transition: { key: "transition", label: "Transition / Passing Period", category: "non_instructional", defaultColor: "amber", defaultDurationMin: 3, defaultDurationMax: 10, subjectDescription: "", standardsFramework: null, isInstructional: false, nonInstructionalMessage: null, icon: "ArrowRightLeft" },
  assembly: { key: "assembly", label: "Assembly", category: "non_instructional", defaultColor: "amber", defaultDurationMin: 20, defaultDurationMax: 60, subjectDescription: "", standardsFramework: null, isInstructional: false, nonInstructionalMessage: "Head to the assembly!", icon: "Megaphone" },
  field_trip: { key: "field_trip", label: "Field Trip", category: "non_instructional", defaultColor: "amber", defaultDurationMin: 60, defaultDurationMax: 480, subjectDescription: "", standardsFramework: null, isInstructional: false, nonInstructionalMessage: "Enjoy your field trip!", icon: "Bus" },
  testing: { key: "testing", label: "Testing / Assessment", category: "non_instructional", defaultColor: "amber", defaultDurationMin: 30, defaultDurationMax: 90, subjectDescription: "State testing, benchmark assessment", standardsFramework: null, isInstructional: false, nonInstructionalMessage: null, icon: "ClipboardCheck" },

  // ── Free & Flexible (3) ────────────────────────────────
  free_choice: { key: "free_choice", label: "Free Choice", category: "free_flexible", defaultColor: "coral", defaultDurationMin: 15, defaultDurationMax: 30, subjectDescription: "Student selects activity from teacher-defined menu", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Sparkles" },
  project_time: { key: "project_time", label: "Project / Passion Time", category: "free_flexible", defaultColor: "coral", defaultDurationMin: 30, defaultDurationMax: 60, subjectDescription: "Student-driven long-term project, genius hour", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Flame" },
  custom: { key: "custom", label: "Custom Block", category: "free_flexible", defaultColor: "coral", defaultDurationMin: 10, defaultDurationMax: 60, subjectDescription: "Teacher-defined", standardsFramework: null, isInstructional: true, nonInstructionalMessage: null, icon: "Plus" },
};

// Legacy mapping for old 6-type blocks
export const LEGACY_BLOCK_MAP: Record<string, string> = {
  academic: "reading",
  routine: "advisory",
  assessment: "testing",
  economy: "custom",
  flex: "free_choice",
  rotation: "custom",
};

export function getBlockDef(type: string): MainBlockDef {
  return MAIN_BLOCK_CATALOG[type] || MAIN_BLOCK_CATALOG[LEGACY_BLOCK_MAP[type]] || MAIN_BLOCK_CATALOG.custom;
}

export function getBlocksByCategory(category: BlockCategory): MainBlockDef[] {
  return Object.values(MAIN_BLOCK_CATALOG).filter((b) => b.category === category);
}
