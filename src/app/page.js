
"use client";

import HeadingSection from "@/components/portfolio/HeadingSection";
import AboutSection from "@/components/portfolio/AboutSection";
import ContactsSection from "@/components/portfolio/ContactsSection";
import { SceneOverlay, SceneItem, ScenePath } from "@/components/portfolio/SceneOverlay";
import SocialRail from "@/components/portfolio/SocialRail";
import RotatingPalette from "@/components/portfolio/RotatingPalette";
import { MiniIdentity } from "@/components/portfolio/MiniBubbles";
import TopLeftNav from "@/components/portfolio/TopLeftNav";
import CompactCard from "@/components/portfolio/cards/CompactCard";
import { useEffect, useState } from "react";

export default function HomePage() {
  // lightweight client fetch for repos to drive palettes and nav modals
  const [repos, setRepos] = useState([]);
  useEffect(() => {
    fetch("https://api.github.com/users/Krishnaqwerty/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => r.json())
      .then((d) => setRepos(Array.isArray(d) ? d : []))
      .catch(() => {});
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
      subtitle="github.com/Krishnaqwerty"
      desc="Open my repositories on GitHub while data loads."
      href="https://github.com/Krishnaqwerty?tab=repositories"
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
      title="Open GitHub"
      subtitle="Krishnaqwerty"
      desc="Tap to view all repositories."
      href="https://github.com/Krishnaqwerty?tab=repositories"
    />
  ));
  const projectCards8 = (repos && repos.length ? repos : []).slice(0, 8).map((r) => (
    <CompactCard key={r.id} title={r.name} subtitle={r.language} desc={r.description} href={r.html_url} />
  ));

  return (
    <SceneOverlay>
      {/* Show nav, social rail, and minibubble only after heading reaches top (frame ~50) */}
      <SceneItem start={50} end={10000} className="inset-0">
        {/* Top-left nav with modals */}
        <TopLeftNav
          projectItems={(projectCards12.length ? projectCards12 : fallbackCards12)}
          educationItems={educationItems.map((e, idx) => (
            <CompactCard key={idx} title={e.school} subtitle={e.year} desc={e.degree} />
          ))}
          contactContent={<ContactsSection />}
        />
        {/* Social rail mid-left */}
        <SocialRail />
        {/* Mini bubble */}
        <MiniIdentity />
      </SceneItem>
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
      {/* About appears when heading reaches top (frame 50) and persists at bottom-center */}
      <SceneItem start={50} end={10000} x={"50%"} yPct={100} vhUnit="dvh" anchor="bottom-center" className="z-30 w-full max-w-3xl">
        <AboutSection />
      </SceneItem>
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
    </SceneOverlay>
  );
}
