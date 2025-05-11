"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ScheduleOptions() {
  const handleWhatsAppClick = () => {
    alert("This would connect to WhatsApp API in the production version")
  }

  const handleCalendlyClick = () => {
    alert("This would open Calendly scheduling in the production version")
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Schedule a Visit or Call</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visit">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="visit">Site Visit</TabsTrigger>
            <TabsTrigger value="call">Phone Call</TabsTrigger>
          </TabsList>

          <TabsContent value="visit" className="space-y-4">
            <p className="text-sm text-gray-600">
              Schedule a site visit to see the property in person. Our representative will guide you through the
              property.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleWhatsAppClick} className="flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsAppss
              </Button>
              <Button onClick={handleCalendlyClick} variant="outline" className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                Calendly
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="call" className="space-y-4">
            <p className="text-sm text-gray-600">
              Schedule a call with our property expert to discuss your requirements in detail.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleWhatsAppClick} className="flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button onClick={handleCalendlyClick} variant="outline" className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                Calendly
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
