"use client"

interface SuggestionButtonsProps {
  suggestions: string[]
  onSuggestionClickAction: (suggestion: string) => void
}

export default function SuggestionButtons({ suggestions, onSuggestionClickAction }: SuggestionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClickAction(suggestion)}
          className="text-xs md:text-sm px-3 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 hover:border-teal-400 transition-colors duration-200 text-gray-700 shadow-sm"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
