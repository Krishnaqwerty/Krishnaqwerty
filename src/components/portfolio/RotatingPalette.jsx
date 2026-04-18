"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useFrame } from "@/components/ui/avatar";

export default function RotatingPalette({
  items = [],
  // radius can be a number in px or a string like '40vh' or '30vw'
  radius = 220,
  itemSize = 160,
  centerX = "80vw",
  centerY = "55vh",
  rotationOffset = 0,
  mapToGaze = true,
  className = "",
}) {
  const { scrollFraction } = useFrame();
  const prefersReducedMotion = useReducedMotion();

  // Track viewport to convert vh/vw units to pixels when radius is provided as a string
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => {
    setMounted(true);
  }, []);

  const radiusPx = useMemo(() => {
    const scale = mounted && viewport.w > 0 && viewport.w < 768 ? 0.72 : 1;
    if (typeof radius === "number") return radius;
    if (typeof radius === "string") {
      const val = parseFloat(radius);
      if (Number.isNaN(val)) return 220 * scale;
      if (radius.endsWith("vh")) return ((val / 100) * viewport.h) * scale;
      if (radius.endsWith("vw")) return ((val / 100) * viewport.w) * scale;
      return val * scale; // fallback: treat as px
    }
    return 220 * scale;
  }, [radius, viewport, mounted]);

  const itemSizePx = useMemo(() => {
    const scale = mounted && viewport.w > 0 && viewport.w < 768 ? 0.84 : 1;
    return Math.max(120, Math.round(itemSize * scale));
  }, [itemSize, viewport.w, mounted]);

  const angle = useMemo(() => {
    if (prefersReducedMotion) return rotationOffset;
    return mapToGaze ? scrollFraction * 360 + rotationOffset : rotationOffset;
  }, [prefersReducedMotion, mapToGaze, rotationOffset, scrollFraction]);

  const positions = useMemo(() => {
    const n = items.length || 1;
    return items.map((_, i) => {
      const theta = ((i / n) * 360 + angle) * (Math.PI / 180);
      const x = Math.cos(theta) * radiusPx;
      const y = Math.sin(theta) * radiusPx;
      const distanceFromCenter = Math.abs(y) / Math.max(1, radiusPx);
      const opacity = prefersReducedMotion ? 1 : Math.max(0.72, 1 - distanceFromCenter * 0.18);
      const scale = prefersReducedMotion ? 1 : Math.max(0.88, 1 - distanceFromCenter * 0.08);
      return { x, y, opacity, scale };
    });
  }, [items, radiusPx, angle, prefersReducedMotion]);

  // If center is specified as corner (0%/100%), slightly pull inward to keep items in view
  const cornerAdjust = () => {
    const cx = typeof centerX === 'string' ? centerX : `${centerX}`;
    const cy = typeof centerY === 'string' ? centerY : `${centerY}`;
    const adjustX = cx === '100%' ? '-10%' : cx === '0%' ? '10%' : '-50%';
    const adjustY = cy === '100%' ? '-10%' : cy === '0%' ? '10%' : '-50%';
    return `translate(${adjustX}, ${adjustY})`;
  };

  return (
    <div className={`absolute`} style={{ left: centerX, top: centerY, transform: cornerAdjust() }}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: itemSizePx,
            height: itemSizePx,
            left: positions[i].x,
            top: positions[i].y,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: positions[i].opacity, scale: positions[i].scale }}
          transition={{ duration: 0.4, delay: i * 0.03 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
