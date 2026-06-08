import { gsap } from "gsap";
import { AssistantBubble } from "./AssistantBubble.jsx"
import { UserBubble } from "./UserBubble.jsx"

/**
 * Builds and plays a timeline that fades in a single assistant message.
 *
 * @param {SVGElement} svgEl - The <svg> element to render into
 * @returns {gsap.core.Timeline}
 */
export function buildTimeline(svgEl) {
  console.log("buildTimeline: called", { svgEl });

  // First message: User (on top)
  const { el: user1El, height: user1H } = UserBubble(svgEl, "Can you help me with a Permutation error?", { x: 80, y: 20 });
  console.log("buildTimeline: user1El", { user1El, user1H });

  // Second message: Assistant (below user)
  const assistantY = 20 + user1H + 12;
  const { el: assistantEl, height: assistantH } = AssistantBubble(svgEl, "Sure, how do I reproduce it?", { x: 80, y: assistantY });
  console.log("buildTimeline: assistantEl", { assistantEl, assistantH });

  // Third message: User (below assistant)
  const user2Y = assistantY + assistantH + 12;
  const { el: user2El } = UserBubble(svgEl, "Permutation([[0,1],[0,1]]) gives me a ValueError", { x: 80, y: user2Y });
  console.log("buildTimeline: user2El", { user2El });

  const tl = gsap.timeline();

  tl.to(user1El, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" })
    .to(assistantEl, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "+=0.18")
    .to(user2El, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "+=0.18");

  return tl;
}