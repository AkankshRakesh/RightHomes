"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "../lib/utils"
import {
  ChevronRight,
  MessageSquare,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  Filter,
  Wallet,
  Home,
  Building,
  Building2,
  Search,
  Settings,
  ClipboardList,
  Mail,
  Currency,
  TrendingUpDown,
} from "lucide-react"

// Define types for better type safety
type PropertyPurpose = "investment" | "personal" | "rental" | "commercial"
type PropertyStatus = "ready" | "under-construction" | "any"
type PropertyType = "apartment" | "villa" | "plot" | "penthouse" | "studio"

interface PropertyRequirements {
  purpose?: PropertyPurpose
  city?: string
  location?: string
  budget?: number | string
  bedrooms?: number | string
  status?: PropertyStatus
  type?: PropertyType
  stage?: number // Track conversation stage
  [key: string]: unknown // Allow for additional dynamic fields
}

interface RequirementMapProps {
  requirementMap: PropertyRequirements
  onStageChange?: (stage: number) => void
  onAction?: (action: string) => void
}

// More comprehensive display labels
const DISPLAY_LABELS: Record<string, string> = {
  purpose: "Purpose",
  city: "City",
  location: "Preferred Area",
  budget: "Budget Range",
  bedrooms: "Bedrooms",
  currency: "Currency",
  budgetUnit: "Budget Unit",
  status: "Construction Status",
  type: "Property Type",
}

// Value transformers for different fields
const VALUE_TRANSFORMERS: Record<string, (value: string | number | PropertyPurpose | PropertyStatus | PropertyType) => string> = {
  budget: (value) => {
    if (typeof value === "string") return value
    return formatPrice(value)
  },
  bedrooms: (value) => {
    if (value === "studio") return "Studio"
    return `${value} BHK`
  },
  status: (value) => {
    const statusMap: Record<PropertyStatus, string> = {
      ready: "Ready to Move",
      "under-construction": "Under Construction",
      any: "Any Status",
    }
    return statusMap[value as PropertyStatus] || String(value)
  },
  purpose: (value) => {
    const purposeMap: Record<PropertyPurpose, string> = {
      investment: "Investment",
      personal: "Personal Use",
      rental: "Rental",
      commercial: "Commercial",
    }
    return purposeMap[value as PropertyPurpose] || String(value)
  },
  type: (value) => {
    const typeMap: Record<PropertyType, string> = {
      apartment: "Apartment",
      villa: "Villa",
      plot: "Plot",
      penthouse: "Penthouse",
      studio: "Studio Apartment",
    }
    return typeMap[value as PropertyType] || String(value)
  },
}

// Icons for different requirement types
const REQUIREMENT_ICONS: Record<string, React.ReactNode> = {
  purpose: <CheckCircle2 className="h-3 w-3" />,
  city: <MapPin className="h-3 w-3" />,
  location: <MapPin className="h-3 w-3" />,
  budget: <Wallet className="h-3 w-3" />,
  bedrooms: <Home className="h-3 w-3" />,
  currency: <Currency className="h-3 w-3" />,
  budgetUnit: <TrendingUpDown className="h-3 w-3" />,
  status: <Building className="h-3 w-3" />,
  type: <Building2 className="h-3 w-3" />,
}

// Stage-specific configurations with icons
const STAGE_CONFIG = {
  1: {
    title: "Let's Get Started",
    description: "Tell us what you're looking for",
    icon: <Search className="h-5 w-5 text-teal-600" />,
  },
  2: {
    title: "Your Preferences",
    description: "We'll use these to find perfect matches",
    icon: <Filter className="h-5 w-5 text-teal-600" />,
  },
  3: {
    title: "Recommended Properties",
    description: "Based on your criteria",
    icon: <Home className="h-5 w-5 text-teal-600" />,
  },
  4: {
    title: "Schedule a Visit",
    description: "Connect with our property experts",
    icon: <Calendar className="h-5 w-5 text-teal-600" />,
  },
  5: {
    title: "Refine Your Search",
    description: "What would you like to change?",
    icon: <Settings className="h-5 w-5 text-teal-600" />,
  },
  6: {
    title: "Summary & Follow-up",
    description: "Your property journey so far",
    icon: <ClipboardList className="h-5 w-5 text-teal-600" />,
  },
}

