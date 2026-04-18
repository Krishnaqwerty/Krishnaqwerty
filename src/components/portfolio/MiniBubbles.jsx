"use client";

import React from "react";
import { motion } from "framer-motion";
import { profile } from "@/lib/profile";

export function MiniIdentity() {
  return (
    <motion.div
      className="absolute left-4 bottom-6 md:left-6 md:bottom-8 pointer-events-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="rounded-full px-4 py-2 bg-white/10 backdrop-blur-md ring-1 ring-white/15 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)]">
        <span className="text-sm font-semibold bg-gradient-to-r from-red-300 via-green-300 to-blue-300 bg-clip-text text-transparent">{profile.name}</span>
        <span className="text-xs bg-gradient-to-r from-red-300 via-green-300 to-blue-300 bg-clip-text text-transparent"> • {profile.role}</span>
      </div>
    </motion.div>
  );
}

export function MiniAbout() {
  return (
    <motion.div
      className="absolute left-4 bottom-20 md:left-6 md:bottom-24 pointer-events-auto max-w-[280px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <div className="rounded-2xl px-3 py-2 bg-white/10 backdrop-blur-md ring-1 ring-white/15 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] text-xs leading-snug">
        {profile.summary} Building delightful web experiences with Next.js, TypeScript, and Node.js.
      </div>
    </motion.div>
  );
}
