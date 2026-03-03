import { logger } from "@/lib/logger";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMessages() {
  const queryClient = useQueryClient();

  const { data: getMessages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["chat"],
    queryFn: async () => {
      logger.log(`[useMessages] Fetching messages from /chat`);
      const response = await fetch("/api/chat", { credentials: "include" });
      if (!response.ok) {
        logger.error(`[useMessages] Failed to fetch messages. Status: ${response.status}`);
        throw new Error("Failed to fetch messages");
      }
      const result = await response.json();
      logger.log(`[useMessages] Fetched ${result.data?.length ?? 0} messages successfully`);
      return result.data;
    },
  });

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (content: string) => {
      logger.log(`[useMessages] Sending message: ${content}`);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: content }),
      });
      if (!response.ok) {
        logger.error(`[useMessages] Failed to send message. Status: ${response.status}`);
        throw new Error("Failed to send message");
      }
      logger.log(`[useMessages] Message sent successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return { getMessages, isMessagesLoading, sendMessage, isSending };
}
