"use client";

import { useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";

const VISITOR_ID_KEY = "portfolio_visitor_id";
const LOCAL_STORAGE_ID_KEY = "portfolio_local_storage_id";
const SESSION_STORAGE_ID_KEY = "portfolio_session_storage_id";
const INDEXED_DB_NAME = "portfolio_analytics";
const INDEXED_DB_STORE = "keyval";
const INDEXED_DB_ID_KEY = "indexed_db_id";
const COOKIE_VISITOR_ID = "portfolio_cookie_id";

function randomId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function hashString(input = "") {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const target = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return target ? decodeURIComponent(target.split("=")[1] || "") : null;
}

function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getOrCreateStorageId(storage, key, prefix) {
  try {
    let value = storage.getItem(key);
    if (!value) {
      value = randomId(prefix);
      storage.setItem(key, value);
    }
    return value;
  } catch {
    return null;
  }
}

async function getOrCreateIndexedDbId() {
  if (typeof indexedDB === "undefined") return null;

  return new Promise((resolve) => {
    try {
      const openRequest = indexedDB.open(INDEXED_DB_NAME, 1);

      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
          db.createObjectStore(INDEXED_DB_STORE, { keyPath: "key" });
        }
      };

      openRequest.onerror = () => resolve(null);

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction(INDEXED_DB_STORE, "readwrite");
        const store = transaction.objectStore(INDEXED_DB_STORE);
        const getRequest = store.get(INDEXED_DB_ID_KEY);

        getRequest.onerror = () => {
          db.close();
          resolve(null);
        };

        getRequest.onsuccess = () => {
          const existing = getRequest.result?.value;
          if (existing) {
            db.close();
            resolve(existing);
            return;
          }

          const nextValue = randomId("idb");
          const putRequest = store.put({ key: INDEXED_DB_ID_KEY, value: nextValue });
          putRequest.onsuccess = () => {
            db.close();
            resolve(nextValue);
          };
          putRequest.onerror = () => {
            db.close();
            resolve(null);
          };
        };
      };
    } catch {
      resolve(null);
    }
  });
}

function supportsStorage(type) {
  try {
    if (type === "localStorage") {
      const key = "__storage_test_ls__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    }
    if (type === "sessionStorage") {
      const key = "__storage_test_ss__";
      sessionStorage.setItem(key, "1");
      sessionStorage.removeItem(key);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function getBrowserInfo(ua = "") {
  const rules = [
    { name: "Edge", regex: /Edg\/([\d.]+)/ },
    { name: "Chrome", regex: /Chrome\/([\d.]+)/ },
    { name: "Firefox", regex: /Firefox\/([\d.]+)/ },
    { name: "Safari", regex: /Version\/([\d.]+).*Safari/ },
  ];

  for (const rule of rules) {
    const match = ua.match(rule.regex);
    if (match) {
      return { name: rule.name, version: match[1] || null };
    }
  }

  return { name: "Unknown", version: null };
}

function getOsInfo(ua = "") {
  const checks = [
    { name: "Windows", regex: /Windows NT/ },
    { name: "macOS", regex: /Mac OS X/ },
    { name: "iOS", regex: /iPhone|iPad|iPod/ },
    { name: "Android", regex: /Android/ },
    { name: "Linux", regex: /Linux/ },
  ];

  for (const check of checks) {
    if (check.regex.test(ua)) return check.name;
  }

  return "Unknown";
}

function getWebGlDetails() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      return {
        supported: false,
        vendor: null,
        renderer: null,
        version: null,
        hash: null,
      };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const version = gl.getParameter(gl.VERSION);
    const hash = hashString(`${vendor || ""}|${renderer || ""}|${version || ""}`);

    return {
      supported: true,
      vendor: vendor || null,
      renderer: renderer || null,
      version: version || null,
      hash,
    };
  } catch {
    return {
      supported: false,
      vendor: null,
      renderer: null,
      version: null,
      hash: null,
    };
  }
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 60;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.textBaseline = "top";
    context.font = "16px Arial";
    context.fillStyle = "#1a6b8f";
    context.fillRect(4, 4, 220, 24);
    context.fillStyle = "#efefef";
    context.fillText("Krishna Portfolio Fingerprint", 8, 8);
    context.strokeStyle = "#3d2a54";
    context.beginPath();
    context.arc(260, 22, 14, 0, Math.PI * 2);
    context.stroke();

    return hashString(canvas.toDataURL());
  } catch {
    return null;
  }
}

async function getAudioFingerprint() {
  return new Promise((resolve) => {
    const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioCtx) {
      resolve(null);
      return;
    }

    let resolved = false;
    const safeResolve = (value) => {
      if (!resolved) {
        resolved = true;
        resolve(value);
      }
    };

    try {
      const context = new AudioCtx(1, 44100, 44100);
      const oscillator = context.createOscillator();
      const compressor = context.createDynamicsCompressor();

      oscillator.type = "triangle";
      oscillator.frequency.value = 10000;
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      oscillator.connect(compressor);
      compressor.connect(context.destination);
      oscillator.start(0);
      context.startRendering();

      context.oncomplete = (event) => {
        try {
          const channelData = event.renderedBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 4500; i < 5000; i += 1) {
            sum += Math.abs(channelData[i] || 0);
          }
          safeResolve(hashString(sum.toString()));
        } catch {
          safeResolve(null);
        }
      };

      setTimeout(() => safeResolve(null), 1500);
    } catch {
      safeResolve(null);
    }
  });
}

