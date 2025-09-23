"use client";

import React, { useMemo } from "react";
import RotatingPalette from "./RotatingPalette";
import CompactCard from "./cards/CompactCard";

export function ProjectsPalette({ repos = [], centerX = "82vw", centerY = "55vh" }) {
  const items = useMemo(() =>
    repos.slice(0, 10).map((r) => (
      <CompactCard
        key={r.id}
        title={r.name}
        subtitle={r.language}
        desc={r.description}
        href={r.html_url}
        footer={(r.topics || []).slice(0, 4).map((t) => (
          <span key={t} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] ring-1 ring-white/15">{t}</span>
        ))}
      />
    )),
  [repos]);

  return <RotatingPalette items={items} centerX={centerX} centerY={centerY} />;
}

// EducationPalette is removed from the main scene per latest requirements.