export default function RequirementMap({ requirementMap, onStageChange, onAction }: RequirementMapProps) {
  const getDisplayValue = (key: string, value: string | number | PropertyPurpose | PropertyStatus | PropertyType | null | undefined): string => {
    return VALUE_TRANSFORMERS[key]?.(value ?? "") || String(value ?? "")
  }

  // Filter out empty values and the 'stage' field
  const validRequirements = Object.entries(requirementMap).filter(
    ([key, value]) => value !== undefined && value !== null && value !== "" && key !== "stage",
  )

  const currentStage = requirementMap.stage || 1
  const stageConfig = STAGE_CONFIG[currentStage as keyof typeof STAGE_CONFIG]

  if (validRequirements.length === 0 && currentStage !== 1) {
    return null
  }

  const handleNextStage = () => {
    if (onStageChange && currentStage < 6) {
      onStageChange(currentStage + 1)
    }
  }

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action)
    }
  }

  // Calculate progress percentage
  const progressPercentage = Math.min(((currentStage - 1) / 5) * 100, 100)

  return (
    <Card className="mb-6 border-gray-200 shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-full bg-teal-50 flex-shrink-0">{stageConfig.icon}</div>
            <div>
              <CardTitle className="text-lg text-gray-800">{stageConfig.title}</CardTitle>
              <p className="text-sm text-gray-500">{stageConfig.description}</p>
            </div>
          </div>
          {currentStage < 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextStage}
              className="text-teal-600 hover:text-teal-700 hidden hover:bg-teal-50"
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Requirements Badges */}
        {validRequirements.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {validRequirements.map(([key, value]) => {
              const icon = REQUIREMENT_ICONS[key]
              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="px-3 py-1.5 bg-teal-50 border-teal-100 hover:bg-teal-100 transition-colors text-teal-800"
                >
                  {icon && <span className="mr-1.5 text-teal-600">{icon}</span>}
                  <span className="font-normal text-teal-700 mr-1">
                    {DISPLAY_LABELS[key] || key.replace(/_/g, " ")}:
                  </span>
                  <span className="font-medium text-gray-900">{getDisplayValue(key, value as string | number | null | undefined)}</span>
                </Badge>
              )
            })}
          </div>
        )}

        {/* Stage-specific actions */}
        {currentStage === 3 && (
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => handleAction("know-more")}
              className="border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Know More
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction("book-call")}
              className="border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              <Phone className="mr-2 h-4 w-4" /> Book a Call
            </Button>
            <Button
              variant="default"
              onClick={() => handleAction("schedule-visit")}
              className="bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              <Calendar className="mr-2 h-4 w-4" /> Schedule Visit
            </Button>
          </div>
        )}

        {currentStage === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              onClick={() => handleAction("whatsapp")}
            >
              <div className="bg-teal-100 text-teal-600 p-2 rounded-full mb-2">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="font-medium">Connect via WhatsApp</span>
              <span className="text-xs text-gray-500 mt-1">Instant messaging with builder</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              onClick={() => handleAction("calendly")}
            >
              <div className="bg-teal-100 text-teal-600 p-2 rounded-full mb-2">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="font-medium">Schedule Call/Visit</span>
              <span className="text-xs text-gray-500 mt-1">Pick your preferred slot</span>
            </Button>
          </div>
        )}

        {currentStage === 5 && (
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => handleAction("change-location")}
              className="border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              <MapPin className="mr-2 h-4 w-4" /> Change Location
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction("change-budget")}
              className="border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              <Wallet className="mr-2 h-4 w-4" /> Change Budget
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction("change-type")}
              className="border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              <Home className="mr-2 h-4 w-4" /> Change Property Type
            </Button>
          </div>
        )}

        {currentStage === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => handleAction("email-summary")}
              className="border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              <Mail className="mr-2 h-4 w-4" /> Email Me Summary
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction("whatsapp-summary")}
              className="border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
