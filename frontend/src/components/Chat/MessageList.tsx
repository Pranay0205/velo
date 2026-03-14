import type { ChatMessage } from "@/types";
import { useEffect, useRef } from "react";

export default function MessageList({
  chatHistory,
  isMessagePending,
}: {
  chatHistory: ChatMessage[];
  isMessagePending: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="flex flex-col gap-3">
      {chatHistory.map((d: ChatMessage) => (
        <div>
          <div key={d.id} className={`flex ${d.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                d.role === "user" ? "bg-cyan-500 text-black" : "bg-zinc-800/90 border border-zinc-700 text-zinc-100"
              }`}
            >
              {d.message}
            </div>
          </div>
        </div>
      ))}

      {isMessagePending && (
        <div className="flex justify-start">
          <div className="max-w-[80%] p-3 rounded-xl bg-zinc-800/90 border border-zinc-700 text-zinc-400 text-sm">
            Thinking...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
