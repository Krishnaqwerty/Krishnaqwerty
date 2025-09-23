"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GlassCard } from "./GlassCard";
import { motion } from "framer-motion";

const GITHUB_USER = "Krishnaqwerty";

function categorizeRepo(r) {
  const n = (r.name || "").toLowerCase();
  const d = (r.description || "").toLowerCase();
  const t = new Set(r.topics || []);
  if (t.has("frontend") || /next|react|tailwind|ui|frontend/.test(n + " " + d)) return "Frontend";
  if (t.has("backend") || /node|api|express|server|backend/.test(n + " " + d)) return "Backend";
  if (t.has("ml") || t.has("ai") || /ml|ai|model|pytorch|tensorflow/.test(n + " " + d)) return "ML/AI";
  if (t.has("tooling") || /cli|tool|lib|config|storybook|eslint|prettier/.test(n + " " + d)) return "Tooling";
  return "Other";
}

function techFromRepo(r) {
  const topics = r.topics || [];
  const tech = new Set();
  topics.forEach((t) => tech.add(t));
  if (r.language) tech.add(r.language);
  return Array.from(tech).slice(0, 6);
}

export default function GitHubProjectsSection() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Fetch repos (public); include topics (requires Accept header)
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
        const data = await res.json();
        // Sort by recruiter impact: stars (desc) then recent activity (desc)
        data.sort((a, b) => {
          const starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
          if (starDiff !== 0) return starDiff;
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });
        if (active) setRepos(data);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const byCategory = useMemo(() => {
    const grouped = new Map();
    repos.forEach((r) => {
      const cat = categorizeRepo(r);
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(r);
    });
    return grouped;
  }, [repos]);

  if (loading) {
    return <div className="text-white/80">Loading GitHub projects…</div>;
  }
  if (error) {
    return <div className="text-red-300">Failed to load projects: {error}</div>;
  }

  return (
    <section className="w-[min(92vw,1120px)]">
      <div className="mb-4 text-2xl font-semibold">Projects (Latest activity first)</div>
      <div className="grid gap-6">
        {[...byCategory.keys()].map((cat) => (
          <div key={cat}>
            <div className="mb-2 text-lg font-semibold text-white/90">{cat}</div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {byCategory.get(cat).slice(0, 6).map((r) => (
                <GlassCard key={r.id}>
                  <motion.a
                    href={r.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-semibold hover:underline underline-offset-4"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.4 }}
                  >
                    {r.name}
                  </motion.a>
                  {r.description && (
                    <p className="mt-1 text-white/80 text-sm">{r.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {r.language && (
                      <span className="rounded-full bg-emerald-400/20 text-emerald-200 px-2 py-0.5 text-xs ring-1 ring-inset ring-emerald-400/30">
                        {r.language}
                      </span>
                    )}
                    {techFromRepo(r).map((t) => (
                      <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80 ring-1 ring-inset ring-white/15">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-white/60">
                    <span>★ {r.stargazers_count} • Updated {new Date(r.pushed_at).toLocaleDateString()}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
