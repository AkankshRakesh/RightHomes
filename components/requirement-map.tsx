import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "../lib/utils"
import { ChevronRight, MessageSquare, Phone, Calendar, MapPin } from "lucide-react"

// Define types for better type safety
type PropertyPurpose = 'investment' | 'personal' | 'rental' | 'commercial'
type PropertyStatus = 'ready' | 'under-construction' | 'any'
type PropertyType = 'apartment' | 'villa' | 'plot' | 'penthouse' | 'studio'

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
  status: "Construction Status",
  type: "Property Type",
}

// Value transformers for different fields
const VALUE_TRANSFORMERS: Record<string, (value: any) => string> = {
  budget: (value) => {
    if (typeof value === 'string') return value
    return formatPrice(value)
  },
  bedrooms: (value) => {
    if (value === 'studio') return 'Studio'
    return `${value} BHK`
  },
  status: (value) => {
    const statusMap: Record<PropertyStatus, string> = {
      'ready': 'Ready to Move',
      'under-construction': 'Under Construction',
      'any': 'Any Status'
    }
    return statusMap[value as PropertyStatus] || value
  },
  purpose: (value) => {
    const purposeMap: Record<PropertyPurpose, string> = {
      'investment': 'Investment',
      'personal': 'Personal Use',
      'rental': 'Rental',
      'commercial': 'Commercial'
    }
    return purposeMap[value as PropertyPurpose] || value
  },
  type: (value) => {
    const typeMap: Record<PropertyType, string> = {
      'apartment': 'Apartment',
      'villa': 'Villa',
      'plot': 'Plot',
      'penthouse': 'Penthouse',
      'studio': 'Studio Apartment'
    }
    return typeMap[value as PropertyType] || value
  }
}

// Stage-specific configurations
const STAGE_CONFIG = {
  1: {
    title: "Let's Get Started",
    description: "Tell us what you're looking for"
  },
  2: {
    title: "Your Preferences",
    description: "We'll use these to find perfect matches"
  },
  3: {
    title: "Recommended Properties",
    description: "Based on your criteria"
  },
  4: {
    title: "Schedule a Visit",
    description: "Connect with our property experts"
  },
  5: {
    title: "Refine Your Search",
    description: "What would you like to change?"
  },
  6: {
    title: "Summary & Follow-up",
    description: "Your property journey so far"
  }
}

export default function RequirementMap({ 
  requirementMap, 
  onStageChange,
  onAction
}: RequirementMapProps) {
  const getDisplayValue = (key: string, value: any): string => {
    return VALUE_TRANSFORMERS[key]?.(value) || String(value)
  }

  // Filter out empty values and the 'stage' field
  const validRequirements = Object.entries(requirementMap)
    .filter(([key, value]) => 
      value !== undefined && 
      value !== null && 
      value !== '' && 
      key !== 'stage'
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

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{stageConfig.title}</CardTitle>
            <p className="text-sm text-gray-500">{stageConfig.description}</p>
          </div>
          {currentStage < 6 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNextStage}
              className="text-primary hover:text-primary"
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Requirements Badges */}
        {validRequirements.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {validRequirements.map(([key, value]) => (
              <Badge 
                key={key} 
                variant="outline" 
                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-normal text-gray-500 mr-1">
                  {DISPLAY_LABELS[key] || key.replace(/_/g, ' ')}:
                </span>
                <span className="font-medium">
                  {getDisplayValue(key, value)}
                </span>
              </Badge>
            ))}
          </div>
        )}

        {/* Stage-specific actions */}
        {currentStage === 3 && (
          <div className="flex flex-wrap gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => handleAction('know-more')}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Know More
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAction('book-call')}
            >
              <Phone className="mr-2 h-4 w-4" /> Book a Call
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAction('schedule-visit')}
            >
              <Calendar className="mr-2 h-4 w-4" /> Schedule Visit
            </Button>
          </div>
        )}

        {currentStage === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3"
              onClick={() => handleAction('whatsapp')}
            >
              <MessageSquare className="mb-2 h-6 w-6" />
              <span>Connect via WhatsApp</span>
              <span className="text-xs text-gray-500 mt-1">Instant messaging with builder</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3"
              onClick={() => handleAction('calendly')}
            >
              <Calendar className="mb-2 h-6 w-6" />
              <span>Schedule Call/Visit</span>
              <span className="text-xs text-gray-500 mt-1">Pick your preferred slot</span>
            </Button>
          </div>
        )}

        {currentStage === 5 && (
          <div className="flex flex-wrap gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => handleAction('change-location')}
            >
              <MapPin className="mr-2 h-4 w-4" /> Change Location
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAction('change-budget')}
            >
              ₹ Change Budget
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAction('change-type')}
            >
              🏠 Change Property Type
            </Button>
          </div>
        )}

        {currentStage === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => handleAction('email-summary')}
            >
              ✉️ Email Me Summary
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAction('whatsapp-summary')}
            >
              💬 WhatsApp Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}