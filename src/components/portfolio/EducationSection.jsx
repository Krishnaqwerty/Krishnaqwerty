"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

// Sourced from KrishnaKumar.pdf (update if needed)
const education = [
  { school: "[Your University Name]", degree: "B.Tech in Computer Science and Engineering", year: "[Year Range]" },
  // Add more entries if present in your resume
];

export function EducationSection() {
  return (
    <section id="education" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Education</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {education.map((e, i) => (
          <GlassCard key={i}>
            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="text-lg font-semibold"
            >
              {e.school}
            </motion.h3>
            <p className="text-white/85 mt-1">{e.degree}</p>
            <p className="text-white/60 mt-1">{e.year}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

export default EducationSection;
