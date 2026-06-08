import { useEffect, useRef } from "react";
import { buildTimeline } from "./timeline.jsx";

console.log("DiagramAnimation module loaded");

export default function DiagramAnimation() {
  const svgRef = useRef(null);

  useEffect(() => {
    console.log("DiagramAnimation: mounted", { svgRef: svgRef.current });
    const tl = buildTimeline(svgRef.current);
    console.log("DiagramAnimation: buildTimeline returned", { tl });
    // Clean up if the component unmounts mid-animation
    return () => tl.kill();
  }, []); // empty deps = run once on mount

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      width="400"
      height="400"
      style={{ width: "100%", maxWidth: 500 }}
    />
  );
}