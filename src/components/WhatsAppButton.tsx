"use client";

import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

/**
 * Floating WhatsApp support button.
 * - Desktop: fixed bottom-right, above the page fold.
 * - Mobile: sits above the bottom nav bar.
 */
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/971554017113"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        fixed right-4 z-50
        bottom-[calc(4.25rem+env(safe-area-inset-bottom)+0.75rem)]
        md:bottom-6
        flex h-14 w-14 items-center justify-center
        rounded-full shadow-lg
        transition-transform duration-200 hover:scale-110 active:scale-95
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50
      "
      style={{ backgroundColor: "#25D366" }}
    >
      <WhatsAppIcon className="h-7 w-7 text-white" />
    </a>
  );
}
