"use client";

import { useEffect, useRef } from "react";

/**
 * Plays the Diwali band's entrance when the band scrolls into view, and pauses
 * its animations whenever it is scrolled away.
 *
 * The band is server-rendered with `data-dwl-enter="wait"`, which holds every
 * animation in it (entrances paused on their first frame, loops too), so it
 * never paints fully drawn and then blinks out when the entrance starts — on a
 * tall desktop screen it is in the first viewport — and costs nothing while
 * it is off screen. `watchBand` flips it to "play" once enough of it is
 * visible, then keeps watching: `data-dwl-offscreen` is set while no part of
 * the band is on screen, which pauses the loops again. It flips straight to
 * "play" when there is nothing to wait for: reduced motion (the CSS drops the
 * animations anyway) or no IntersectionObserver. Without JavaScript at all, a
 * `scripting: none` rule in the stylesheet runs everything on load instead.
 *
 * It starts from an inline script, not only from the effect. An effect runs
 * after hydration, which waits for the whole page to stream in — on a slow
 * load (or a slow dev server) the held band sat as a blank gap until then. The
 * script runs as soon as the browser parses the band. React does not run
 * inline scripts it renders on the client, so the effect is the fallback for a
 * client-side navigation to the homepage; whichever runs first marks the band
 * and the other leaves it alone.
 *
 * The attributes are set on the DOM, not through React state: the band is a
 * server component, and React leaves an attribute alone as long as the prop it
 * rendered ("wait") hasn't changed, so a refresh doesn't replay the entrance.
 * The band carries suppressHydrationWarning because the script may already
 * have changed them by the time React hydrates.
 */

// Self-contained — it is also serialized into the inline script below, so it
// must not reference anything outside its own body.
function watchBand(band: HTMLElement | null | undefined) {
  const state = band as (HTMLElement & { dwlWatched?: boolean }) | null | undefined;
  if (!state || state.dwlWatched) return;
  state.dwlWatched = true;
  const threshold = 0.3;

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    state.dataset.dwlEnter = "play";
    return;
  }

  // The first callback reports the current state regardless of threshold,
  // with isIntersecting true for a sliver at the viewport edge — hence the
  // ratio check, so the entrance doesn't spend itself barely on screen. The
  // observer lives as long as the band: it is dropped with it.
  new IntersectionObserver(
    (entries) => {
      const e = entries[entries.length - 1];
      if (!e) return;
      if (e.isIntersecting) delete state.dataset.dwlOffscreen;
      else state.dataset.dwlOffscreen = "";
      if (state.dataset.dwlEnter === "wait" && e.intersectionRatio >= threshold - 0.05) {
        state.dataset.dwlEnter = "play";
      }
    },
    { threshold: [0, threshold] }
  ).observe(state);
}

const INLINE = `(${watchBand.toString()})(document.currentScript&&document.currentScript.parentElement)`;

export default function DiwaliEntrance() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    watchBand(ref.current?.parentElement);
  }, []);

  return (
    <>
      <span ref={ref} hidden />
      <script
        // The serialized source can differ between the server and client
        // bundles; the script has already run by then either way.
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: INLINE }}
      />
    </>
  );
}
