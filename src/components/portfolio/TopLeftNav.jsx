"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Briefcase, GraduationCap, FileText, Contact } from "lucide-react";
import RotatingPalette from "./RotatingPalette";
import CompactCard from "./cards/CompactCard";
import { GlassCard } from "./GlassCard";

export default function TopLeftNav({ projectItems = [], educationItems = [], contactContent }) {
  const [open, setOpen] = useState(null); // 'work' | 'education' | 'resume' | 'contact' | null

  const items = [
    { id: 'work', label: 'Work', Icon: Briefcase },
    { id: 'education', label: 'Education', Icon: GraduationCap },
    { id: 'resume', label: 'Resume', Icon: FileText },
    { id: 'contact', label: 'Contact', Icon: Contact },
  ];

  const RopeSwitch = ({ id, label, Icon, active, onClick, delay = 0 }) => {
    // Per-rope randomized swing params (stable across renders)
    const rnd = useRef(Math.random());
    const amplitude = 2 + rnd.current * 2.5; // 2° - 4.5°
    const duration = 2.5 + rnd.current * 2; // 2.5s - 4.5s
    const phaseDelay = delay + rnd.current * 0.8; // slight random phase

    // Pull effect controllers
    const knotCtrl = useAnimation();
    const ropeCtrl = useAnimation();

    const handleClick = () => {
      // Pull-down effect: knot drops and rope stretches slightly, then rebounds
      knotCtrl.start({ y: [0, 16, 0], transition: { duration: 0.35, ease: "easeInOut" } });
      ropeCtrl.start({ scaleY: [1, 1.12, 1], transition: { duration: 0.35, ease: "easeInOut" } });
      onClick?.();
    };

    return (
      <motion.div
        className="relative flex flex-col items-center w-14 select-none cursor-pointer origin-top"
        initial={{ rotate: 0 }}
        animate={{ rotate: [-amplitude, amplitude] }}
        transition={{ duration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: phaseDelay }}
        whileHover={{ rotate: amplitude + 2 }}
        whileTap={{ y: 4, rotate: 0 }}
        onClick={handleClick}
        aria-label={label}
      >
        {/* anchor */}
  <div className="w-2 h-2 rounded-full bg-white/35 ring-1 ring-white/30 backdrop-blur" />
        {/* rope */}
        <motion.div
          className="glass-rope rope-length-md"
          style={{
            height: "4.5rem",
            width: "7px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255,255,255,0.05)",
            backgroundImage:
              "linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.08)), repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 1px, rgba(255,255,255,0.03) 1px 2px)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "inset 0 0 10px rgba(255,255,255,0.7), inset 0 0 2px rgba(255,255,255,0.85), 0 0 8px rgba(0,0,0,0.2)",
            backdropFilter: "blur(7px) saturate(140%)",
            WebkitBackdropFilter: "blur(7px) saturate(140%)",
            transformOrigin: "top center",
            zIndex: 1,
            position: "relative",
            overflow: "hidden",
          }}
          animate={ropeCtrl}
          initial={false}
        >
          <span className="glass-rope-gloss" />
        </motion.div>
        <style jsx>{`
          @media (min-width: 768px) {
            .rope-length-md { height: 5.25rem !important; } /* 25% shorter than 7rem (h-28) */
          }
          .glass-rope {
            position: relative;
            z-index: 0;
          }
          .glass-rope::before, .glass-rope::after {
            content: '';
            position: absolute;
            top: 0; bottom: 0;
            width: 3px;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.22) 35%, transparent 70%);
            filter: blur(1.6px);
            opacity: 0.7;
            pointer-events: none;
          }
          .glass-rope::before { left: -3px; }
          .glass-rope::after { right: -3px; }
          .glass-rope-gloss {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            mix-blend-mode: screen;
            opacity: 0.8;
            background-image:
              linear-gradient(to left, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.25) 100%),
              repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0 2px, rgba(255,255,255,0.02) 2px 4px);
            filter: blur(0.3px);
          }
        `}</style>
        {/* knot + icon */}
        <motion.div
          className={`relative rounded-full ring-1 ring-white/25 bg-white/8 backdrop-blur-xl shadow-xl w-12 h-12 flex items-center justify-center ${active ? 'bg-white/15 ring-white/40' : ''}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={knotCtrl}
          whileInView={{ scale: active ? 1.05 : 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
        >
          {/* small knot nub */}
          <div className="absolute -top-1 w-2 h-2 rounded-full bg-white/70" />
          {/* gloss */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-white/10 to-transparent opacity-60" />
          <Icon className="w-5 h-5 text-white/90" />
          <span className="sr-only">{label}</span>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="absolute left-4 top-0 z-20 pointer-events-auto">
      {/* Hanging rope switches */}
      <div className="flex items-start gap-2 pt-1 pl-0">
        {items.map((it, i) => (
          <RopeSwitch
            key={it.id}
            id={it.id}
            label={it.label}
            Icon={it.Icon}
            active={open === it.id}
            onClick={() => setOpen(open === it.id ? null : it.id)}
            delay={i * 0.05}
          />
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key={open}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(null)} />
            {/* Modal Content */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <GlassCard className="p-4">
                {open === 'work' && (
                  <div className="relative w-[80vw] h-[70vh]">
                    {React.Children.count(projectItems) > 0 ? (
                      <RotatingPalette
                        items={projectItems}
                        radius={260}
                        itemSize={180}
                        centerX={"50%"}
                        centerY={"50%"}
                        mapToGaze={false}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/70">
                        Loading projects...
                      </div>
                    )}
                  </div>
                )}
                {open === 'education' && (
                  <div className="relative w-[80vw] h-[70vh]">
                    <RotatingPalette
                      items={educationItems}
                      radius={240}
                      itemSize={180}
                      centerX={"50%"}
                      centerY={"50%"}
                      mapToGaze={false}
                    />
                  </div>
                )}
                {open === 'resume' && (
                  <div className="relative w-[80vw] h-[80vh]">
                    <div className="w-full h-full rounded-xl overflow-hidden">
                      <iframe src="/KrishnaKumar.pdf" className="w-full h-full" />
                    </div>
                  </div>
                )}
                {open === 'contact' && (
                  <div className="relative w-[520px] max-w-[90vw]">
                    {contactContent}
                  </div>
                )}
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
