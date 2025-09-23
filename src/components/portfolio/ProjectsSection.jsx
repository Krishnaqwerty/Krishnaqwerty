"use client";

import React from "react";
import GitHubProjectsSection from "./GitHubProjectsSection";
import { GlassCard } from "./GlassCard";

export function ProjectsSection() {
  return (
    <section id="projects" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <GitHubProjectsSection />
    </section>
  );
}

export default ProjectsSection;