function detectFonts() {
  try {
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testFonts = [
      "Arial",
      "Verdana",
      "Times New Roman",
      "Courier New",
      "Georgia",
      "Trebuchet MS",
      "Comic Sans MS",
      "Impact",
      "Calibri",
      "Cambria",
    ];
    const testText = "mmmmmmmmmmlli";
    const testSize = "72px";
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return [];

    const baseline = {};
    for (const baseFont of baseFonts) {
      context.font = `${testSize} ${baseFont}`;
      baseline[baseFont] = context.measureText(testText).width;
    }

    return testFonts.filter((font) => {
      return baseFonts.some((baseFont) => {
        context.font = `${testSize} '${font}', ${baseFont}`;
        const width = context.measureText(testText).width;
        return width !== baseline[baseFont];
      });
    });
  } catch {
    return [];
  }
}

function getNavigationType() {
  try {
    const entries = performance.getEntriesByType("navigation");
    if (entries.length > 0) {
      return entries[0]?.type || "unknown";
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

function getCurrentPath() {
  return `${window.location.pathname || "/"}${window.location.search || ""}${window.location.hash || ""}`;
}

function summarizeBehavior(behavior) {
  const average = (items) => {
    if (!items.length) return null;
    return Math.round(items.reduce((acc, value) => acc + value, 0) / items.length);
  };

  return {
    mouseMoveCount: behavior.mouseMoveCount,
    mouseTravelPixels: Math.round(behavior.mouseTravelPixels),
    mouseAverageIntervalMs: average(behavior.mouseIntervals),
    clickCount: behavior.clickCount,
    scrollEventCount: behavior.scrollEventCount,
    maxScrollDepthPct: Math.round(behavior.maxScrollDepthPct),
    keyStrokeCount: behavior.keyStrokeCount,
    typingAverageIntervalMs: average(behavior.typingIntervals),
  };
}

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState(0);
  const behaviorRef = useRef({
    mouseMoveCount: 0,
    mouseTravelPixels: 0,
    mouseIntervals: [],
    lastMouseX: null,
    lastMouseY: null,
    lastMouseTs: null,
    clickCount: 0,
    scrollEventCount: 0,
    maxScrollDepthPct: 0,
    keyStrokeCount: 0,
    typingIntervals: [],
    lastKeyTs: null,
  });
  const pageSequenceRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    const updateCount = (nextValue) => {
      if (Number.isFinite(nextValue) && !cancelled) {
        setVisitorCount(Number(nextValue));
      }
    };

    const postAnalytics = async (payload, useBeacon = false) => {
      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon("/api/visitor-analytics/", blob);
        return;
      }

      try {
        const response = await fetch("/api/visitor-analytics/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });

        const result = await response.json().catch(() => ({}));
        if (response.ok) {
          updateCount(Number(result?.count || 0));
        }
      } catch {
        // Ignore analytics send failures and keep the page responsive.
      }
    };

    const fetchCount = async () => {
      try {
        const response = await fetch("/api/visitor-analytics/", { cache: "no-store" });
        const result = await response.json();
        if (response.ok) {
          updateCount(Number(result?.count || 0));
        }
      } catch {
        if (!cancelled) setVisitorCount(0);
      }
    };

    const onMouseMove = (event) => {
      const behavior = behaviorRef.current;
      behavior.mouseMoveCount += 1;

      if (behavior.lastMouseX != null && behavior.lastMouseY != null) {
        const dx = event.clientX - behavior.lastMouseX;
        const dy = event.clientY - behavior.lastMouseY;
        behavior.mouseTravelPixels += Math.sqrt(dx * dx + dy * dy);
      }

      const now = Date.now();
      if (behavior.lastMouseTs != null) {
        behavior.mouseIntervals.push(now - behavior.lastMouseTs);
        if (behavior.mouseIntervals.length > 100) behavior.mouseIntervals.shift();
      }

      behavior.lastMouseX = event.clientX;
      behavior.lastMouseY = event.clientY;
      behavior.lastMouseTs = now;
    };

    const onClick = () => {
      behaviorRef.current.clickCount += 1;
    };

    const onScroll = () => {
      const behavior = behaviorRef.current;
      behavior.scrollEventCount += 1;
      const doc = document.documentElement;
      const depth = doc.scrollHeight > 0
        ? ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100
        : 0;
      if (depth > behavior.maxScrollDepthPct) {
        behavior.maxScrollDepthPct = Math.min(depth, 100);
      }
    };

    const onKeyDown = () => {
      const behavior = behaviorRef.current;
      behavior.keyStrokeCount += 1;
      const now = Date.now();
      if (behavior.lastKeyTs != null) {
        behavior.typingIntervals.push(now - behavior.lastKeyTs);
        if (behavior.typingIntervals.length > 100) behavior.typingIntervals.shift();
      }
      behavior.lastKeyTs = now;
    };

    const onRouteChangeSignal = () => {
      const current = getCurrentPath();
      const sequence = pageSequenceRef.current;
      if (sequence[sequence.length - 1] !== current) {
        sequence.push(current);
      }
    };

    const beginSession = async () => {
      const visitTimestamp = new Date().toISOString();
      const sessionStartEpoch = Date.now();
      const sessionStartIso = new Date(sessionStartEpoch).toISOString();
      const sessionId = randomId("session");

      const visitorId = getOrCreateStorageId(localStorage, VISITOR_ID_KEY, "visitor");
      if (!visitorId) return;

      const localStorageId = getOrCreateStorageId(localStorage, LOCAL_STORAGE_ID_KEY, "local");
      const sessionStorageId = getOrCreateStorageId(sessionStorage, SESSION_STORAGE_ID_KEY, "session");
      const indexedDbId = await getOrCreateIndexedDbId();

      const existingCookieId = getCookie(COOKIE_VISITOR_ID);
      const cookieId = existingCookieId || randomId("cookie");
      if (!existingCookieId) {
        setCookie(COOKIE_VISITOR_ID, cookieId);
      }

      const userAgent = navigator.userAgent || null;
      const browser = getBrowserInfo(userAgent || "");
      const osName = getOsInfo(userAgent || "");
      const webGl = getWebGlDetails();

      const [audioFingerprint, canvasFingerprint] = await Promise.all([
        getAudioFingerprint(),
        Promise.resolve(getCanvasFingerprint()),
      ]);

      const signature = {
        browserAndOs: {
          userAgent,
          browserName: browser.name,
          browserVersion: browser.version,
          operatingSystem: osName,
          platform: navigator.platform || null,
          language: navigator.language || null,
          online: typeof navigator.onLine === "boolean" ? navigator.onLine : null,
          acceptLanguages: Array.isArray(navigator.languages) ? navigator.languages : [],
        },
        screenAndDisplay: {
          screenWidth: typeof screen.width === "number" ? screen.width : null,
          screenHeight: typeof screen.height === "number" ? screen.height : null,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          devicePixelRatio: typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : null,
          colorDepth: typeof screen.colorDepth === "number" ? screen.colorDepth : null,
          orientation: screen.orientation?.type || null,
        },
        hardware: {
          cpuCores: navigator.hardwareConcurrency || null,
          deviceMemory: navigator.deviceMemory || null,
          maxTouchPoints: navigator.maxTouchPoints || 0,
        },
        browserCapabilities: {
          cookiesEnabled: navigator.cookieEnabled,
          localStorageSupported: supportsStorage("localStorage"),
          sessionStorageSupported: supportsStorage("sessionStorage"),
          indexedDbSupported: typeof indexedDB !== "undefined",
          webGlSupported: webGl.supported,
          webRtcSupported: typeof window.RTCPeerConnection !== "undefined",
          serviceWorkerSupported: "serviceWorker" in navigator,
        },
        renderingFingerprints: {
          canvas: canvasFingerprint,
          webGl: webGl.hash,
          webGlVendor: webGl.vendor,
          webGlRenderer: webGl.renderer,
          audio: audioFingerprint,
        },
        fontsAndRendering: {
          detectedFonts: detectFonts(),
        },
        pluginsAndMimeTypes: {
          plugins: Array.from(navigator.plugins || []).map((plugin) => plugin.name),
          mimeTypes: Array.from(navigator.mimeTypes || []).map((mime) => mime.type),
        },
        clientStorageIdentifiers: {
          cookieId,
          localStorageId,
          sessionStorageId,
          indexedDbId,
        },
      };

      const initialPath = getCurrentPath();
      pageSequenceRef.current = [initialPath];

      await postAnalytics({
        eventType: "session_start",
        visitorId,
        sessionId,
        visitTimestamp,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        sessionStart: sessionStartIso,
        pagePath: initialPath,
        pageVisitSequence: pageSequenceRef.current,
        navigationType: getNavigationType(),
        online: navigator.onLine,
        referrer: document.referrer || null,
        currentUrl: window.location.href,
        signature,
      });

      let sessionClosed = false;
      const closeSession = () => {
        if (sessionClosed) return;
        sessionClosed = true;

        const sessionEndEpoch = Date.now();
        const payload = {
          eventType: "session_end",
          visitorId,
          sessionId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
          sessionStart: sessionStartIso,
          sessionEnd: new Date(sessionEndEpoch).toISOString(),
          pagePath: getCurrentPath(),
          pageVisitSequence: pageSequenceRef.current,
          timeSpentMs: sessionEndEpoch - sessionStartEpoch,
          navigationType: getNavigationType(),
          online: navigator.onLine,
          referrer: document.referrer || null,
          currentUrl: window.location.href,
          behavior: summarizeBehavior(behaviorRef.current),
        };

        postAnalytics(payload, true);
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          closeSession();
        }
      };

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("click", onClick, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("keydown", onKeyDown, { passive: true });
      window.addEventListener("hashchange", onRouteChangeSignal, { passive: true });
      window.addEventListener("popstate", onRouteChangeSignal, { passive: true });
      window.addEventListener("pagehide", closeSession, { passive: true });
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
        closeSession();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("click", onClick);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("hashchange", onRouteChangeSignal);
        window.removeEventListener("popstate", onRouteChangeSignal);
        window.removeEventListener("pagehide", closeSession);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    };

    let detachListeners = null;

    fetchCount();
    beginSession().then((cleanup) => {
      if (typeof cleanup === "function") {
        detachListeners = cleanup;
      }
    });

    return () => {
      cancelled = true;
      if (typeof detachListeners === "function") {
        detachListeners();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[80] sm:bottom-6 sm:right-6">
      <div className="flex items-center gap-2 rounded-full border border-white/25 bg-black/60 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-md sm:text-sm">
        <Users className="h-3.5 w-3.5 text-cyan-200 sm:h-4 sm:w-4" aria-hidden="true" />
        <span className="text-white/80">Visitors</span>
        <span aria-label={`Total visitors ${visitorCount}`} className="font-semibold text-cyan-100">
          {visitorCount}
        </span>
      </div>
    </div>
  );
}
