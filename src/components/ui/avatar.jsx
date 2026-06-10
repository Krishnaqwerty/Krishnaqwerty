"use client"; // <--- crucial for Next.js client component

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

export const FrameContext = createContext({ currentFrame: 1, frameCount: 1, scrollFraction: 0 });
export const useFrame = () => useContext(FrameContext);

export function ScrollAnimationPage({ children }) {
  // --- Configuration ---
  const frameCount = 300; // maximum expected frames
  const initialFrameTarget = 30;

  const getFrameUrl = (frame) => {
    const frameNumber = String(frame).padStart(3, '0');
    return `/frames/${frameNumber}.png`;
  };

  const [loading, setLoading] = useState(true);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [initialSettled, setInitialSettled] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [maxLoadedFrame, setMaxLoadedFrame] = useState(1);
  const canvasRef = useRef(null);
  const imageCache = useRef([]);
  const loadedFlags = useRef(Array(frameCount + 1).fill(false));

  // Preload frames
  useEffect(() => {
    let cancelled = false;

    const markFrameLoaded = (index) => {
      if (loadedFlags.current[index]) return;
      loadedFlags.current[index] = true;
      setLoadedFrames((prev) => prev + 1);
      setMaxLoadedFrame((prev) => {
        let next = prev;
        while (next + 1 <= frameCount && loadedFlags.current[next + 1]) next += 1;
        return next;
      });
    };

    const loadFrame = (index) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (!cancelled) markFrameLoaded(index);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = getFrameUrl(index);
        imageCache.current[index] = img;
      });

    const preloadIndices = async (indices, concurrency = 6) => {
      let pointer = 0;
      const workers = Array.from({ length: concurrency }, async () => {
        while (pointer < indices.length && !cancelled) {
          const index = indices[pointer];
          pointer += 1;
          await loadFrame(index);
          if (!cancelled && index <= initialFrameTarget) {
            setInitialSettled((prev) => prev + 1);
          }
        }
      });
      await Promise.all(workers);
    };

    const bootstrap = async () => {
      const initialIndices = Array.from({ length: initialFrameTarget }, (_, i) => i + 1);
      const backgroundIndices = Array.from({ length: frameCount - initialFrameTarget }, (_, i) => i + initialFrameTarget + 1);

      await preloadIndices(initialIndices, 6);
      if (!cancelled) setLoading(false);

      // Continue preloading without blocking interaction.
      preloadIndices(backgroundIndices, 4);
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Map scroll -> frame
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = maxScrollY > 0 ? scrollY / maxScrollY : 0;
      const frameIndex = Math.min(frameCount, Math.max(1, Math.ceil(fraction * frameCount)));
      setCurrentFrame(frameIndex);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Draw to canvas
  useEffect(() => {
    if (loading || !canvasRef.current) return;

    const findDrawableFrame = (target) => {
      if (loadedFlags.current[target]) return target;
      for (let i = target - 1; i >= 1; i -= 1) {
        if (loadedFlags.current[i]) return i;
      }
      for (let i = target + 1; i <= frameCount; i += 1) {
        if (loadedFlags.current[i]) return i;
      }
      return 1;
    };

    const drawableFrame = findDrawableFrame(currentFrame);
    const drawableImage = imageCache.current[drawableFrame];
    if (!drawableImage) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = drawableImage;

    const scaleAndDraw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = img.naturalWidth / img.naturalHeight;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;
      if (canvasRatio > imageRatio) {
        drawHeight = canvas.width / imageRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imageRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    if (img.complete) scaleAndDraw();
    else img.onload = scaleAndDraw;

    window.addEventListener('resize', scaleAndDraw);
    return () => window.removeEventListener('resize', scaleAndDraw);
  }, [currentFrame, loading]);

  const scrollFraction = frameCount > 1 ? currentFrame / frameCount : 0;

  return (
  <main className="relative bg-black text-white min-h-[220vh] font-sans">
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <div className="w-64 bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(initialSettled / Math.max(1, initialFrameTarget)) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-lg text-gray-300">Preparing animation... {Math.round((initialSettled / Math.max(1, initialFrameTarget)) * 100)}%</p>
          <p className="mt-2 text-sm text-gray-400">Loading core frames first ({Math.min(initialSettled, initialFrameTarget)}/{initialFrameTarget})</p>
        </div>
      )}

      {!loading && loadedFrames < frameCount && (
        <div className="fixed right-3 top-3 z-40 rounded-md bg-black/40 px-2 py-1 text-xs text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
          Optimizing playback... {Math.round((loadedFrames / frameCount) * 100)}%
        </div>
      )}

      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-screen z-0" />

      <FrameContext.Provider value={{ currentFrame, frameCount, scrollFraction }}>
        <div className="fixed inset-0 z-10">
          {children}
        </div>
      </FrameContext.Provider>
    </main>
  );
}