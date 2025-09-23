"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  const angle = mapToGaze ? scrollFraction * 360 + rotationOffset : rotationOffset;

  // Track viewport to convert vh/vw units to pixels when radius is provided as a string
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const radiusPx = useMemo(() => {
    if (typeof radius === "number") return radius;
    if (typeof radius === "string") {
      const val = parseFloat(radius);
      if (Number.isNaN(val)) return 220;
      if (radius.endsWith("vh")) return (val / 100) * (viewport.h || (typeof window !== 'undefined' ? window.innerHeight : 0));
      if (radius.endsWith("vw")) return (val / 100) * (viewport.w || (typeof window !== 'undefined' ? window.innerWidth : 0));
      return val; // fallback: treat as px
    }
    return 220;
  }, [radius, viewport]);

  const positions = useMemo(() => {
    const n = items.length || 1;
    return items.map((_, i) => {
      const theta = ((i / n) * 360 + angle) * (Math.PI / 180);
      const x = Math.cos(theta) * radiusPx;
      const y = Math.sin(theta) * radiusPx;
      return { x, y };
    });
  }, [items, radiusPx, angle]);

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
          style={{ width: itemSize, height: itemSize, left: positions[i].x, top: positions[i].y, transform: "translate(-50%, -50%)" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.03 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
