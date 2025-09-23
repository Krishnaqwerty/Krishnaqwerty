"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

export function AboutSection() {
  return (
    <section id="about" className="w-full max-w-3xl mx-auto px-3">
      <GlassCard className="w-full px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400/80 to-sky-400/80 ring-2 ring-white/20" />
            <div className="text-sm sm:text-base">
              <span className="font-semibold text-white">Krishna Kumar</span>
              <span className="text-white/60"> • Software Developer</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-white/70">
            <span className="rounded-full px-2 py-1 bg-white/10 ring-1 ring-white/15">Next.js</span>
            <span className="rounded-full px-2 py-1 bg-white/10 ring-1 ring-white/15">TypeScript</span>
            <span className="rounded-full px-2 py-1 bg-white/10 ring-1 ring-white/15">Node.js</span>
          </div>
        </div>

        {/* Summary */}
        <p className="mt-2 text-sm text-white/85 leading-relaxed">
          Full‑stack and Android developer focused on building scalable, user‑centric products. I work across
          the stack with <span className="text-white">Next.js</span>, <span className="text-white">TypeScript</span>, and <span className="text-white">Node.js</span>,
          and build mobile features with <span className="text-white">Kotlin/Java</span>. I’m an <span className="text-white">AI & ML</span> enthusiast who enjoys
          clean architecture, performance tuning, and thoughtful developer experience.
        </p>

        {/* Tech Stack */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-white/80">
          {[
            'Next.js','React','TypeScript','JavaScript','Node.js','Express',
            'Python','AI/ML','Kotlin','Java','Android','Tailwind CSS',
            'PostgreSQL','MongoDB','REST/GraphQL','Docker','Git'
          ].map((t) => (
            <span key={t} className="rounded-full px-2 py-1 bg-white/10 ring-1 ring-white/15 whitespace-nowrap">{t}</span>
          ))}
        </div>

        {/* Hobbies */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-white/70 mr-1">Hobbies:</span>
          {['Yoga','Astrology','Space Science','Biology','Research orientation'].map((h) => (
            <span key={h} className="rounded-full px-2 py-1 bg-white/10 ring-1 ring-white/15 text-white/85 whitespace-nowrap">{h}</span>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

export default AboutSection;
