import type { ChatMessage } from "@/types";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

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
        <div key={d.id} className={`flex ${d.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
              d.role === "user" ? "bg-cyan-500 text-black" : "bg-zinc-800/90 border border-zinc-700 text-zinc-100"
            }`}
          >
            {d.role === "user" ? (
              d.message
            ) : (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-zinc-200">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-zinc-700/50 px-1.5 py-0.5 rounded text-xs text-cyan-300">{children}</code>
                  ),
                }}
              >
                {d.message}
              </ReactMarkdown>
            )}
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
