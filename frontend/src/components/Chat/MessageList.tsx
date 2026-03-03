import type { ChatMessage } from "@/types";

export default function MessageList({
  chatHistory,
  isMessagePending,
}: {
  chatHistory: ChatMessage[];
  isMessagePending: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {chatHistory.map((d: ChatMessage) => (
        <div key={d.id} className={`flex ${d.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
              d.role === "user" ? "bg-cyan-500 text-black" : "bg-zinc-800/90 border border-zinc-700 text-zinc-100"
            }`}
          >
            {d.message}
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
    </div>
  );
}
