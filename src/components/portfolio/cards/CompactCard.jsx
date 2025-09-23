"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CompactCard({ title, subtitle, desc, footer, href }) {
  return (
    <motion.a
      href={href}
      target={href && href.startsWith("http") ? "_blank" : undefined}
      rel={href && href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group block rounded-xl border border-white/15 bg-white/5 ring-1 ring-inset ring-white/10 backdrop-blur-md shadow-[0_12px_30px_-15px_rgba(0,0,0,0.6)] hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]"
    >
      <div className="p-4">
        {title && <div className="text-sm font-semibold leading-tight line-clamp-2">{title}</div>}
        {subtitle && <div className="text-[11px] text-white/70 mt-0.5 line-clamp-1">{subtitle}</div>}
        {desc && <div className="text-[12px] text-white/80 mt-2 line-clamp-3">{desc}</div>}
        {footer && <div className="mt-2 text-[10px] text-white/60 flex flex-wrap gap-1">{footer}</div>}
      </div>
    </motion.a>
  );
}
