"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

export function AboutSection() {
  return (
    <section id="about" className="max-w-3xl w-[92vw] mx-auto px-3">
      <GlassCard className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400/80 to-sky-400/80 ring-2 ring-white/20" />
            <div className="text-sm sm:text-base">
              <span className="font-semibold text-white">Krishna Kumar</span>
              <span className="text-white/60"> • Software Developer</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
            <span className="rounded-full px-2 py-1 bg-white/10 ring-1 ring-white/15">Next.js</span>
            <span className="rounded-full px-2 py-1 bg-white/10 ring-1 ring-white/15">TypeScript</span>
            <span className="rounded-full px-2 py-1 bg-white/10 ring-1 ring-white/15">Node.js</span>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

export default AboutSection;
