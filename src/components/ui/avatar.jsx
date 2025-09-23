"use client"; // <--- crucial for Next.js client component

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

export const FrameContext = createContext({ currentFrame: 1, frameCount: 1, scrollFraction: 0 });
export const useFrame = () => useContext(FrameContext);

export function ScrollAnimationPage({ children }) {
  // --- Configuration ---
  const frameCount = 300; // maximum expected frames

  const getFrameUrl = (frame) => {
    const frameNumber = String(frame).padStart(3, '0');
    return `/frames/${frameNumber}.png`;
  };

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [maxLoadedFrame, setMaxLoadedFrame] = useState(1);
  const canvasRef = useRef(null);
  const imageCache = useRef([]);

  // Preload frames
  useEffect(() => {
    const preloadImages = async () => {
      const promises = [];
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const promise = new Promise((resolve) => {
          img.onload = () => {
            setProgress((prev) => prev + 1);
            resolve({ index: i, ok: true });
          };
          img.onerror = () => resolve({ index: i, ok: false });
          img.src = getFrameUrl(i);
        });
        imageCache.current[i] = img;
        promises.push(promise);
      }
      const results = await Promise.allSettled(promises);
      let maxOk = 1;
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.ok) {
          if (r.value.index > maxOk) maxOk = r.value.index;
        }
      });
      setMaxLoadedFrame(maxOk);
      setLoading(false);
    };
    preloadImages();
  }, []);

  // Map scroll -> frame
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = maxScrollY > 0 ? scrollY / maxScrollY : 0;
      const maxFrames = maxLoadedFrame || frameCount;
      const frameIndex = Math.min(maxFrames, Math.max(1, Math.ceil(fraction * maxFrames)));
      setCurrentFrame(frameIndex);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxLoadedFrame]);

  // Draw to canvas
  useEffect(() => {
    if (loading || !canvasRef.current || !imageCache.current[currentFrame]) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = imageCache.current[currentFrame];

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

  const totalFrames = maxLoadedFrame || frameCount;
  const scrollFraction = totalFrames > 1 ? currentFrame / totalFrames : 0;

  return (
  <main className="relative bg-black text-white min-h-[220vh] font-sans">
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <div className="w-64 bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress / Math.max(1, maxLoadedFrame)) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-lg text-gray-300">Loading Frames... {Math.round((progress / Math.max(1, maxLoadedFrame)) * 100)}%</p>
        </div>
      )}

      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-screen z-0" />

      <FrameContext.Provider value={{ currentFrame, frameCount: totalFrames, scrollFraction }}>
        <div className="fixed inset-0 z-10">
          {children}
        </div>
      </FrameContext.Provider>
    </main>
  );
}