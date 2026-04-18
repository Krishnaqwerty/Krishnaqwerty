"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, PenTool } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { profile } from "@/lib/profile";

const iconMap = { Email: Mail, GitHub: Github, LinkedIn: Linkedin, Medium: PenTool };

export function SocialRail() {
  return (
    <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
      <GlassCard className="p-2">
        <ul className="flex flex-col gap-3">
          {profile.socialLinks.map((s) => {
            const Icon = iconMap[s.label];
            return (
            <li key={s.href}>
              <motion.a
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : "_self"}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                aria-label={s.label}
              >
                <Icon className="w-5 h-5 text-white/90" />
              </motion.a>
            </li>
          );})}
        </ul>
      </GlassCard>
    </div>
  );
}

export default SocialRail;
