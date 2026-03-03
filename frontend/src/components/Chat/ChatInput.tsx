type ChatInputProps = {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
};

export default function ChatInput({
  placeholder = "Ask Velo AI for help...",
  onSend,
  disabled = false,
}: ChatInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!onSend || disabled) {
          return;
        }
        const formData = new FormData(e.currentTarget);
        const content = formData.get("content") as string;
        if (content.trim()) {
          onSend(content.trim());
          e.currentTarget.reset();
        }
      }}
    >
      <div className="flex gap-2">
        <input
          name="content"
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-80"
        />
        <button
          type="submit"
          disabled={disabled}
          className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Send
        </button>
      </div>
    </form>
  );
}
