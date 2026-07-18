import type { Metadata } from "next";
import type { SVGProps } from "react";
import Link from "next/link";
import {
  Store,
  Truck,
  BadgeCheck,
  Wallet,
  Globe,
  Tags,
  Handshake,
  BookOpen,
} from "lucide-react";

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.5h-.01a9.42 9.42 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c-.01 5.2-4.24 9.43-9.44 9.43Zm8.02-17.46A11.32 11.32 0 0 0 12.05.7C5.8.7.72 5.78.72 12.02c0 2 .52 3.95 1.52 5.67L.62 23.3l5.76-1.51a11.3 11.3 0 0 0 5.66 1.44h.01c6.24 0 11.32-5.08 11.32-11.32 0-3.03-1.18-5.87-3.32-8.01Z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Wholesale & Distribution | JNK Nutrition",
  description:
    "Partner with JNK Nutrition for wholesale supply, worldwide export, private label manufacturing and distributorship of 100% authentic sports nutrition and supplements.",
};

const WHATSAPP_NUMBER = "971556238582";
const WHATSAPP_DISPLAY = "+971 55 623 8582";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi JNK Nutrition, I'm interested in your wholesale program.",
)}`;

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "100% Authentic Stock",
    body: "Every product sourced directly from authorised distributors — guaranteed genuine for your shelves.",
  },
  {
    icon: Wallet,
    title: "Competitive Trade Prices",
    body: "Tiered wholesale pricing designed to protect your margins as your order volume grows.",
  },
  {
    icon: Truck,
    title: "Fast UAE Fulfilment",
    body: "Reliable, quick delivery across the Emirates so you never run out of best sellers.",
  },
  {
    icon: Store,
    title: "Full Brand Range",
    body: "Access 50+ leading brands and 2,000+ SKUs across protein, pre-workout, creatine and wellness.",
  },
] as const;

const SERVICES = [
  {
    icon: Globe,
    title: "Worldwide Export",
    body: "We ship wholesale orders internationally with full export documentation, compliant labelling and reliable freight partners — delivering authentic supplements to your market anywhere in the world.",
  },
  {
    icon: Tags,
    title: "Build Your Own Label",
    body: "Launch your own supplement brand with our private-label service. We help with formulation, manufacturing, packaging and compliance so you can go to market with a product that carries your name.",
  },
  {
    icon: Handshake,
    title: "Distributorship",
    body: "Distribute many of the world's leading supplement brands in your region. Get protected territory pricing, marketing support and priority stock allocation to grow a profitable supplement business.",
  },
  {
    icon: BookOpen,
    title: "Sales Guide & Support",
    body: "New to selling supplements? Our team shares proven product knowledge, best-seller lists, pricing guidance and merchandising tips to help you sell faster from day one.",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Get in touch",
    body: "Message us on WhatsApp or send an enquiry telling us your business, location and the categories you want to stock.",
  },
  {
    step: "02",
    title: "Receive your price list",
    body: "We send you tiered wholesale pricing, MOQs and — if you want — private-label and distributorship options tailored to you.",
  },
  {
    step: "03",
    title: "Place your order",
    body: "Confirm your selection and quantities. We prepare your order with authentic stock and export-ready paperwork.",
  },
  {
    step: "04",
    title: "Sell & restock",
    body: "We deliver fast, share a sales guide to help you move product, and keep you stocked as you grow.",
  },
] as const;

export default function WholesalePage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero band ────────────────────────────────────────── */}
      <section className="bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
          <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-3">
            Wholesale
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight max-w-4xl">
            Stock Your Shelves With The Real Deal
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#94A3B8] max-w-2xl">
            Become a JNK Nutrition wholesale partner and supply your customers
            with 100% authentic supplements from the world&apos;s top brands. We
            supply retailers, gyms and distributors across the UAE and
            <span className="text-white"> export worldwide</span> — plus help you
            build your own label and grow a distributorship.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-[#0B0F14] font-bold uppercase tracking-wide px-6 py-3 rounded hover:bg-[#1EBE57] transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>
            <Link
              href="/pages/contact"
              className="inline-flex items-center border border-[#334155] text-white font-bold uppercase tracking-wide px-6 py-3 rounded hover:border-[#F9D20F] hover:text-[#F9D20F] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
          Why Partner With JNK
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-[#E2E8F0] bg-white p-6"
            >
              <Icon className="w-8 h-8 text-[#F9D20F]" />
              <h3 className="mt-4 text-lg font-bold text-[#0B0F14]">{title}</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Services ─────────────────────────────────────────── */}
      <section className="bg-[#EEF4FF] border-y border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-3">
            More Than Wholesale
          </h2>
          <p className="text-[#64748B] max-w-2xl mb-8">
            From single wholesale orders to launching your own brand, we support
            you at every stage of your supplement business.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border border-[#CBD5E1] bg-white p-6"
              >
                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-[#F9D20F]/15">
                  <Icon className="w-6 h-6 text-[#B8860B]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B0F14]">{title}</h3>
                  <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works / Sales guide ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-3">
          How It Works
        </h2>
        <p className="text-[#64748B] max-w-2xl mb-8">
          Getting started is simple — and we guide you through every step, from
          your first order to selling like a pro.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ step, title, body }) => (
            <div key={step} className="relative rounded-xl border border-[#E2E8F0] bg-white p-6">
              <span className="text-3xl font-black text-[#F9D20F]">{step}</span>
              <h3 className="mt-3 text-lg font-bold text-[#0B0F14]">{title}</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WhatsApp CTA ─────────────────────────────────────── */}
      <section className="bg-[#082D4C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Ready to place a wholesale order?
            </h2>
            <p className="mt-2 text-[#C7D0DA]">
              Message our trade team directly on WhatsApp at{" "}
              <span className="font-bold text-white">{WHATSAPP_DISPLAY}</span>{" "}
              for a price list and to get started.
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 shrink-0 bg-[#25D366] text-[#0B0F14] font-bold uppercase tracking-wide px-8 py-4 rounded hover:bg-[#1EBE57] transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
