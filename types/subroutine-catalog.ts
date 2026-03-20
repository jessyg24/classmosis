// Classmosis Sub-Routine Catalog — 63 pre-built sub-routines + custom
// These are TypeScript constants, NOT database rows.
// Any sub-routine can go inside any main block.

export type SubRoutineCategory =
  | "instruction"
  | "practice"
  | "discussion_sharing"
  | "assessment"
  | "routine"
  | "economy"
  | "special";

export interface SubRoutineSupports {
  assignment: boolean;
  rubric: boolean;
  practice_set: boolean;
  economy_trigger: boolean;
  submission: boolean;
  standards: boolean;
}

export interface SubRoutineDef {
  key: string;
  label: string;
  category: SubRoutineCategory;
  description: string;
  defaultDurationMin: number;
  defaultDurationMax: number;
  supports: SubRoutineSupports;
  studentViewDescription: string;
  icon: string;
}

export const SUBROUTINE_CATEGORIES: Array<{ key: SubRoutineCategory; label: string; color: string }> = [
  { key: "instruction", label: "Instruction", color: "cm-blue" },
  { key: "practice", label: "Practice", color: "cm-teal" },
  { key: "discussion_sharing", label: "Discussion & Sharing", color: "cm-purple" },
  { key: "assessment", label: "Assessment", color: "cm-amber" },
  { key: "routine", label: "Routine", color: "cm-green" },
  { key: "economy", label: "Economy", color: "cm-coral" },
  { key: "special", label: "Special", color: "cm-pink" },
];

const S = (a: boolean, r: boolean, p: boolean, e: boolean, sub: boolean, std: boolean): SubRoutineSupports => ({
  assignment: a, rubric: r, practice_set: p, economy_trigger: e, submission: sub, standards: std,
});

