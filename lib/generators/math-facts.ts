/**
 * Algorithmic math facts generator.
 * No AI, no API calls — pure randomized problem generation with known answers.
 * Supports K-8 grade-appropriate difficulty.
 */

export type MathOperation = "addition" | "subtraction" | "multiplication" | "division";

export interface MathFactsConfig {
  operations: MathOperation[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  problemCount: number;
  allowNegatives: boolean;
  includeWordProblems: boolean;
}

export interface GeneratedProblem {
  id: string;
  prompt: string;
  displayExpression: string; // e.g. "7 × 8 = ___"
  correctAnswer: number;
  acceptableAnswers: string[]; // e.g. ["56", "56.0"]
  operation: MathOperation;
  difficulty: number;
  wordProblem: string | null;
  hint: string | null;
}

export interface GeneratedWorksheet {
  id: string;
  title: string;
  problems: GeneratedProblem[];
  config: MathFactsConfig;
  generatedAt: string;
  totalPoints: number;
}

// ── Difficulty ranges ───────────────────────────────────────────

interface DifficultyRange {
  min: number;
  max: number;
}

const ADDITION_RANGES: Record<number, { a: DifficultyRange; b: DifficultyRange }> = {
  1: { a: { min: 1, max: 10 }, b: { min: 1, max: 10 } },       // K-1: single digit
  2: { a: { min: 2, max: 20 }, b: { min: 1, max: 20 } },       // 1-2: up to 20
  3: { a: { min: 10, max: 100 }, b: { min: 10, max: 100 } },    // 2-3: two digit
  4: { a: { min: 100, max: 1000 }, b: { min: 10, max: 999 } },  // 3-4: three digit
  5: { a: { min: 1000, max: 9999 }, b: { min: 100, max: 9999 } }, // 5+: large numbers
};

const SUBTRACTION_RANGES: Record<number, { a: DifficultyRange; b: DifficultyRange }> = {
  1: { a: { min: 2, max: 10 }, b: { min: 1, max: 10 } },
  2: { a: { min: 5, max: 20 }, b: { min: 1, max: 20 } },
  3: { a: { min: 20, max: 100 }, b: { min: 1, max: 99 } },
  4: { a: { min: 100, max: 1000 }, b: { min: 10, max: 999 } },
  5: { a: { min: 1000, max: 9999 }, b: { min: 100, max: 9999 } },
};

const MULTIPLICATION_RANGES: Record<number, { a: DifficultyRange; b: DifficultyRange }> = {
  1: { a: { min: 1, max: 5 }, b: { min: 1, max: 5 } },         // 2-3: basic facts
  2: { a: { min: 1, max: 10 }, b: { min: 1, max: 10 } },       // 3: times tables
  3: { a: { min: 2, max: 12 }, b: { min: 2, max: 12 } },       // 3-4: full times tables
  4: { a: { min: 10, max: 99 }, b: { min: 2, max: 12 } },      // 4-5: multi-digit × single
  5: { a: { min: 10, max: 99 }, b: { min: 10, max: 99 } },     // 5+: multi × multi
};

const DIVISION_RANGES: Record<number, { divisors: number[]; maxQuotient: number }> = {
  1: { divisors: [2, 3, 4, 5], maxQuotient: 5 },
  2: { divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10], maxQuotient: 10 },
  3: { divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], maxQuotient: 12 },
  4: { divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], maxQuotient: 50 },
  5: { divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25], maxQuotient: 100 },
};

// ── Word problem templates ──────────────────────────────────────

const WORD_PROBLEM_TEMPLATES: Record<MathOperation, string[]> = {
  addition: [
    "You have {a} stickers and your friend gives you {b} more. How many stickers do you have now?",
    "There are {a} books on the shelf. {b} more books are added. How many books are on the shelf?",
    "{a} students are on the bus. At the next stop, {b} more get on. How many are on the bus now?",
    "A farmer has {a} apples and picks {b} more. How many apples does the farmer have?",
  ],
  subtraction: [
    "You have {a} marbles and give {b} to a friend. How many do you have left?",
    "There are {a} birds on a wire. {b} fly away. How many are left?",
    "A baker made {a} cookies and sold {b}. How many cookies are left?",
    "You have {a} pages to read. You already read {b}. How many pages are left?",
  ],
  multiplication: [
    "There are {a} bags with {b} apples in each bag. How many apples are there in all?",
    "A classroom has {a} rows of desks with {b} desks in each row. How many desks total?",
    "You read {b} pages every day for {a} days. How many pages did you read?",
    "Each box has {b} crayons. You have {a} boxes. How many crayons do you have?",
  ],
  division: [
    "You have {a} stickers to share equally among {b} friends. How many does each friend get?",
    "A baker has {a} cookies and puts {b} in each box. How many boxes does she fill?",
    "There are {a} students split into {b} equal teams. How many on each team?",
    "{a} pencils are divided equally into {b} cups. How many pencils per cup?",
  ],
};

// ── Hint templates ──────────────────────────────────────────────

