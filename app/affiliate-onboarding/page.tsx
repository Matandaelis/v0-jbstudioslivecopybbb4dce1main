"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  CheckCircle2,
  FileText,
  Link2,
  DollarSign,
  TrendingUp,
  Share2,
  Gift,
  ChevronRight,
  Globe,
  Instagram,
  Youtube,
  MessageCircle,
  Zap,
  Target,
  Award,
} from "lucide-react"

export default function AffiliateOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const steps = [
    { id: 1, title: "Account Setup", icon: FileText },
    { id: 2, title: "Social Profiles", icon: Share2 },
    { id: 3, title: "Choose Niche", icon: Target },
    { id: 4, title: "Get Started", icon: Zap },
  ]

  const niches = [
    { name: "Automotive", icon: "🚗", color: "bg-blue-500/10 text-blue-500" },
    { name: "Beauty & Fashion", icon: "💄", color: "bg-pink-500/10 text-pink-500" },
    { name: "Tech & Gadgets", icon: "📱", color: "bg-purple-500/10 text-purple-500" },
    { name: "Home & Garden", icon: "🏡", color: "bg-green-500/10 text-green-500" },
    { name: "Health & Fitness", icon: "💪", color: "bg-orange-500/10 text-orange-500" },
    { name: "Food & Cooking", icon: "🍳", color: "bg-yellow-500/10 text-yellow-500" },
  ]

  const commissionTiers = [
    { tier: "Starter", rate: "5%", requirement: "0-50 sales", color: "border-gray-500" },
    { tier: "Bronze", rate: "8%", requirement: "51-200 sales", color: "border-amber-700" },
    { tier: "Silver", rate: "12%", requirement: "201-500 sales", color: "border-gray-400" },
    { tier: "Gold", rate: "15%", requirement: "501-1000 sales", color: "border-yellow-500" },
    { tier: "Platinum", rate: "20%", requirement: "1000+ sales", color: "border-purple-500" },
  ]

  const getCurrentStepIcon = (stepId) => {
    const step = steps.find((step) => step.id === stepId)
    return step ? step.icon : null
  }

  const getCurrentStepTitle = (stepId) => {
    const step = steps.find((step) => step.id === stepId)
    return step ? step.title : null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold">Affiliate Program</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of affiliates earning passive income. Share products you love and earn commissions on every
            sale.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      currentStep >= step.id ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle2 className="h-6 w-6" /> : <step.icon className="h-5 w-5" />}
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
                    className={`w-20 md:w-32 h-1 mx-2 rounded ${currentStep > step.id ? "bg-green-500" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCurrentStepIcon(currentStep) && (
                    <getCurrentStepIcon.currentStep className="h-5 w-5 text-green-500" />
                  )}
                  {getCurrentStepTitle(currentStep)}
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
                      <label className="text-sm font-medium mb-2 block">Email Address</label>
                      <Input type="email" placeholder="affiliate@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone Number</label>
                      <Input type="tel" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Country</label>
                      <Input placeholder="Select your country" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Referral Code (Optional)</label>
                      <Input placeholder="Enter referral code if you have one" />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Connect your social accounts to help us understand your audience better.
                    </p>
                    {[
                      { name: "Website/Blog", icon: Globe, placeholder: "https://yourblog.com" },
                      { name: "Instagram", icon: Instagram, placeholder: "@yourusername" },
                      { name: "YouTube", icon: Youtube, placeholder: "youtube.com/c/yourchannel" },
                      { name: "TikTok", icon: MessageCircle, placeholder: "@yourusername" },
                    ].map((platform) => (
                      <div key={platform.name}>
                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                          {platform.icon && <platform.icon className="h-4 w-4" />}
                          {platform.name}
                        </label>
                        <Input placeholder={platform.placeholder} />
                      </div>
                    ))}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Total Audience Size</label>
                      <Input placeholder="e.g., 10,000 followers" />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Select the niches that best match your content and audience.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {niches.map((niche) => (
                        <div
                          key={niche.name}
                          className="p-4 border rounded-xl cursor-pointer hover:border-green-500 transition-colors text-center"
                        >
                          <div className="text-3xl mb-2">{niche.icon}</div>
                          <span className="font-medium text-sm">{niche.name}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tell us about your content</label>
                      <textarea
                        className="w-full p-3 border rounded-lg bg-background min-h-[100px]"
                        placeholder="Describe the type of content you create and how you plan to promote products..."
                      />
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="p-6 bg-green-500/10 rounded-xl text-center">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">You are All Set!</h3>
                      <p className="text-muted-foreground">
                        Your affiliate account is ready. Start sharing and earning today!
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <label className="text-sm font-medium mb-2 block">Your Unique Referral Link</label>
                      <div className="flex gap-2">
                        <Input value="https://jbstudios.live/ref/YOUR_CODE" readOnly />
                        <Button variant="outline">
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-muted rounded-lg">
                        <DollarSign className="h-6 w-6 mx-auto text-green-500 mb-2" />
                        <div className="font-bold">$0.00</div>
                        <div className="text-xs text-muted-foreground">Earnings</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Users className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                        <div className="font-bold">0</div>
                        <div className="text-xs text-muted-foreground">Referrals</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <TrendingUp className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                        <div className="font-bold">5%</div>
                        <div className="text-xs text-muted-foreground">Commission</div>
                      </div>
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
                    className="bg-green-500 hover:bg-green-600"
                    disabled={currentStep === totalSteps}
                  >
                    {currentStep === totalSteps ? "Go to Dashboard" : "Continue"}
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
                <CardTitle className="text-lg">Commission Tiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {commissionTiers.map((tier) => (
                  <div key={tier.tier} className={`p-3 border-l-4 ${tier.color} bg-muted/50 rounded-r-lg`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{tier.tier}</span>
                      <Badge variant="secondary">{tier.rate}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{tier.requirement}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Program Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: DollarSign, title: "High Commissions", desc: "Earn up to 20% per sale" },
                  { icon: Gift, title: "Exclusive Perks", desc: "Access to special promotions" },
                  { icon: TrendingUp, title: "Real-time Tracking", desc: "Monitor your performance" },
                  { icon: Award, title: "Bonuses & Rewards", desc: "Extra incentives for top performers" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      {item.icon && <item.icon className="h-4 w-4 text-green-500" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
