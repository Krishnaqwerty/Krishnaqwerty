"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { useFrame } from "@/components/ui/avatar";
import { profile } from "@/lib/profile";

export default function MorphHeader({ start = 1, end = 60 }) {
  const { currentFrame } = useFrame();

  const t = useMemo(() => {
    const clamped = Math.min(Math.max(currentFrame, start), end);
    return (clamped - start) / Math.max(1, end - start);
  }, [currentFrame, start, end]);

  // Interpolate values for a smooth morph
  const scale = 1 - 0.3 * t; // shrink a bit
  const padY = 24 - 14 * t; // px
  const padX = 24 - 10 * t; // px
  const radius = 20 - 6 * t; // px
  const headingOpacity = 1 - t; // fades out
  const headingY = 0 + 6 * t; // slight settle
  const subOpacity = Math.min(1, t * 1.2); // fades in earlier
  const subY = 10 - 10 * t; // rises into place

  return (
    <div className="w-[92vw] max-w-5xl">
      <GlassCard
        className="overflow-hidden"
        style={{ paddingTop: padY, paddingBottom: padY, paddingLeft: padX, paddingRight: padX, borderRadius: radius }}
      >
        <motion.div style={{ scale }}>
          {/* Full heading morphs out */}
          <motion.h1
            style={{ opacity: headingOpacity, y: headingY }}
            transition={{ duration: 0.2 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
          >
              Hi, I'm <span className="bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">{profile.name}</span>
          </motion.h1>
          {/* Sub-heading morphs in */}
          <motion.p
            style={{ opacity: subOpacity, y: subY }}
            transition={{ duration: 0.25 }}
            className="mt-2 text-base sm:text-lg font-medium bg-gradient-to-r from-white/85 via-slate-200/85 to-sky-200/85 bg-clip-text text-transparent"
          >
            {profile.role} • Full‑stack • Building delightful web experiences.
          </motion.p>
        </motion.div>
      </GlassCard>
    </div>
  );
}
