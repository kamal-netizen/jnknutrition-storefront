"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const CONTACT_EMAIL = "support@jnknutrition.com";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const subject = String(data.get("subject") || "Website enquiry");
    const message = String(data.get("message") || "");

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    setSent(true);
  }

  const fieldClass =
    "w-full bg-white border border-[#E2E8F0] rounded px-4 py-3 text-sm text-[#0B0F14] placeholder:text-[#94A3B8] outline-none focus:border-[#F9D20F] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-bold uppercase tracking-wide text-[#64748B] mb-1.5"
          >
            Name
          </label>
          <input id="name" name="name" required placeholder="Your name" className={fieldClass} />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wide text-[#64748B] mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="subject"
          className="block text-xs font-bold uppercase tracking-wide text-[#64748B] mb-1.5"
        >
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          placeholder="How can we help?"
          className={fieldClass}
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-xs font-bold uppercase tracking-wide text-[#64748B] mb-1.5"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us more…"
          className={`${fieldClass} resize-y`}
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 bg-[#F9D20F] text-[#0B0F14] font-bold uppercase tracking-wide px-6 py-3 rounded hover:bg-[#E7BF00] transition-colors"
      >
        <Send className="h-4 w-4" />
        Send Message
      </button>
      {sent && (
        <p className="text-sm text-[#16A34A] font-medium">
          Your email client should have opened. If not, email us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}
    </form>
  );
}
