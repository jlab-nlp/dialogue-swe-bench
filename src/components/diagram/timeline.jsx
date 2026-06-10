import { gsap } from "gsap";
import { AssistantBubble } from "./AssistantBubble.jsx"
import { UserBubble } from "./UserBubble.jsx"

const USER_ICON_URL = new URL("../../assets/diagram/user.svg", import.meta.url).href;
const AGENT_ICON_URL = new URL("../../assets/diagram/agent.svg", import.meta.url).href;
const REPO_ICON_URL = new URL("../../assets/diagram/repo.svg", import.meta.url).href;
const SVG_NS = "http://www.w3.org/2000/svg";

const mk = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

const mkImage = (attrs = {}) => {
  const { href, ...rest } = attrs;
  const el = mk("image", rest);
  el.setAttribute("href", href);
  el.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
  return el;
};

/**
 * Builds and plays a timeline that fades in a single assistant message.
 *
 * @param {SVGElement} svgEl - The <svg> element to render into
 * @returns {gsap.core.Timeline}
 */

const DIV_X = 360;
const HEADER_Y = 18;
const STEP_DURATION = 0.6;
export function buildTimeline(svgEl) {
  console.log("buildTimeline: called", { svgEl });
  let arrowPath = null;

  // --- Add persistent background elements: headers and divider ---
  try {
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

    const agentIcon = mkImage({
      href: AGENT_ICON_URL,
      x: DIV_X - 50,
      y: 100,
      width: 100,
      height: 183,
    });
    svgEl.appendChild(agentIcon);
  } catch (err) {
    console.warn("buildTimeline: failed to add static background elements", err);
  }

  // First message: User (on top)
  const { el: user1El, height: user1H } = UserBubble(svgEl, "Can you help me with a Permutation error?", { x: 80, y: HEADER_Y + 20 });
  console.log("buildTimeline: user1El", { user1El, user1H });

  const userIcon = mkImage({
    href: USER_ICON_URL,
    x: 0,
    y: HEADER_Y + 32,
    width: 64,
    height: 64,
  });
  svgEl.insertBefore(userIcon, user1El);

  const repoIcon = mkImage({
    href: REPO_ICON_URL,
    x: 480,
    y: 100 + 36,
    width: 128,
    height: 128,
  });
  svgEl.insertBefore(repoIcon, user1El);

  const defs = mk("defs");
  const marker = mk("marker", {
    id: "repo-arrow-head",
    viewBox: "0 0 10 10",
    refX: 8,
    refY: 5,
    markerWidth: 8,
    markerHeight: 8,
    orient: "auto-start-reverse",
  });
  marker.appendChild(
    mk("path", {
      d: "M 0 0 L 10 5 L 0 10 z",
      fill: "#16a34a",
    })
  );
  defs.appendChild(marker);
  svgEl.insertBefore(defs, svgEl.firstChild);

  const agentRightX = DIV_X + 50;
  const agentCenterY = 100 + 183 / 2;
  const repoLeftX = 480;
  const repoCenterY = 100 + 36 + 128 / 2;
  arrowPath = mk("path", {
    d: `M ${agentRightX} ${agentCenterY} C ${agentRightX + 36} ${agentCenterY - 44}, ${repoLeftX - 52} ${repoCenterY - 44}, ${repoLeftX} ${repoCenterY}`,
    fill: "none",
    stroke: "#16a34a",
    "stroke-width": 4,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "marker-end": "url(#repo-arrow-head)",
    opacity: 0,
  });
  svgEl.insertBefore(arrowPath, user1El);

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
    .to(user2El, { opacity: 1, y: 0, duration: STEP_DURATION, ease: "power2.out" }, `+=${STEP_DURATION * 0.4}`)
    .to(arrowPath, { opacity: 1, duration: 0.25, ease: "power1.out" }, `+=0.15`);

  return tl;
}