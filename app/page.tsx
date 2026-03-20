import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  Coins,
  Brain,
  Users,
  BarChart3,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  Heart,
  Eye,
  BookOpen,
  TrendingUp,
  Check,
  Play,
  Target,
  ShoppingBag,
  Trophy,
  FileText,
  Smile,
  CircleDot,
  Briefcase,
} from "lucide-react";

const replacedTools = [
  "Google Classroom",
  "ClassDojo",
  "Seesaw",
  "Planbook",
  "Remind",
  "Bloomz",
  "Physical timers",
  "Paper gradebooks",
  "Behavior charts",
  "IEP binders",
  "Bathroom pass clipboards",
  "Birthday calendars",
];

const features = [
  {
    icon: Calendar,
    title: "Schedule Builder",
    description:
      "Drag-and-drop your entire day. Six block types, auto-calculated times, daily class codes. Save templates. Publish in one click.",
    color: "cm-teal",
    bgClass: "bg-cm-teal-light",
    textClass: "text-cm-teal-dark",
    iconClass: "text-cm-teal",
    borderClass: "border-cm-teal/20",
    details: [
      "Drag-and-drop block reordering",
      "Auto time recalculation",
      "Daily 4-digit class codes",
      "Save & reuse day templates",
      "Projector display mode",
    ],
  },
  {
    icon: GraduationCap,
    title: "AI-Powered Grading",
    description:
      "AI drafts scores against your rubric with per-category reasoning. You review, adjust, approve. Students get warm, specific feedback.",
    color: "cm-blue",
    bgClass: "bg-cm-blue-light",
    textClass: "text-cm-blue-dark",
    iconClass: "text-cm-blue",
    borderClass: "border-cm-blue/20",
    details: [
      "AI scores with confidence levels",
      "Side-by-side review interface",
      "Flexible grading scales",
      "Automatic gradebook entry",
      "Student feedback with reply threads",
    ],
  },
  {
    icon: Coins,
    title: "Classroom Economy",
    description:
      "Coins for effort, not just scores. Class jobs with multipliers. Mystery student reveals. A store students actually care about.",
    color: "cm-amber",
    bgClass: "bg-cm-amber-light",
    textClass: "text-cm-amber-dark",
    iconClass: "text-cm-amber",
    borderClass: "border-cm-amber/20",
    details: [
      "Configurable earn triggers",
      "Class jobs with coin multipliers",
      "Daily mystery student",
      "Digital & physical store",
      "Full transaction audit trail",
    ],
  },
  {
    icon: Brain,
    title: "Practice Engine",
    description:
      "AI-generated problems aligned to standards. Adaptive difficulty students never see. Instant feedback. Streak bonuses that keep them going.",
    color: "cm-pink",
    bgClass: "bg-cm-pink-light",
    textClass: "text-cm-pink-dark",
    iconClass: "text-cm-pink",
    borderClass: "border-cm-pink/20",
    details: [
      "9 problem types",
      "AI-generated & teacher-created",
      "Adaptive difficulty engine",
      "Spaced repetition built in",
      "Auto-scored to gradebook",
    ],
  },
  {
    icon: Users,
    title: "Parent Portal",
    description:
      "Families see grades, goals, attendance, and economy activity in plain language. Auto-translated. Weekly digest previewed by you first.",
    color: "cm-coral",
    bgClass: "bg-cm-coral-light",
    textClass: "text-cm-coral-dark",
    iconClass: "text-cm-coral",
    borderClass: "border-cm-coral/20",
    details: [
      "Plain-language standards",
      "Auto-translated via DeepL",
      "Weekly email digest",
      "Multiple guardian support",
      "Custody-aware sharing",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "AI morning brief. Student spotlight. Class health. Standards coverage. Economy lens. Everything you need, nothing you don&apos;t.",
    color: "cm-purple",
    bgClass: "bg-cm-purple-light",
    textClass: "text-cm-purple-dark",
    iconClass: "text-cm-purple",
    borderClass: "border-cm-purple/20",
    details: [
      "AI-generated morning brief",
      "14 proactive alert types",
      "Standards mastery heatmap",
      "Week-over-week trends",
      "One-tap actions on every insight",
    ],
  },
];

const promises = [
  {
    icon: Clock,
    audience: "Teachers",
    promise:
      "This platform will save you time every day. It will never add work without removing more. When you're overwhelmed, it will show you one thing to do.",
    color: "cm-teal",
    bgClass: "bg-cm-teal-light",
    iconClass: "text-cm-teal",
  },
  {
    icon: Heart,
    audience: "Students",
    promise:
      "This platform sees your effort, not just your score. It will never make you feel small. When you struggle, it will help. When you succeed, it will celebrate with you.",
    color: "cm-coral",
    bgClass: "bg-cm-coral-light",
    iconClass: "text-cm-coral",
  },
  {
    icon: Eye,
    audience: "Families",
    promise:
      "You will always know how your child is doing, in language you can understand. We will never sell what you share with us.",
    color: "cm-purple",
    bgClass: "bg-cm-purple-light",
    iconClass: "text-cm-purple",
  },
  {
    icon: Shield,
    audience: "Administrators",
    promise:
      "You will have the visibility you need without surveilling the people you lead.",
    color: "cm-blue",
    bgClass: "bg-cm-blue-light",
    iconClass: "text-cm-blue",
  },
];

const freeFeatures = [
  "Schedule builder + daily class codes",
  "Student portal (basic view)",
  "Manual grading + gradebook",
  "Basic classroom economy",
  "Up to 3 active classes",
  "Up to 30 students per class",
];

const proFeatures = [
  "Everything in Free, unlimited",
  "AI grading + rubric generation",
  "AI practice problem engine",
  "Full analytics dashboard",
  "Parent portal + weekly digest",
  "Standards tracking + coverage map",
  "IEP/504 accommodation tools",
  "Mystery student + class jobs + store",
  "Projector display view",
  "Sub plan generator",
  "Unlimited classes & students",
  "All exports & reports",
];

const complianceBadges = [
  { label: "FERPA", description: "Student data never sold" },
  { label: "COPPA", description: "No email required for students" },
  { label: "SOPIPA", description: "No advertising, ever" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cm-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-cm-border bg-cm-surface/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-cm-button bg-cm-teal">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-cm-text-primary">
              Classmosis
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-cm-text-secondary transition-colors hover:text-cm-text-primary"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-cm-text-secondary transition-colors hover:text-cm-text-primary"
            >
              Pricing
            </a>
            <a
              href="#promises"
              className="text-sm font-medium text-cm-text-secondary transition-colors hover:text-cm-text-primary"
            >
              Our Promise
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-cm-text-secondary transition-colors hover:text-cm-text-primary"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center gap-1.5 rounded-cm-button bg-cm-teal px-4 text-sm font-medium text-white transition-colors hover:bg-cm-teal-dark"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-20 md:pt-28">
        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cm-teal-light opacity-40 blur-3xl" />
          <div className="absolute -left-32 top-48 h-80 w-80 rounded-full bg-cm-purple-light opacity-30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cm-amber-light opacity-30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cm-teal/20 bg-cm-teal-light px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-cm-teal" />
            <span className="text-cm-caption font-medium uppercase tracking-wider text-cm-teal-dark">
              The classroom operating system
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-semibold leading-[1.1] tracking-tight text-cm-text-primary md:text-6xl lg:text-7xl">
            Where learning
            <span className="relative ml-3 inline-block">
              <span className="relative z-10 text-cm-teal">flows</span>
              <span className="absolute -bottom-1 left-0 right-0 z-0 h-3 rounded-full bg-cm-teal-light" />
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-cm-text-secondary md:text-xl">
            One platform that replaces everything a K–8 teacher touches every
            day. Schedule. Grade. Engage. Track. Communicate. All in one place,
            all year long.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-cm-button bg-cm-teal px-8 text-base font-medium text-white shadow-lg shadow-cm-teal/20 transition-all hover:bg-cm-teal-dark hover:shadow-xl hover:shadow-cm-teal/30"
            >
              Start your free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center gap-2 rounded-cm-button border border-cm-border-med bg-cm-surface px-8 text-base font-medium text-cm-text-primary transition-colors hover:bg-cm-white"
            >
              See how it works
            </a>
          </div>

          <p className="mt-4 text-sm text-cm-text-hint">
            Free forever for core features. No credit card required.
          </p>
        </div>

        {/* Schedule Builder Preview */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="rounded-cm-modal border border-cm-border bg-cm-surface p-6 shadow-2xl shadow-black/[0.04] md:p-8">
            {/* Mock toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-cm-label font-medium text-cm-text-primary">
                  Tuesday, March 19
                </div>
                <span className="rounded-cm-badge bg-cm-teal-light px-2.5 py-0.5 text-cm-caption font-medium text-cm-teal-dark">
                  Published
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-cm-badge bg-cm-purple-light px-2.5 py-0.5 text-cm-caption font-medium text-cm-purple-dark">
                  Code: 4821
                </span>
              </div>
            </div>

            {/* Mock schedule blocks — interlocking wooden building blocks */}
            <div className="relative z-0 flex flex-col">
              {[
                { color: "teal" as const, label: "Morning Meeting", time: "8:00 – 8:20", type: "Routine", duration: "20 min" },
                { color: "blue" as const, label: "ELA — Main Idea & Details", time: "8:20 – 9:15", type: "Academic", duration: "55 min", inserts: [
                  { label: "Read passage: \"The Water Cycle\"", icon: "book" },
                  { label: "Silent reading — 10 min", icon: "clock" },
                  { label: "Written response", icon: "pencil" },
                  { label: "Exit ticket: Main idea", icon: "check" },
                ] },
                { color: "amber" as const, label: "Recess & Snack", time: "9:15 – 9:35", type: "Routine", duration: "20 min" },
                { color: "blue" as const, label: "Math — Fractions", time: "9:35 – 10:25", type: "Academic", duration: "50 min", inserts: [
                  { label: "Mini-lesson: number line", icon: "book" },
                  { label: "Guided practice", icon: "pencil" },
                  { label: "Independent practice set", icon: "check" },
                ] },
                { color: "purple" as const, label: "Mystery Student Reveal", time: "2:45 – 2:55", type: "Economy", duration: "10 min" },
                { color: "teal" as const, label: "Closing Circle", time: "2:55 – 3:10", type: "Routine", duration: "15 min" },
              ].map((block, i, arr) => (
                <ScheduleBlock
                  key={i}
                  {...block}
                  isFirst={i === 0}
                  isLast={i === arr.length - 1}
                  depth={arr.length - i}
                />
              ))}
            </div>
          </div>

          {/* Floating stat cards — positioned outside the block area */}
          <div className="absolute -left-8 top-16 z-10 hidden rounded-cm-card border border-cm-border bg-cm-surface p-3 shadow-lg xl:block">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cm-green-light">
                <TrendingUp className="h-4 w-4 text-cm-green" />
              </div>
              <div>
                <div className="text-cm-caption text-cm-text-hint">
                  Submissions
                </div>
                <div className="text-cm-label font-semibold text-cm-text-primary">
                  94%
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-8 top-40 z-10 hidden rounded-cm-card border border-cm-border bg-cm-surface p-3 shadow-lg xl:block">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cm-amber-light">
                <Coins className="h-4 w-4 text-cm-amber" />
              </div>
              <div>
                <div className="text-cm-caption text-cm-text-hint">
                  Coins today
                </div>
                <div className="text-cm-label font-semibold text-cm-text-primary">
                  +342
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What it replaces */}
      <section className="border-y border-cm-border bg-cm-surface px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-3 text-cm-section font-medium text-cm-text-primary">
            One platform. Everything replaced.
          </h2>
          <p className="mb-10 text-cm-body text-cm-text-secondary">
            Stop juggling a dozen tools that don&apos;t talk to each other.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {replacedTools.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-2 rounded-full border border-cm-border bg-cm-white px-4 py-2 text-sm text-cm-text-secondary line-through decoration-cm-coral/40 decoration-2"
              >
                {tool}
              </span>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-2">
            <ArrowRight className="h-5 w-5 text-cm-teal" />
            <span className="text-cm-label font-medium text-cm-teal-dark">
              All replaced by Classmosis
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cm-purple/20 bg-cm-purple-light px-4 py-1.5">
              <Zap className="h-4 w-4 text-cm-purple" />
              <span className="text-cm-caption font-medium uppercase tracking-wider text-cm-purple-dark">
                Built for real classrooms
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-cm-text-primary md:text-4xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-cm-text-secondary">
              Six integrated systems that work together. Each one powerful alone.
              Together, they transform your classroom.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group rounded-cm-card border ${feature.borderClass} bg-cm-surface p-6 transition-shadow hover:shadow-lg hover:shadow-black/[0.03]`}
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-cm-button ${feature.bgClass}`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconClass}`} />
                </div>
                <h3 className="mb-2 text-cm-label font-semibold text-cm-text-primary">
                  {feature.title}
                </h3>
                <p className="mb-4 text-cm-body leading-relaxed text-cm-text-secondary">
                  {feature.description}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {feature.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-cm-caption text-cm-text-secondary"
                    >
                      <Check
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${feature.iconClass}`}
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works (student flow) */}
      <section className="border-y border-cm-border bg-cm-surface px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-cm-text-primary md:text-4xl">
              So simple a kindergartner can do it
            </h2>
            <p className="text-lg text-cm-text-secondary">
              No email. No password. No accounts. Just a code and a name.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              step={1}
              title="Enter code"
              description="Teacher publishes the day. A 4-digit code appears."
            />
            <StepCard
              step={2}
              title="Pick name"
              description="Student finds their name on the class roster."
            />
            <StepCard
              step={3}
              title="Start learning"
              description="See the current block, timer, assignments, and coins."
            />
          </div>
        </div>
      </section>

      {/* Student Portal Demo */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cm-coral/20 bg-cm-coral-light px-4 py-1.5">
              <Smile className="h-4 w-4 text-cm-coral" />
              <span className="text-cm-caption font-medium uppercase tracking-wider text-cm-coral-dark">
                Student portal
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-cm-text-primary md:text-4xl">
              What students see every day
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-cm-text-secondary">
              One thing at a time. Encouraging, warm, and clear. Celebrates small wins. Never overwhelming.
            </p>
          </div>

          {/* Student portal mockup */}
          <div className="rounded-cm-modal border border-cm-border bg-cm-white shadow-2xl shadow-black/[0.04] overflow-hidden">
            {/* Student portal header */}
            <div className="border-b border-cm-border bg-cm-surface px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cm-coral-light text-sm font-semibold text-cm-coral-dark">
                    MR
                  </div>
                  <div>
                    <div className="text-cm-label font-medium text-cm-text-primary">
                      Maya Rodriguez
                    </div>
                    <div className="text-cm-caption text-cm-text-hint">
                      Ms. Glazewski&apos;s Class
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 rounded-full bg-cm-amber-light px-3 py-1">
                    <Coins className="h-4 w-4 text-cm-amber" />
                    <span className="text-sm font-semibold text-cm-amber-dark">247</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-cm-purple-light px-3 py-1">
                    <Briefcase className="h-3.5 w-3.5 text-cm-purple" />
                    <span className="text-cm-caption font-medium text-cm-purple-dark">Tech Manager 1.5x</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-[1fr_320px]">
              {/* Main content */}
              <div className="p-6 md:border-r md:border-cm-border">
                {/* NOW block — wooden C-shape */}
                <div className="mb-6">
                  <div className="mb-2 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Happening Now
                  </div>
                  <WoodBlock color="blue">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-white/80" />
                        <div>
                          <div className="text-sm font-semibold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                            ELA — Main Idea &amp; Details
                          </div>
                          <div className="text-cm-caption text-white/60">Academic Block</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-[3px] bg-white/20 px-2.5 py-1">
                        <Clock className="h-3.5 w-3.5 text-white" />
                        <span className="text-cm-caption font-bold tabular-nums text-white">32:14</span>
                      </div>
                    </div>
                  </WoodBlock>
                  {/* Assignment insert */}
                  <div className="mt-2 rounded-[4px] border border-cm-border bg-cm-surface p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-cm-blue" />
                      <span className="text-sm font-medium text-cm-text-primary">
                        Find the Main Idea — &quot;The Water Cycle&quot;
                      </span>
                    </div>
                    <p className="mb-3 text-cm-caption leading-relaxed text-cm-text-secondary">
                      Read the passage and identify the main idea. Write 2–3 sentences explaining how the details support it.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-cm-caption text-cm-teal">
                        <Coins className="h-3.5 w-3.5" />
                        <span>+2 coins on submit, +1 on-time bonus</span>
                      </div>
                      <button className="inline-flex h-8 items-center gap-1.5 rounded-[3px] bg-cm-blue px-4 text-cm-caption font-medium text-white">
                        <Play className="h-3.5 w-3.5" />
                        Start
                      </button>
                    </div>
                  </div>
                </div>

                {/* UP NEXT — wooden block */}
                <div className="mb-6">
                  <div className="mb-2 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Up Next
                  </div>
                  <WoodBlock color="amber">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-4 w-4 text-white/80" />
                        <div>
                          <div className="text-sm font-semibold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                            Recess &amp; Snack
                          </div>
                          <div className="text-cm-caption text-white/60">20 min</div>
                        </div>
                      </div>
                      <span className="rounded-[3px] bg-white/20 px-2 py-0.5 text-cm-caption font-medium text-white">Routine</span>
                    </div>
                  </WoodBlock>
                </div>

                {/* Day schedule — mini wooden blocks */}
                <div>
                  <div className="mb-2 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Today&apos;s Schedule
                  </div>
                  <div className="flex flex-col gap-1">
                    <MiniWoodRow time="8:00" label="Morning Meeting" color="teal" status="done" />
                    <MiniWoodRow time="8:20" label="ELA — Main Idea & Details" color="blue" status="active" />
                    <MiniWoodRow time="9:15" label="Recess & Snack" color="amber" status="upcoming" />
                    <MiniWoodRow time="9:35" label="Math — Fractions" color="blue" status="upcoming" />
                    <MiniWoodRow time="10:25" label="Science" color="blue" status="upcoming" />
                    <MiniWoodRow time="11:15" label="Lunch" color="teal" status="upcoming" />
                    <MiniWoodRow time="12:00" label="Reading" color="blue" status="upcoming" />
                    <MiniWoodRow time="12:45" label="Practice Problems" color="pink" status="upcoming" />
                    <MiniWoodRow time="1:30" label="Social Studies" color="blue" status="upcoming" />
                    <MiniWoodRow time="2:15" label="Art / PE" color="coral" status="upcoming" />
                    <MiniWoodRow time="2:45" label="Mystery Student" color="purple" status="upcoming" />
                    <MiniWoodRow time="2:55" label="Closing Circle" color="teal" status="upcoming" />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="bg-cm-white p-6">
                {/* Today's earnings */}
                <div className="mb-6">
                  <div className="mb-2 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Today&apos;s Earnings
                  </div>
                  <div className="rounded-cm-button bg-cm-amber-light p-3">
                    <div className="mb-1 text-2xl font-bold text-cm-amber-dark">+12</div>
                    <div className="text-cm-caption text-cm-amber-dark">coins earned today</div>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-cm-caption text-cm-text-secondary">
                        <span>Attendance</span>
                        <span className="font-medium text-cm-amber-dark">+1</span>
                      </div>
                      <div className="flex items-center justify-between text-cm-caption text-cm-text-secondary">
                        <span>Morning Meeting</span>
                        <span className="font-medium text-cm-amber-dark">+2</span>
                      </div>
                      <div className="flex items-center justify-between text-cm-caption text-cm-text-secondary">
                        <span>Practice streak (5)</span>
                        <span className="font-medium text-cm-amber-dark">+9</span>
                      </div>
                    </div>
                    <div className="mt-2 border-t border-cm-amber/20 pt-2 text-cm-caption text-cm-purple">
                      Tech Manager 1.5x applied
                    </div>
                  </div>
                </div>

                {/* Work queue */}
                <div className="mb-6">
                  <div className="mb-2 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Work Queue
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 rounded-cm-button border border-cm-border bg-cm-surface p-2.5">
                      <CircleDot className="h-4 w-4 text-cm-blue" />
                      <div className="flex-1 min-w-0">
                        <div className="text-cm-caption font-medium text-cm-text-primary truncate">Main Idea — &quot;Water Cycle&quot;</div>
                        <div className="text-[11px] text-cm-text-hint">Due today</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-cm-button border border-cm-border bg-cm-surface p-2.5">
                      <CircleDot className="h-4 w-4 text-cm-amber" />
                      <div className="flex-1 min-w-0">
                        <div className="text-cm-caption font-medium text-cm-text-primary truncate">Fractions Homework</div>
                        <div className="text-[11px] text-cm-text-hint">Due tomorrow</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-cm-button border border-cm-teal-light bg-cm-teal-light/50 p-2.5">
                      <Check className="h-4 w-4 text-cm-teal" />
                      <div className="flex-1 min-w-0">
                        <div className="text-cm-caption font-medium text-cm-text-hint line-through truncate">Spelling List 14</div>
                        <div className="text-[11px] text-cm-teal">Submitted</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* My Goals */}
                <div className="mb-6">
                  <div className="mb-2 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    My Goals
                  </div>
                  <div className="rounded-cm-button border border-cm-border bg-cm-surface p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-cm-purple" />
                      <span className="text-cm-caption font-medium text-cm-text-primary">
                        Main idea mastery
                      </span>
                    </div>
                    <div className="mb-1.5 text-[11px] text-cm-text-hint">Almost there!</div>
                    <div className="h-2 w-full rounded-full bg-cm-purple-light">
                      <div className="h-2 rounded-full bg-cm-purple" style={{ width: "78%" }} />
                    </div>
                    <div className="mt-1 text-right text-[11px] font-medium text-cm-purple">78%</div>
                  </div>
                </div>

                {/* My Skills */}
                <div className="mb-6">
                  <div className="mb-2 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    My Skills
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between rounded-cm-badge bg-cm-green-light px-2.5 py-1.5">
                      <span className="text-cm-caption text-cm-green-dark">Multiplication facts</span>
                      <span className="text-[11px] font-semibold text-cm-green-dark">Got it!</span>
                    </div>
                    <div className="flex items-center justify-between rounded-cm-badge bg-cm-purple-light px-2.5 py-1.5">
                      <span className="text-cm-caption text-cm-purple-dark">Finding main idea</span>
                      <span className="text-[11px] font-semibold text-cm-purple-dark">Almost there</span>
                    </div>
                    <div className="flex items-center justify-between rounded-cm-badge bg-cm-blue-light px-2.5 py-1.5">
                      <span className="text-cm-caption text-cm-blue-dark">Fractions</span>
                      <span className="text-[11px] font-semibold text-cm-blue-dark">Building</span>
                    </div>
                  </div>
                </div>

                {/* Store peek */}
                <div>
                  <div className="mb-2 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Class Store
                  </div>
                  <div className="flex items-center gap-2.5 rounded-cm-button border border-cm-border bg-cm-surface p-2.5">
                    <ShoppingBag className="h-4 w-4 text-cm-amber" />
                    <div className="flex-1">
                      <div className="text-cm-caption font-medium text-cm-text-primary">Homework Pass</div>
                      <div className="text-[11px] text-cm-text-hint">50 coins</div>
                    </div>
                    <span className="text-cm-caption font-medium text-cm-amber">Shop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Dashboard Demo */}
      <section className="border-y border-cm-border bg-cm-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cm-teal/20 bg-cm-teal-light px-4 py-1.5">
              <BarChart3 className="h-4 w-4 text-cm-teal" />
              <span className="text-cm-caption font-medium uppercase tracking-wider text-cm-teal-dark">
                Teacher dashboard
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-cm-text-primary md:text-4xl">
              Your command center
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-cm-text-secondary">
              AI morning brief, live class health, and one-tap actions. Everything you need before the bell rings.
            </p>
          </div>

          <div className="rounded-cm-modal border border-cm-border bg-cm-white shadow-2xl shadow-black/[0.04] overflow-hidden">
            {/* Teacher dashboard header */}
            <div className="border-b border-cm-border bg-cm-surface px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-cm-button bg-cm-teal">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-cm-label font-semibold text-cm-text-primary">
                      Classmosis
                    </span>
                  </div>
                  <div className="hidden items-center gap-1 md:flex">
                    <span className="rounded-cm-button bg-cm-teal-light px-3 py-1.5 text-cm-caption font-medium text-cm-teal-dark">
                      Dashboard
                    </span>
                    <span className="rounded-cm-button px-3 py-1.5 text-cm-caption font-medium text-cm-text-hint hover:text-cm-text-secondary">
                      Schedule
                    </span>
                    <span className="rounded-cm-button px-3 py-1.5 text-cm-caption font-medium text-cm-text-hint hover:text-cm-text-secondary">
                      Gradebook
                    </span>
                    <span className="rounded-cm-button px-3 py-1.5 text-cm-caption font-medium text-cm-text-hint hover:text-cm-text-secondary">
                      Economy
                    </span>
                    <span className="rounded-cm-button px-3 py-1.5 text-cm-caption font-medium text-cm-text-hint hover:text-cm-text-secondary">
                      Students
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-cm-badge bg-cm-purple-light px-2.5 py-0.5 text-cm-caption font-medium text-cm-purple-dark">
                    3rd Grade &middot; Room 14
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cm-teal-light text-cm-caption font-semibold text-cm-teal-dark">
                    JG
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
              {/* Main area */}
              <div className="p-6">
                {/* Morning brief */}
                <div className="mb-6 rounded-cm-card border border-cm-pink/20 bg-cm-pink-light/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cm-pink" />
                    <span className="text-cm-label font-semibold text-cm-pink-dark">Morning Brief</span>
                    <span className="text-cm-caption text-cm-text-hint">March 19, 2026</span>
                  </div>
                  <p className="mb-3 text-cm-body leading-relaxed text-cm-text-primary">
                    Good morning! 24 of 26 students submitted yesterday&apos;s ELA assignment. Practice accuracy is up 8% this week — nice work on the fractions unit. Two students need your attention today.
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between rounded-cm-button bg-cm-surface p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-cm-coral" />
                        <span className="text-cm-caption text-cm-text-primary">
                          <span className="font-medium">Ethan M.</span> — no submissions in 3 days, mood check-ins trending &quot;tired&quot;
                        </span>
                      </div>
                      <button className="text-cm-caption font-medium text-cm-pink">Spotlight</button>
                    </div>
                    <div className="flex items-center justify-between rounded-cm-button bg-cm-surface p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-cm-amber" />
                        <span className="text-cm-caption text-cm-text-primary">
                          <span className="font-medium">Sofia L.</span> — fractions practice dropped below 60%, may need re-teach
                        </span>
                      </div>
                      <button className="text-cm-caption font-medium text-cm-pink">Re-teach</button>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <TeacherStatCard label="Submission Rate" value="92%" trend="+3%" trendUp />
                  <TeacherStatCard label="Practice Accuracy" value="78%" trend="+8%" trendUp />
                  <TeacherStatCard label="Avg Grade" value="B+" trend="same" />
                  <TeacherStatCard label="Missing Work" value="4" trend="-2" trendUp />
                </div>

                {/* Today's schedule compact */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-cm-label font-semibold text-cm-text-primary">Today&apos;s Schedule</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-cm-badge bg-cm-teal-light px-2 py-0.5 text-cm-caption font-medium text-cm-teal-dark">
                        Published
                      </span>
                      <span className="rounded-cm-badge bg-cm-purple-light px-2 py-0.5 text-cm-caption font-medium text-cm-purple-dark">
                        Code: 4821
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <MiniWoodRow time="8:00" label="Morning Meeting" color="teal" status="done" />

                    {/* ELA block — expanded C-shape showing inserts */}
                    <ExpandedTeacherBlock
                      time="8:20"
                      label="ELA — Main Idea & Details"
                      color="blue"
                      duration="55 min"
                      type="Academic"
                      badge="18/26 submitted"
                      inserts={[
                        { label: "Read passage: \"The Water Cycle\"", icon: "book" },
                        { label: "Silent reading — 10 min", icon: "clock" },
                        { label: "Written response", icon: "pencil" },
                        { label: "Exit ticket: Main idea", icon: "check" },
                      ]}
                    />

                    <MiniWoodRow time="9:15" label="Recess & Snack" color="amber" status="upcoming" />
                    <MiniWoodRow time="9:35" label="Math — Fractions" color="blue" status="upcoming" />
                    <MiniWoodRow time="2:45" label="Mystery Student" color="purple" status="upcoming" />
                    <MiniWoodRow time="2:55" label="Closing Circle" color="teal" status="upcoming" />
                  </div>
                </div>

                {/* Grading queue */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-cm-label font-semibold text-cm-text-primary">Grading Queue</span>
                    <span className="text-cm-caption text-cm-text-hint">8 items</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between rounded-cm-button border border-cm-border bg-cm-surface p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cm-blue-light text-[11px] font-semibold text-cm-blue-dark">AI</div>
                        <div>
                          <div className="text-cm-caption font-medium text-cm-text-primary">Spelling List 14 — Marcus T.</div>
                          <div className="text-[11px] text-cm-text-hint">AI draft ready &middot; High confidence</div>
                        </div>
                      </div>
                      <button className="rounded-cm-badge bg-cm-teal-light px-2.5 py-1 text-cm-caption font-medium text-cm-teal-dark">
                        Approve
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-cm-button border border-cm-border bg-cm-surface p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cm-amber-light text-[11px] font-semibold text-cm-amber-dark">AI</div>
                        <div>
                          <div className="text-cm-caption font-medium text-cm-text-primary">Main Idea Response — Lily K.</div>
                          <div className="text-[11px] text-cm-text-hint">AI draft ready &middot; Needs review</div>
                        </div>
                      </div>
                      <button className="rounded-cm-badge bg-cm-blue-light px-2.5 py-1 text-cm-caption font-medium text-cm-blue-dark">
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="border-t border-cm-border bg-cm-white p-6 lg:border-l lg:border-t-0">
                {/* Class health */}
                <div className="mb-6">
                  <div className="mb-3 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Class Health
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between rounded-cm-button bg-cm-teal-light/50 p-2.5">
                      <span className="text-cm-caption text-cm-text-secondary">Attendance</span>
                      <span className="text-cm-caption font-semibold text-cm-teal-dark">25/26</span>
                    </div>
                    <div className="flex items-center justify-between rounded-cm-button bg-cm-surface p-2.5">
                      <span className="text-cm-caption text-cm-text-secondary">Mood check-ins</span>
                      <span className="text-cm-caption font-semibold text-cm-text-primary">20/25</span>
                    </div>
                    <div className="flex items-center justify-between rounded-cm-button bg-cm-surface p-2.5">
                      <span className="text-cm-caption text-cm-text-secondary">Hands raised</span>
                      <span className="text-cm-caption font-semibold text-cm-text-primary">3</span>
                    </div>
                  </div>
                </div>

                {/* Mood snapshot */}
                <div className="mb-6">
                  <div className="mb-3 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Mood Snapshot
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { emoji: "😊", count: 10, label: "Great" },
                      { emoji: "🙂", count: 6, label: "Good" },
                      { emoji: "😐", count: 3, label: "Okay" },
                      { emoji: "😴", count: 1, label: "Tired" },
                    ].map((m) => (
                      <div key={m.label} className="flex flex-col items-center rounded-cm-badge bg-cm-surface p-2">
                        <span className="text-lg">{m.emoji}</span>
                        <span className="text-[11px] font-semibold text-cm-text-primary">{m.count}</span>
                        <span className="text-[10px] text-cm-text-hint">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Economy pulse */}
                <div className="mb-6">
                  <div className="mb-3 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Economy Pulse
                  </div>
                  <div className="rounded-cm-button bg-cm-amber-light/50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-cm-caption text-cm-text-secondary">Coins awarded today</span>
                      <span className="text-cm-caption font-bold text-cm-amber-dark">342</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-cm-caption text-cm-text-secondary">Store purchases</span>
                      <span className="text-cm-caption font-bold text-cm-amber-dark">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cm-caption text-cm-text-secondary">Mystery student</span>
                      <span className="text-cm-caption font-medium text-cm-purple">Hidden</span>
                    </div>
                  </div>
                </div>

                {/* Standards progress */}
                <div className="mb-6">
                  <div className="mb-3 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Standards This Week
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-cm-caption text-cm-text-secondary">RL.3.2 Main Idea</span>
                        <span className="text-[11px] font-medium text-cm-green">72% mastered</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-cm-green-light">
                        <div className="h-1.5 rounded-full bg-cm-green" style={{ width: "72%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-cm-caption text-cm-text-secondary">3.NF.A.2 Number Line</span>
                        <span className="text-[11px] font-medium text-cm-purple">48% mastered</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-cm-purple-light">
                        <div className="h-1.5 rounded-full bg-cm-purple" style={{ width: "48%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div>
                  <div className="mb-3 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex flex-col items-center gap-1 rounded-cm-button border border-cm-border bg-cm-surface p-2.5 text-cm-caption text-cm-text-secondary hover:bg-cm-white">
                      <Coins className="h-4 w-4 text-cm-amber" />
                      Award Coins
                    </button>
                    <button className="flex flex-col items-center gap-1 rounded-cm-button border border-cm-border bg-cm-surface p-2.5 text-cm-caption text-cm-text-secondary hover:bg-cm-white">
                      <Trophy className="h-4 w-4 text-cm-purple" />
                      Reveal Mystery
                    </button>
                    <button className="flex flex-col items-center gap-1 rounded-cm-button border border-cm-border bg-cm-surface p-2.5 text-cm-caption text-cm-text-secondary hover:bg-cm-white">
                      <Eye className="h-4 w-4 text-cm-teal" />
                      Projector View
                    </button>
                    <button className="flex flex-col items-center gap-1 rounded-cm-button border border-cm-border bg-cm-surface p-2.5 text-cm-caption text-cm-text-secondary hover:bg-cm-white">
                      <Users className="h-4 w-4 text-cm-blue" />
                      Equity Picker
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section id="promises" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cm-coral/20 bg-cm-coral-light px-4 py-1.5">
              <Heart className="h-4 w-4 text-cm-coral" />
              <span className="text-cm-caption font-medium uppercase tracking-wider text-cm-coral-dark">
                Our promise
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-cm-text-primary md:text-4xl">
              Built by a teacher, for every classroom
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-cm-text-secondary">
              Classmosis was created by a real K–8 teacher who was tired of
              duct-taping a dozen tools together. These are the promises baked
              into every pixel.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {promises.map((p) => (
              <div
                key={p.audience}
                className="rounded-cm-card border border-cm-border bg-cm-surface p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${p.bgClass}`}
                  >
                    <p.icon className={`h-5 w-5 ${p.iconClass}`} />
                  </div>
                  <span className="text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                    To every {p.audience.toLowerCase()}
                  </span>
                </div>
                <p className="text-cm-body leading-relaxed text-cm-text-primary">
                  {p.promise}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-y border-cm-border bg-cm-surface px-6 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cm-amber/20 bg-cm-amber-light px-4 py-1.5">
              <Star className="h-4 w-4 text-cm-amber" />
              <span className="text-cm-caption font-medium uppercase tracking-wider text-cm-amber-dark">
                Simple pricing
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-cm-text-primary md:text-4xl">
              Start free. Upgrade when you&apos;re ready.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-cm-text-secondary">
              No surprise fees. No per-student charges. One price, everything
              included.
            </p>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-3 lg:gap-8">
            {/* Free tier */}
            <div className="rounded-cm-card border border-cm-border bg-cm-white p-8">
              <div className="mb-1 text-cm-overline font-medium uppercase tracking-wider text-cm-text-hint">
                Free
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-cm-text-primary">
                  $0
                </span>
                <span className="text-cm-body text-cm-text-hint">/forever</span>
              </div>
              <p className="mb-6 text-cm-body text-cm-text-secondary">
                Everything you need to get started. No credit card required.
              </p>

              <Link
                href="/signup"
                className="mb-8 flex h-11 w-full items-center justify-center rounded-cm-button border border-cm-border-med bg-cm-surface text-sm font-medium text-cm-text-primary transition-colors hover:bg-cm-white"
              >
                Get started free
              </Link>

              <ul className="flex flex-col gap-3">
                {freeFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-cm-body text-cm-text-secondary"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cm-teal" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Monthly */}
            <div className="relative rounded-cm-card border-2 border-cm-teal bg-cm-white p-8">
              <div className="absolute -top-3 right-6 rounded-full bg-cm-teal px-3 py-0.5 text-cm-caption font-medium text-white">
                7-day free trial
              </div>

              <div className="mb-1 text-cm-overline font-medium uppercase tracking-wider text-cm-teal">
                Pro Monthly
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-cm-text-primary">
                  $19.99
                </span>
                <span className="text-cm-body text-cm-text-hint">/month</span>
              </div>
              <p className="mb-6 text-cm-body text-cm-text-secondary">
                The full classroom operating system. Unlimited everything.
              </p>

              <Link
                href="/signup?plan=pro"
                className="mb-8 flex h-11 w-full items-center justify-center gap-2 rounded-cm-button bg-cm-teal text-sm font-medium text-white shadow-lg shadow-cm-teal/20 transition-all hover:bg-cm-teal-dark hover:shadow-xl"
              >
                Start 7-day free trial
                <ArrowRight className="h-4 w-4" />
              </Link>

              <ul className="flex flex-col gap-3">
                {proFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-cm-body text-cm-text-secondary"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cm-teal" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Annual */}
            <div className="relative rounded-cm-card border-2 border-cm-purple bg-cm-white p-8">
              <div className="absolute -top-3 right-6 rounded-full bg-cm-purple px-3 py-0.5 text-cm-caption font-medium text-white">
                Save over 50%
              </div>

              <div className="mb-1 text-cm-overline font-medium uppercase tracking-wider text-cm-purple">
                Pro Annual
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-cm-text-primary">
                  $119
                </span>
                <span className="text-cm-body text-cm-text-hint">/year</span>
              </div>
              <p className="mb-6 text-cm-body text-cm-text-secondary">
                Everything in Pro. Billed annually at $9.92/mo.
              </p>

              <Link
                href="/signup?plan=pro-annual"
                className="mb-8 flex h-11 w-full items-center justify-center gap-2 rounded-cm-button bg-cm-purple text-sm font-medium text-white shadow-lg shadow-cm-purple/20 transition-all hover:bg-cm-purple-dark hover:shadow-xl"
              >
                Start 7-day free trial
                <ArrowRight className="h-4 w-4" />
              </Link>

              <ul className="flex flex-col gap-3">
                {proFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-cm-body text-cm-text-secondary"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cm-purple" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* School & District note */}
          <div className="mt-8 rounded-cm-card border border-cm-border bg-cm-white p-6 text-center">
            <p className="text-cm-body text-cm-text-secondary">
              <span className="font-medium text-cm-text-primary">
                School & District plans
              </span>{" "}
              — Cover all your teachers with volume pricing, admin dashboards,
              SIS integration, and dedicated support.{" "}
              <a
                href="mailto:hello@classmosis.com"
                className="font-medium text-cm-teal underline decoration-cm-teal/30 underline-offset-2 hover:decoration-cm-teal"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Compliance & Trust */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center md:gap-16">
            {complianceBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cm-green-light">
                  <Shield className="h-5 w-5 text-cm-green" />
                </div>
                <div>
                  <div className="text-cm-label font-semibold text-cm-text-primary">
                    {badge.label} Compliant
                  </div>
                  <div className="text-cm-caption text-cm-text-hint">
                    {badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-24 pt-8">
        <div className="mx-auto max-w-3xl rounded-cm-modal bg-cm-teal-dark p-12 text-center md:p-16">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Your classroom deserves this
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/70">
            Join teachers who stopped duct-taping tools together and started
            spending their time where it matters — with their students.
          </p>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center gap-2 rounded-cm-button bg-white px-8 text-base font-medium text-cm-teal-dark transition-colors hover:bg-white/90"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-white/50">
            Free forever for core features. Pro trial starts with 7 days free.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cm-border bg-cm-surface px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cm-teal">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-cm-label font-semibold text-cm-text-primary">
                Classmosis
              </span>
              <span className="text-cm-caption text-cm-text-hint">
                — Where learning flows
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-cm-text-hint">
              <span>A Lorespark connected brand</span>
              <span className="text-cm-border-med">|</span>
              <span>&copy; {new Date().getFullYear()} Classmosis</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

type BlockColor = "teal" | "blue" | "amber" | "purple" | "coral" | "pink";
type BlockInsert = { label: string; icon: string };

const WOOD: Record<BlockColor, { base: string; dark: string; grain: string }> = {
  teal:   { base: "#62A080", dark: "#4E8B6A", grain: "rgba(0,0,0,0.05)" },
  blue:   { base: "#7090B0", dark: "#5A7B9E", grain: "rgba(0,0,0,0.04)" },
  amber:  { base: "#C49B56", dark: "#B08840", grain: "rgba(0,0,0,0.05)" },
  purple: { base: "#9585B8", dark: "#7E6DA8", grain: "rgba(0,0,0,0.04)" },
  coral:  { base: "#C47E5E", dark: "#B06848", grain: "rgba(0,0,0,0.05)" },
  pink:   { base: "#B47890", dark: "#A0607A", grain: "rgba(0,0,0,0.04)" },
};

function woodGrain(grain: string) {
  return [
    `repeating-linear-gradient(88deg, transparent, transparent 3px, ${grain} 3px, ${grain} 5px)`,
    `repeating-linear-gradient(91deg, transparent, transparent 11px, ${grain} 11px, ${grain} 13px)`,
    `repeating-linear-gradient(86deg, transparent, transparent 23px, rgba(255,255,255,0.04) 23px, rgba(255,255,255,0.04) 26px)`,
    `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 30%, rgba(0,0,0,0.08) 100%)`,
  ].join(", ");
}

const TAB_W = 36;
const TAB_H = 10;
const TAB_L = 24;

const insertIcons: Record<string, typeof BookOpen> = {
  book: BookOpen,
  clock: Clock,
  pencil: FileText,
  check: Check,
};

function ScheduleBlock({
  color,
  label,
  time,
  type,
  duration,
  inserts,
  isFirst,
  isLast,
  depth = 1,
}: {
  color: BlockColor;
  label: string;
  time: string;
  type: string;
  duration: string;
  inserts?: BlockInsert[];
  isFirst?: boolean;
  isLast?: boolean;
  depth?: number;
}) {
  const w = WOOD[color] || WOOD.teal;
  const grain = woodGrain(w.grain);
  const hasInserts = inserts && inserts.length > 0;

  const woodStyle = {
    backgroundColor: w.base,
    backgroundImage: grain,
  };

  const depthBar = (radius?: string) => (
    <div
      className="absolute inset-x-0 bottom-0"
      style={{ height: 3, backgroundColor: w.dark, borderRadius: radius }}
    />
  );

  return (
    <div
      className="relative"
      style={{ marginTop: isFirst ? 0 : -TAB_H, zIndex: depth }}
    >
      {/* Socket row — colored strip with rectangular punch-out for the tab above */}
      {!isFirst && (
        <div className="relative overflow-hidden" style={{ height: TAB_H }}>
          <div className="absolute inset-0" style={woodStyle} />
          {/* Rectangular socket — exact same size as tab, no border-radius so edges are flush */}
          <div
            className="absolute top-0 bg-cm-surface"
            style={{ left: TAB_L, width: TAB_W, height: TAB_H }}
          />
        </div>
      )}

      {/* Top bar — block header */}
      <div
        className="relative px-4 py-3"
        style={{
          ...woodStyle,
          borderRadius: isFirst ? "4px 4px 0 0" : "0",
        }}
      >
        {isFirst && <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[4px] bg-white/20" />}
        {!hasInserts && depthBar(isLast ? "0 0 4px 4px" : undefined)}

        <div className="relative flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="hidden w-24 text-cm-caption text-white/50 sm:block">{time}</div>
            <div className="text-sm font-semibold" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
              {label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-cm-caption text-white/50 sm:block">{duration}</span>
            <span
              className="rounded-[3px] px-2 py-0.5 text-cm-caption font-semibold text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.18)", textShadow: "0 1px 1px rgba(0,0,0,0.2)" }}
            >
              {type}
            </span>
          </div>
        </div>
      </div>

      {/* C-shaped body — inserts nest inside */}
      {hasInserts && (
        <>
          {/* Left wall + insert area */}
          <div className="flex">
            {/* Left wall of the C-shape */}
            <div
              className="relative shrink-0"
              style={{ ...woodStyle, width: TAB_L }}
            >
              <div className="absolute inset-y-0 right-0 w-[1px] bg-black/10" />
            </div>

            {/* Insert well */}
            <div className="flex-1 bg-cm-surface py-2 pl-2 pr-3">
              <div className="flex flex-col gap-1.5">
                {inserts.map((insert, idx) => {
                  const IconComp = insertIcons[insert.icon] || BookOpen;
                  const insertColors = [
                    { base: "#D4A880", dark: "#C4956B" },
                    { base: "#A39070", dark: "#8E7A5A" },
                    { base: "#C88E70", dark: "#B5785A" },
                    { base: "#AFA484", dark: "#9A8E6E" },
                  ];
                  const ic = insertColors[idx % insertColors.length];
                  const insertGrain = woodGrain("rgba(0,0,0,0.07)");
                  return (
                    <div
                      key={idx}
                      className="relative flex items-center gap-2.5 px-3 py-2.5 text-white"
                      style={{
                        backgroundColor: ic.base,
                        backgroundImage: insertGrain,
                        borderRadius: "3px",
                      }}
                    >
                      <div
                        className="absolute inset-x-0 bottom-0"
                        style={{ height: 2, backgroundColor: ic.dark, borderRadius: "0 0 3px 3px" }}
                      />
                      <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[3px] bg-white/15" />
                      <IconComp className="relative h-3.5 w-3.5 shrink-0 text-white/70" />
                      <span
                        className="relative text-cm-caption font-semibold"
                        style={{ textShadow: "0 1px 1px rgba(0,0,0,0.25)" }}
                      >
                        {insert.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom bar of the C-shape */}
          <div
            className="relative px-4 py-2"
            style={{
              ...woodStyle,
              borderRadius: isLast ? "0 0 4px 4px" : "0",
            }}
          >
            {depthBar(isLast ? "0 0 4px 4px" : undefined)}
          </div>
        </>
      )}

      {/* Tab — protrudes down, rectangular with rounded bottom only */}
      {!isLast && (
        <div
          className="relative overflow-hidden"
          style={{
            marginLeft: TAB_L,
            width: TAB_W,
            height: TAB_H,
            ...woodStyle,
            borderRadius: "0 0 4px 4px",
          }}
        >
          <div
            className="absolute inset-x-0 bottom-0"
            style={{ height: 2, backgroundColor: w.dark, borderRadius: "0 0 4px 4px" }}
          />
        </div>
      )}
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  const stepColors: Record<number, BlockColor> = { 1: "teal", 2: "blue", 3: "amber", 4: "purple" };
  const c = stepColors[step] || "teal";
  const w = WOOD[c];
  return (
    <div className="text-center">
      <div
        className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center text-lg font-bold text-white"
        style={{
          backgroundColor: w.base,
          backgroundImage: woodGrain(w.grain),
          borderRadius: "4px",
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-[4px]" style={{ backgroundColor: w.dark }} />
        <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[4px] bg-white/20" />
        {step}
      </div>
      <h3 className="mb-2 text-cm-label font-semibold text-cm-text-primary">
        {title}
      </h3>
      <p className="text-cm-body text-cm-text-secondary">{description}</p>
    </div>
  );
}

/** A standalone wooden block used in demos */
function WoodBlock({ color, children }: { color: BlockColor; children: React.ReactNode }) {
  const w = WOOD[color];
  return (
    <div
      className="relative rounded-[4px] px-4 py-3"
      style={{
        backgroundColor: w.base,
        backgroundImage: woodGrain(w.grain),
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-[4px]" style={{ backgroundColor: w.dark }} />
      <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[4px] bg-white/20" />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Mini wooden block row for schedule lists in demos */
function MiniWoodRow({
  time,
  label,
  color,
  status,
  badge,
}: {
  time: string;
  label: string;
  color: string;
  status: "done" | "active" | "upcoming";
  badge?: string;
}) {
  const w = WOOD[(color as BlockColor)] || WOOD.teal;
  const isActive = status === "active";
  const isDone = status === "done";

  return (
    <div
      className="relative flex items-center gap-3 rounded-[3px] px-3 py-1.5"
      style={{
        backgroundColor: w.base,
        backgroundImage: woodGrain(w.grain),
        opacity: isDone ? 0.5 : 1,
        boxShadow: isActive ? `0 0 0 2px ${w.base}44` : undefined,
      }}
    >
      {/* Depth edge */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-[3px]" style={{ backgroundColor: w.dark }} />
      <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[3px] bg-white/15" />

      <span className="relative w-10 text-cm-caption text-white/60">{time}</span>
      <span
        className={`relative text-cm-caption font-medium text-white ${isDone ? "line-through opacity-70" : ""}`}
        style={{ textShadow: "0 1px 1px rgba(0,0,0,0.25)" }}
      >
        {label}
      </span>
      {isDone && <Check className="relative ml-auto h-3 w-3 text-white/70" />}
      {isActive && badge && (
        <span className="relative ml-auto rounded-[3px] bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {badge}
        </span>
      )}
      {isActive && !badge && (
        <span className="relative ml-auto flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      )}
    </div>
  );
}

/** Expanded C-shaped block for teacher dashboard demo — shows inserts */
function ExpandedTeacherBlock({
  time,
  label,
  color,
  duration,
  type,
  badge,
  inserts,
}: {
  time: string;
  label: string;
  color: BlockColor;
  duration: string;
  type: string;
  badge?: string;
  inserts: BlockInsert[];
}) {
  const w = WOOD[color];
  const grain = woodGrain(w.grain);
  const woodStyle = { backgroundColor: w.base, backgroundImage: grain };

  const insertColors = [
    { base: "#D4A880", dark: "#C4956B" },
    { base: "#A39070", dark: "#8E7A5A" },
    { base: "#C88E70", dark: "#B5785A" },
    { base: "#AFA484", dark: "#9A8E6E" },
  ];

  return (
    <div className="relative" style={{ boxShadow: `0 0 0 2px ${w.base}44` }}>
      {/* Top bar */}
      <div
        className="relative rounded-t-[4px] px-3 py-2"
        style={woodStyle}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[4px] bg-white/20" />
        <div className="relative flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-cm-caption text-white/60">{time}</span>
            <span className="text-cm-caption font-semibold" style={{ textShadow: "0 1px 1px rgba(0,0,0,0.3)" }}>
              {label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="rounded-[3px] bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {badge}
              </span>
            )}
            <span className="rounded-[3px] bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
              {duration}
            </span>
            <span className="rounded-[3px] bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
              {type}
            </span>
          </div>
        </div>
      </div>

      {/* C-body: left wall + inserts */}
      <div className="flex">
        <div className="relative shrink-0" style={{ ...woodStyle, width: 16 }}>
          <div className="absolute inset-y-0 right-0 w-[1px] bg-black/10" />
        </div>
        <div className="flex-1 bg-cm-surface py-1.5 pl-1.5 pr-2">
          <div className="flex flex-col gap-1">
            {inserts.map((insert, idx) => {
              const IconComp = insertIcons[insert.icon] || BookOpen;
              const ic = insertColors[idx % insertColors.length];
              const iGrain = woodGrain("rgba(0,0,0,0.07)");
              return (
                <div
                  key={idx}
                  className="relative flex items-center gap-2 rounded-[3px] px-2.5 py-1.5 text-white"
                  style={{ backgroundColor: ic.base, backgroundImage: iGrain }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-[3px]" style={{ backgroundColor: ic.dark }} />
                  <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-[3px] bg-white/15" />
                  <IconComp className="relative h-3 w-3 shrink-0 text-white/70" />
                  <span className="relative text-[11px] font-medium" style={{ textShadow: "0 1px 1px rgba(0,0,0,0.2)" }}>
                    {insert.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative rounded-b-[4px] px-3 py-1.5" style={woodStyle}>
        <div className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-[4px]" style={{ backgroundColor: w.dark }} />
      </div>
    </div>
  );
}

function TeacherStatCard({
  label,
  value,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
}) {
  return (
    <div className="rounded-cm-button border border-cm-border bg-cm-surface p-3">
      <div className="text-cm-caption text-cm-text-hint">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-xl font-bold text-cm-text-primary">{value}</span>
        <span className={`text-[11px] font-medium ${trendUp ? "text-cm-teal" : "text-cm-text-hint"}`}>
          {trend === "same" ? "—" : trend}
          {trendUp && " ↑"}
        </span>
      </div>
    </div>
  );
}
