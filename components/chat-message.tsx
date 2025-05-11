import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: string
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn("max-w-[80%] rounded-lg p-3", isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800")}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
