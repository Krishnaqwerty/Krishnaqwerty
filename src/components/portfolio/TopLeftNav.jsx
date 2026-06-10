"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { ArrowUpRight, Briefcase, Globe, Github, GraduationCap, FileText, Contact, Download, Linkedin } from "lucide-react";
// RotatingPalette intentionally not used in the nav modal to reduce runtime
// bundle and complexity; projects are shown as a simple responsive grid instead.
import EducationTimeline from "./EducationTimeline";
import CompactCard from "./cards/CompactCard";
import { GlassCard } from "./GlassCard";

export default function TopLeftNav({ projectItems = [], educationItems = [], contactContent }) {
  const [open, setOpen] = useState(null); // 'work' | 'education' | 'resume' | 'contact' | null
  const [showResumeLeadPopup, setShowResumeLeadPopup] = useState(false);
  const [resumeLeadSubmitted, setResumeLeadSubmitted] = useState(false);
  const [resumeLeadForm, setResumeLeadForm] = useState({ workEmail: "", feedback: "" });
  const [resumeLeadSending, setResumeLeadSending] = useState(false);
  const [resumeLeadError, setResumeLeadError] = useState("");
  const [resumeDownloadCount, setResumeDownloadCount] = useState(0);
  const [pebbleVisitCount, setPebbleVisitCount] = useState(0);
  const [owaspVisitCount, setOwaspVisitCount] = useState(0);
  const [petVisitCount, setPetVisitCount] = useState(0);
  const modalRef = useRef(null);
  const activeTriggerRef = useRef(null);
  const buttonRefs = useRef({});
  const resumePdfPath = "/KrishnaKumar.pdf";
  const linkedinUrl = "https://www.linkedin.com/in/krishnaqwerty/";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });
    }

    const onKeyDown = (event) => {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(null);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const nodes = Array.from(focusable || []).filter((node) => !node.hasAttribute("disabled"));
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open && activeTriggerRef.current) {
      activeTriggerRef.current.focus?.();
      activeTriggerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (open !== "resume") {
      setShowResumeLeadPopup(false);
      setResumeLeadSubmitted(false);
      setResumeLeadForm({ workEmail: "", feedback: "" });
      setResumeLeadSending(false);
      setResumeLeadError("");
    }
  }, [open]);

  useEffect(() => {
    let cancelled = false;

    const loadResumeDownloadCount = async () => {
      try {
        const response = await fetch("/api/resume-download-count/", { cache: "no-store" });
        const result = await response.json();
        if (!cancelled && response.ok) {
          setResumeDownloadCount(Number(result?.count || 0));
        }
      } catch {
        if (!cancelled) {
          setResumeDownloadCount(0);
        }
      }
    };

    loadResumeDownloadCount();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (open !== "work") return;

    let cancelled = false;

    const loadPebbleVisitCount = async () => {
      try {
        const response = await fetch("/api/pebble-visit-count/", { cache: "no-store" });
        const result = await response.json();
        if (!cancelled && response.ok) {
          setPebbleVisitCount(Number(result?.count || 0));
        }
      } catch {
        if (!cancelled) {
          setPebbleVisitCount(0);
        }
      }
    };

    const loadOwaspVisitCount = async () => {
      try {
        const response = await fetch("/api/owasp-visit-count/", { cache: "no-store" });
        const result = await response.json();
        if (!cancelled && response.ok) {
          setOwaspVisitCount(Number(result?.count || 0));
        }
      } catch {
        if (!cancelled) {
          setOwaspVisitCount(0);
        }
      }
    };

    const loadPetVisitCount = async () => {
      try {
        const response = await fetch("/api/pet-visit-count/", { cache: "no-store" });
        const result = await response.json();
        if (!cancelled && response.ok) {
          setPetVisitCount(Number(result?.count || 0));
        }
      } catch {
        if (!cancelled) {
          setPetVisitCount(0);
        }
      }
    };

    loadPebbleVisitCount();
    loadOwaspVisitCount();
    loadPetVisitCount();

    const pebblePollId = window.setInterval(() => {
      loadPebbleVisitCount();
      loadOwaspVisitCount();
      loadPetVisitCount();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(pebblePollId);
    };
  }, [open]);

  const handleResumeDownload = async () => {
    const link = document.createElement("a");
    link.href = resumePdfPath;
    link.download = "KrishnaKumar_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      const response = await fetch("/api/resume-download-count/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setResumeDownloadCount(Number(result?.count || 0));
      }
    } catch {
      // Keep the download action working even if the counter update fails.
    }

    setShowResumeLeadPopup(true);
    setResumeLeadSubmitted(false);
  };

  const handleResumeLeadSubmit = async (event) => {
    event.preventDefault();
    const workEmail = resumeLeadForm.workEmail.trim();
    const feedback = resumeLeadForm.feedback.trim();
    if (!workEmail || !feedback) return;

    try {
      setResumeLeadSending(true);
      setResumeLeadError("");

      const response = await fetch("/api/resume-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workEmail, feedback }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || "Unable to send email.");
      }

      setResumeLeadSubmitted(true);
    } catch (error) {
      setResumeLeadError(error instanceof Error ? error.message : "Unable to send email.");
    } finally {
      setResumeLeadSending(false);
    }
  };

  const recordPebbleVisit = () => {
    setPebbleVisitCount((count) => count + 1);

    fetch("/api/pebble-visit-count/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json().catch(() => ({})).then((result) => ({ response, result })))
      .then(({ response, result }) => {
        if (response.ok) {
          setPebbleVisitCount(Number(result?.count || 0));
        }
      })
      .catch(() => {
        // Keep the card usable even if the analytics update fails.
      });
  };

  const recordOwaspVisit = () => {
    setOwaspVisitCount((count) => count + 1);

    fetch("/api/owasp-visit-count/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json().catch(() => ({})).then((result) => ({ response, result })))
      .then(({ response, result }) => {
        if (response.ok) {
          setOwaspVisitCount(Number(result?.count || 0));
        }
      })
      .catch(() => {
        // Keep the card usable even if the analytics update fails.
      });
  };

  const recordPetVisit = () => {
    setPetVisitCount((count) => count + 1);

    fetch("/api/pet-visit-count/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json().catch(() => ({})).then((result) => ({ response, result })))
      .then(({ response, result }) => {
        if (response.ok) {
          setPetVisitCount(Number(result?.count || 0));
        }
      })
      .catch(() => {
        // Keep the card usable even if the analytics update fails.
      });
  };

  const items = [
    { id: 'work', label: 'Work', Icon: Briefcase },
    { id: 'education', label: 'Education', Icon: GraduationCap },
    { id: 'resume', label: 'Resume', Icon: FileText },
    { id: 'contact', label: 'Contact', Icon: Contact },
  ];

  const RopeSwitch = ({ id, label, Icon, active, onClick, delay = 0 }) => {
    // Per-rope randomized swing params (stable across renders)
    const rnd = useRef(Math.random());
    const amplitude = 3.6 + rnd.current * 2.8; // 3.6° - 6.4°
    const duration = 2.4 + rnd.current * 1.4; // 2.4s - 3.8s
    const phaseDelay = delay + rnd.current * 0.8; // slight random phase
    const entropy = 0.35 + rnd.current * 0.9;
    const gust = 0.6 + rnd.current * 1.1;

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
      <motion.button
        type="button"
        ref={(node) => {
          if (node) buttonRefs.current[id] = node;
        }}
        className="relative flex flex-col items-center w-14 select-none cursor-pointer origin-top bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
        initial={{ rotate: 0 }}
        animate={{
          rotate: [
            -amplitude * (0.62 + entropy * 0.08),
            amplitude * (0.92 + gust * 0.06),
            -amplitude * (0.34 + entropy * 0.06),
            amplitude * (0.78 + gust * 0.04),
            -amplitude * (0.62 + entropy * 0.08),
          ],
          x: [0, 0.55 + gust * 0.45, -0.6 - entropy * 0.35, 0.35 + gust * 0.25, 0],
          y: [0, -0.25, 0.3, -0.15, 0],
        }}
        transition={{ duration, ease: "easeInOut", repeat: Infinity, delay: phaseDelay }}
        whileHover={{ rotate: amplitude + 2.4, x: 1.2 }}
        whileTap={{ y: 4, rotate: 0 }}
        onClick={handleClick}
        aria-label={`Open ${label}`}
        aria-pressed={active}
        title={`Open ${label}`}
      >
        {/* anchor */}
        <div className="w-2 h-2 rounded-full bg-white/35 ring-1 ring-white/30 backdrop-blur" />
        {/* rope */}
        <motion.div
          className="glass-rope rope-length-md"
          style={{
            height: "4.5rem",
            width: "9px",
            borderRadius: "9999px",
            backgroundColor: "rgba(244, 247, 252, 0.42)",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.9) 18%, rgba(229,234,242,0.96) 34%, rgba(255,255,255,0.82) 50%, rgba(230,236,245,0.94) 66%, rgba(255,255,255,0.88) 82%, rgba(255,255,255,0.24) 100%), repeating-linear-gradient(150deg, rgba(255,255,255,0.58) 0 1px, rgba(205,213,224,0.18) 1px 2px, rgba(255,255,255,0.1) 2px 3px, rgba(184,192,204,0.12) 3px 4px), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.94) 0 22%, rgba(214,221,232,0.72) 38%, rgba(255,255,255,0) 70%)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "inset 0 0 12px rgba(255,255,255,0.96), inset 0 0 7px rgba(194,202,214,0.5), inset -1px 0 2px rgba(129,138,150,0.22), 0 0 14px rgba(255,255,255,0.48), 0 0 28px rgba(255,255,255,0.24)",
            backdropFilter: "blur(7px) saturate(140%)",
            WebkitBackdropFilter: "blur(7px) saturate(140%)",
            transformOrigin: "top center",
            zIndex: 1,
            position: "relative",
            overflow: "hidden",
            backgroundSize: "100% 180%, 220% 220%, 100% 100%",
          }}
          animate={ropeCtrl}
          initial={false}
        >
          <span className="glass-rope-braid" />
          <span className="glass-rope-hairs" />
          <span className="glass-rope-gloss" />
        </motion.div>
        <style jsx>{`
          @media (min-width: 768px) {
            .rope-length-md { height: 6rem !important; }
          }
          .glass-rope {
            position: relative;
            z-index: 0;
            animation: lasso-flow 3.2s ease-in-out infinite;
          }
          .glass-rope-braid,
          .glass-rope-hairs,
          .glass-rope-gloss {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
          }
          .glass-rope-braid {
            background-image:
              repeating-linear-gradient(155deg,
                rgba(255,255,255,0.02) 0 0.75px,
                rgba(254,254,255,0.42) 0.75px 1.5px,
                rgba(149,158,171,0.4) 1.5px 2.25px,
                rgba(255,255,255,0.06) 2.25px 3px,
                rgba(110,120,132,0.44) 3px 3.75px,
                rgba(255,255,255,0.02) 3.75px 4.5px),
              repeating-linear-gradient(25deg,
                rgba(255,255,255,0.34) 0 0.75px,
                rgba(172,180,192,0.22) 0.75px 1.5px,
                rgba(255,255,255,0.04) 1.5px 2.25px,
                rgba(122,131,143,0.24) 2.25px 3px);
            background-size: 118% 200%, 104% 180%;
            mix-blend-mode: multiply;
            opacity: 0.92;
            filter: blur(0.08px);
            animation: braid-twist 2.2s ease-in-out infinite alternate;
          }
          .glass-rope-hairs {
            inset: -42% -72%;
            background-image:
              radial-gradient(circle at 14% 10%, rgba(255,255,255,0.94) 0 0.28px, transparent 0.82px),
              radial-gradient(circle at 20% 24%, rgba(255,255,255,0.8) 0 0.28px, transparent 0.82px),
              radial-gradient(circle at 72% 12%, rgba(255,255,255,0.74) 0 0.28px, transparent 0.82px),
              radial-gradient(circle at 42% 36%, rgba(255,255,255,0.9) 0 0.25px, transparent 0.78px),
              radial-gradient(circle at 78% 52%, rgba(255,255,255,0.72) 0 0.28px, transparent 0.86px),
              radial-gradient(circle at 28% 70%, rgba(255,255,255,0.82) 0 0.25px, transparent 0.8px),
              radial-gradient(circle at 62% 88%, rgba(255,255,255,0.74) 0 0.25px, transparent 0.84px),
              radial-gradient(circle at 88% 72%, rgba(255,255,255,0.68) 0 0.25px, transparent 0.84px),
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 10%, transparent 21%, rgba(255,255,255,0.12) 33%, transparent 46%, rgba(255,255,255,0.1) 60%, transparent 72%, rgba(255,255,255,0.12) 84%, transparent 100%);
            background-repeat: repeat;
            background-size: 30% 16%, 28% 16%, 30% 16%, 28% 20%, 30% 16%, 30% 18%, 32% 16%, 28% 16%, 240% 100%;
            filter: blur(0.22px);
            opacity: 0.7;
            mix-blend-mode: screen;
            animation: rope-fiber-float 3.1s ease-in-out infinite;
          }
          .glass-rope::before, .glass-rope::after {
            content: '';
            position: absolute;
            top: -10%;
            bottom: -10%;
            width: 2.5px;
            background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.94) 14%, rgba(220,227,237,0.62) 50%, rgba(255,255,255,0.88) 86%, transparent 100%);
            filter: blur(1.05px);
            opacity: 0.94;
            pointer-events: none;
          }
          .glass-rope::before { left: -3px; transform: rotate(-5deg); }
          .glass-rope::after { right: -3px; transform: rotate(5deg); }
          .glass-rope-gloss {
            mix-blend-mode: screen;
            opacity: 0.62;
            background-image:
              linear-gradient(115deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.26) 16%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.01) 42%, rgba(255,255,255,0.11) 58%, rgba(255,255,255,0.52) 72%, rgba(255,255,255,0.06) 100%),
              repeating-linear-gradient(170deg, rgba(255,255,255,0.12) 0 1px, rgba(255,255,255,0.03) 1px 3px);
            filter: blur(0.18px);
            background-size: 220% 220%, 180% 180%;
            animation: rope-entropy-shimmer 3.4s ease-in-out infinite;
          }
          .glass-rope::after {
            animation: rope-side-flicker 3.2s ease-in-out infinite;
          }
          @keyframes lasso-flow {
            0% {
              background-position: 50% 0%, 0% 0%, 0% 0%;
              filter: saturate(1.01) brightness(0.99);
            }
            35% {
              background-position: 50% 36%, 55% 44%, 35% 20%;
              filter: saturate(1.04) brightness(1.04);
            }
            68% {
              background-position: 50% 72%, 88% 80%, 70% 65%;
              filter: saturate(1.05) brightness(1.08);
            }
            100% {
              background-position: 50% 100%, 100% 100%, 100% 100%;
              filter: saturate(1.02) brightness(1.01);
            }
          }
          @keyframes braid-twist {
            0% { transform: translateX(0) skewX(0deg); opacity: 0.82; }
            50% { transform: translateX(0.2px) skewX(-1deg); opacity: 0.95; }
            100% { transform: translateX(0) skewX(0.6deg); opacity: 0.88; }
          }
          @keyframes rope-fiber-float {
            0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.68; }
            40% { transform: translate3d(0.25px, -0.35px, 0) rotate(-0.5deg); opacity: 0.82; }
            70% { transform: translate3d(-0.2px, 0.25px, 0) rotate(0.4deg); opacity: 0.74; }
          }
          @keyframes rope-entropy-shimmer {
            0%, 100% {
              background-position: 0% 0%, 0% 0%;
              opacity: 0.62;
            }
            42% {
              background-position: 72% 36%, 50% 62%;
              opacity: 0.74;
            }
            70% {
              background-position: 100% 42%, 100% 100%;
              opacity: 0.68;
            }
          }
          @keyframes rope-side-flicker {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 0.72; }
            75% { opacity: 0.62; }
          }
          @media (prefers-reduced-motion: reduce) {
            .glass-rope,
            .glass-rope-braid,
            .glass-rope-hairs,
            .glass-rope-gloss,
            .glass-rope::after {
              animation: none !important;
            }
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
      </motion.button>
    );
  };

  return (
    <div className={`absolute left-4 top-0 pointer-events-auto ${open ? "z-[95]" : "z-40"}`}>
      {/* Hanging rope switches */}
      <div className="flex items-start gap-2 pt-1 pl-0">
        {items.map((it, i) => (
          <RopeSwitch
            key={it.id}
            id={it.id}
            label={it.label}
            Icon={it.Icon}
            active={open === it.id}
            onClick={() => {
              activeTriggerRef.current = buttonRefs.current[it.id] || null;
              setOpen(open === it.id ? null : it.id);
            }}
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
            className="fixed inset-0 z-[90]"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`nav-dialog-title-${open}`}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/42 backdrop-blur-[3px]" onClick={() => setOpen(null)} />
            {/* Modal Content */}
            <div
              ref={modalRef}
              className="absolute left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2"
            >
              <GlassCard className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p id={`nav-dialog-title-${open}`} className="text-sm font-semibold text-white">
                      {items.find((item) => item.id === open)?.label}
                    </p>
                    <p className="text-xs text-white/65">Press Escape to close</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {open === "resume" && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleResumeDownload}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs text-emerald-100 ring-1 ring-emerald-300/30 hover:bg-emerald-500/25"
                          title="Download resume"
                          aria-label="Download resume"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                        <span
                          className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/75 ring-1 ring-white/15"
                          title="Total downloads"
                          aria-label={`Total downloads ${resumeDownloadCount}`}
                        >
                          <Download className="h-3 w-3" />
                          {resumeDownloadCount}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpen(null)}
                      className="rounded-md bg-white/10 px-2 py-1 text-xs text-white/80 ring-1 ring-white/15 hover:bg-white/15"
                    >
                      Close
                    </button>
                  </div>
                </div>
                {open === 'work' && (
                  <div className="relative w-[80vw] h-[70vh]">
                    <div className="h-full overflow-y-auto p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/5 ring-1 ring-inset ring-white/10 backdrop-blur-md shadow-[0_12px_30px_-15px_rgba(0,0,0,0.6)] hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]">
                          <div className="p-4">
                            <div className="overflow-hidden rounded-lg border border-black/10 bg-[#f3efe7] shadow-inner">
                              <div className="relative flex aspect-[16/10] items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.8),rgba(241,237,229,0.96)_55%,rgba(231,225,214,0.98))]">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(120,120,120,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,120,120,0.08)_1px,transparent_1px)] bg-[size:22px_22px] opacity-30" />
                                <div className="absolute left-4 top-4 grid grid-cols-4 gap-2">
                                  {[
                                    "h-7 w-7",
                                    "h-10 w-10",
                                    "h-5 w-5",
                                    "h-12 w-12",
                                    "h-6 w-6",
                                    "h-9 w-9",
                                    "h-4 w-4",
                                    "h-11 w-11",
                                    "h-8 w-8",
                                    "h-6 w-6",
                                  ].map((size, index) => (
                                    <span
                                      key={index}
                                      className={`${size} rounded-full bg-black shadow-[0_2px_8px_rgba(0,0,0,0.18)]`}
                                    />
                                  ))}
                                </div>
                                <div className="absolute inset-x-0 bottom-4 px-4 text-center">
                                  <div className="text-[13px] font-semibold tracking-[0.08em] text-black/80">Pebble 1.0</div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">Pebble 1.0</div>
                                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Minimal Language</div>
                                </div>
                                <span className="rounded-full bg-sky-500/15 px-2 py-1 text-[10px] font-medium text-sky-100 ring-1 ring-sky-300/20">Featured</span>
                              </div>

                              <p className="text-[12px] leading-5 text-white/75">
                                A minimal programming language with a single-pass compiler and stack-based VM. Pebble is intentionally small. The goal is to present the language like a real system, while keeping the implementation understandable and personal.
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                <a
                                  href="https://pebble.krishnakumar.tech/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={recordPebbleVisit}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-white/85 ring-1 ring-white/15 hover:bg-white/15"
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                  Website
                                </a>
                                <a
                                  href="https://github.com/Krishnaqwerty/Pebble"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={recordPebbleVisit}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-white/85 ring-1 ring-white/15 hover:bg-white/15"
                                >
                                  <Github className="h-3.5 w-3.5" />
                                  GitHub
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-md">
                            Visits {pebbleVisitCount}
                          </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/5 ring-1 ring-inset ring-white/10 backdrop-blur-md shadow-[0_12px_30px_-15px_rgba(0,0,0,0.6)] hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]">
                          <div className="p-4">
                            <div className="overflow-hidden rounded-lg border border-cyan-950/20 bg-[#06111a] shadow-inner">
                              <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(9,87,126,0.52),rgba(6,17,26,0.99)_72%)] text-cyan-50">
                                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.18)_0%,transparent_24%,transparent_74%,rgba(34,211,238,0.08)_100%)]" />
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:18px_18px] opacity-16" />
                                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-cyan-200/15 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/15 bg-cyan-300/10 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.12)]">
                                    <span className="text-lg">🛡️</span>
                                  </div>
                                  <div className="leading-tight">
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/85">OWASP</div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/55">Scanner</div>
                                  </div>
                                </div>
                                <div className="absolute right-4 top-4 rounded-full border border-cyan-200/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/75 backdrop-blur-md">
                                  Python
                                </div>

                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-left">
                                  <div className="text-[15px] font-semibold uppercase tracking-[0.44em] text-cyan-100/50">Web App</div>
                                  <div className="mt-2 max-w-[9rem] text-[28px] font-black uppercase leading-[0.86] tracking-[0.22em] text-white drop-shadow-[0_12px_35px_rgba(0,0,0,0.65)] sm:max-w-[10rem] sm:text-[32px]">
                                    OWASP
                                  </div>
                                </div>

                                <div className="absolute right-4 bottom-16 text-right">
                                  <div className="text-[26px] font-black uppercase leading-[0.88] tracking-[0.14em] text-cyan-50 drop-shadow-[0_12px_35px_rgba(0,0,0,0.65)] sm:text-[30px]">
                                    Scanner
                                  </div>
                                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-300/8 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.34em] text-cyan-100/75">
                                    SQLi · XSS · Crawl
                                  </div>
                                </div>

                                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-[10px] uppercase tracking-[0.28em] text-cyan-100/70">
                                  <span>Prototype</span>
                                  <span>Reflected attacks</span>
                                  <span>Error heuristics</span>
                                </div>

                                <div className="absolute -left-2 top-8 h-24 w-24 rounded-full border border-cyan-200/10 bg-cyan-300/5 blur-2xl" />
                                <div className="absolute -right-6 bottom-6 h-28 w-28 rounded-full border border-cyan-200/10 bg-cyan-300/5 blur-2xl" />
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">🛡️ OWASP Scanner</div>
                                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Python Security Prototype</div>
                                </div>
                                <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-[10px] font-medium text-cyan-100 ring-1 ring-cyan-300/20">Security</span>
                              </div>

                              <p className="text-[12px] leading-5 text-white/75">
                                A Python-based prototype to detect common web vulnerabilities, scanning for SQL Injection error-based heuristics and reflected XSS. It crawls pages and forms (GET/POST) up to the chosen depth, then injects common payloads and looks for error or reflection markers.
                              </p>

                              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                                <a
                                  href="http://owasp.krishnakumar.tech/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={recordOwaspVisit}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-white/85 ring-1 ring-white/15 hover:bg-white/15"
                                >
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                  Visit Link
                                </a>
                                <a
                                  href="https://github.com/Krishnaqwerty/OWASP-Scanner"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={recordOwaspVisit}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-white/85 ring-1 ring-white/15 hover:bg-white/15"
                                >
                                  <Github className="h-3.5 w-3.5" />
                                  GitHub
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-md">
                            Visits {owaspVisitCount}
                          </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/5 ring-1 ring-inset ring-white/10 backdrop-blur-md shadow-[0_12px_30px_-15px_rgba(0,0,0,0.6)] hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]">
                          <div className="p-4">
                            <div className="overflow-hidden rounded-lg border border-amber-950/20 bg-[#f4efe5] shadow-inner">
                              <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.92),rgba(244,237,224,0.97)_58%,rgba(233,223,205,0.99))] text-amber-950">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(160,120,70,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(160,120,70,0.08)_1px,transparent_1px)] bg-[size:22px_22px] opacity-25" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.7),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.55),transparent_24%),radial-gradient(circle_at_50%_85%,rgba(105,132,170,0.12),transparent_26%)]" />

                                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/65 px-3 py-1.5 backdrop-blur-md">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-950 text-amber-50 shadow-[0_0_18px_rgba(120,78,38,0.18)]">
                                    <span className="text-[12px] font-black">P</span>
                                  </div>
                                  <div className="leading-tight">
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-950/80">Hybrid</div>
                                    <div className="text-[10px] uppercase tracking-[0.18em] text-amber-950/60">CNN-SVM</div>
                                  </div>
                                </div>

                                <div className="absolute right-4 top-4 rounded-full border border-blue-900/10 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-950/75 backdrop-blur-md">
                                  Vision AI
                                </div>

                                <div className="absolute left-5 top-1/2 -translate-y-1/2 space-y-2 text-left">
                                  <div className="flex gap-2">
                                    <span className="h-5 w-5 rounded-full bg-amber-950/92 shadow-[0_2px_10px_rgba(0,0,0,0.2)]" />
                                    <span className="mt-4 h-4 w-4 rounded-full bg-amber-950/92 shadow-[0_2px_10px_rgba(0,0,0,0.18)]" />
                                  </div>
                                  <div className="flex gap-2 pl-2">
                                    <span className="h-6 w-6 rounded-full bg-amber-950/92 shadow-[0_2px_10px_rgba(0,0,0,0.2)]" />
                                    <span className="mt-4 h-5 w-5 rounded-full bg-amber-950/92 shadow-[0_2px_10px_rgba(0,0,0,0.18)]" />
                                  </div>
                                  <div className="flex gap-2 pl-5">
                                    <span className="h-8 w-8 rounded-full bg-amber-950/92 shadow-[0_2px_10px_rgba(0,0,0,0.2)]" />
                                  </div>
                                </div>

                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center">
                                  <div className="mx-auto max-w-[12rem] text-[24px] font-black uppercase leading-[0.9] tracking-[0.14em] text-amber-950 drop-shadow-[0_10px_28px_rgba(0,0,0,0.22)] sm:max-w-[13rem] sm:text-[28px]">
                                    Hybrid CNN-SVM
                                  </div>
                                  <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-950/72">
                                    Pet Breed Classification
                                  </div>
                                  <div className="mx-auto mt-3 h-px w-32 bg-blue-900/30" />
                                  <div className="mt-3 text-[10px] uppercase tracking-[0.24em] text-amber-950/65">
                                    VGG16 • ResNet50 • MobileNetV2 • PCA • RBF-SVM
                                  </div>
                                </div>

                                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-[10px] uppercase tracking-[0.28em] text-amber-950/62">
                                  <span>Oxford-IIIT Pet</span>
                                  <span>Fine-grained accuracy</span>
                                  <span>Robustness</span>
                                </div>

                                <div className="absolute -left-6 top-6 h-24 w-24 rounded-full border border-blue-900/10 bg-blue-300/10 blur-2xl" />
                                <div className="absolute -right-4 bottom-5 h-24 w-24 rounded-full border border-amber-900/10 bg-amber-300/10 blur-2xl" />
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">Hybrid Pet Breed Classification System</div>
                                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">CNN + SVM Research Project</div>
                                </div>
                                <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-medium text-amber-100 ring-1 ring-amber-300/20">Research</span>
                              </div>

                              <p className="text-[12px] leading-5 text-white/75">
                                Hybrid CNN-SVM system for pet breed classification. Extracts features using VGG16, ResNet50, and MobileNetV2, refines them with PCA, and classifies with RBF-SVM for fine-grained accuracy and stronger robustness on the Oxford-IIIT Pet dataset.
                              </p>

                              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                                <a
                                  href="https://github.com/Krishnaqwerty/Hybrid_Pet_Breed_Classification_System_using_CNN_and_SVM"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={recordPetVisit}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-white/85 ring-1 ring-white/15 hover:bg-white/15"
                                >
                                  <Github className="h-3.5 w-3.5" />
                                  GitHub
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-md">
                            Visits {petVisitCount}
                          </div>
                        </div>

                        {Array.from({ length: 0 }).map((_, i) => (
                          <div key={`blank-${i}`} className="w-full">
                            <CompactCard title={" "} subtitle={" "} desc={" "} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {open === 'education' && (
                  <div className="relative w-[80vw] h-[70vh]">
                    <EducationTimeline
                      educationItems={educationItems}
                    />
                  </div>
                )}
                {open === 'resume' && (
                  <div className="relative w-[min(94vw,210mm)] max-h-[82vh] overflow-y-auto rounded-[0.2rem] pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.6)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/60">
                    <div className="relative mx-auto w-full rounded-[0.05rem] bg-white text-black shadow-[0_30px_80px_rgba(0,0,0,0.48)]">
                      <div className="relative h-auto px-[0.42in] py-[0.32in] text-[8.85pt] leading-[1.08] [font-family:'Times_New_Roman',Times,serif]">
                        <div className="text-center">
                          <div className="text-[17pt] font-bold leading-none tracking-[-0.01em]">Krishna Kumar</div>
                          <div className="mt-1.5">Hazaribagh, Jharkhand 825322</div>
                          <div className="mt-1 leading-[1.15]">
                            <a href="mailto:meet.kumarkrishna@gmail.com" className="hover:underline">meet.kumarkrishna@gmail.com</a> | +91 7761 989 674 | <a href="https://linkedin.com/in/krishnaqwerty" className="hover:underline">linkedin.com/in/krishnaqwerty</a> | <a href="https://github.com/krishnaqwerty" className="hover:underline">github.com/krishnaqwerty</a>
                          </div>
                        </div>

                        <section className="mt-[0.12in]">
                          <div className="text-[12pt] font-normal uppercase tracking-[0.04em]">Education</div>
                          <div className="mt-[0.04in] border-t border-black" />
                          <div className="mt-[0.06in]">
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-bold">Lovely Professional University, Punjab</div>
                              <div className="italic">Phagwara, Punjab</div>
                            </div>
                            <div className="mt-[0.01in] flex items-start justify-between gap-3">
                              <div className="italic">B.Tech in Computer Science and Engineering</div>
                              <div className="italic">2022 – Present</div>
                            </div>
                          </div>
                        </section>

                        <section className="mt-[0.08in]">
                          <div className="text-[12pt] font-normal uppercase tracking-[0.04em]">Experience</div>
                          <div className="mt-[0.04in] border-t border-black" />

                          <div className="mt-[0.06in]">
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-bold">Mphasis</div>
                              <div className="italic">Pune</div>
                            </div>
                            <div className="mt-[0.01in] flex items-start justify-between gap-3">
                              <div className="italic">Associate Software Engineer Intern</div>
                              <div className="italic">Dec 2025 – Present</div>
                            </div>
                            <ul className="mt-[0.01in] list-disc pl-[1.3em] space-y-[0.005in]">
                              <li>Built and optimized <span className="font-bold">Spring Boot</span> backend services with <span className="font-bold">Hibernate/JPA</span>, reducing API latency by <span className="font-bold">30%</span> and improving query performance by <span className="font-bold">40%</span> at scale.</li>
                              <li>Architected <span className="font-bold">modular, layered systems</span> and developed secure <span className="font-bold">REST APIs</span>, improving maintainability by <span className="font-bold">35%</span> and enabling faster feature iteration in production environments.</li>
                              <li>Designed <span className="font-bold">batch processing pipelines</span> using <span className="font-bold">Spring Batch</span> for <span className="font-bold">10K+ records</span>, cutting processing time by <span className="font-bold">50%</span> while ensuring reliability and scalability.</li>
                            </ul>
                          </div>

                          <div className="mt-[0.06in]">
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-bold">Hitbullseye</div>
                              <div className="italic">Jalandhar</div>
                            </div>
                            <div className="mt-[0.01in] flex items-start justify-between gap-3">
                              <div className="italic">Java Full Stack Developer Intern</div>
                              <div className="italic">May 2025 – Jul 2025</div>
                            </div>
                            <ul className="mt-[0.01in] list-disc pl-[1.3em] space-y-[0.005in]">
                              <li>Developed and hosted scalable backend modules using <span className="font-bold">Spring Boot</span> and <span className="font-bold">Java</span>, reducing API latency by <span className="font-bold">25%</span> and improving concurrent user handling by <span className="font-bold">40%</span>.</li>
                              <li>Integrated <span className="font-bold">RESTful APIs</span> with React frontend across <span className="font-bold">5+ microservices</span>, improving reliability and data consistency by <span className="font-bold">35%</span>.</li>
                              <li>Refactored workflows in <span className="font-bold">Agile sprints</span> and optimized CI/CD pipelines using <span className="font-bold">Jenkins</span> and <span className="font-bold">GitLab</span>, cutting deployment time from <span className="font-bold">15 min to 7 min</span>.</li>
                            </ul>
                          </div>
                        </section>

                        <section className="mt-[0.08in]">
                          <div className="text-[12pt] font-normal uppercase tracking-[0.04em]">Projects</div>
                          <div className="mt-[0.04in] border-t border-black" />

                          <div className="mt-[0.06in]">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="font-bold">Hybrid Pet Breed Classification System (CNN–SVM)</span> - <a href="https://github.com/Krishnaqwerty/Hybrid_Pet_Breed_Classification_System_using_CNN_and_SVM" className="hover:underline">GitHub</a>
                              </div>
                              <div className="italic whitespace-nowrap">Oct 2025 – Nov 2025</div>
                            </div>
                            <ul className="mt-[0.01in] list-disc pl-[1.3em] space-y-[0.005in]">
                              <li>Built hybrid <span className="font-bold">CNN–SVM pipeline</span> (VGG16, ResNet50, MobileNetV2 + RBF-SVM) achieving <span className="font-bold">94.32% accuracy</span> and <span className="font-bold">99.19% top-3 accuracy</span> on <span className="font-bold">7.4K images (37 breeds)</span>.</li>
                              <li>Reduced <span className="font-bold">7K+ dimensional features to 1,629</span> using <span className="font-bold">PCA (95% variance)</span>, improving training efficiency.</li>
                              <li>Designed end-to-end pipeline with augmentation + feature fusion, improving inter-breed separability.</li>
                            </ul>
                          </div>

                          <div className="mt-[0.06in]">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="font-bold">Automated SQL Injection Fault Tester</span> - <a href="https://github.com/Krishnaqwerty/OWASP-Scanner" className="hover:underline">GitHub</a>
                              </div>
                              <div className="italic whitespace-nowrap">Aug 2025 – Sep 2025</div>
                            </div>
                            <ul className="mt-[0.01in] list-disc pl-[1.3em] space-y-[0.005in]">
                              <li>Engineered a scanner for <span className="font-bold">SQLi</span> and <span className="font-bold">XSS</span> using <span className="font-bold">Gemini API</span>, detecting <span className="font-bold">85%</span> of known vectors across 50+ tests.</li>
                              <li>Integrated security checks into <span className="font-bold">CI/CD pipelines</span> via GitHub Actions, automating scans for <span className="font-bold">100%</span> of new PRs.</li>
                              <li>Reduced manual review effort by <span className="font-bold">70%</span> and improved threat detection turnaround from hours to minutes.</li>
                            </ul>
                          </div>

                          <div className="mt-[0.06in]">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="font-bold">Pebble — Minimal Functional Programming Language</span> - <a href="https://github.com/Krishnaqwerty/Pebble" className="hover:underline">GitHub</a>
                              </div>
                              <div className="italic whitespace-nowrap">Jun 2025 – Aug 2025</div>
                            </div>
                            <ul className="mt-[0.01in] list-disc pl-[1.3em] space-y-[0.005in]">
                              <li>Designed lightweight functional language supporting <span className="font-bold">immutability</span>, <span className="font-bold">higher-order functions</span>, and <span className="font-bold">modular syntax</span>, with <span className="font-bold">pebblec</span> compiler.</li>
                              <li>Achieved stable execution across <span className="font-bold">20+ benchmark programs</span>, improving type safety and memory efficiency by <span className="font-bold">15%</span>.</li>
                              <li>Deployed compiler as CLI tool used by <span className="font-bold">30+ developers</span> for experimental programming.</li>
                            </ul>
                          </div>
                        </section>

                        <section className="mt-[0.08in]">
                          <div className="text-[12pt] font-normal uppercase tracking-[0.04em]">Achievements</div>
                          <div className="mt-[0.04in] border-t border-black" />
                          <ul className="mt-[0.06in] list-disc pl-[1.3em] space-y-[0.005in]">
                            <li>2nd Runner Up — <span className="font-bold">Hackathon</span>, Infosys, 2024; top <span className="font-bold">100+ teams</span>.</li>
                            <li>Finalist — <span className="font-bold">Google Cloud Campaign</span>, GDSC, 2023; top <span className="font-bold">2%</span> nationally.</li>
                            <li>Silver Medalist — <span className="font-bold">Inter-School Yoga Competition</span>, LPU, 2022; top 5/100+ participants.</li>
                            <li>Winner — <span className="font-bold">Essay Writing Competition</span>, Fresher’s Talent Hunt, LPU, 2022; 1st/600+ participants.</li>
                          </ul>
                        </section>

                        <section className="mt-[0.08in]">
                          <div className="text-[12pt] font-normal uppercase tracking-[0.04em]">Technical Skills</div>
                          <div className="mt-[0.04in] border-t border-black" />
                          <div className="mt-[0.06in] space-y-[0.005in]">
                            <p><span className="font-bold">Languages:</span> C/C++, Java, JavaScript, Python, Kotlin</p>
                            <p><span className="font-bold">Frameworks &amp; Tools:</span> Spring Boot, React.js, Node.js, Android Studio, Firebase, TensorFlow, LangChain, Azure ML Studio, nginx, Git, GitHub, VS Code, Jupyter, Google Colab, Postman, Appium</p>
                            <p><span className="font-bold">DevOps/MLOps:</span> Docker, Kubernetes, Terraform, GitLab, Jenkins, DVC, MLflow, MCP Server, CI/CD Pipelines</p>
                            <p><span className="font-bold">Cloud &amp; Analytics:</span> Azure, Machine Learning, Data Analytics, Power BI</p>
                            <p><span className="font-bold">Concepts:</span> API Design, Microservices, System Design</p>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                )}
                {open === 'contact' && (
                  <div className="relative w-[min(94vw,960px)] max-h-[84vh] overflow-y-auto rounded-3xl bg-black/20 p-1 md:p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {contactContent}
                  </div>
                )}

                {open === "resume" && showResumeLeadPopup && (
                  <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Resume feedback popup">
                    <div
                      className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                      onClick={() => setShowResumeLeadPopup(false)}
                    />
                    <div className="absolute left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-slate-950/95 p-5 text-white shadow-2xl ring-1 ring-white/10">
                      {!resumeLeadSubmitted ? (
                        <form onSubmit={handleResumeLeadSubmit} className="space-y-3">
                          <div>
                            <h4 className="text-base font-semibold">Thank you for your interest in my resume.</h4>
                            <p className="mt-1 text-sm text-white/75">Please share your work/company email and any feedback or improvement suggestion.</p>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-white/80" htmlFor="resume-work-email">
                              Work/Company Email
                            </label>
                            <input
                              id="resume-work-email"
                              type="email"
                              required
                              value={resumeLeadForm.workEmail}
                              onChange={(e) => setResumeLeadForm((prev) => ({ ...prev, workEmail: e.target.value }))}
                              className="w-full rounded-md border border-white/20 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-emerald-300/70"
                              placeholder="name@company.com"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs text-white/80" htmlFor="resume-feedback">
                              Feedback / Improvements
                            </label>
                            <textarea
                              id="resume-feedback"
                              required
                              rows={4}
                              value={resumeLeadForm.feedback}
                              onChange={(e) => setResumeLeadForm((prev) => ({ ...prev, feedback: e.target.value }))}
                              className="w-full resize-y rounded-md border border-white/20 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-emerald-300/70"
                              placeholder="Share what you liked and what I can improve."
                            />
                          </div>

                          {resumeLeadError && (
                            <p className="text-xs text-rose-300">{resumeLeadError}</p>
                          )}

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowResumeLeadPopup(false)}
                              className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/20 hover:bg-white/15"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={resumeLeadSending}
                              className="rounded-md bg-emerald-500/80 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {resumeLeadSending ? "Sending..." : "Submit"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="text-base font-semibold">Thanks for sharing your feedback.</h4>
                          <p className="text-sm text-white/80">I appreciate your time and interest. Let’s connect on LinkedIn.</p>
                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md bg-sky-500/20 px-3 py-1.5 text-sm text-sky-100 ring-1 ring-sky-300/30 hover:bg-sky-500/30"
                          >
                            <Linkedin className="h-4 w-4" />
                            Connect on LinkedIn
                          </a>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setShowResumeLeadPopup(false)}
                              className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/20 hover:bg-white/15"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
