
"use client";

import HeadingSection from "@/components/portfolio/HeadingSection";
import ContactsSection from "@/components/portfolio/ContactsSection";
import { SceneOverlay, SceneItem, ScenePath } from "@/components/portfolio/SceneOverlay";
import SocialRail from "@/components/portfolio/SocialRail";
import RotatingPalette from "@/components/portfolio/RotatingPalette";
import { MiniIdentity } from "@/components/portfolio/MiniBubbles";
import TopLeftNav from "@/components/portfolio/TopLeftNav";
import CompactCard from "@/components/portfolio/cards/CompactCard";
import VisitorCounter from "@/components/portfolio/VisitorCounter";
import { profile } from "@/lib/profile";
import { useEffect, useState } from "react";

const REPO_CACHE_KEY = "portfolio_repos_cache_v1";
const REPO_CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export default function HomePage() {
  // lightweight client fetch for repos to drive palettes and nav modals
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState("");

  const loadRepos = async ({ force = false, signal } = {}) => {
    setReposError("");

    if (!force) {
      try {
        const raw = localStorage.getItem(REPO_CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          const isFresh = Date.now() - cached?.timestamp < REPO_CACHE_TTL_MS;
          if (isFresh && Array.isArray(cached?.repos)) {
            setRepos(cached.repos);
            setReposLoading(false);
            return;
          }
        }
      } catch {
        // Ignore cache read issues and fallback to network.
      }
    }

    setReposLoading(true);
    try {
      const response = await fetch(`https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=updated`, {
        headers: { Accept: "application/vnd.github+json" },
        signal,
      });
      if (!response.ok) {
        throw new Error(`GitHub API request failed (${response.status})`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected GitHub response shape");
      }

      setRepos(data);
      try {
        localStorage.setItem(
          REPO_CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), repos: data })
        );
      } catch {
        // Ignore cache write issues; live data already loaded.
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      setReposError("Could not load latest GitHub projects. Showing fallback cards.");
      setRepos([]);
    } finally {
      setReposLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadRepos({ signal: controller.signal });
    return () => controller.abort();
  }, []);

  const educationItems = [
    {
      school: "Lovely Professional University, Punjab",
      degree: "B.Tech in Computer Science and Engineering — Phagwara, Punjab",
      year: "2022 – Present",
    },
    {
      school: "S.R.K D.A.V Public School, Suriya",
      degree: "12th with Science  — Suriya, Jharkhand",
      year: "2020 – 2022",
    },
    {
      school: "S.R.K D.A.V Public School, Suriya",
      degree: "10th with Science  — Suriya, Jharkhand",
      year: "2019 – 2020",
    },
  ];

  const fallbackCards12 = Array.from({ length: 12 }).map((_, i) => (
    <CompactCard
      key={`fb12-${i}`}
      title="View projects on GitHub"
      subtitle={`github.com/${profile.githubUser}`}
      desc="Open my repositories on GitHub while data loads."
      href={profile.githubReposUrl}
    />
  ));
  const projectCards12 = (repos && repos.length ? repos : []).slice(0, 12).map((r) => (
    <CompactCard
      key={r.id}
      title={r.name}
      subtitle={r.language}
      desc={r.description}
      href={r.html_url}
      footer={Array.isArray(r.topics) ? r.topics.slice(0, 4).map((t) => (
        <span key={t} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] ring-1 ring-white/15">{t}</span>
      )) : null}
    />
  ));
  const fallbackCards8 = Array.from({ length: 8 }).map((_, i) => (
    <CompactCard
      key={`fb8-${i}`}
      title={reposLoading ? "Loading projects..." : "Open GitHub"}
      subtitle={profile.githubUser}
      desc={reposLoading ? "Fetching repositories from GitHub." : "Tap to view all repositories."}
      href={profile.githubReposUrl}
    />
  ));
  const projectCards8 = (repos && repos.length ? repos : []).slice(0, 8).map((r) => (
    <CompactCard key={r.id} title={r.name} subtitle={r.language} desc={r.description} href={r.html_url} />
  ));

  return (
    <SceneOverlay>
      {/* Show nav, social rail, and minibubble only after heading reaches top (frame ~50) */}
      <SceneItem start={50} end={10000} className="inset-0 z-50">
        {/* Top-left nav with modals */}
        <TopLeftNav
          projectItems={(projectCards12.length ? projectCards12 : fallbackCards12)}
          educationItems={educationItems}
          contactContent={<ContactsSection />}
        />
        {/* Social rail mid-left */}
        <SocialRail />
        {/* Mini bubble */}
        <MiniIdentity />
      </SceneItem>
      {reposError && (
        <SceneItem start={50} end={10000} xPct={50} yPct={6} anchor="top-center" className="z-40">
          <div className="rounded-xl bg-rose-950/55 px-3 py-2 text-xs text-rose-100 ring-1 ring-rose-300/30 backdrop-blur-md flex items-center gap-2">
            <span>{reposError}</span>
            <button
              type="button"
              onClick={() => loadRepos({ force: true })}
              className="rounded-md bg-white/15 px-2 py-1 text-rose-50 hover:bg-white/25"
            >
              Retry
            </button>
          </div>
        </SceneItem>
      )}
      {/* Move heading from center-bottom to center-top; heading component handles morph; subheading shows from start */}
      <ScenePath
        start={1}
        end={50}
        from={{ xPct: 50, yPct: 85 }}
          to={{ xPct: 50, yPct: 0 }}
        opacityFrom={1}
        opacityTo={1}
          anchor="top-center"
        hold
      >
        <div className="inline-block">
          <HeadingSection morphStart={50} morphEnd={80} />
        </div>
      </ScenePath>
      {/* No separate morph component needed */}
      {/* Projects rotating palette: keep visible from heading-top to end */}
      <SceneItem start={50} end={10000} xPct={100} yPct={50} anchor="center" className="z-20">
        {(projectCards8.length > 0 ? (
          <RotatingPalette
            items={projectCards8}
            radius={"40vh"}
            itemSize={160}
            centerX={"50%"}
            centerY={"50%"}
            rotationOffset={0}
            mapToGaze={true}
          />
        ) : (
          <RotatingPalette
            items={fallbackCards8}
            radius={"38vh"}
            itemSize={160}
            centerX={"50%"}
            centerY={"50%"}
            rotationOffset={0}
            mapToGaze={true}
          />
        ))}
      </SceneItem>
      {/* Contact removed from scroll (still available in nav modal) */}
      <VisitorCounter />
    </SceneOverlay>
  );
}
