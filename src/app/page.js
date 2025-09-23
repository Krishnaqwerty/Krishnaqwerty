
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
      degree: "12th with Science – 75.00% — Suriya, Jharkhand",
      year: "2020 – 2022",
    },
    {
      school: "S.R.K D.A.V Public School, Suriya",
      degree: "10th with Science – 93.00% — Suriya, Jharkhand",
      year: "2019 – 2020",
    },
  ];

  const projectCards12 = (repos || []).slice(0, 12).map((r) => (
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
  const projectCards8 = (repos || []).slice(0, 8).map((r) => (
    <CompactCard key={r.id} title={r.name} subtitle={r.language} desc={r.description} href={r.html_url} />
  ));

  return (
    <SceneOverlay>
      {/* Show nav, social rail, and minibubble only after heading reaches top (frame ~50) */}
      <SceneItem start={50} end={10000} className="inset-0">
        {/* Top-left nav with modals */}
        <TopLeftNav
          projectItems={projectCards12}
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
      {/* About pill docks at bottom and stays visible till end of scroll */}
      <SceneItem start={30} end={184} xPct={50} yPct={92} anchor="center">
        <AboutSection />
      </SceneItem>
      {/* Projects rotating palette: center at the middle of the right edge */}
      <SceneItem start={70} end={184} xPct={100} yPct={50} anchor="center">
        {projectCards8.length > 0 ? (
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
          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 backdrop-blur px-4 py-2 text-white/80">
            Loading GitHub projects…
          </div>
        )}
      </SceneItem>
      {/* Contact removed from scroll (still available in nav modal) */}
    </SceneOverlay>
  );
}
