import { gsap } from "gsap";
import { AssistantBubble } from "./AssistantBubble.jsx"
import { UserBubble } from "./UserBubble.jsx"

/**
 * Builds and plays a timeline that fades in a single assistant message.
 *
 * @param {SVGElement} svgEl - The <svg> element to render into
 * @returns {gsap.core.Timeline}
 */

const DIV_X = 320;
const HEADER_Y = 18;
const STEP_DURATION = 0.6;
export function buildTimeline(svgEl) {
  console.log("buildTimeline: called", { svgEl });

  // --- Add persistent background elements: headers and divider ---
  try {
    const SVG_NS = "http://www.w3.org/2000/svg";

    const mk = (tag, attrs = {}) => {
      const el = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      return el;
    };

    // Left header: Dialogue Environment
    const leftHeader = mk("text", {
      x: 96,
      y: HEADER_Y,
      "font-size": 14,
      "font-weight": 700,
      fill: "#444",
    });
    leftHeader.textContent = "Dialogue Environment";
    svgEl.appendChild(leftHeader);

    // Vertical dividing line in the middle
    const divider = mk("line", {
      x1: DIV_X,
      y1: 0,
      x2: DIV_X,
      y2: 420,
      stroke: "#777",
      "stroke-width": 2,
      "stroke-dasharray": "6 6",
      opacity: 0.95,
    });
    svgEl.appendChild(divider);

    // Right header: Repo Environment
    const rightHeader = mk("text", {
      x: DIV_X + 80,
      y: HEADER_Y,
      "font-size": 14,
      "font-weight": 700,
      fill: "#444",
    });
    rightHeader.textContent = "Repo Environment";
    svgEl.appendChild(rightHeader);
  } catch (err) {
    console.warn("buildTimeline: failed to add static background elements", err);
  }

  // First message: User (on top)
  const { el: user1El, height: user1H } = UserBubble(svgEl, "Can you help me with a Permutation error?", { x: 80, y: HEADER_Y + 20 });
  console.log("buildTimeline: user1El", { user1El, user1H });

  // Second message: Assistant (below user)
  const assistantY = HEADER_Y + 20 + user1H + 12;
  const { el: assistantEl, height: assistantH } = AssistantBubble(svgEl, "Sure, how do I reproduce it?", { x: 80, y: assistantY });
  console.log("buildTimeline: assistantEl", { assistantEl, assistantH });

  // Third message: User (below assistant)
  const user2Y = assistantY + assistantH + 12;
  const { el: user2El } = UserBubble(svgEl, "Permutation([[0,1],[0,1]]) gives me a ValueError", { x: 80, y: user2Y });
  console.log("buildTimeline: user2El", { user2El });

  const tl = gsap.timeline();

  tl.to(user1El, { opacity: 1, y: 0, duration: STEP_DURATION, ease: "power2.out" })
    .to(assistantEl, { opacity: 1, y: 0, duration: STEP_DURATION, ease: "power2.out" }, `+=${STEP_DURATION * 0.4}`)
    .to(user2El, { opacity: 1, y: 0, duration: STEP_DURATION, ease: "power2.out" }, `+=${STEP_DURATION * 0.4}`);

  return tl;
}