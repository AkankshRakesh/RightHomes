"use client"

import { Button } from "@/components/ui/button"

interface SuggestionButtonsProps {
  suggestions: string[]
  onSuggestionClickAction: (suggestion: string) => void
}

export default function SuggestionButtons({ suggestions, onSuggestionClickAction }: SuggestionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClickAction(suggestion)}
          className="text-sm"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
