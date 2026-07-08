import type { Handle } from "@sveltejs/kit";

// ── Under Construction gate ───────────────────────────────────
// Set CONSTRUCTION_MODE to true while building.
// Flip to false when ready to launch — no other changes needed.
const CONSTRUCTION_MODE = true;

// Routes that bypass the gate even in construction mode
const ALLOWED = ["/construction", "/admin"];

export const handle: Handle = async ({ event, resolve }) => {
  if (CONSTRUCTION_MODE) {
    const path = event.url.pathname;
    const isAllowed = ALLOWED.some((route) => path.startsWith(route));

    if (!isAllowed) {
      // Redirect everything else to the under construction page
      return new Response(null, {
        status: 302,
        headers: { location: "/construction" },
      });
    }
  }

  return resolve(event);
};