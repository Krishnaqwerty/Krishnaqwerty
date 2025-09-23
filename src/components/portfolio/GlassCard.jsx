"use client";

import { motion } from "framer-motion";
import React from "react";

// A reusable 3D glass card with tilt on hover
export function GlassCard({ className = "", children, transparent = false }) {
  const base = transparent
    ? "group relative rounded-2xl bg-transparent border-none ring-0 shadow-none "
    : "group relative rounded-2xl border border-white/15 bg-white/5 dark:bg-white/5 backdrop-blur-md shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/10 ";
  return (
    <motion.div
      whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={base + "[transform-style:preserve-3d] " + className}
    >
      {!transparent && (
        <>
          {/* subtle gradient sheen */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-white/0 to-white/10 opacity-60" />
          {/* border highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
        </>
      )}
  <div className="relative inline-block">{children}</div>
    </motion.div>
  );
}

export default GlassCard;
