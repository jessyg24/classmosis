"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bell, MapPin, Clock } from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  duration_minutes: number;
  location: string | null;
  provider: string | null;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pull_out: { label: "Pull-out", color: "text-cm-purple", bg: "bg-cm-purple-light" },
  support: { label: "Support", color: "text-cm-blue", bg: "bg-cm-blue-light" },
  therapy: { label: "Therapy", color: "text-cm-pink", bg: "bg-cm-pink-light" },
  enrichment: { label: "Enrichment", color: "text-cm-green", bg: "bg-cm-green-light" },
  assessment: { label: "Assessment", color: "text-cm-amber", bg: "bg-cm-amber-light" },
  custom: { label: "Event", color: "text-cm-teal", bg: "bg-cm-teal-light" },
};

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function MyEvents({ studentId }: { studentId: string }) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const stored = localStorage.getItem("classmosis_student");
    const headers: Record<string, string> = {};
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.token) headers["Authorization"] = `Bearer ${session.token}`;
      } catch { /* ignore */ }
    }

    fetch("/api/v1/student/schedule-events", { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return null;
  if (events.length === 0) return null;

  return (
    <Card className="p-cm-6 bg-cm-surface rounded-cm-card border-cm-border">
      <div className="flex items-center gap-cm-3 mb-3">
        <div className="w-8 h-8 bg-cm-purple-light rounded-cm-badge flex items-center justify-center">
          <Bell className="h-4 w-4 text-cm-purple" />
        </div>
        <span className="text-cm-overline text-cm-text-hint uppercase">Today&apos;s Events</span>
      </div>

      <div className="space-y-2">
        {events.map((event) => {
          const typeConfig = TYPE_LABELS[event.event_type] || TYPE_LABELS.custom;
          return (
            <div key={event.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-cm-button ${typeConfig.bg}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-cm-body font-medium ${typeConfig.color}`}>{event.title}</p>
                  <span className={`px-1.5 py-0.5 rounded-cm-badge text-[9px] font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                </div>
                {event.description && (
                  <p className="text-cm-caption text-cm-text-secondary mt-0.5">{event.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-cm-caption text-cm-text-hint">
                    <Clock className="h-3 w-3" />
                    {formatTime(event.start_time)} · {event.duration_minutes}m
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1 text-cm-caption text-cm-text-hint">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
