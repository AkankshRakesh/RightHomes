"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Info, Calendar, MessageSquare, Heart, Share2, Clipboard, Mail, Twitter, Facebook, Linkedin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "../lib/utils"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PropertyDetailsDialog } from "./propertyDetailsDialog"
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

interface PropertyRecommendationsProps {
  properties: Array<Property>
}

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
      closePopupWidget: () => void;
    };
  }
}

export default function PropertyRecommendations({ properties }: PropertyRecommendationsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [liked, setLiked] = useState<boolean[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Initialize liked state based on properties length
  useEffect(() => {
    setLiked(new Array(properties.length).fill(false))
  }, [properties.length])
  const handleKnowMore = (property: Property) => {
    setSelectedProperty(property)
    setDetailsOpen(true)
  }
  const nextProperty = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev + 1) % properties.length)
    setTimeout(() => setIsAnimating(false), 300)
  }
  
  const prevProperty = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev - 1 + properties.length) % properties.length)
    setTimeout(() => setIsAnimating(false), 300)
  }
  const generatePropertyDetails = (property: Property) => {
    return `
🏠 *${property.name}*
📍 *Location:* ${property.location}
💰 *Price:* ${formatPrice(property.price)} ${property.priceUnit}
📐 *Size:* ${property.size} sq.ft
🛏️ *Bedrooms:* ${property.bedrooms} BHK
🏡 *Type:* ${property.type}
🏷️ *Status:* ${property.status}

✨ *Key Features:*
${property.features.map(feat => `• ${feat}`).join('\n')}

🔗 *View more details:* ${window.location.href}
    `.trim()
  }

  const handleNativeShare = async (property: Property) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${property.name} - Property Details`,
          text: generatePropertyDetails(property),
          url: window.location.href,
        })
      } else {
        await handleCopyToClipboard(property)
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  const handleCopyToClipboard = async (property: Property) => {
    try {
      await navigator.clipboard.writeText(generatePropertyDetails(property))
      toast.success("Property details copied to clipboard!", {
        position: "top-center",
        duration: 2000,
      })
    } catch (err) {
      toast.error(`Failed to copy details - ${err}`, {
        position: "top-center",
        duration: 2000,
      })
    }
  }

  const shareOnPlatform = (platform: string, property: Property) => {
    const details = generatePropertyDetails(property)
    const encodedDetails = encodeURIComponent(details)
    const encodedUrl = encodeURIComponent(window.location.href)

    const platforms = {
      whatsapp: `https://wa.me/?text=${encodedDetails}%0A%0A${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedDetails}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDetails}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodeURIComponent(property.name)}&summary=${encodedDetails}`,
      email: `mailto:?subject=${encodeURIComponent(`Property: ${property.name}`)}&body=${encodedDetails}%0A%0A${encodedUrl}`
    }

    const link = platforms[platform as keyof typeof platforms];
  if (link) window.open(link, "_blank");
  }
  const toggleLike = (index: number) => {
    const newLiked = [...liked]
    newLiked[index] = !newLiked[index]
    setLiked(newLiked)
  }

  if (properties.length === 0) {
    return (
      <Card className="mb-6 border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Info className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No properties match your criteria.</p>
            <p className="text-sm text-gray-400">Try adjusting your preferences or explore more areas.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const property = properties[activeIndex]

  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Recommended Properties</h2>
        <div className="text-sm text-gray-500">{properties.length} properties found</div>
      </div>

      <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative w-full aspect-[3/2] min-h-[200px] max-h-[300px] overflow-hidden bg-gray-100">
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              isAnimating ? "opacity-50" : "opacity-100",
            )}
          >
            <Image
              src={property.image || "/placeholder-large.jpg"}
              alt={property.name}
              fill
              style={{ objectFit: "cover" }}
              quality={90}
              sizes="(max-width: 768px) 100vw, 600px"
              priority
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
            <Badge variant="secondary" className="bg-teal-600 text-white border-none">
              {property.status}
            </Badge>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white border-none"
                onClick={() => toggleLike(activeIndex)}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    liked[activeIndex] ? "fill-red-500 text-red-500" : "text-gray-600",
                  )}
                />
              </Button>
              <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/90 hover:bg-white border-none"
          aria-label="Share property details"
        >
          <Share2 className="h-4 w-4 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleNativeShare(property)}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share via...</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyToClipboard(property)}>
          <Clipboard className="mr-2 h-4 w-4" />
          <span>Copy all details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareOnPlatform('whatsapp', property)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareOnPlatform('email', property)}>
          <Mail className="mr-2 h-4 w-4" />
          <span>Email</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareOnPlatform('twitter', property)}>
          <Twitter className="mr-2 h-4 w-4" />
          <span>Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareOnPlatform('facebook', property)}>
          <Facebook className="mr-2 h-4 w-4" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareOnPlatform('linkedin', property)}>
          <Linkedin className="mr-2 h-4 w-4" />
          <span>LinkedIn</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
            </div>
          </div>

          {properties.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 h-8 w-8 rounded-full shadow-sm"
                onClick={prevProperty}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 h-8 w-8 rounded-full shadow-sm"
                onClick={nextProperty}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {properties.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAnimating(true)
                      setActiveIndex(index)
                      setTimeout(() => setIsAnimating(false), 300)
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === activeIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80",
                    )}
                    aria-label={`View property ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{property.name}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {property.location}
              </p>
            </div>
            <div className="text-lg font-bold text-teal-600">
              {formatPrice(property.price)} {property.priceUnit}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <p className="font-medium text-gray-800">{property.type}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Size</p>
              <p className="font-medium text-gray-800">{property.size} sq.ft</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Bedrooms</p>
              <p className="font-medium text-gray-800">{property.bedrooms} BHK</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Key Features:</p>
            <div className="flex flex-wrap gap-2">
              {property.features.slice(0, 3).map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-normal">
                  {feature}
                </Badge>
              ))}
              {property.features.length > 3 && (
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 font-normal">
                  +{property.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="grid grid-cols-2 lg:grid-cols-3 justify-between gap-2 pt-2 pb-4">
  <Button
    variant="outline"
    className="flex-1 border-gray-200 hover:bg-gray-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
    size="sm"
    onClick={() => handleKnowMore(property)}
  >
    <Info className="h-4 w-4 mr-2" />
    Know More
  </Button>

  <a
    href="https://wa.me/919876543210"
    target="_blank"
    rel="noopener noreferrer"
    className="flex-1"
  >
    <Button
      variant="outline"
      className="w-full border-gray-200 hover:bg-gray-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
      size="sm"
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      WhatsApp
    </Button>
  </a>

  <Button
    variant="default"
    className="col-span-2 lg:col-span-1 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
    size="sm"
    onClick={() =>
    window.Calendly?.initPopupWidget({ url: 'https://calendly.com/AkankshRakesh/property-visit' })
  }
  >
    <Calendar className="h-4 w-4 mr-2" />
    Schedule Visit
  </Button>
</CardFooter>

      </Card>
       {selectedProperty && (
        <PropertyDetailsDialog
          property={selectedProperty}
          open={detailsOpen}
          onOpenChangeAction={setDetailsOpen}
        />
      )}
    </div>
  )
}
