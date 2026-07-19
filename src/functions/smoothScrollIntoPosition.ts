/**
 * Smooth-scrolls the nearest scrollable ancestor so `el` lands `marginTop`
 * pixels below the top of its scrollport (easeInOutCubic).
 *
 * A new call PREEMPTS any animation still in flight: a selection change can
 * legitimately schedule two scrolls (the pitch-class bar's transposition
 * event and the selection effect both fire), and overlapping rAF loops
 * would otherwise fight over scrollTop every frame. Last caller wins.
 *
 * Shared by the maqam and jins transposition headers — one copy of the
 * ancestor-finding, easing, and animation, not one per component.
 */
// The app's scroll clock for the page's travel to a transposition — one
// duration, easing, and schedule delay, imported by every scheduler.
// (The pitch-class bar's horizontal glide deliberately stays on the
// browser's fast native smooth scroll, per ruling.)
export const SCROLL_DURATION_MS = 800;
// Short enough to read as immediate (the pitch bar's native glide starts
// instantly), long enough to coalesce same-interaction schedulers. Timers
// queue behind the render, so the target row always exists by fire time.
export const SCROLL_SCHEDULE_DELAY_MS = 100;

const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let animationGeneration = 0;

export default function smoothScrollIntoPosition(el: HTMLElement, marginTop: number, duration: number, onComplete?: () => void): void {
  const generation = ++animationGeneration;

  let container: HTMLElement | Window = window;
  let node: HTMLElement | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const scrollable = (style.overflowY === "auto" || style.overflowY === "scroll") && node.scrollHeight > node.clientHeight;
    if (scrollable) {
      container = node;
      break;
    }
    node = node.parentElement;
  }

  // Read the scrollport's current offset and the element's target offset
  // WITHIN it. Both are expressed in the scrollport's own scroll coordinates,
  // so they are invariant under scrolling — re-reading the target mid-flight
  // measures layout, not our own animation.
  const readScrollTop = (): number => (container === window ? window.pageYOffset || document.documentElement.scrollTop : (container as HTMLElement).scrollTop);

  const readTarget = (): number => {
    const rect = el.getBoundingClientRect();
    const containerTop = container === window ? 0 : (container as HTMLElement).getBoundingClientRect().top;
    return Math.max(0, rect.top - containerTop + readScrollTop() - marginTop);
  };

  const start = readScrollTop();
  const startTime = performance.now();

  const animateScroll = (currentTime: number) => {
    if (generation !== animationGeneration) return; // preempted by a newer scroll
    const progress = Math.min((currentTime - startTime) / duration, 1);
    // Re-read the target every frame rather than freezing it at t=0. Content
    // above the anchor is still settling while we travel — the open row's
    // staff notation resizes after measuring its own bbox, cell rotation
    // applies a frame late, a lazy batch commits — and a frozen target cannot
    // absorb any of it, so the page lands short by however much the layout
    // moved. Retargeting each frame converges on wherever the anchor actually
    // ends up, whichever late-sizer moved it.
    const current = start + (readTarget() - start) * easeInOutCubic(progress);
    if (container === window) {
      window.scrollTo(0, current);
    } else {
      (container as HTMLElement).scrollTop = current;
    }
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      // Fires only for the animation that actually landed (a preempted
      // one returns above) — the scroll-then-open sequencing hangs off this
      onComplete?.();
    }
  };

  requestAnimationFrame(animateScroll);
}
