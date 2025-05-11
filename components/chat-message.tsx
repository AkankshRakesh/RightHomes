import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: string
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={cn("flex w-full", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4",
          role === "user" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-800 border border-gray-200",
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
