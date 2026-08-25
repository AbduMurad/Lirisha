"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/editorial";

/**
 * A crossfade between three frames, standing in until the reels are exported
 * and cut into a loop. Deliberately close in behaviour to the video it
 * replaces: silent, unattended, no controls, no dots to click. A hero is
 * atmosphere — the moment it grows an interface it starts asking the customer
 * to operate it instead of look at it.
 *
 * Each slide ships a wide crop and a portrait, swapped by CSS rather than by
 * measuring the viewport in JS, so the correct one is chosen before paint and
 * the server and client markup agree.
 *
 * Only the first slide is `priority`: it is the LCP element. Preloading all
 * three would push three full-bleed images into the critical path on a Libyan
 * mobile connection to show two of them later.
 */
export function HeroSlides({ slides, intervalMs = 5600 }: { slides: HeroSlide[]; intervalMs?: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    // Someone who has asked for less motion gets the first frame and nothing
    // moving. Autoplaying carousels are one of the clearer cases where that
    // preference is a real accessibility need, not a nicety.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (reduced?.matches) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      timer ??= setInterval(() => setActive((i) => (i + 1) % slides.length), intervalMs);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    // A background tab shouldn't burn a phone's battery cycling images nobody
    // is looking at.
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [slides.length, intervalMs]);

  return (
    <>
      {slides.map((slide, i) => (
        <div
          key={slide.wide.url}
          aria-hidden={i !== active}
          className="absolute inset-0"
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 1600ms var(--ease)",
            // The fade is the only motion. No zoom: a Ken Burns drift over a
            // garment reads as a screensaver, and it fights the embroidery.
          }}
        >
          <Image
            src={slide.portrait.url}
            alt={i === active ? slide.alt : ""}
            fill
            priority={i === 0}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={slide.portrait.blur}
            className="object-cover md:hidden"
          />
          <Image
            src={slide.wide.url}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={slide.wide.blur}
            className="hidden object-cover md:block"
          />
        </div>
      ))}
    </>
  );
}