const HINTS: Record<MathOperation, string[]> = {
  addition: [
    "Try counting up from the bigger number.",
    "Break it into tens and ones, then add each part.",
    "You can use a number line — start at {a} and jump {b} spaces.",
  ],
  subtraction: [
    "Try counting back from {a}.",
    "Think: what plus {b} equals {a}?",
    "Break it into friendly numbers — subtract to the nearest ten first.",
  ],
  multiplication: [
    "Think of it as {a} groups of {b}.",
    "Try skip counting by {b}, do it {a} times.",
    "Use the commutative property: {a} × {b} is the same as {b} × {a}.",
  ],
  division: [
    "Think: {b} times what equals {a}?",
    "Try sharing {a} things into {b} equal groups.",
    "Use repeated subtraction — keep subtracting {b} from {a} and count how many times.",
  ],
};

// ── Helpers ─────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return crypto.randomUUID();
}

const OP_TITLES: Record<MathOperation, string> = {
  addition: "Addition",
  subtraction: "Subtraction",
  multiplication: "Multiplication",
  division: "Division",
};

// ── Problem generators ──────────────────────────────────────────

function generateAddition(difficulty: number, includeWord: boolean): GeneratedProblem {
  const range = ADDITION_RANGES[difficulty] || ADDITION_RANGES[1];
  const a = randInt(range.a.min, range.a.max);
  const b = randInt(range.b.min, range.b.max);
  const answer = a + b;

  return {
    id: uid(),
    prompt: `${a} + ${b}`,
    displayExpression: `${a} + ${b} = ___`,
    correctAnswer: answer,
    acceptableAnswers: [String(answer)],
    operation: "addition",
    difficulty,
    wordProblem: includeWord
      ? pickRandom(WORD_PROBLEM_TEMPLATES.addition).replace("{a}", String(a)).replace("{b}", String(b))
      : null,
    hint: pickRandom(HINTS.addition).replace("{a}", String(a)).replace("{b}", String(b)),
  };
}

function generateSubtraction(difficulty: number, allowNegatives: boolean, includeWord: boolean): GeneratedProblem {
  const range = SUBTRACTION_RANGES[difficulty] || SUBTRACTION_RANGES[1];
  let a = randInt(range.a.min, range.a.max);
  let b = randInt(range.b.min, Math.min(range.b.max, a));

  // Ensure a >= b unless negatives allowed
  if (!allowNegatives && b > a) {
    [a, b] = [b, a];
  }

  const answer = a - b;

  return {
    id: uid(),
    prompt: `${a} - ${b}`,
    displayExpression: `${a} − ${b} = ___`,
    correctAnswer: answer,
    acceptableAnswers: [String(answer)],
    operation: "subtraction",
    difficulty,
    wordProblem: includeWord
      ? pickRandom(WORD_PROBLEM_TEMPLATES.subtraction).replace("{a}", String(a)).replace("{b}", String(b))
      : null,
    hint: pickRandom(HINTS.subtraction).replace("{a}", String(a)).replace("{b}", String(b)),
  };
}

function generateMultiplication(difficulty: number, includeWord: boolean): GeneratedProblem {
  const range = MULTIPLICATION_RANGES[difficulty] || MULTIPLICATION_RANGES[1];
  const a = randInt(range.a.min, range.a.max);
  const b = randInt(range.b.min, range.b.max);
  const answer = a * b;

  return {
    id: uid(),
    prompt: `${a} × ${b}`,
    displayExpression: `${a} × ${b} = ___`,
    correctAnswer: answer,
    acceptableAnswers: [String(answer)],
    operation: "multiplication",
    difficulty,
    wordProblem: includeWord
      ? pickRandom(WORD_PROBLEM_TEMPLATES.multiplication).replace("{a}", String(a)).replace("{b}", String(b))
      : null,
    hint: pickRandom(HINTS.multiplication).replace("{a}", String(a)).replace("{b}", String(b)),
  };
}

function generateDivision(difficulty: number, includeWord: boolean): GeneratedProblem {
  const config = DIVISION_RANGES[difficulty] || DIVISION_RANGES[1];
  const divisor = pickRandom(config.divisors);
  const quotient = randInt(1, config.maxQuotient);
  const dividend = divisor * quotient; // Always clean division

  return {
    id: uid(),
    prompt: `${dividend} ÷ ${divisor}`,
    displayExpression: `${dividend} ÷ ${divisor} = ___`,
    correctAnswer: quotient,
    acceptableAnswers: [String(quotient)],
    operation: "division",
    difficulty,
    wordProblem: includeWord
      ? pickRandom(WORD_PROBLEM_TEMPLATES.division).replace("{a}", String(dividend)).replace("{b}", String(divisor))
      : null,
    hint: pickRandom(HINTS.division).replace("{a}", String(dividend)).replace("{b}", String(divisor)),
  };
}

// ── Main generator ──────────────────────────────────────────────

const GENERATORS: Record<MathOperation, (d: number, neg: boolean, word: boolean) => GeneratedProblem> = {
  addition: (d, _neg, w) => generateAddition(d, w),
  subtraction: (d, neg, w) => generateSubtraction(d, neg, w),
  multiplication: (d, _neg, w) => generateMultiplication(d, w),
  division: (d, _neg, w) => generateDivision(d, w),
};

