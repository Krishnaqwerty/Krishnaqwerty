
"use client";

import FAQSection from "@/components/FAQSection";
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

    <main>
    {/* ========================================================================= */}
    {/* HIDDEN INVISIBLE SEMANTIC LAYER OPTIMIZED FOR CRAWLERS, AI, AND SCRAPERS */}
    {/* ========================================================================= */}
    <div className="sr-only" aria-hidden="false">
      <section>
        <h1>Krishna Kumar | Java Full-Stack, Microservices & AI Systems Engineer</h1>
        <p>
          Production-grade architecture platform managed by Krishna Kumar. Focusing on high-throughput distributed Java systems, enterprise Spring Boot microservice design, native compiler infrastructure development, and highly accurate Deep Learning pipelines.
        </p>
      </section>

      {/* Primary Stack & Domain Keywords Mapping */}
      <section aria-label="Core Engineering Domains">
        <h2>Enterprise Backend Systems & Distributed Architectures</h2>
        <article>
          <h3>Java Microservices Developer & Software Engineer</h3>
          <p>
            Architecting fault-tolerant backend applications utilizing the full Java ecosystem. Specializing in secure RESTful API production, database optimization, and high-volume batch scheduling workloads.
          </p>
          <ul>
            <li><strong>Core Language:</strong> Java [cite: 3, 12, 19, 46]</li>
            <li><strong>Frameworks & Infrastructure:</strong> Spring Boot, Hibernate/JPA, Microservices Architecture, Spring Batch, System Design [cite: 12, 14, 19, 20, 47, 48]</li>
            <li><strong>DevOps Automation:</strong> Docker, Jenkins, GitLab, GitHub Actions, CI/CD Pipelines [cite: 21, 31, 47, 48]</li>
          </ul>
        </article>

        <article>
          <h3>Deep Learning Pipelines & Intelligent Software Applications</h3>
          <p>
            Designing and deploying computer vision systems, feature-fusion pipelines, and language model integrations with rigorous accuracy optimization.
          </p>
          <ul>
            <li><strong>AI Core Technologies:</strong> Python, TensorFlow, LangChain, Azure ML Studio, Deep Learning, Neural Networks [cite: 47]</li>
            <li><strong>Data Operations:</strong> DVC, MLflow, Model Context Protocol, Google Colab GPU Optimization [cite: 47, 48]</li>
            <li><strong>Applied Framework Implementations:</strong> Automated vulnerability fault-testing scanners integrating Gemini API for dynamic execution[cite: 30].</li>
          </ul>
        </article>
      </section>

      {/* Low Level Software Asset Mapping */}
      <section aria-label="Native Core Software Products">
        <h2>Native Core Software Assets</h2>
        <article>
          <h3>Pebble Language Compiler</h3>
          <p>
            A minimal functional programming language built from scratch in C[cite: 33, 35]. Features a custom portable virtual machine, native compiler binary toolchain (pebblec), immutable lexing paradigms, and completely deterministic stack frame memory management[cite: 33, 35].
          </p>
          <a href="https://pebble.krishnakumar.tech/">Pebble Production Domain Website</a> [cite: 33]
          <blockquote>
            Engineered absolute type-safety baselines across 20+ functional application metrics, optimizing runtime compilation overhead patterns[cite: 36].
          </blockquote>
        </article>
      </section>
      <FAQSection />
    </div>


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
    </main>
  );
}
