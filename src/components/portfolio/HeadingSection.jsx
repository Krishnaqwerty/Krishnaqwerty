"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { LiquidGlass } from "./LiquidGlass";
import { useFrame } from "@/components/ui/avatar";
import { profile } from "@/lib/profile";

export function HeadingSection({ morphStart = 50, morphEnd = 80 }) {
  const { currentFrame } = useFrame();
  const t = useMemo(() => {
    const clamped = Math.min(Math.max(currentFrame, morphStart), morphEnd);
    return (clamped - morphStart) / Math.max(1, morphEnd - morphStart);
  }, [currentFrame, morphStart, morphEnd]);

  const scale = 1 - 0.3 * t; // shrink slightly
  const padTop = 0; // always 0 so content can touch the top
  const padBottom = 12; // keep slight bottom padding
  const padX = 24 - 10 * t; // px
  const radius = 9999; // px
  const headingY = 0 + 6 * t;
  const showFinal = t > 0; // on reaching top (morphStart), switch to final content

  // Slight additional text-size reduction during the top morph
  const lerp = (a, b, u) => a + (b - a) * u;
  const sizeMinPx = lerp(24, 22, t);
  const sizeVw = lerp(5.2, 4.8, t);
  const sizeMaxPx = lerp(40, 36, t);
  const dynamicClamp = `clamp(${sizeMinPx}px, ${sizeVw}vw, ${sizeMaxPx}px)`;

  return (
  <section id="heading" className="inline-block w-auto mx-auto px-0 pt-0 text-center">
      <LiquidGlass
    className="overflow-visible w-max mx-auto" // Added w-max to wrap text, mx-auto to keep it centered
  style={{ 
    paddingTop: showFinal ? 0 : padTop, 
    paddingBottom: showFinal ? 0 : padBottom, 
    paddingLeft: showFinal ? 0 : padX, 
    paddingRight: showFinal ? 0 : padX, 
    borderRadius: radius 
  }}
      >
        <motion.div style={{ scale, transformOrigin: "top center" }}>
          <motion.h1
            style={{ y: headingY, marginTop: 8 * (1 - t), fontSize: dynamicClamp }}
            transition={{ duration: 0.2 }}
            className={`mt-0 font-semibold bg-gradient-to-r from-red-200 via-emerald-200 to-sky-200 bg-clip-text text-transparent whitespace-nowrap drop-shadow-[0_2px_16px_rgba(255,255,255,0.18)] ${showFinal ? "-mx-32" : ""}`}
          >
            {showFinal
              ? "Accelerating API Performance & Building Intelligent Systems"
              : `${profile.name} • ${profile.role}`}
          </motion.h1>
        </motion.div>
      </LiquidGlass>
    </section>
  );
}

export default HeadingSection;
