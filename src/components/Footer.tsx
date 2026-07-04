import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, Store, Headset } from "lucide-react";
import type { SVGProps } from "react";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.24A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.89A4.29 4.29 0 1 1 16.29 12 4.29 4.29 0 0 1 12 16.29Zm6.85-11.15a1.54 1.54 0 1 0 1.54 1.54 1.54 1.54 0 0 0-1.54-1.54Z" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25H8.07l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64Z" />
    </svg>
  );
}

function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z" />
    </svg>
  );
}

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.05 12.54c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.3 2-1.4 2.44-.36 6.05 1.01 8.03.67.97 1.47 2.06 2.51 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.99 2.44-1.96.77-1.12 1.09-2.21 1.1-2.27-.02-.01-2.11-.81-2.13-3.25ZM15.04 6.63c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.97 1.56-.85 2.48.9.07 1.83-.46 2.39-1.13Z" />
    </svg>
  );
}

function GooglePlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3.6 2.3c-.25.27-.4.68-.4 1.22v16.96c0 .54.15.95.4 1.22l.06.05 9.5-9.5v-.5l-9.5-9.5-.06.05Z" opacity=".9" />
      <path d="m16.4 15.3-3.24-3.25v-.5l3.25-3.25.07.04 3.85 2.19c1.1.62 1.1 1.64 0 2.27l-3.85 2.19-.08.05Z" />
      <path d="m16.47 15.25-3.31-3.31-9.56 9.56c.36.39.96.43 1.64.05l11.23-6.3" />
      <path d="M16.47 8.69 5.24 2.4c-.68-.39-1.28-.34-1.64.05l9.56 9.55 3.31-3.31Z" opacity=".9" />
    </svg>
  );
}

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 7.1-1.01L12 2Z" />
    </svg>
  );
}

const SHOP_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
];

const INFO_LINKS = [
  { label: "About Us", href: "/pages/about" },
  { label: "Wholesale", href: "/pages/wholesale" },
  { label: "Blog", href: "/blogs/news" },
  { label: "FAQ", href: "/pages/faq" },
  { label: "Contact", href: "/pages/contact" },
];

const POLICY_LINKS = [
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Refund Policy", href: "/policies/refund-policy" },
  { label: "Shipping Policy", href: "/policies/shipping-policy" },
  { label: "Terms of Service", href: "/policies/terms-of-service" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "Twitter", href: "https://twitter.com", Icon: TwitterIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
];

const TRUST = [
  { Icon: Truck, title: "Free Shipping", text: "On orders over AED149" },
  { Icon: Store, title: "Wholesale", text: "Best supplements at wholesale prices" },
  { Icon: ShieldCheck, title: "Secure Checkout", text: "100% payment secure" },
  { Icon: Headset, title: "Online Support", text: "Guaranteed product quality" },
];

const APP_LINKS = [
  {
    href: "https://apps.apple.com/us/app/jnk-nutrition/id6743687638",
    Icon: AppleIcon,
    line1: "Download on the",
    line2: "App Store",
  },
  {
    href: "https://play.google.com/store/apps/details?id=com.simicart.jnknutrition",
    Icon: GooglePlayIcon,
    line1: "Get it on",
    line2: "Google Play",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#082D4C] border-t border-[#263445] mt-auto">
      {/* Trust badges */}
      <div className="border-b border-[#0D3E66]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-2 sm:gap-3">
              <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide leading-tight">{title}</p>
                <p className="text-[10px] sm:text-xs text-[#C7D0DA] leading-tight">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-[#0D3E66]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              Join the Movement
            </h3>
            <p className="mt-1 text-sm text-[#C7D0DA]">
              Get 15% off your first order plus exclusive drops &amp; deals.
            </p>
          </div>
          <form
            className="flex w-full md:w-auto max-w-md gap-2"
            action="/account/register"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="flex-1 md:w-72 bg-[#0B0F14] border border-[#263445] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#C7D0DA] outline-none focus:border-[#F9D20F] focus:ring-2 focus:ring-[#F9D20F]/30 transition-colors"
            />
            <button
              type="submit"
              className="bg-[#F9D20F] text-[#0B0F14] font-black uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-[#E7BF00] transition-colors"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label="JNK Nutrition home">
              <Image
                src="/logo.svg"
                alt="JNK Nutrition"
                width={130}
                height={71}
                className="h-11 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-3 text-sm text-[#C7D0DA] leading-relaxed max-w-xs">
              Premium nutrition supplements crafted for performance. Fuel your
              potential.
            </p>
            <div className="flex items-center gap-4 mt-5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#C7D0DA] hover:text-[#F9D20F] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Get the App */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F] mb-4">
              Get the App
            </h3>
            <p className="text-sm text-[#C7D0DA] leading-relaxed max-w-xs">
              Shop faster, track orders &amp; unlock app-only deals.
            </p>
            <div className="flex items-center gap-1 mt-3 text-[#F9D20F]">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="w-3.5 h-3.5" />
              ))}
              <span className="ml-1.5 text-xs text-[#C7D0DA]">4.7 / 5</span>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 mt-4">
              {APP_LINKS.map(({ href, Icon, line1, line2 }) => (
                <a
                  key={line2}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-lg border border-[#263445] bg-[#0B0F14] px-4 py-2.5 transition-colors hover:border-[#F9D20F]"
                >
                  <Icon className="w-6 h-6 text-white shrink-0" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[10px] uppercase tracking-wide text-[#C7D0DA]">
                      {line1}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {line2}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F] mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#C7D0DA] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F] mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#C7D0DA] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F] mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#C7D0DA] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#263445]">
          <Image
            src="/tabby-tamara-%26-pay-method.jpg"
            alt="Accepted payment methods: Google Pay, Visa, American Express, Mastercard, tamara and tabby — get it now, pay later"
            width={2400}
            height={120}
            className="w-full h-auto"
          />
        </div>

        <div className="mt-8 pt-8 border-t border-[#263445] flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[#C7D0DA] order-2 sm:order-1">
            &copy; {new Date().getFullYear()} JNK Nutrition. All rights
            reserved.
          </p>
          <Link
            href="/account"
            className="text-xs text-[#C7D0DA] hover:text-white transition-colors order-1 sm:order-2"
          >
            My Account
          </Link>
        </div>
      </div>
    </footer>
  );
}
