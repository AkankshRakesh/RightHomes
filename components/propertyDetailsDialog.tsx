"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { formatPrice } from "../lib/utils"

interface PropertyDetailsDialogProps {
  property: {
    name: string;
    location: string;
    image?: string;
    price: number;
    priceUnit: string;
    type: string;
    size: number;
    status: string;
    moreDetails: {
      description: string;
      amenities: string[];
      floorPlans?: string[];
      contact: string;
      reraId: string;
      possessionDate: string;
    };
  }
  open: boolean
  onOpenChangeAction: (open: boolean) => void;
}

export function PropertyDetailsDialog({ property, open, onOpenChangeAction }: PropertyDetailsDialogProps) {
  if (!property?.moreDetails) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{property.name}</DialogTitle>
          <p className="text-sm text-gray-500">{property.location}</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Main Image */}
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <Image
              src={property.image || "/placeholder-large.jpg"}
              alt={property.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Property Description</h3>
            <p className="text-gray-700">{property.moreDetails.description}</p>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium">{formatPrice(property.price)} {property.priceUnit}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{property.type}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Size</p>
              <p className="font-medium">{property.size} sq.ft</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{property.status}</p>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.moreDetails.amenities.map((amenity: string, index: number) => (
                <span key={index} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Floor Plans */}
          {(property.moreDetails.floorPlans ?? []).length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Floor Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.moreDetails.floorPlans?.map((plan: string, index: number) => (
                  <div key={index} className="relative h-64 w-full rounded-lg overflow-hidden border">
                    <Image
                      src={plan}
                      alt={`Floor plan ${index + 1}`}
                      fill
                      className="object-fit"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Contact Information</h4>
              <p>{property.moreDetails.contact}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Legal Information</h4>
              <p>RERA ID: {property.moreDetails.reraId}</p>
              <p>Possession: {property.moreDetails.possessionDate}</p>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={() => onOpenChangeAction(false)}
          className="absolute right-4 top-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  )
}