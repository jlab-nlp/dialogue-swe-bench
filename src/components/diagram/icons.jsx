const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

const USER_ICON_URL = new URL("../../assets/diagram/user.svg", import.meta.url).href;
const AGENT_ICON_URL = new URL("../../assets/diagram/agent.svg", import.meta.url).href;
const REPO_ICON_URL = new URL("../../assets/diagram/repo.svg", import.meta.url).href;
const PATCH_ICON_URL = new URL("../../assets/diagram/patch.svg", import.meta.url).href;

const createSvgElement = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
};

const createImageElement = (attrs = {}) => {
  const { href, ...rest } = attrs;
  const el = createSvgElement("image", rest);
  el.setAttribute("href", href);
  el.setAttributeNS(XLINK_NS, "href", href);
  return el;
};

const appendImage = (svgEl, href, attrs = {}) => {
  const image = createImageElement({ href, ...attrs });
  svgEl.appendChild(image);
  return image;
};

export function renderText(svgEl, text, attrs = {}) {
  const textElement = createSvgElement("text", attrs);
  textElement.textContent = text;
  svgEl.appendChild(textElement);
  return textElement;
}

export function renderDivider(svgEl, attrs = {}) {
  const divider = createSvgElement("line", attrs);
  svgEl.appendChild(divider);
  return divider;
}

export function renderUserIcon(svgEl, attrs = {}) {
  return appendImage(svgEl, USER_ICON_URL, attrs);
}

export function renderAgentIcon(svgEl, attrs = {}) {
  return appendImage(svgEl, AGENT_ICON_URL, attrs);
}

export function renderRepoIcon(svgEl, attrs = {}) {
  return appendImage(svgEl, REPO_ICON_URL, attrs);
}

export function renderPatchIcon(svgEl, attrs = {}) {
  return appendImage(svgEl, PATCH_ICON_URL, attrs);
}

const renderArrowIcon = (svgEl, attrs = {}) => {
  const {
    id,
    startX,
    startY,
    endX,
    endY,
    opacity = 0,
    stroke = "#16a34a",
    strokeWidth = 4,
    curveXOffset = 24,
    curveYOffset = 24,
    markerWidth = 6,
    markerHeight = 6,
    markerRefX = 8,
    markerRefY = 5,
    markerPath = "M 0 0 L 10 5 L 0 10 z",
    markerOrient = "auto-start-reverse",
  } = attrs;

  const defs = createSvgElement("defs");
  const marker = createSvgElement("marker", {
    id,
    viewBox: "0 0 10 10",
    refX: markerRefX,
    refY: markerRefY,
    markerWidth,
    markerHeight,
    orient: markerOrient,
  });
  marker.appendChild(
    createSvgElement("path", {
      d: markerPath,
      fill: stroke,
    })
  );
  defs.appendChild(marker);
  svgEl.insertBefore(defs, svgEl.firstChild);

  const path = createSvgElement("path", {
    d: `M ${startX} ${startY} C ${startX + curveXOffset} ${startY - curveYOffset}, ${endX - curveXOffset} ${endY - curveYOffset}, ${endX} ${endY}`,
    fill: "none",
    stroke,
    "stroke-width": strokeWidth,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "marker-end": `url(#${id})`,
    opacity,
  });
  svgEl.insertBefore(path, svgEl.firstChild);
  return path;
};

export function renderAgentActionIcon(svgEl, attrs = {}) {
  return renderArrowIcon(svgEl, {
    id: "repo-arrow-head",
    stroke: "#16a34a",
    curveXOffset: 24,
    curveYOffset: 24,
    ...attrs,
  });
}

export function renderObservationIcon(svgEl, attrs = {}) {
  return renderArrowIcon(svgEl, {
    id: "observation-arrow-head",
    stroke: "#2563eb",
    curveXOffset: -24,
    curveYOffset: -24,
    markerOrient: "auto",
    ...attrs,
  });
}