export function generateMathWorksheet(config: MathFactsConfig): GeneratedWorksheet {
  const problems: GeneratedProblem[] = [];
  const seenExpressions = new Set<string>();

  for (let i = 0; i < config.problemCount; i++) {
    const operation = pickRandom(config.operations);
    const generator = GENERATORS[operation];

    // Try up to 10 times to get a unique problem
    let problem: GeneratedProblem | null = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generator(config.difficulty, config.allowNegatives, config.includeWordProblems);
      if (!seenExpressions.has(candidate.prompt)) {
        seenExpressions.add(candidate.prompt);
        problem = candidate;
        break;
      }
    }

    if (problem) {
      problems.push(problem);
    }
  }

  // Build title from operations
  const opNames = Array.from(new Set(config.operations)).map((op) => OP_TITLES[op]);
  const title = opNames.length === 1
    ? `${opNames[0]} Practice`
    : `Mixed Practice: ${opNames.join(", ")}`;

  return {
    id: uid(),
    title,
    problems,
    config,
    generatedAt: new Date().toISOString(),
    totalPoints: problems.length,
  };
}

// ── Grading ─────────────────────────────────────────────────────

export interface WorksheetResult {
  worksheetId: string;
  answers: Record<string, string>; // problemId → student answer
}

export interface GradedWorksheet {
  totalProblems: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  pctScore: number;
  results: Array<{
    problemId: string;
    studentAnswer: string;
    correctAnswer: number;
    isCorrect: boolean;
    displayExpression: string;
  }>;
}

export function gradeWorksheet(
  worksheet: GeneratedWorksheet,
  answers: Record<string, string>,
): GradedWorksheet {
  const results = worksheet.problems.map((problem) => {
    const raw = (answers[problem.id] || "").trim();
    const parsed = parseFloat(raw);
    const isCorrect = !isNaN(parsed) && parsed === problem.correctAnswer;

    return {
      problemId: problem.id,
      studentAnswer: raw,
      correctAnswer: problem.correctAnswer,
      isCorrect,
      displayExpression: problem.displayExpression,
    };
  });

  const correctCount = results.filter((r) => r.isCorrect).length;
  const skippedCount = results.filter((r) => r.studentAnswer === "").length;
  const incorrectCount = results.length - correctCount - skippedCount;

  return {
    totalProblems: results.length,
    correctCount,
    incorrectCount,
    skippedCount,
    pctScore: results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0,
    results,
  };
}

// ── Preset configs for common use cases ─────────────────────────

export const MATH_PRESETS: Record<string, { label: string; config: MathFactsConfig }> = {
  "addition-easy": {
    label: "Addition Facts (Easy)",
    config: { operations: ["addition"], difficulty: 1, problemCount: 15, allowNegatives: false, includeWordProblems: false },
  },
  "addition-medium": {
    label: "Addition Facts (Medium)",
    config: { operations: ["addition"], difficulty: 2, problemCount: 15, allowNegatives: false, includeWordProblems: false },
  },
  "subtraction-easy": {
    label: "Subtraction Facts (Easy)",
    config: { operations: ["subtraction"], difficulty: 1, problemCount: 15, allowNegatives: false, includeWordProblems: false },
  },
  "subtraction-medium": {
    label: "Subtraction Facts (Medium)",
    config: { operations: ["subtraction"], difficulty: 2, problemCount: 15, allowNegatives: false, includeWordProblems: false },
  },
  "multiplication-tables": {
    label: "Times Tables",
    config: { operations: ["multiplication"], difficulty: 2, problemCount: 20, allowNegatives: false, includeWordProblems: false },
  },
  "multiplication-advanced": {
    label: "Multiplication (Advanced)",
    config: { operations: ["multiplication"], difficulty: 3, problemCount: 15, allowNegatives: false, includeWordProblems: false },
  },
  "division-basic": {
    label: "Division Facts",
    config: { operations: ["division"], difficulty: 2, problemCount: 15, allowNegatives: false, includeWordProblems: false },
  },
  "mixed-easy": {
    label: "Mixed Facts (Easy)",
    config: { operations: ["addition", "subtraction"], difficulty: 1, problemCount: 20, allowNegatives: false, includeWordProblems: false },
  },
  "mixed-medium": {
    label: "Mixed Facts (Medium)",
    config: { operations: ["addition", "subtraction", "multiplication"], difficulty: 2, problemCount: 20, allowNegatives: false, includeWordProblems: false },
  },
  "mixed-all": {
    label: "All Operations",
    config: { operations: ["addition", "subtraction", "multiplication", "division"], difficulty: 3, problemCount: 20, allowNegatives: false, includeWordProblems: false },
  },
  "word-problems-easy": {
    label: "Word Problems (Easy)",
    config: { operations: ["addition", "subtraction"], difficulty: 1, problemCount: 10, allowNegatives: false, includeWordProblems: true },
  },
  "word-problems-medium": {
    label: "Word Problems (Medium)",
    config: { operations: ["addition", "subtraction", "multiplication", "division"], difficulty: 2, problemCount: 10, allowNegatives: false, includeWordProblems: true },
  },
};
