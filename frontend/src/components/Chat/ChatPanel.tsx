import { useMessages } from "@/hooks/useMessages";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { X } from "lucide-react";
import MessageList from "./MessageList";
import ActionReview from "./ActionReview";
import type { ChatMessage } from "@/types";

export default function ChatPanel() {
  const { getMessages, sendMessage, isMessagesLoading, isSending } = useMessages();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="w-full max-w-4xl px-4">
      <div
        ref={panelRef}
        className={`relative rounded-3xl border border-cyan-500/20 bg-zinc-900/30 backdrop-blur-xl p-2 shadow-2xl shadow-cyan-500/10 transition-[height] duration-300 ease-out ${
          open ? "h-[70vh] max-h-190 min-h-105" : "h-14"
        }`}
      >
        {/* Collapsed content */}
        <div
          className={`absolute inset-2 transition-all duration-300 ${
            open ? "opacity-0 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"
          }`}
          onClick={() => setOpen(true)}
        >
          <div className="cursor-pointer">
            <ChatInput placeholder="Ask Velo AI for help..." />
          </div>
        </div>

        {/* Expanded content */}
        <div
          className={`h-full w-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl flex flex-col shadow-xl transition-all duration-300 ${
            open ? "opacity-100 scale-100" : "opacity-0 scale-[0.98] pointer-events-none"
          }`}
        >
          <div className="flex justify-between items-center p-3 border-b border-zinc-800">
            <span className="text-sm font-medium text-cyan-400">Velo AI</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-300 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto chat-scrollbar p-3">
            <MessageList chatHistory={getMessages ?? []} isMessagePending={isMessagesLoading} />
          </div>
          <div className="p-3 border-t border-zinc-800">
            {getMessages &&
              getMessages.length === 0 &&
              !isMessagesLoading &&
              getMessages.map((message: ChatMessage) => (
                <ActionReview key={message.id} actions={message.action ?? []} />
              ))}
          </div>

          <div className="p-3 border-t border-zinc-800">
            <ChatInput onSend={sendMessage} placeholder="Ask Velo AI for help..." disabled={isSending} />
          </div>
        </div>
      </div>
    </div>
  );
}
