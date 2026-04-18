"use client";

import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { profile } from "@/lib/profile";

export function ContactsSection({ showTitle = false }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState({ type: "idle", text: "" });
  const [sending, setSending] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Basic bot trap: real users should never fill this hidden field.
    if (form.website.trim()) {
      setStatus({ type: "error", text: "Submission blocked. Please try again." });
      return;
    }

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ type: "error", text: "Please fill in all fields before sending." });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      setStatus({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    try {
      setSending(true);
      setStatus({ type: "idle", text: "" });

      const response = await fetch("/api/contact-lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Unable to send message.");
      }

      setStatus({ type: "success", text: "Message sent successfully." });
      setForm({ name: "", email: "", message: "", website: "" });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to send message.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contacts" className="w-full max-w-[920px] mx-auto px-0 sm:px-2 py-1">
      {showTitle && <h2 className="text-2xl font-semibold mb-4">Contact</h2>}
      <div className="grid gap-4 md:grid-cols-[0.92fr_1.08fr] items-start">
        <GlassCard className="p-5 md:p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">Get in touch</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                I’m open to freelance, collaborations, and full-time opportunities.
              </p>
            </div>
            <div className="space-y-2">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center justify-between rounded-xl border border-white/15 bg-white/6 px-3 py-3 text-sm text-white/90 transition hover:bg-white/10 hover:border-white/25"
              >
                <span className="truncate">{profile.email}</span>
                <span className="ml-4 text-xs text-white/55">Email</span>
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/15 bg-white/6 px-3 py-3 text-sm text-white/90 transition hover:bg-white/10 hover:border-white/25"
              >
                <span>LinkedIn</span>
                <span className="ml-4 text-xs text-white/55">Profile</span>
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/15 bg-white/6 px-3 py-3 text-sm text-white/90 transition hover:bg-white/10 hover:border-white/25"
              >
                <span>GitHub</span>
                <span className="ml-4 text-xs text-white/55">Repos</span>
              </a>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 md:p-6">
          <h3 className="text-base font-semibold text-white">Quick message</h3>
          <form className="mt-4 grid gap-3" onSubmit={onSubmit} noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-white/70 text-xs uppercase tracking-[0.18em]">Your name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="rounded-xl bg-black/20 px-3 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-inset ring-white/12 focus:outline-none focus:ring-sky-400/50"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-white/70 text-xs uppercase tracking-[0.18em]">Your email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="rounded-xl bg-black/20 px-3 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-inset ring-white/12 focus:outline-none focus:ring-sky-400/50"
                  placeholder="Your email"
                  autoComplete="email"
                  required
                />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="text-white/70 text-xs uppercase tracking-[0.18em]">Message</span>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={onChange}
                className="rounded-xl bg-black/20 px-3 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-inset ring-white/12 focus:outline-none focus:ring-sky-400/50 resize-none"
                placeholder="Tell me a bit about the project"
                required
              />
            </label>
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={onChange}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <button
              type="submit"
              disabled={sending}
              className="inline-flex justify-center rounded-xl bg-sky-500/90 px-4 py-3 text-sm font-medium text-white hover:bg-sky-400 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send"}
            </button>
            {status.type !== "idle" && (
              <p className={`text-xs ${status.type === "success" ? "text-emerald-300" : "text-rose-300"}`}>{status.text}</p>
            )}
          </form>
        </GlassCard>
      </div>
    </section>
  );
}

export default ContactsSection;
