// GSAP doesn't read the OS "reduce motion" setting on its own (CSS
// transitions are handled globally in globals.css). Every GSAP call site
// checks this first and jumps straight to the end state instead.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
