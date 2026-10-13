"use client";

import { useEffect, useRef } from "react";

/**
 * Plays the Diwali band's entrance when the band scrolls into view, and pauses
 * its animations whenever it is scrolled away.
 *
 * The band is server-rendered with `data-dwl-enter="wait"`, which holds every
 * animation in it (entrances paused on their first frame, loops too), so it
 * never paints fully drawn and then blinks out when this hydrates — on a tall
 * desktop screen it is in the first viewport — and costs nothing while the
 * page is still loading. This renders an empty marker inside the band and
 * flips its parent to "play" once enough of it is visible, then keeps
 * watching: `data-dwl-offscreen` is set while no part of the band is on
 * screen, which pauses the loops again. It flips straight to "play" when there
 * is nothing to wait for: reduced motion (the CSS drops the animations anyway)
 * or no IntersectionObserver. Without JavaScript at all, a `scripting: none`
 * rule in globals.css runs everything on load instead.
 *
 * The attributes are set on the DOM, not through React state: the band is a
 * server component, and React leaves an attribute alone as long as the prop it
 * rendered ("wait") hasn't changed, so a refresh doesn't replay the entrance.
 */
const THRESHOLD = 0.3;

export default function DiwaliEntrance() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const band = ref.current?.parentElement;
    if (!band) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      band.dataset.dwlEnter = "play";
      return;
    }

    // The first callback reports the current state regardless of threshold,
    // with isIntersecting true for a sliver at the viewport edge — hence the
    // ratio check, so the entrance doesn't spend itself barely on screen.
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (!e) return;
        if (e.isIntersecting) delete band.dataset.dwlOffscreen;
        else band.dataset.dwlOffscreen = "";
        if (band.dataset.dwlEnter === "wait" && e.intersectionRatio >= THRESHOLD - 0.05) {
          band.dataset.dwlEnter = "play";
        }
      },
      { threshold: [0, THRESHOLD] }
    );
    io.observe(band);
    return () => io.disconnect();
  }, []);

  return <span ref={ref} hidden />;
}
