"use client";

import type { TrackEvent } from "./types";

const UTM_KEY = "lir_utm";

type Utm = { source?: string; medium?: string; campaign?: string; content?: string };

/** Captures UTMs on the landing request and keeps them for the session. */
export function captureUtm(): Utm {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const fresh: Utm = {};
  const src = p.get("utm_source") ?? p.get("source");
  if (src) fresh.source = src;
  const med = p.get("utm_medium");
  if (med) fresh.medium = med;
  const camp = p.get("utm_campaign");
  if (camp) fresh.campaign = camp;
  const cont = p.get("utm_content");
  if (cont) fresh.content = cont;

  try {
    if (Object.keys(fresh).length) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const stored = sessionStorage.getItem(UTM_KEY);
    return stored ? (JSON.parse(stored) as Utm) : {};
  } catch {
    return fresh;
  }
}

export function track(
  type: TrackEvent,
  payload: { path?: string; productId?: string; meta?: Record<string, unknown> } = {},
): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    type,
    path: payload.path ?? window.location.pathname,
    productId: payload.productId,
    meta: payload.meta,
    referrer: document.referrer || undefined,
    utm: captureUtm(),
  });

  // sendBeacon survives the navigation away to wa.me — which is exactly the
  // event we care most about not losing.
  if (navigator.sendBeacon) {
    const ok = navigator.sendBeacon(
      "/api/track",
      new Blob([body], { type: "application/json" }),
    );
    if (ok) return;
  }
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
