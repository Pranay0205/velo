import { useMessages } from "@/hooks/useMessages";
import { Button } from "../ui/button";
import { useState } from "react";
import ChatInput from "./ChatInput";
import { X } from "lucide-react";
import MessageList from "./MessageList";

export default function ChatPanel() {
  const { getMessages, sendMessage, isMessagesLoading, isSending } = useMessages();
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl px-4">
      <div className="rounded-3xl border border-cyan-500/20 bg-zinc-900/30 backdrop-blur-xl p-2 shadow-2xl shadow-cyan-500/10">
        {open ? (
          <div className="h-[70vh] max-h-190 min-h-105 w-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl flex flex-col shadow-xl">
            {/* Header with close button */}
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
            {/* Messages */}
            <div className="flex-1 overflow-y-auto chat-scrollbar p-3">
              <MessageList chatHistory={getMessages ?? []} isMessagePending={isMessagesLoading} />
            </div>
            {/* Input */}
            <div className="p-3 border-t border-zinc-800">
              <ChatInput onSend={sendMessage} placeholder="Ask Velo AI for help..." disabled={isSending} />
            </div>
          </div>
        ) : (
          <div className="cursor-pointer" onClick={() => setOpen(true)}>
            <ChatInput placeholder="Ask Velo AI for help..." disabled={isSending} />
          </div>
        )}
      </div>
    </div>
  );
}