export const SUBROUTINE_CATALOG: Record<string, SubRoutineDef> = {
  // ── Instruction (12) ───────────────────────────────────
  mini_lesson:            { key: "mini_lesson",            label: "Mini-lesson",                   category: "instruction",       description: "Direct instruction — teacher teaches, class participates", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(true,false,false,false,false,true),  studentViewDescription: "Listen and participate", icon: "Presentation" },
  warm_up:                { key: "warm_up",                label: "Warm-up",                       category: "instruction",       description: "Quick activation — review, preview, hook, brain teaser", defaultDurationMin: 3, defaultDurationMax: 10,  supports: S(true,false,false,false,true,false),  studentViewDescription: "Quick warm-up activity", icon: "Zap" },
  read_aloud:             { key: "read_aloud",             label: "Read Aloud",                    category: "instruction",       description: "Teacher reads to the class", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(true,false,false,false,false,true),  studentViewDescription: "Listen to the story", icon: "BookOpen" },
  shared_reading:         { key: "shared_reading",         label: "Shared Reading",                category: "instruction",       description: "Whole class reads a text together with stop-and-think prompts", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(true,false,false,false,true,true),   studentViewDescription: "Read together as a class", icon: "BookOpen" },
  video_multimedia:       { key: "video_multimedia",       label: "Video / Multimedia",            category: "instruction",       description: "Educational video, podcast clip, or interactive content", defaultDurationMin: 5, defaultDurationMax: 20,  supports: S(false,false,false,false,false,false), studentViewDescription: "Watch and learn", icon: "Play" },
  modeled_writing:        { key: "modeled_writing",        label: "Modeled Writing",               category: "instruction",       description: "Teacher writes in front of class — think-aloud demonstration", defaultDurationMin: 10, defaultDurationMax: 15, supports: S(true,false,false,false,false,true),  studentViewDescription: "Watch the writing process", icon: "PenTool" },
  think_aloud:            { key: "think_aloud",            label: "Think Aloud",                   category: "instruction",       description: "Teacher verbalizes thinking process — metacognitive modeling", defaultDurationMin: 5, defaultDurationMax: 15,  supports: S(false,false,false,false,false,false), studentViewDescription: "Listen and observe", icon: "Brain" },
  vocabulary_intro:       { key: "vocabulary_intro",       label: "Vocabulary Introduction",       category: "instruction",       description: "New words introduced with definitions, context, visuals", defaultDurationMin: 5, defaultDurationMax: 15,  supports: S(true,false,false,false,true,true),   studentViewDescription: "Learn new words", icon: "BookA" },
  anchor_chart:           { key: "anchor_chart",           label: "Anchor Chart Build",            category: "instruction",       description: "Teacher builds a reference chart with the class", defaultDurationMin: 5, defaultDurationMax: 15,  supports: S(false,false,false,false,false,true),  studentViewDescription: "Help build the chart", icon: "StickyNote" },
  number_talk:            { key: "number_talk",            label: "Number Talk",                   category: "instruction",       description: "Mental math discussion — students share strategies", defaultDurationMin: 5, defaultDurationMax: 10,  supports: S(false,false,false,false,false,true),  studentViewDescription: "Think and share your strategy", icon: "Calculator" },
  read_aloud_discussion:  { key: "read_aloud_discussion",  label: "Read Aloud + Discussion Stops", category: "instruction",       description: "Teacher reads with planned pause-and-discuss moments", defaultDurationMin: 15, defaultDurationMax: 25, supports: S(true,false,false,false,true,true),   studentViewDescription: "Listen, stop, and discuss", icon: "BookOpen" },
  guest_speaker:          { key: "guest_speaker",          label: "Guest Speaker",                 category: "instruction",       description: "Visitor presents to the class", defaultDurationMin: 15, defaultDurationMax: 45, supports: S(false,false,false,false,false,false), studentViewDescription: "Listen to our guest", icon: "UserCheck" },

  // ── Practice (16) ──────────────────────────────────────
  independent_work:       { key: "independent_work",       label: "Independent Work",              category: "practice",          description: "Student works alone on an assigned task", defaultDurationMin: 10, defaultDurationMax: 40, supports: S(true,true,false,true,true,true),     studentViewDescription: "Work on your own", icon: "User" },
  partner_work:           { key: "partner_work",           label: "Partner Work",                  category: "practice",          description: "Two students collaborate on a shared task", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(true,false,false,true,true,false),   studentViewDescription: "Work with your partner", icon: "Users" },
  small_group_work:       { key: "small_group_work",       label: "Small Group Work",              category: "practice",          description: "3–5 students work together on a shared task", defaultDurationMin: 10, defaultDurationMax: 25, supports: S(true,false,false,true,true,false),   studentViewDescription: "Work with your group", icon: "UsersRound" },
  independent_reading:    { key: "independent_reading",    label: "Independent Reading",           category: "practice",          description: "Silent self-selected reading — SSR, DEAR, book club", defaultDurationMin: 15, defaultDurationMax: 30, supports: S(true,false,false,true,true,true),    studentViewDescription: "Read quietly", icon: "BookOpen" },
  writing_time:           { key: "writing_time",           label: "Writing Time",                  category: "practice",          description: "Independent drafting, revising, editing, or publishing", defaultDurationMin: 15, defaultDurationMax: 40, supports: S(true,true,false,true,true,true),     studentViewDescription: "Write independently", icon: "PenTool" },
  word_work:              { key: "word_work",              label: "Word Work",                     category: "practice",          description: "Phonics practice, spelling patterns, word sorts", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(true,false,true,true,true,true),     studentViewDescription: "Practice your words", icon: "Abc" },
  fluency_practice:       { key: "fluency_practice",       label: "Fluency Practice",              category: "practice",          description: "Oral reading practice — partner reading, timed reading", defaultDurationMin: 10, defaultDurationMax: 15, supports: S(true,false,false,false,true,true),   studentViewDescription: "Practice reading fluently", icon: "AudioLines" },
  practice_problems:      { key: "practice_problems",      label: "Practice Problems",             category: "practice",          description: "Adaptive auto-scored practice from the practice engine", defaultDurationMin: 5, defaultDurationMax: 20,  supports: S(false,false,true,true,false,true),   studentViewDescription: "Solve practice problems", icon: "Brain" },
  project_work:           { key: "project_work",           label: "Project Work Time",             category: "practice",          description: "Students work on ongoing long-term project", defaultDurationMin: 20, defaultDurationMax: 45, supports: S(true,true,false,true,true,true),     studentViewDescription: "Work on your project", icon: "FolderOpen" },
  stations_centers:       { key: "stations_centers",       label: "Stations / Centers",            category: "practice",          description: "Students rotate through independent learning stations", defaultDurationMin: 20, defaultDurationMax: 40, supports: S(true,false,true,true,true,false),    studentViewDescription: "Work at your station", icon: "LayoutGrid" },
  group_rotation:         { key: "group_rotation",         label: "Group Rotation",                category: "practice",          description: "Teacher-led small group + independent stations simultaneously", defaultDurationMin: 30, defaultDurationMax: 60, supports: S(true,true,true,true,true,true),      studentViewDescription: "Work at your group's station", icon: "RefreshCw" },
  homework_review:        { key: "homework_review",        label: "Homework Review",               category: "practice",          description: "Class reviews and discusses previously assigned homework", defaultDurationMin: 5, defaultDurationMax: 15,  supports: S(true,false,false,false,false,false),  studentViewDescription: "Review homework together", icon: "CheckSquare" },
  math_games:             { key: "math_games",             label: "Math Games",                    category: "practice",          description: "Math practice through structured games", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(true,false,true,true,false,true),     studentViewDescription: "Play math games", icon: "Dice5" },
  science_investigation:  { key: "science_investigation",  label: "Science Investigation / Lab",   category: "practice",          description: "Hands-on experiment, observation, data collection", defaultDurationMin: 20, defaultDurationMax: 45, supports: S(true,true,false,true,true,true),     studentViewDescription: "Investigate and discover", icon: "FlaskConical" },
  art_making:             { key: "art_making",             label: "Art / Making Time",             category: "practice",          description: "Creative making, building, drawing, designing", defaultDurationMin: 20, defaultDurationMax: 45, supports: S(true,true,false,false,true,false),    studentViewDescription: "Create and make", icon: "Palette" },
  research_time:          { key: "research_time",          label: "Research Time",                 category: "practice",          description: "Student-directed research — reading, note-taking, sources", defaultDurationMin: 15, defaultDurationMax: 40, supports: S(true,false,false,false,true,true),    studentViewDescription: "Research your topic", icon: "Search" },

  // ── Discussion & Sharing (9) ───────────────────────────
  whole_class_discussion: { key: "whole_class_discussion", label: "Whole-Class Discussion",        category: "discussion_sharing", description: "Structured open discussion — Socratic seminar", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(false,false,false,false,false,true),  studentViewDescription: "Join the discussion", icon: "MessageSquare" },
  think_pair_share:       { key: "think_pair_share",       label: "Think-Pair-Share",              category: "discussion_sharing", description: "Think → partner discussion → share with class", defaultDurationMin: 5, defaultDurationMax: 15,  supports: S(true,false,false,false,true,false),   studentViewDescription: "Think, then share with a partner", icon: "Users" },
  turn_and_talk:          { key: "turn_and_talk",          label: "Turn and Talk",                 category: "discussion_sharing", description: "Brief partner conversation in response to a prompt", defaultDurationMin: 2, defaultDurationMax: 5,   supports: S(false,false,false,false,false,false), studentViewDescription: "Talk with your neighbor", icon: "MessageCircle" },
  share_time:             { key: "share_time",             label: "Share Time",                    category: "discussion_sharing", description: "Students share work or ideas with the class", defaultDurationMin: 5, defaultDurationMax: 15,  supports: S(false,false,false,false,true,false),   studentViewDescription: "Share your work", icon: "Hand" },
  student_presentation:   { key: "student_presentation",   label: "Student Presentation",          category: "discussion_sharing", description: "Students present to the class — graded by rubric", defaultDurationMin: 10, defaultDurationMax: 40, supports: S(true,true,false,true,true,true),     studentViewDescription: "Present to the class", icon: "Presentation" },
  class_debate:           { key: "class_debate",           label: "Class Debate",                  category: "discussion_sharing", description: "Structured argument — sides assigned, evidence required", defaultDurationMin: 15, defaultDurationMax: 30, supports: S(true,true,false,false,false,true),   studentViewDescription: "Debate your position", icon: "Scale" },
  gallery_walk:           { key: "gallery_walk",           label: "Gallery Walk",                  category: "discussion_sharing", description: "Students move around to view and respond to posted work", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(false,false,false,false,true,false),  studentViewDescription: "Walk and observe", icon: "Eye" },
  literature_circles:     { key: "literature_circles",     label: "Literature Circles / Book Clubs", category: "discussion_sharing", description: "Small groups discuss shared reading with assigned roles", defaultDurationMin: 15, defaultDurationMax: 25, supports: S(true,false,false,false,true,true),   studentViewDescription: "Discuss with your book club", icon: "BookOpen" },
  philosophical_chairs:   { key: "philosophical_chairs",   label: "Philosophical Chairs",          category: "discussion_sharing", description: "Students position themselves based on stance, discuss", defaultDurationMin: 15, defaultDurationMax: 25, supports: S(true,true,false,false,false,true),   studentViewDescription: "Take your position", icon: "Armchair" },

  // ── Assessment (11) ────────────────────────────────────
  exit_ticket:            { key: "exit_ticket",            label: "Exit Ticket",                   category: "assessment",        description: "1–3 questions submitted at end of lesson", defaultDurationMin: 3, defaultDurationMax: 10,  supports: S(true,true,false,true,true,true),     studentViewDescription: "Answer and submit", icon: "TicketCheck" },
  quiz:                   { key: "quiz",                   label: "Quiz",                          category: "assessment",        description: "Formal graded quiz — recorded in gradebook", defaultDurationMin: 10, defaultDurationMax: 25, supports: S(true,true,false,true,true,true),     studentViewDescription: "Take the quiz", icon: "FileQuestion" },
  test_assessment:        { key: "test_assessment",        label: "Test / Unit Assessment",        category: "assessment",        description: "Formal end-of-unit assessment — IEP extended time applies", defaultDurationMin: 30, defaultDurationMax: 60, supports: S(true,true,false,true,true,true),     studentViewDescription: "Complete the assessment", icon: "ClipboardCheck" },
  quick_poll:             { key: "quick_poll",             label: "Quick Poll / CFU",              category: "assessment",        description: "Live question to all student portals — real-time results", defaultDurationMin: 2, defaultDurationMax: 5,   supports: S(false,false,false,false,true,false),  studentViewDescription: "Answer the poll", icon: "BarChart3" },
  self_assessment:        { key: "self_assessment",        label: "Self-Assessment",               category: "assessment",        description: "Student rates their understanding 1–5 with reflection", defaultDurationMin: 2, defaultDurationMax: 5,   supports: S(false,false,false,false,true,false),  studentViewDescription: "Rate your understanding", icon: "ThumbsUp" },
  peer_review:            { key: "peer_review",            label: "Peer Review",                   category: "assessment",        description: "Students review a classmate's work against a rubric", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(true,true,false,false,true,true),    studentViewDescription: "Review a classmate's work", icon: "UserCheck" },
  goal_checkin:           { key: "goal_checkin",           label: "Goal Check-In",                 category: "assessment",        description: "Student reviews active goals and updates progress", defaultDurationMin: 3, defaultDurationMax: 7,   supports: S(false,false,false,false,true,false),  studentViewDescription: "Check your goals", icon: "Target" },
  classwork_submission:   { key: "classwork_submission",   label: "Classwork Submission",          category: "assessment",        description: "Student submits completed classwork", defaultDurationMin: 3, defaultDurationMax: 5,   supports: S(true,true,false,true,true,true),     studentViewDescription: "Submit your work", icon: "Upload" },
  observation:            { key: "observation",            label: "Observation / Anecdotal",       category: "assessment",        description: "Teacher observes and takes notes — no student submission", defaultDurationMin: 5, defaultDurationMax: 20,  supports: S(false,false,false,false,false,false), studentViewDescription: "Keep working — teacher is observing", icon: "Eye" },
  running_record:         { key: "running_record",         label: "Running Record",                category: "assessment",        description: "Individual oral reading assessment — one student at a time", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(false,false,false,false,false,true),  studentViewDescription: "Read independently while waiting", icon: "Mic" },
  writing_conference:     { key: "writing_conference",     label: "Writing Conference",            category: "assessment",        description: "Teacher meets 1:1 about writing while class writes", defaultDurationMin: 20, defaultDurationMax: 40, supports: S(true,false,false,false,true,true),   studentViewDescription: "Write — teacher will come to you", icon: "PenTool" },

  // ── Routine (6) ────────────────────────────────────────
  brain_break:            { key: "brain_break",            label: "Brain Break",                   category: "routine",           description: "Short movement or sensory reset to restore focus", defaultDurationMin: 2, defaultDurationMax: 5,   supports: S(false,false,false,false,false,false), studentViewDescription: "Time for a brain break!", icon: "Zap" },
  transition_routine:     { key: "transition_routine",     label: "Transition",                    category: "routine",           description: "Students move, get materials, or shift activities", defaultDurationMin: 1, defaultDurationMax: 5,   supports: S(false,false,false,false,false,false), studentViewDescription: "Get ready for the next activity", icon: "ArrowRightLeft" },
  mindfulness_moment:     { key: "mindfulness_moment",     label: "Mindfulness / Breathing",       category: "routine",           description: "Guided breathing, gratitude, quiet reflection", defaultDurationMin: 2, defaultDurationMax: 5,   supports: S(false,false,false,false,false,false), studentViewDescription: "Breathe and relax", icon: "Flower2" },
  clean_up:               { key: "clean_up",               label: "Clean-up",                      category: "routine",           description: "End-of-activity tidy — materials away, area reset", defaultDurationMin: 2, defaultDurationMax: 5,   supports: S(false,false,false,false,false,false), studentViewDescription: "Clean up your area", icon: "Trash2" },
  materials_distribution: { key: "materials_distribution", label: "Materials Distribution",        category: "routine",           description: "Handing out papers, books, or supplies", defaultDurationMin: 1, defaultDurationMax: 3,   supports: S(false,false,false,false,false,false), studentViewDescription: "Get your materials ready", icon: "Package" },
  lining_up:              { key: "lining_up",              label: "Lining Up / Dismissal Prep",    category: "routine",           description: "Students pack up, line up, or prepare to leave", defaultDurationMin: 2, defaultDurationMax: 5,   supports: S(false,false,false,false,false,false), studentViewDescription: "Get ready to go", icon: "DoorOpen" },

  // ── Economy (6) ────────────────────────────────────────
  coin_award:             { key: "coin_award",             label: "Coin Award",                    category: "economy",           description: "Teacher awards coins to individuals or whole class", defaultDurationMin: 2, defaultDurationMax: 5,   supports: S(false,false,false,true,false,false),  studentViewDescription: "Coins incoming!", icon: "Coins" },
  class_store_moment:     { key: "class_store_moment",     label: "Class Store Moment",            category: "economy",           description: "Brief window for students to browse and spend coins", defaultDurationMin: 5, defaultDurationMax: 10,  supports: S(false,false,false,false,false,false), studentViewDescription: "Browse the class store", icon: "ShoppingBag" },
  mystery_reveal:         { key: "mystery_reveal",         label: "Mystery Student Reveal",        category: "economy",           description: "End-of-day reveal of mystery student — fires on all portals", defaultDurationMin: 3, defaultDurationMax: 5,   supports: S(false,false,false,true,false,false),  studentViewDescription: "Who is the mystery student?", icon: "HelpCircle" },
  mystery_motivator:      { key: "mystery_motivator",      label: "Mystery Motivator Check",       category: "economy",           description: "Update class-wide progress bar toward hidden reward", defaultDurationMin: 2, defaultDurationMax: 3,   supports: S(false,false,false,false,false,false), studentViewDescription: "How close are we?", icon: "Gift" },
  job_rotation:           { key: "job_rotation",           label: "Job Rotation Announcement",     category: "economy",           description: "Announce new class job assignments", defaultDurationMin: 2, defaultDurationMax: 3,   supports: S(false,false,false,false,false,false), studentViewDescription: "New jobs are here!", icon: "BadgeCheck" },
  seating_auction:        { key: "seating_auction",        label: "Seating Auction",               category: "economy",           description: "Students spend coins to claim premium seats", defaultDurationMin: 3, defaultDurationMax: 5,   supports: S(false,false,false,true,false,false),  studentViewDescription: "Bid on your seat!", icon: "Armchair" },

  // ── Special (4) ────────────────────────────────────────
  group_rotation_full:    { key: "group_rotation_full",    label: "Group Rotation (Station Builder)", category: "special",        description: "Full station builder — teacher configures stations, assigns groups", defaultDurationMin: 20, defaultDurationMax: 60, supports: S(true,true,true,true,true,true),     studentViewDescription: "Work at your group's station", icon: "RefreshCw" },
  peer_tutoring:          { key: "peer_tutoring",          label: "Peer Tutoring Session",         category: "special",           description: "Teacher-approved peer pairs — mastery student tutors developing student", defaultDurationMin: 10, defaultDurationMax: 20, supports: S(false,false,true,true,false,true),   studentViewDescription: "Help and learn together", icon: "Handshake" },
  time_capsule:           { key: "time_capsule",           label: "Time Capsule",                  category: "special",           description: "Students write a letter to future selves — sealed until year end", defaultDurationMin: 15, defaultDurationMax: 30, supports: S(false,false,false,true,true,false),  studentViewDescription: "Write to your future self", icon: "Clock" },
  custom_subroutine:      { key: "custom_subroutine",      label: "Custom Sub-routine",            category: "special",           description: "Teacher names it anything, sets duration, attaches any properties", defaultDurationMin: 5, defaultDurationMax: 30, supports: S(true,true,true,true,true,true),      studentViewDescription: "", icon: "Plus" },
};

export function getSubRoutineDef(type: string): SubRoutineDef {
  return SUBROUTINE_CATALOG[type] || SUBROUTINE_CATALOG.custom_subroutine;
}

export function getSubRoutinesByCategory(category: SubRoutineCategory): SubRoutineDef[] {
  return Object.values(SUBROUTINE_CATALOG).filter((s) => s.category === category);
}
