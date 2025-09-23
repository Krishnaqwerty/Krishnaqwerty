"use client";

import React from "react";
import { GlassCard } from "./GlassCard";

export default function HeadingCompact() {
  return (
    <div className="max-w-3xl w-[92vw] mx-auto px-3">
      <GlassCard className="px-4 py-2">
        <p className="text-base sm:text-lg font-medium bg-gradient-to-r from-white/85 via-slate-200/85 to-sky-200/85 bg-clip-text text-transparent">
          Software Developer • Full‑stack • Building delightful web experiences.
        </p>
      </GlassCard>
    </div>
  );
}
