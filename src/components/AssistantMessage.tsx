interface AssistantMessageProps {
  text: string;
  animated?: boolean;
  className?: string;
}

export function AssistantMessage({
  text,
  animated = false,
  className = "",
}: AssistantMessageProps) {
  return (
    <div className={`not-prose mx-auto w-full max-w-2xl px-4 ${className}`.trim()}>
      <div
        data-assistant-message
        className={`relative rounded-2xl bg-emerald-600 px-5 py-4 text-left text-white shadow-lg ring-1 ring-emerald-500/40 ${
          animated ? "opacity-0 translate-y-4 scale-[0.98]" : ""
        }`}
      >
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
          Assistant
        </div>
        <p className="m-0 text-base leading-7 text-white/95">{text}</p>
        <span
          aria-hidden="true"
          data-assistant-message-tail
          className={`absolute right-[-10px] top-1/2 h-5 w-5 -translate-y-1/2 rotate-45 rounded-[2px] bg-emerald-600 ring-1 ring-emerald-500/40 ${
            animated ? "opacity-0 scale-[0.92]" : ""
          }`}
        />
      </div>
    </div>
  );
}