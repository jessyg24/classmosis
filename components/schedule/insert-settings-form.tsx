"use client";

import type { Insert } from "@/types/database";
import { getSubRoutineDef } from "@/types/subroutine-catalog";
import { useScheduleStore } from "@/stores/schedule-store";
import { Link2, FileText, Brain, PenLine, MessageCircle } from "lucide-react";

/**
 * Type-specific settings form for sub-routine inserts.
 * Renders different fields based on what the sub-routine supports:
 * - Writing prompt → prompt text, rubric toggle
 * - External program → URL, platform name
 * - Practice problems → link to math generator or practice set
 * - Independent/partner/group work → instructions, submission toggle
 * - Exit ticket → question text
 * - Video/multimedia → URL
 * - Read aloud / shared reading → passage text or URL
 * - Discussion → topic/question
 */

interface Props {
  insert: Insert;
  blockId: string;
}

export default function InsertSettingsForm({ insert, blockId }: Props) {
  const { updateInsert } = useScheduleStore();
  const subDef = getSubRoutineDef(insert.type);
  const settings = (insert.settings || {}) as Record<string, string | boolean | number | null>;

  const update = (key: string, value: string | boolean | number | null) => {
    updateInsert(blockId, insert.id, {
      settings: { ...settings, [key]: value },
    });
  };

  const inputClass = "w-full px-cm-3 py-cm-2 text-cm-body border border-cm-border rounded-cm-button bg-cm-white focus:outline-none focus:ring-2 focus:ring-cm-teal/30 focus:border-cm-teal";
  const textareaClass = `${inputClass} resize-none`;
  const labelClass = "text-cm-caption text-cm-text-secondary block mb-1";
  const hintClass = "text-[10px] text-cm-text-hint mt-1";

  // Determine which settings to show based on insert type
  const type = insert.type;

  // ── Writing Prompt / Modeled Writing / Writing Time ──────────
  if (["writing_prompt", "modeled_writing", "writing_time", "writing"].includes(type)) {
    return (
      <div className="space-y-cm-4">
        <SectionHeader icon={<PenLine className="h-3.5 w-3.5" />} label="Writing Prompt" />
        <div>
          <label className={labelClass}>Prompt / Instructions</label>
          <textarea
            value={(settings.prompt as string) || ""}
            onChange={(e) => update("prompt", e.target.value)}
            rows={4}
            placeholder="Write about a time when..."
            className={textareaClass}
          />
          <p className={hintClass}>Students will see this prompt and write their response.</p>
        </div>
        <div>
          <label className={labelClass}>Word minimum (optional)</label>
          <input
            type="number"
            min={0}
            max={1000}
            value={(settings.word_min as number) || ""}
            placeholder="No minimum"
            onChange={(e) => update("word_min", e.target.value ? parseInt(e.target.value) : null)}
            className={inputClass}
          />
        </div>
        <ToggleField
          label="Accept student submissions"
          value={settings.accept_submissions !== false}
          onChange={(v) => update("accept_submissions", v)}
        />
        <ToggleField
          label="Coin reward on submit"
          value={!!settings.coin_reward}
          onChange={(v) => update("coin_reward", v)}
        />
      </div>
    );
  }

  // ── External Program Link ────────────────────────────────────
  if (["external_program", "video_media"].includes(type)) {
    return (
      <div className="space-y-cm-4">
        <SectionHeader icon={<Link2 className="h-3.5 w-3.5" />} label="External Link" />
        <div>
          <label className={labelClass}>URL</label>
          <input
            type="url"
            value={(settings.url as string) || ""}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://www.brainpop.com/..."
            className={inputClass}
          />
          <p className={hintClass}>Students will see a button to open this link.</p>
        </div>
        <div>
          <label className={labelClass}>Platform name (optional)</label>
          <input
            type="text"
            value={(settings.platform_name as string) || ""}
            onChange={(e) => update("platform_name", e.target.value)}
            placeholder="BrainPOP, Khan Academy, Edpuzzle..."
            className={inputClass}
          />
        </div>
        {type === "video_multimedia" && (
          <div>
            <label className={labelClass}>Teacher notes for students</label>
            <textarea
              value={(settings.instructions as string) || ""}
              onChange={(e) => update("instructions", e.target.value)}
              rows={2}
              placeholder="Watch the video and be ready to discuss..."
              className={textareaClass}
            />
          </div>
        )}
      </div>
    );
  }

  // ── Practice Problems / Math Facts ───────────────────────────
  if (["practice_problems", "word_work", "fluency_practice", "practice"].includes(type)) {
    return (
      <div className="space-y-cm-4">
        <SectionHeader icon={<Brain className="h-3.5 w-3.5" />} label="Practice Settings" />
        <div>
          <label className={labelClass}>Practice type</label>
          <select
            value={(settings.practice_type as string) || "math_facts"}
            onChange={(e) => update("practice_type", e.target.value)}
            className={inputClass}
          >
            <option value="math_facts">Math Facts (auto-generated)</option>
            <option value="practice_set">Linked Practice Set</option>
            <option value="custom_instructions">Custom Instructions</option>
          </select>
        </div>
        {settings.practice_type === "math_facts" || !settings.practice_type ? (
          <>
            <div>
              <label className={labelClass}>Operations</label>
              <div className="flex flex-wrap gap-1.5">
                {["addition", "subtraction", "multiplication", "division"].map((op) => {
                  const ops = ((settings.math_operations as string) || "addition,subtraction").split(",");
                  const active = ops.includes(op);
                  return (
                    <button
                      key={op}
                      type="button"
                      onClick={() => {
                        const next = active ? ops.filter((o) => o !== op) : [...ops, op];
                        update("math_operations", next.filter(Boolean).join(",") || "addition");
                      }}
                      className={`px-2 py-1 rounded-cm-badge text-[11px] font-medium transition-colors ${
                        active ? "bg-cm-teal-light text-cm-teal-dark border border-cm-teal/30" : "bg-cm-white text-cm-text-hint border border-cm-border"
                      }`}
                    >
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className={labelClass}>Difficulty (1-5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={(settings.math_difficulty as number) || 2}
                onChange={(e) => update("math_difficulty", Number(e.target.value))}
                className="w-full accent-cm-teal"
              />
              <div className="flex justify-between text-[10px] text-cm-text-hint">
                <span>K-1</span><span>2-3</span><span>3-4</span><span>4-5</span><span>5+</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Problem count</label>
              <input
                type="number"
                min={5}
                max={30}
                value={(settings.math_count as number) || 15}
                onChange={(e) => update("math_count", Math.max(5, Math.min(30, parseInt(e.target.value) || 15)))}
                className={inputClass}
              />
            </div>
          </>
        ) : settings.practice_type === "custom_instructions" ? (
          <div>
            <label className={labelClass}>Instructions</label>
            <textarea
              value={(settings.instructions as string) || ""}
              onChange={(e) => update("instructions", e.target.value)}
              rows={3}
              placeholder="Complete problems 1-20 on page 45..."
              className={textareaClass}
            />
          </div>
        ) : null}
        <ToggleField
          label="Coin reward on complete"
          value={settings.coin_reward !== false}
          onChange={(v) => update("coin_reward", v)}
        />
      </div>
    );
  }

  // ── Exit Ticket / Assessment / Quiz ──────────────────────────
  if (["exit_ticket", "quiz_check", "assessment"].includes(type)) {
    return (
      <div className="space-y-cm-4">
        <SectionHeader icon={<FileText className="h-3.5 w-3.5" />} label="Assessment" />
        <div>
          <label className={labelClass}>Question / Prompt</label>
          <textarea
            value={(settings.question as string) || ""}
            onChange={(e) => update("question", e.target.value)}
            rows={3}
            placeholder="What was the main idea of today's lesson?"
            className={textareaClass}
          />
          <p className={hintClass}>Students will see this and submit a response.</p>
        </div>
        <ToggleField
          label="Accept student submissions"
          value={settings.accept_submissions !== false}
          onChange={(v) => update("accept_submissions", v)}
        />
        <ToggleField
          label="Coin reward on submit"
          value={!!settings.coin_reward}
          onChange={(v) => update("coin_reward", v)}
        />
      </div>
    );
  }

  // ── Discussion / Think-Pair-Share / Socratic ──────────────────
  if (["class_discussion", "think_pair_share", "socratic_seminar", "fishbowl", "gallery_walk", "discussion"].includes(type)) {
    return (
      <div className="space-y-cm-4">
        <SectionHeader icon={<MessageCircle className="h-3.5 w-3.5" />} label="Discussion" />
        <div>
          <label className={labelClass}>Discussion topic / question</label>
          <textarea
            value={(settings.topic as string) || ""}
            onChange={(e) => update("topic", e.target.value)}
            rows={3}
            placeholder="How do the characters change from the beginning to the end?"
            className={textareaClass}
          />
          <p className={hintClass}>Displayed on the projector and student portals during this block.</p>
        </div>
      </div>
    );
  }

  // ── Reading (read aloud, shared reading, independent reading) ─
  if (["read_aloud", "shared_reading", "independent_reading", "read_aloud_discussion", "reading"].includes(type)) {
    return (
      <div className="space-y-cm-4">
        <SectionHeader icon={<FileText className="h-3.5 w-3.5" />} label="Reading" />
        <div>
          <label className={labelClass}>Text / Passage title</label>
          <input
            type="text"
            value={(settings.passage_title as string) || ""}
            onChange={(e) => update("passage_title", e.target.value)}
            placeholder="Chapter 3: The Water Cycle"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Page range or instructions (optional)</label>
          <input
            type="text"
            value={(settings.pages as string) || ""}
            onChange={(e) => update("pages", e.target.value)}
            placeholder="Pages 42-48"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Link to text (optional)</label>
          <input
            type="url"
            value={(settings.url as string) || ""}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>
    );
  }

  // ── Independent / Partner / Group / Project Work ──────────────
  if (["independent_work", "partner_work", "small_group_work", "project_work", "centers_stations"].includes(type)) {
    return (
      <div className="space-y-cm-4">
        <SectionHeader icon={<FileText className="h-3.5 w-3.5" />} label="Work Instructions" />
        <div>
          <label className={labelClass}>Instructions for students</label>
          <textarea
            value={(settings.instructions as string) || ""}
            onChange={(e) => update("instructions", e.target.value)}
            rows={4}
            placeholder="Complete the graphic organizer comparing..."
            className={textareaClass}
          />
          <p className={hintClass}>Students will see these instructions on their portal.</p>
        </div>
        <ToggleField
          label="Accept student submissions"
          value={!!settings.accept_submissions}
          onChange={(v) => update("accept_submissions", v)}
        />
        <ToggleField
          label="Coin reward on complete"
          value={!!settings.coin_reward}
          onChange={(v) => update("coin_reward", v)}
        />
      </div>
    );
  }

  // ── Fallback: generic settings for any insert ─────────────────
  const hasSupports = subDef?.supports;
  return (
    <div className="space-y-cm-4">
      <div>
        <label className={labelClass}>Instructions / Notes</label>
        <textarea
          value={(settings.instructions as string) || ""}
          onChange={(e) => update("instructions", e.target.value)}
          rows={3}
          placeholder="What should students do during this time?"
          className={textareaClass}
        />
      </div>
      {hasSupports?.submission && (
        <ToggleField
          label="Accept student submissions"
          value={!!settings.accept_submissions}
          onChange={(v) => update("accept_submissions", v)}
        />
      )}
      {hasSupports?.economy_trigger && (
        <ToggleField
          label="Coin reward"
          value={!!settings.coin_reward}
          onChange={(v) => update("coin_reward", v)}
        />
      )}
    </div>
  );
}

// ── Reusable UI bits ────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-cm-overline text-cm-text-hint uppercase">
      {icon}
      {label}
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-cm-caption text-cm-text-secondary">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-cm-teal" : "bg-cm-border-med"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
