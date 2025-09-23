"use client";

import React from "react";
import { useFrame } from "@/components/ui/avatar";
import { motion } from "framer-motion";

// Renders children in a fixed full-screen layer above the canvas.
export function SceneOverlay({ children, className = "" }) {
  return <div className={`absolute inset-0 ${className}`}>{children}<ScrollAura /></div>;
}

// Positions an element when currentFrame is within [start, end]. Supports px or viewport %.
export function SceneItem({
  start,
  end,
  x,
  y,
  xPct,
  yPct,
  anchor = "top-left", // 'top-left' | 'center' | 'top-center' | 'bottom-center'
  vhUnit = "vh", // allow 'dvh' to avoid mobile URL-bar issues
  className = "",
  children,
}) {
  const { currentFrame } = useFrame();
  const visible = currentFrame >= start && currentFrame <= end;
  const isBottomCenter = anchor === "bottom-center";
  const style = {
    ...(isBottomCenter
      ? { left: 0, right: 0 }
      : { left: xPct != null ? `${xPct}vw` : x != null ? x : 0 }),
    top: yPct != null && !isBottomCenter ? `${yPct}${vhUnit}` : y != null ? y : undefined,
    bottom: yPct != null && isBottomCenter ? `${Math.max(0, 100 - yPct)}${vhUnit}` : undefined,
    transform:
      anchor === "center"
        ? "translate(-50%, -50%)"
        : anchor === "top-center"
        ? "translate(-50%, 0%)"
        : isBottomCenter
        ? "translateY(0%)"
        : undefined,
  };
  const wrapperClass = `absolute ${isBottomCenter ? 'w-full flex justify-center' : 'inline-block'} pointer-events-auto ${className}`;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className={wrapperClass}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Places an element that follows a simple linear path between two points across a frame range.
export function ScenePath({
  start,
  end,
  from = { x: 0, y: 0 }, // supports x/y (px) or xPct/yPct (vw/vh)
  to = { x: 0, y: 0 },
  opacityFrom = 1,
  opacityTo = 1,
  anchor = "top-left", // 'top-left' | 'center' | 'top-center' | 'bottom-center'
  vhUnit = "vh", // allow 'dvh'
  className = "",
  hold = false, // when true, keep visible after 'end' at final position
  children,
}) {
  const { currentFrame } = useFrame();
  const clamped = Math.min(Math.max(currentFrame, start), end);
  const t = (clamped - start) / Math.max(1, end - start);

  const lerp = (a, b, tt) => a + (b - a) * tt;
  const computePos = (from, to) => {
    const xIsPct = from.xPct != null || to.xPct != null;
    const yIsPct = from.yPct != null || to.yPct != null;
    const x = xIsPct
      ? `calc(${lerp(from.xPct ?? 0, to.xPct ?? 0, t)}vw)`
      : lerp(from.x ?? 0, to.x ?? 0, t);
    const yPctVal = yIsPct ? lerp(from.yPct ?? 0, to.yPct ?? 0, t) : undefined;
    const y = yIsPct
      ? `calc(${yPctVal}${vhUnit})`
      : lerp(from.y ?? 0, to.y ?? 0, t);
    return { x, y, yPctVal };
  };

  const { x, y, yPctVal } = computePos(from, to);
  const visible = hold ? currentFrame >= start : currentFrame >= start && currentFrame <= end;
  const opacity = lerp(opacityFrom, opacityTo, t);

  const isBottomCenter = anchor === "bottom-center";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? opacity : 0 }}
      transition={{ duration: 0.25 }}
      className={`absolute ${isBottomCenter ? 'w-full flex justify-center' : 'inline-block'} pointer-events-auto ${className}`}
      style={{
        left: isBottomCenter ? 0 : x,
        right: isBottomCenter ? 0 : undefined,
        top: !isBottomCenter ? y : undefined,
        bottom: isBottomCenter ? (yPctVal != null ? `${Math.max(0, 100 - yPctVal)}${vhUnit}` : undefined) : undefined,
        transform:
          anchor === "center"
            ? "translate(-50%, -50%)"
            : anchor === "top-center"
            ? "translate(-50%, 0%)"
            : isBottomCenter
            ? "translateY(0%)"
            : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

export default SceneOverlay;

function ScrollAura() {
  const { scrollFraction } = useFrame();
  const y = `${Math.min(0.98, Math.max(0.02, scrollFraction)) * 100}%`;
  return (
    <div className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none z-10">
      {/* Moving RGB aura only */}
      <motion.div
        className="absolute -left-5 w-16 h-16 -translate-y-1/2"
        style={{ top: y }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 via-green-400 to-blue-400 blur-3xl opacity-80" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-400/40 via-green-400/40 to-blue-400/40 blur-2xl opacity-70" />
      </motion.div>
    </div>
  );
}
