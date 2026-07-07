"use client";

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
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="white"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.364.634 4.676 1.838 6.701L2.667 29.333l6.802-1.784A13.27 13.27 0 0 0 16.003 29.333C23.364 29.333 29.333 23.361 29.333 16S23.364 2.667 16.003 2.667zm0 24.267a11.256 11.256 0 0 1-5.737-1.572l-.411-.245-4.036 1.059 1.077-3.929-.268-.428A11.267 11.267 0 0 1 4.8 16c0-6.178 5.025-11.2 11.203-11.2 6.177 0 11.197 5.022 11.197 11.2 0 6.177-5.02 11.134-11.197 11.134zm6.139-8.37c-.337-.169-1.993-.984-2.303-1.096-.309-.113-.533-.169-.757.169-.225.338-.869 1.096-1.065 1.321-.197.225-.393.253-.73.084-.337-.169-1.42-.523-2.704-1.67-1-.892-1.675-1.994-1.872-2.331-.197-.337-.021-.52.148-.688.152-.151.337-.394.506-.591.17-.197.225-.337.338-.562.113-.225.056-.422-.028-.591-.084-.169-.757-1.826-1.037-2.501-.273-.656-.55-.567-.757-.577l-.645-.011c-.225 0-.59.084-.9.422-.309.337-1.178 1.152-1.178 2.809 0 1.657 1.206 3.258 1.374 3.483.169.225 2.373 3.622 5.748 5.079.804.347 1.43.555 1.919.710.806.257 1.54.221 2.12.134.647-.097 1.993-.814 2.274-1.601.281-.787.281-1.461.197-1.601-.084-.141-.309-.225-.646-.394z" />
      </svg>
    </a>
  );
}
