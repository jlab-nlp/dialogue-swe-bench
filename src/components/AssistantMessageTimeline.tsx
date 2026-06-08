import { useEffect, useRef } from "react";
import gsap from "gsap";

import { AssistantMessage } from "./AssistantMessage";

interface AssistantMessageTimelineProps {
  text?: string;
}

export function AssistantMessageTimeline({
  text = "hellow world",
}: AssistantMessageTimelineProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const context = gsap.context(() => {
      const bubble = scope.querySelector("[data-assistant-message]");
      const tail = scope.querySelector("[data-assistant-message-tail]");

      if (!bubble || !tail) return;

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .to(bubble, { opacity: 1, y: 0, scale: 1, duration: 0.55 })
        .to(tail, { opacity: 1, scale: 1, duration: 0.2 }, "<0.12");
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <div ref={scopeRef} className="not-prose w-full">
      <AssistantMessage animated text={text} />
    </div>
  );
}