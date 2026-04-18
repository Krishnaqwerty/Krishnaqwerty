"use client";

import React from "react";
import { GlassCard } from "./GlassCard";
import { profile } from "@/lib/profile";

export function AboutSection() {
  return (
    <section id="about" className="w-full max-w-[760px]">
      <GlassCard className="w-full px-5 py-4 md:px-6 md:py-5 bg-black/38 border-white/20">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/55">
          <span>About</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        <p className="mt-3 text-base md:text-[1.05rem] leading-relaxed text-white/88">
          <span className="font-medium text-white">{profile.name}</span>
          <span className="text-white/60"> • {profile.role}</span>
          <span className="text-white/78"> — Full-stack engineer building scalable products and AI-powered applications with clean architecture and performance-focused execution.</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/72">
          <span className="rounded-full px-2.5 py-1 bg-white/8 ring-1 ring-white/15">Next.js</span>
          <span className="rounded-full px-2.5 py-1 bg-white/8 ring-1 ring-white/15">TypeScript</span>
          <span className="rounded-full px-2.5 py-1 bg-white/8 ring-1 ring-white/15">Node.js</span>
        </div>
      </GlassCard>
    </section>
  );
}

export default AboutSection;
