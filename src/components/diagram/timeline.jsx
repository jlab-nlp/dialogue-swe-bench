import { gsap } from "gsap";
import { AssistantBubble } from "./AssistantBubble.jsx"
import { UserBubble } from "./UserBubble.jsx"
import {
  renderAgentActionIcon,
  renderAgentIcon,
  renderDivider,
  renderRepoIcon,
  renderObservationIcon,
  renderPatchIcon,
  renderText,
  renderUserIcon,
} from "./icons.jsx";

/**
 * Builds and plays a timeline that fades in a single assistant message.
 *
 * @param {SVGElement} svgEl - The <svg> element to render into
 * @returns {gsap.core.Timeline}
 */

const DIV_X = 360;
const HEADER_Y = 18;
const STEP_DURATION = 0.67;
export function buildTimeline(svgEl) {
  console.log("buildTimeline: called", { svgEl });

  // Static setup: these items are always present.
  try {
    renderText(svgEl, "Dialogue Environment", {
      x: 96,
      y: HEADER_Y,
      "font-size": 14,
      "font-weight": 700,
      fill: "#444",
    });

    renderDivider(svgEl, {
      x1: DIV_X,
      y1: 0,
      x2: DIV_X,
      y2: 420,
      stroke: "#777",
      "stroke-width": 2,
      "stroke-dasharray": "6 6",
      opacity: 0.95,
    });

    renderText(svgEl, "Repo Environment", {
      x: DIV_X + 80,
      y: HEADER_Y,
      "font-size": 14,
      "font-weight": 700,
      fill: "#444",
    });

    renderAgentIcon(svgEl, {
      x: DIV_X - 50,
      y: 100,
      width: 100,
      height: 183,
    });
  } catch (err) {
    console.warn("buildTimeline: failed to add static background elements", err);
  }

  // Dynamic setup: message bubbles animate in, but their layout is still computed up front.
  const { el: user1El, height: user1H } = UserBubble(svgEl, "Can you help me with a Permutation error?", { x: 80, y: HEADER_Y + 20 });
  console.log("buildTimeline: user1El", { user1El, user1H });

  const userIcon = renderUserIcon(svgEl, {
    x: 0,
    y: HEADER_Y + 24,
    width: 64,
    height: 64,
  });
  svgEl.insertBefore(userIcon, user1El);

  const repoIcon = renderRepoIcon(svgEl, {
    x: 480,
    y: 100 + 36,
    width: 128,
    height: 128,
  });
  svgEl.insertBefore(repoIcon, user1El);

  const patchIcon = renderPatchIcon(svgEl, {
    x: 505,
    y: 140 + 36 + 128 + 12,
    width: 74,
    height: 77,
  });
  svgEl.insertBefore(patchIcon, user1El);
  gsap.set(patchIcon, { opacity: 0 });

  const agentActionIcon = renderAgentActionIcon(svgEl, {
    startX: DIV_X + 50,
    startY: 80 + 183 / 2,
    endX: 475,
    endY: 83 + 183 / 2,
    opacity: 0,
  });

  const observationIcon = renderObservationIcon(svgEl, {
    startX: 475,
    startY: 133 + 183 / 2,
    endX: DIV_X + 50,
    endY: 136 + 183 / 2,
    opacity: 0,
  });

  const patchActionIcon = renderAgentActionIcon(svgEl, {
    startX: 541,
    startY: 256,
    endX: 541,
    endY: 302,
    curveXOffset: 0,
    curveYOffset: 8,
    opacity: 0,
  });

  const searchIcon = renderText(svgEl, "🔍", {
    x: DIV_X + 72,
    y: 113 + 183 / 2 + 8,
    "font-size": 32,
    "font-weight": 700,
    fill: "#111",
    opacity: 0,
    "text-anchor": "middle",
  });
  const editIcon = renderText(svgEl, "✏️", {
    x: DIV_X + 102,
    y: 113 + 183 / 2 + 8,
    "font-size": 32,
    "font-weight": 700,
    fill: "#111",
    opacity: 0,
    "text-anchor": "middle",
  });

  // Dynamic setup continues: compute the stack positions for the bubbles.
  const assistantY = HEADER_Y + 20 + user1H + 12;
  const { el: assistantEl, height: assistantH } = AssistantBubble(svgEl, "Sure, how do I reproduce it?", { x: 80, y: assistantY });
  console.log("buildTimeline: assistantEl", { assistantEl, assistantH });

  // Third message: User (below assistant)
  const user2Y = assistantY + assistantH + 12;
  const { el: user2El, height: user2H } = UserBubble(svgEl, "Permutation([[0,1],[0,1]]) gives me a ValueError", { x: 80, y: user2Y });
  console.log("buildTimeline: user2El", { user2El, user2H });

  const summaryAssistantY = user2Y + user2H + 12;
  const { el: summaryAssistantEl } = AssistantBubble(
    svgEl,
    "I was able to reproduce and fix the issue. Here is a summary...",
    { x: 80, y: summaryAssistantY }
  );
  console.log("buildTimeline: summaryAssistantEl", { summaryAssistantEl });

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });

  tl
    .to(patchIcon, { opacity: 0, duration: 0, ease: "power1.out" }, "<")
    .to(user1El, { opacity: 1, y: 0, duration: STEP_DURATION, ease: "power2.out" })
    .to(assistantEl, { opacity: 1, y: 0, duration: STEP_DURATION, ease: "power2.out" }, `+=${STEP_DURATION * 0.4}`)
    .to(user2El, { opacity: 1, y: 0, duration: STEP_DURATION, ease: "power2.out" })
    // first action: search
    .to(searchIcon, { opacity: 1, duration: STEP_DURATION, ease: "power1.out" })
    .to(agentActionIcon, { opacity: 1, duration: STEP_DURATION, ease: "power1.out" }, "<")
    .to(observationIcon, { opacity: 1, duration: STEP_DURATION, ease: "power1.out" }, `+=${STEP_DURATION * 0.4}`)
    .to(editIcon, { opacity: 1, duration: STEP_DURATION, ease: "power1.out" })
    //.to(searchIcon, { opacity: 0, duration: 0, ease: "power1.out" }, '<')
    .to(agentActionIcon, { scale: 1.05, duration: STEP_DURATION / 2, ease: "power2.inOut", yoyo: true, repeat: 1 }, '<')
    .to(observationIcon, { scale: 1.05, duration: STEP_DURATION / 2, ease: "power2.inOut", yoyo: true, repeat: 1 }, `+=${STEP_DURATION * 0.4}`)
    .to(patchActionIcon, { opacity: 1, duration: STEP_DURATION, ease: "power1.out" })
    .to(patchIcon, { opacity: 1, duration: STEP_DURATION, ease: "power1.out" }, "<")
    .to(summaryAssistantEl, { opacity: 1, y: 0, duration: STEP_DURATION, ease: "power2.out" })
    .to(searchIcon, { opacity: 0, duration: 1, ease: "power1.out" }, `+=${STEP_DURATION * 0.4}`)




  return tl;
}