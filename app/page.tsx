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

            {/* Mock schedule blocks */}
            <div className="flex flex-col gap-3">
              <ScheduleBlock
                color="teal"
                label="Morning Meeting"
                time="8:00 – 8:20"
                type="Routine"
                duration="20 min"
              />
              <ScheduleBlock
                color="blue"
                label="ELA — Main Idea & Details"
                time="8:20 – 9:15"
                type="Academic"
                duration="55 min"
                hasAssignment
              />
              <ScheduleBlock
                color="amber"
                label="Exit Ticket — Summarizing"
                time="9:15 – 9:25"
                type="Assessment"
                duration="10 min"
              />
              <ScheduleBlock
                color="blue"
                label="Math — Fractions on a Number Line"
                time="9:30 – 10:20"
                type="Academic"
                duration="50 min"
                hasAssignment
                hasPractice
              />
              <ScheduleBlock
                color="purple"
                label="Mystery Student Reveal"
                time="2:45 – 2:55"
                type="Economy"
                duration="10 min"
              />
              <ScheduleBlock
                color="teal"
                label="Closing Circle"
                time="2:55 – 3:10"
                type="Routine"
                duration="15 min"
              />
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="absolute -left-4 top-12 hidden rounded-cm-card border border-cm-border bg-cm-surface p-3 shadow-lg lg:block">
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

          <div className="absolute -right-4 top-32 hidden rounded-cm-card border border-cm-border bg-cm-surface p-3 shadow-lg lg:block">
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
              No email. No password. Just a code and a PIN &#8212; that&apos;s it.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
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
              title="Enter PIN"
              description="4-digit PIN — no email needed. Works for K–2."
            />
            <StepCard
              step={4}
              title="Start learning"
              description="See the current block, timer, assignments, and coins."
            />
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

          <div className="grid items-start gap-6 md:grid-cols-2 lg:gap-8">
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

            {/* Pro tier */}
            <div className="relative rounded-cm-card border-2 border-cm-teal bg-cm-white p-8">
              <div className="absolute -top-3 right-6 rounded-full bg-cm-teal px-3 py-0.5 text-cm-caption font-medium text-white">
                7-day free trial
              </div>

              <div className="mb-1 text-cm-overline font-medium uppercase tracking-wider text-cm-teal">
                Pro
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-cm-text-primary">
                  $19.99
                </span>
                <span className="text-cm-body text-cm-text-hint">/month</span>
              </div>
              <p className="mb-1 text-cm-body text-cm-text-secondary">
                The full classroom operating system. Unlimited everything.
              </p>
              <p className="mb-6 text-cm-caption text-cm-teal">
                Or $119/year — save over 50%
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

function ScheduleBlock({
  color,
  label,
  time,
  type,
  duration,
  hasAssignment,
  hasPractice,
}: {
  color: string;
  label: string;
  time: string;
  type: string;
  duration: string;
  hasAssignment?: boolean;
  hasPractice?: boolean;
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    teal: {
      bg: "bg-cm-teal-light",
      border: "border-l-cm-teal",
      text: "text-cm-teal-dark",
      badge: "bg-cm-teal/10 text-cm-teal-dark",
    },
    blue: {
      bg: "bg-cm-blue-light",
      border: "border-l-cm-blue",
      text: "text-cm-blue-dark",
      badge: "bg-cm-blue/10 text-cm-blue-dark",
    },
    amber: {
      bg: "bg-cm-amber-light",
      border: "border-l-cm-amber",
      text: "text-cm-amber-dark",
      badge: "bg-cm-amber/10 text-cm-amber-dark",
    },
    purple: {
      bg: "bg-cm-purple-light",
      border: "border-l-cm-purple",
      text: "text-cm-purple-dark",
      badge: "bg-cm-purple/10 text-cm-purple-dark",
    },
    coral: {
      bg: "bg-cm-coral-light",
      border: "border-l-cm-coral",
      text: "text-cm-coral-dark",
      badge: "bg-cm-coral/10 text-cm-coral-dark",
    },
    pink: {
      bg: "bg-cm-pink-light",
      border: "border-l-cm-pink",
      text: "text-cm-pink-dark",
      badge: "bg-cm-pink/10 text-cm-pink-dark",
    },
  };

  const c = colorMap[color] || colorMap.teal;

  return (
    <div
      className={`flex items-center justify-between rounded-cm-button border-l-[3px] ${c.border} ${c.bg} px-4 py-3`}
    >
      <div className="flex items-center gap-4">
        <div className="hidden w-24 text-cm-caption text-cm-text-hint sm:block">
          {time}
        </div>
        <div>
          <div className="text-cm-body font-medium text-cm-text-primary">
            {label}
          </div>
          <div className="flex items-center gap-2">
            {hasAssignment && (
              <span className="text-cm-caption text-cm-text-hint">
                Assignment attached
              </span>
            )}
            {hasPractice && (
              <span className="text-cm-caption text-cm-text-hint">
                + Practice
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-cm-caption text-cm-text-hint sm:block">
          {duration}
        </span>
        <span
          className={`rounded-cm-badge px-2 py-0.5 text-cm-caption font-medium ${c.badge}`}
        >
          {type}
        </span>
      </div>
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
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cm-teal-light text-lg font-semibold text-cm-teal">
        {step}
      </div>
      <h3 className="mb-2 text-cm-label font-semibold text-cm-text-primary">
        {title}
      </h3>
      <p className="text-cm-body text-cm-text-secondary">{description}</p>
    </div>
  );
}
