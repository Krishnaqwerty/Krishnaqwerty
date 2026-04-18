"use client";

import React, { useMemo } from "react";
import { motion, useViewportScroll } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function EducationTimeline({ educationItems = [] }) {
  // Sort items by year (most recent first)
  const sortedItems = useMemo(() => {
    return [...educationItems].sort((a, b) => {
      // Handle both raw objects and CompactCard components
      const aYear = a.year || a.props?.children?.[1]?.props?.children || "0";
      const bYear = b.year || b.props?.children?.[1]?.props?.children || "0";
      const aYearNum = parseInt(String(aYear).split('-')[1] || String(aYear));
      const bYearNum = parseInt(String(bYear).split('-')[1] || String(bYear));
      return bYearNum - aYearNum;
    });
  }, [educationItems]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.6,
      },
    },
  };

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.1,
      },
    },
    hover: {
      scale: 1.3,
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  };

  const lineVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: (custom) => ({
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: custom * 0.12 + 0.2,
        ease: "easeInOut",
      },
    }),
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    },
    hover: {
      y: -6,
      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.25)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.15,
        duration: 0.4,
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.5, 0, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 md:p-8">
      <motion.div
        className="relative w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Timeline Column */}
        <div className="relative space-y-12">
          {/* Animated vertical line background */}
          <svg
            className="absolute left-[30px] top-0 w-1 h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            {sortedItems.map((_, idx) => {
              const isLast = idx === sortedItems.length - 1;
              return (
                <motion.line
                  key={`line-${idx}`}
                  x1="0"
                  y1={idx === 0 ? "0" : `${idx * 96 + 20}px`}
                  x2="0"
                  y2={isLast ? `${(idx + 1) * 96 - 40}px` : `${(idx + 1) * 96 - 20}px`}
                  stroke="url(#gradientLine)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  custom={idx}
                  variants={lineVariants}
                  initial="hidden"
                  animate="visible"
                />
              );
            })}
            <defs>
              <linearGradient id="gradientLine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(248, 113, 113, 0.8)" />
                <stop offset="50%" stopColor="rgba(74, 222, 128, 0.7)" />
                <stop offset="100%" stopColor="rgba(96, 165, 250, 0.6)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timeline Items */}
          {sortedItems.map((item, idx) => {
            // Handle both raw objects and CompactCard components
            let titleText, yearText, degreeText;
            
            if (item.school) {
              // Raw object format
              titleText = item.school;
              yearText = item.year;
              degreeText = item.degree;
            } else {
              // CompactCard component format
              titleText = item.props?.children?.[0]?.props?.children || "School";
              yearText = item.props?.children?.[1]?.props?.children || "Year";
              degreeText = item.props?.children?.[2]?.props?.children || "Degree";
            }

            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={`timeline-item-${idx}`}
                className="relative flex items-center gap-8"
                variants={itemVariants}
              >
                {/* Timeline Dot with Pulse */}
                <motion.div
                  className="relative z-10 flex-shrink-0 flex items-center justify-center"
                  variants={dotVariants}
                  whileHover="hover"
                >
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute w-8 h-8 rounded-full border-2 border-red-400"
                    variants={pulseVariants}
                    initial="initial"
                    animate="animate"
                  />
                  {/* Main dot */}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-300 to-green-400 ring-3 ring-white/20 shadow-lg shadow-red-400/50 flex items-center justify-center z-20">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  {/* Icon */}
                  <motion.div
                    className="absolute -right-8 w-5 h-5 text-green-400"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                  >
                    <GraduationCap className="w-full h-full" />
                  </motion.div>
                </motion.div>

                {/* Content Card */}
                <motion.div
                  className="flex-1 group"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  {/* Card Background */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950/55">
                    {/* Animated gradient background - clipped by parent */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.12 + 0.3 }}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-green-500/8 to-blue-500/10 group-hover:from-red-500/15 group-hover:to-blue-500/15 transition-all duration-300" />
                      <div className="absolute inset-0 rounded-2xl backdrop-blur-md bg-white/[0.03] group-hover:bg-white/[0.06] transition-all duration-300" />
                    </motion.div>

                    {/* Content */}
                    <motion.div
                      className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] via-white/[0.025] to-transparent transition-colors duration-300 group-hover:border-white/20 p-5 md:p-6"
                      variants={contentVariants}
                    >
                      {/* Year Badge */}
                      <motion.div
                        className="inline-flex items-center gap-2 mb-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.12 + 0.35 }}
                      >
                        <span className="text-xs font-semibold text-red-300 bg-red-500/20 px-3 py-1 rounded-full ring-1 ring-red-400/30 uppercase tracking-wider">
                          {yearText}
                        </span>
                      </motion.div>

                      {/* School/Institution */}
                      <motion.h3
                        className="text-lg font-bold text-white mb-2 group-hover:text-green-200 transition-colors duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.12 + 0.38 }}
                      >
                        {titleText}
                      </motion.h3>

                      {/* Degree */}
                      <motion.p
                        className="text-sm text-white/75 group-hover:text-white/85 transition-colors duration-300 leading-relaxed"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.12 + 0.41 }}
                      >
                        {degreeText}
                      </motion.p>

                      {/* Decorative accent line */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 via-green-400 to-blue-400"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: idx * 0.12 + 0.43, duration: 0.6 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Timeline End Marker */}
          <motion.div
            className="relative flex items-center gap-8 ml-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: sortedItems.length * 0.12 + 0.4,
              type: "spring",
              stiffness: 200,
            }}
          >
            <div className="absolute -left-9 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-green-500 ring-3 ring-white/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="text-sm text-white/60 italic">Educational Journey</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
