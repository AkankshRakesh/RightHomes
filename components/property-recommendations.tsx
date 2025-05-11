"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Info, Calendar, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "../lib/utils"
import Image from "next/image"

interface Property {
  properties: Array<Property>
  name: string;
  location: string;
  price: number;
  type: string;
  size: number;
  bedrooms: number;
  features: string[];
  status: string;
  image?: string;
}

interface PropertyRecommendationsProps {
  properties: Array<Property>
}

export default function PropertyRecommendations({ properties }: PropertyRecommendationsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextProperty = () => {
    setActiveIndex((prev) => (prev + 1) % properties.length)
  }

  const prevProperty = () => {
    setActiveIndex((prev) => (prev - 1 + properties.length) % properties.length)
  }

  if (properties.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            No properties match your criteria. Try adjusting your preferences.
          </p>
        </CardContent>
      </Card>
    )
  }

  const property = properties[activeIndex]

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-xl font-bold">Recommended Properties</h2>

      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gray-200">
          <Image
            src={property.image || `/placeholder.svg?height=300&width=600`}
            alt={property.name}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white text-black">
              {property.status}
            </Badge>
          </div>

          {properties.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevProperty}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextProperty}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                {activeIndex + 1} / {properties.length}
              </div>
            </>
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">{property.name}</h3>
              <p className="text-sm text-gray-500">{property.location}</p>
            </div>
            <div className="text-lg font-bold text-blue-600">{formatPrice(property.price)}</div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium">{property.type}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Size</p>
              <p className="font-medium">{property.size} sq.ft</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Bedrooms</p>
              <p className="font-medium">{property.bedrooms} BHK</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Key Features:</p>
            <ul className="text-sm text-gray-600 pl-5 list-disc">
              {property.features.slice(0, 3).map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2 pt-2">
          <Button variant="outline" className="flex-1" size="sm">
            <Info className="h-4 w-4 mr-2" />
            Know More
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="default" className="flex-1" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Visit
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
