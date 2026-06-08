import { gsap } from "gsap";

/**
 * AssistantBubble
 * Creates an animated green assistant chat bubble in an SVG.
 *
 * @param {SVGElement} svgEl   - The <svg> element to append the bubble into
 * @param {string}     content - The message text to display
 * @param {object}     pos     - { x, y } top-left position of the bubble
 * @param {object}     opts    - Optional overrides: { width, fontSize, tailSide }
 * @returns {{ el: SVGGElement, height: number }}
 *   el     — the <g> element (use to position in a timeline)
 *   height — total height of the bubble (useful for stacking multiple bubbles)
 */
export function AssistantBubble(svgEl, content, pos, opts = {}) {
  //console.log("AssistantBubble: called", { svgEl, content, pos, opts });
  const {
    width     = 220,
    fontSize  = 12,
    tailSide  = "right",   // "left" | "right"
  } = opts;

  const SVG_NS      = "http://www.w3.org/2000/svg";
  const PADDING     = 14;
  const LINE_HEIGHT = fontSize * 1.5;
  const HEADER_H    = 22;
  const TAIL_W      = 14;
  const TAIL_H      = 10;
  const RADIUS      = 12;

  // --- Word-wrap content into lines that fit inside the bubble ---
  const maxCharsPerLine = Math.floor((width - PADDING * 2) / (fontSize * 0.62));
  const words = content.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  const bodyH  = lines.length * LINE_HEIGHT + PADDING;
  // totalH used for vertical stacking — use rect height (header + body).
  // The tail is centered vertically and does not change overall height.
  const totalH = HEADER_H + bodyH;

  // --- Build <g> wrapper ---
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", "assistant-bubble");

  const mk = (tag, attrs) => {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  };

  const txt = (str, attrs) => {
    const el = document.createElementNS(SVG_NS, "text");
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.textContent = str;
    return el;
  };

  const { x, y } = pos;

  // Bubble rect
  g.appendChild(mk("rect", {
    x, y,
    width,
    height: HEADER_H + bodyH,
    rx: RADIUS,
    fill: "#f0faf2",
    stroke: "#4caf6e",
    "stroke-width": "1.8",
  }));

  // Header label
  g.appendChild(txt("Assistant:", {
    x: x + PADDING,
    y: y + HEADER_H - 5,
    "font-size": fontSize,
    "font-weight": "700",
    fill: "#2a6e40",
    "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  }));

  // Content lines
  lines.forEach((line, i) => {
    g.appendChild(txt(line, {
      x: x + PADDING,
      y: y + HEADER_H + PADDING + i * LINE_HEIGHT,
      "font-size": fontSize,
      fill: "#333",
      "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }));
  });

  // Tail triangle (does not affect vertical stacking)
  const tailY = y + HEADER_H + bodyH / 2;
  if (tailSide === "left") {
    g.appendChild(mk("polygon", {
      points: `${x},${tailY - TAIL_H / 2} ${x - TAIL_W},${tailY} ${x},${tailY + TAIL_H / 2}`,
      fill: "#4caf6e",
    }));
  } else {
    const tx = x + width;
    g.appendChild(mk("polygon", {
      points: `${tx},${tailY - TAIL_H / 2} ${tx + TAIL_W},${tailY} ${tx},${tailY + TAIL_H / 2}`,
      fill: "#4caf6e",
    }));
  }

  svgEl.appendChild(g);
  console.log("AssistantBubble: appended <g> to svg", { g });

  // Start invisible — caller's timeline will animate it in
  gsap.set(g, { opacity: 0, y: 8 });
  console.log("AssistantBubble: gsap.set applied", { g });

  return { el: g, height: totalH };
}