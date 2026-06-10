"use client";

import React from "react";
import { motion } from "framer-motion";

// A liquid, animated glass surface for heading-only usage.
export function LiquidGlass({ className = "", children, style = {}, transparent = false }) {
  const base = transparent
    ? "relative rounded-[24px] bg-transparent border-none ring-0 shadow-none overflow-hidden"
    : "relative rounded-[24px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] backdrop-blur-[20px] saturate-180 shadow-[0_8px_32px_0_rgba(31,38,135,0.2),inset_0_4px_12px_rgba(255,255,255,0.4),inset_0_-4px_12px_rgba(0,0,0,0.05)] ring-1 ring-inset ring-white/15 overflow-hidden";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={base + " " + className}
      style={style}
    >
      <div aria-hidden className="liquid-blob" />
      <div aria-hidden className="liquid-specular" />
      <div aria-hidden className="liquid-sheen" />
      <div aria-hidden className="liquid-edge" />

      <div className="relative block w-full">{children}</div>
    </motion.div>
  );
}

export default LiquidGlass;
