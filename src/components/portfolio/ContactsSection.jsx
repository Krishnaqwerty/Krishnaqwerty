"use client";

import React from "react";
import { GlassCard } from "./GlassCard";

export function ContactsSection() {
  return (
    <section id="contacts" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-10 pb-24">
      <h2 className="text-2xl font-semibold mb-4">Contact</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <GlassCard>
          <h3 className="text-lg font-semibold">Get in touch</h3>
          <p className="mt-2 text-white/80">I’m open to freelance, collaborations, and full-time opportunities.</p>
          <ul className="mt-4 space-y-2 text-white/80">
            <li><a href="mailto:you@example.com" className="underline underline-offset-4 hover:text-sky-200">you@example.com</a></li>
            <li><a href="#" className="underline underline-offset-4 hover:text-sky-200">LinkedIn</a></li>
            <li><a href="#" className="underline underline-offset-4 hover:text-sky-200">GitHub</a></li>
            <li><a href="#" className="underline underline-offset-4 hover:text-sky-200">Twitter</a></li>
          </ul>
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-semibold">Quick message</h3>
          <form className="mt-3 grid gap-3">
            <input className="rounded-md bg-white/10 px-3 py-2 text-sm placeholder:text-white/50 ring-1 ring-inset ring-white/15 focus:outline-none focus:ring-sky-400/50" placeholder="Your name" />
            <input type="email" className="rounded-md bg-white/10 px-3 py-2 text-sm placeholder:text-white/50 ring-1 ring-inset ring-white/15 focus:outline-none focus:ring-sky-400/50" placeholder="Your email" />
            <textarea rows={4} className="rounded-md bg-white/10 px-3 py-2 text-sm placeholder:text-white/50 ring-1 ring-inset ring-white/15 focus:outline-none focus:ring-sky-400/50" placeholder="Message" />
            <button type="button" className="inline-flex justify-center rounded-md bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400/90 transition">Send</button>
          </form>
        </GlassCard>
      </div>
    </section>
  );
}

export default ContactsSection;
