"use client";

import Image from "next/image";

interface OsmoProps {
  size?: number;
  className?: string;
}

/**
 * Osmo — the friendly Classmosis AI buddy.
 * Used wherever AI features are surfaced to users.
 */
export default function Osmo({ size = 32, className = "" }: OsmoProps) {
  return (
    <Image
      src="/osmo.png"
      alt="Osmo"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}

/**
 * Osmo badge — small inline Osmo avatar with text label
 */
export function OsmoBadge({ label, size = 20 }: { label?: string; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Image src="/osmo.png" alt="Osmo" width={size} height={size} className="rounded-full" />
      {label && <span className="text-cm-caption text-cm-pink font-medium">{label}</span>}
    </span>
  );
}
