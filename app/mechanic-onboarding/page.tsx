"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Wrench,
  CheckCircle2,
  FileText,
  Camera,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Shield,
  Briefcase,
  ChevronRight,
  Upload,
  Car,
  type LucideIcon,
} from "lucide-react"

export default function MechanicOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const steps: { id: number; title: string; icon: LucideIcon }[] = [
    { id: 1, title: "Personal Info", icon: FileText },
    { id: 2, title: "Skills & Certifications", icon: Award },
    { id: 3, title: "Work Experience", icon: Briefcase },
    { id: 4, title: "Portfolio Upload", icon: Camera },
    { id: 5, title: "Verification", icon: Shield },
  ]

  const specializations = [
    "Engine Repair",
    "Transmission",
    "Electrical Systems",
    "Brakes & Suspension",
    "AC & Heating",
    "Bodywork",
    "Diagnostics",
    "Oil Change & Maintenance",
    "Tire Services",
    "Custom Modifications",
    "Hybrid/Electric",
    "Performance Tuning",
  ]

  const certifications = [
    { name: "ASE Certified", level: "Master" },
    { name: "EPA 609", level: "Certified" },
    { name: "Manufacturer Training", level: "Various" },
    { name: "Hybrid/EV Certification", level: "Advanced" },
  ]

  const renderStepIcon = () => {
    const currentStepData = steps[currentStep - 1]
    if (currentStep > currentStepData.id) {
      return <CheckCircle2 className="h-6 w-6" />
    }
    const IconComponent = currentStepData.icon
    return <IconComponent className="h-5 w-5 text-orange-500" />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Wrench className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold">Mechanic Onboarding</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our network of certified mechanics and start earning. Complete your profile to get matched with
            customers.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        currentStep >= step.id ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircle2 className="h-6 w-6" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 md:w-24 h-1 mx-2 rounded ${currentStep > step.id ? "bg-orange-500" : "bg-muted"}`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {renderStepIcon()}
                  {steps[currentStep - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">First Name</label>
                        <Input placeholder="Enter first name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Last Name</label>
                        <Input placeholder="Enter last name" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Address
                      </label>
                      <Input type="email" placeholder="mechanic@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone Number
                      </label>
                      <Input type="tel" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Service Area
                      </label>
                      <Input placeholder="City, State or ZIP code" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Years of Experience</label>
                      <Input type="number" placeholder="e.g., 5" />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-3 block">Select Your Specializations</label>
                      <div className="flex flex-wrap gap-2">
                        {specializations.map((spec) => (
                          <Badge
                            key={spec}
                            variant="outline"
                            className="cursor-pointer hover:bg-orange-500/10 hover:border-orange-500 transition-colors py-2 px-3"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-3 block">Certifications</label>
                      <div className="space-y-3">
                        {certifications.map((cert) => (
                          <div key={cert.name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Award className="h-5 w-5 text-orange-500" />
                              <span className="font-medium">{cert.name}</span>
                            </div>
                            <Badge variant="secondary">{cert.level}</Badge>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full bg-transparent">
                          + Add Certification
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-4">
                      <h4 className="font-medium">Previous Employment</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Company/Shop Name" />
                        <Input placeholder="Position/Role" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input type="date" placeholder="Start Date" />
                        <Input type="date" placeholder="End Date" />
                      </div>
                      <textarea
                        className="w-full p-3 border rounded-lg bg-background min-h-[100px]"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      + Add Another Position
                    </Button>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed rounded-xl p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="font-medium mb-2">Upload Work Photos</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Show off your best work - before/after repairs, custom jobs, etc.
                      </p>
                      <Button variant="outline">
                        <Camera className="h-4 w-4 mr-2" />
                        Select Photos
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                          <Car className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-orange-500/10 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-orange-500" />
                        Identity Verification
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Upload a government-issued ID to verify your identity
                      </p>
                    </div>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center">
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload ID Document
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">I agree to the terms of service and privacy policy</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">I confirm all information provided is accurate</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {currentStep === totalSteps ? "Submit Application" : "Continue"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Join Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Clock, title: "Flexible Hours", desc: "Work on your own schedule" },
                  { icon: Star, title: "Top Earnings", desc: "Competitive pay rates" },
                  { icon: Shield, title: "Insurance Coverage", desc: "Protected while you work" },
                  { icon: Award, title: "Growth Opportunities", desc: "Advance your career" },
                ].map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <ItemIcon className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is here to help you through the onboarding process.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
