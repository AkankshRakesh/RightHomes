"use client"

/// <reference lib="dom" />

import type React from "react"

import { useState } from "react"
import { Mic, MicOff, Send } from "lucide-react"
import PropertyRecommendations from "../components/property-recommendations"
import ChatMessage from "../components/chat-message"
import RequirementMap from "../components/requirement-map"
import ScheduleOptions from "../components/schedule-options"
import SuggestionButtons from "../components/suggestion-buttons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockProperties } from "../lib/mock-data"
import { processUserInput } from "../lib/chat-logic"

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi, I'm your property co-pilot. Looking for a home or investment? I'll help you shortlist the best ones and book visits too.",
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  interface RequirementMap {
    city?: string;
    budget?: number;
    bedrooms?: number;
    [key: string]: string | number | undefined; // Add index signature
  }

  const [requirementMap, setRequirementMap] = useState<RequirementMap>({})
  interface Property {
    name: string
  location: string
  price: number
  type: string
  size: number
  bedrooms: number
  features: string[]
  status: string
  image?: string
  priceUnit: string
  moreDetails: {
      description: string;
      amenities: string[];
      floorPlans?: string[];
      contact: string;
      reraId: string;
      possessionDate: string;
    }
  }

  const [recommendations, setRecommendations] = useState<Array<Property>>([])
  const [showSchedule, setShowSchedule] = useState(false)
  const [stage, setStage] = useState(1)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Process user input and get response
    const { response, updatedRequirementMap, updatedStage, showRecommendations, showScheduleOptions } =
      await processUserInput(input, requirementMap, stage)

    // Update state based on response
    setRequirementMap(updatedRequirementMap)
    setStage(updatedStage)

    // Add assistant response
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: response }])

      if (showRecommendations) {
        const filteredProperties = mockProperties.filter((property) => {
          // Simple filtering based on requirement map
          if (requirementMap.city && !property.location.toLowerCase().includes(requirementMap.city.toLowerCase()))
            return false
          if (requirementMap.budget && property.price > requirementMap.budget) return false
          if (requirementMap.bedrooms && property.bedrooms !== requirementMap.bedrooms) return false
          return true
        })

        setRecommendations(filteredProperties.slice(0, 5))
      }

      if (showScheduleOptions) {
        setShowSchedule(true)
      }
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleListening = () => {
    if (!isListening) {
      // Start speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.lang = "en-US"

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
        }

        recognition.onend = () => {
          setIsListening(false)
          // Auto-send after voice input
          setTimeout(() => {
            handleSendMessage()
          }, 500)
        }

        recognition.start()
      } else {
        alert("Speech recognition is not supported in your browser.")
      }
    } else {
      // Stop speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.stop()
        setIsListening(false)
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const initialSuggestions = [
    "I want to buy a flat in Gurgaon",
    "Looking for a 3BHK in Dubai under 2 Cr",
    "Show me top builder projects",
  ]

  return (
    <main className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Left Panel - Chat Interface */}
      <div className="w-full md:w-1/2 flex flex-col h-full border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">RightHome AI</h1>
          <p className="text-sm text-gray-500">Your personal property co-pilot</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} />
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          {stage === 1 ? (
            <SuggestionButtons suggestions={initialSuggestions} onSuggestionClickAction={handleSuggestionClick} />
          ) : (
            <SuggestionButtons
              suggestions={["Tell me more details", "Show other options", "Schedule a visit", "Contact via WhatsApp"]}
              onSuggestionClickAction={handleSuggestionClick}
            />
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={toggleListening} className={isListening ? "bg-red-100" : ""}>
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Dynamic Content */}
      <div className="hidden md:block md:w-1/2 h-full overflow-y-auto bg-gray-50 p-6">
        {Object.keys(requirementMap).length > 0 && <RequirementMap requirementMap={requirementMap} />}

        {recommendations.length > 0 && <PropertyRecommendations properties={recommendations} />}

        {showSchedule && <ScheduleOptions />}
      </div>

      {/* Mobile view for recommendations and scheduling */}
      <div className="md:hidden w-full">
        {Object.keys(requirementMap).length > 0 && <RequirementMap requirementMap={requirementMap} />}

        {(recommendations.length > 0 || showSchedule) && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {recommendations.length > 0 && <PropertyRecommendations properties={recommendations} />}
            {showSchedule && <ScheduleOptions />}
          </div>
        )}
      </div>
    </main>
  )
}
