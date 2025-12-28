"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Shield, ExternalLink, ChevronDown, Home, Play, Users, Truck, HelpCircle, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

const EA_COUNTRIES: Record<string, { name: string; flag: string; languages: string[] }> = {
  KE: { name: "Kenya", flag: "🇰🇪", languages: ["en", "sw"] },
  UG: { name: "Uganda", flag: "🇺🇬", languages: ["en", "sw", "lg"] },
  TZ: { name: "Tanzania", flag: "🇹🇿", languages: ["sw", "en"] },
  RW: { name: "Rwanda", flag: "🇷🇼", languages: ["rw", "en", "fr"] },
  BI: { name: "Burundi", flag: "🇧🇮", languages: ["rn", "fr", "en"] },
  SS: { name: "South Sudan", flag: "🇸🇸", languages: ["en", "ar"] },
  ET: { name: "Ethiopia", flag: "🇪🇹", languages: ["am", "en"] },
  ER: { name: "Eritrea", flag: "🇪🇷", languages: ["ti", "ar", "en"] },
  DJ: { name: "Djibouti", flag: "🇩🇯", languages: ["fr", "ar"] },
  SO: { name: "Somalia", flag: "🇸🇴", languages: ["so", "ar", "en"] },
  MG: { name: "Madagascar", flag: "🇲🇬", languages: ["mg", "fr"] },
  MU: { name: "Mauritius", flag: "🇲🇺", languages: ["en", "fr"] },
}

const EA_LANGUAGES: Record<string, string> = {
  en: "English",
  sw: "Kiswahili",
  fr: "Français",
  ar: "العربية",
  am: "አማርኛ",
  ti: "ትግርኛ",
  so: "Soomaali",
  rw: "Ikinyarwanda",
  rn: "Ikirundi",
  lg: "Oluganda",
  mg: "Malagasy",
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showExternal, setShowExternal] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [showCampaigns, setShowCampaigns] = useState(false)
  const [showRegion, setShowRegion] = useState(false)
  const [country, setCountry] = useState("KE")
  const [language, setLanguage] = useState("en")

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-3 h-3" /> },
    { name: "Live", href: "/live-showcase", icon: <Play className="w-3 h-3" />, badge: "🔴" },
    { name: "Host", href: "/host-portal", icon: <Users className="w-3 h-3" /> },
  ]

  const teamLinks = [
    { name: "Host Dashboard", href: "/host-dashboard" },
    { name: "Training Center", href: "/host-training" },
    { name: "Host Tools", href: "/host-tools" },
    { name: "Payouts", href: "/creator-payout-dashboard" },
    { name: "Affiliate Hub", href: "/affiliate-hub" },
    { name: "Vendor Portal", href: "/vendor-dashboard" },
    { name: "Brand Partners", href: "/brand-partner-portal" },
    { name: "Community Hub", href: "/community-hub" },
    { name: "GearNation", href: "/gear-nation-hub" },
    { name: "Host Onboarding", href: "/" },
    { name: "Mechanic Onboarding", href: "/mechanic-onboarding" },
    { name: "Affiliate Onboarding", href: "/affiliate-onboarding" },
  ]

  const campaignLinks = [
    { name: "Marketing 360", href: "/marketing-360-dashboard" },
    { name: "MaaS 360", href: "/maas-360" },
    { name: "Battle Mode", href: "/battle-mode" },
    { name: "Gamification", href: "/gamification-center" },
    { name: "Loyalty Center", href: "/loyalty-center" },
    { name: "Finance Dashboard", href: "/finance-dashboard" },
    { name: "Workflows Hub", href: "/workflows-hub" },
    { name: "Personalization", href: "/personalization-center" },
    { name: "Tribe Rush", href: "/tribe-rush" },
  ]

  const externalLinks = [
    { name: "Beauty Shop", url: "https://jessicabrowncollections.com" },
    { name: "Auto Shop", url: "https://autowheels.co.ke" },
    { name: "Beauty Earn", url: "https://earn.jessicabrown.co.ke" },
    { name: "Auto Earn", url: "https://earn.autowheels.co.ke" },
    { name: "BrownBeauty", url: "https://brownbeauty.africa" },
    { name: "GearNation", url: "https://gearnation.africa" },
    { name: "CRM", url: "https://crm.jessicabrowncollections.com" },
    { name: "Logistics", url: "https://logistics.jessicabrowncollections.com" },
    { name: "JB Studio", url: "https://jbstudio.co.ke" },
  ]

  interface DropdownLink {
    name: string
    href?: string
    url?: string
  }

  const DropdownMenu = ({
    show,
    setShow,
    title,
    links,
    isExternal = false,
  }: {
    show: boolean
    setShow: (show: boolean) => void
    title: string
    links: DropdownLink[]
    isExternal?: boolean
  }) => (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all flex items-center gap-2"
      >
        {title} <ChevronDown className={`w-3 h-3 transition-transform ${show ? "rotate-180" : ""}`} />
      </button>
      {show && (
        <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
          {links.map((link, idx) =>
            isExternal ? (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              >
                {link.name}
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            ) : (
              <Link
                key={idx}
                href={link.href || "/"}
                className="block px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              >
                {link.name}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  )

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
              JB
            </div>
            <span className="text-neutral-900 font-bold text-lg hidden sm:block">Studios</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all flex items-center gap-2"
              >
                {link.icon} {link.name}
                {link.badge && <span className="text-xs">{link.badge}</span>}
              </Link>
            ))}

            <DropdownMenu show={showTeam} setShow={setShowTeam} title="Team" links={teamLinks} />
            <DropdownMenu show={showCampaigns} setShow={setShowCampaigns} title="Campaigns" links={campaignLinks} />

            <Link
              href="/logistics-dashboard"
              className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1"
            >
              <Truck className="w-3 h-3" /> Orders
            </Link>

            <Link
              href="/admin-dashboard"
              className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3" /> Compliance
            </Link>

            <DropdownMenu
              show={showExternal}
              setShow={setShowExternal}
              title="Ecosystem"
              links={externalLinks}
              isExternal
            />

            <Link
              href="/help-center"
              className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" /> Help
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowRegion(!showRegion)}
                onBlur={() => setTimeout(() => setShowRegion(false), 200)}
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                {EA_COUNTRIES[country]?.flag} {EA_LANGUAGES[language]?.slice(0, 2) || language.toUpperCase()}
                <ChevronDown className={`w-3 h-3 transition-transform ${showRegion ? "rotate-180" : ""}`} />
              </button>
              {showRegion && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-2 max-h-96 overflow-y-auto">
                  <div className="px-3 py-1 text-xs text-neutral-400 uppercase tracking-wide">Country</div>
                  <div className="grid grid-cols-2 gap-1 px-2 mb-2">
                    {Object.entries(EA_COUNTRIES).map(([code, data]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCountry(code)
                          setLanguage(data.languages[0])
                        }}
                        className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                          country === code ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {data.flag} {data.name}
                      </button>
                    ))}
                  </div>
                  <div className="px-3 py-1 text-xs text-neutral-400 uppercase tracking-wide border-t border-neutral-100">
                    Language
                  </div>
                  <div className="flex flex-wrap gap-1 px-2">
                    {EA_COUNTRIES[country]?.languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-2 py-1 text-xs rounded ${
                          language === lang ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {EA_LANGUAGES[lang] || lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/super-admin">
              <Button size="sm" className="ml-3 bg-neutral-900 text-white hover:bg-neutral-800 shadow-md">
                <Shield className="w-3 h-3 mr-1" /> Admin
              </Button>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden py-2 border-t border-neutral-100 max-h-[80vh] overflow-y-auto bg-white">
            <div className="px-3 py-1 text-xs text-neutral-400 uppercase tracking-wide">Main</div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md"
              >
                {link.icon} {link.name}
              </Link>
            ))}

            <div className="px-3 py-1 text-xs text-neutral-400 uppercase tracking-wide mt-2">Team</div>
            {teamLinks.slice(0, 6).map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md"
              >
                {link.name}
              </Link>
            ))}

            <div className="px-3 py-1 text-xs text-neutral-400 uppercase tracking-wide mt-2">Campaigns</div>
            {campaignLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md"
              >
                {link.name}
              </Link>
            ))}

            <div className="px-3 py-1 text-xs text-neutral-400 uppercase tracking-wide mt-2 border-t border-neutral-100">
              Region
            </div>
            <div className="px-3 py-2 grid grid-cols-4 gap-1">
              {Object.entries(EA_COUNTRIES).map(([code, data]) => (
                <button
                  key={code}
                  onClick={() => {
                    setCountry(code)
                    setLanguage(data.languages[0])
                  }}
                  className={`p-2 text-center rounded ${
                    country === code ? "bg-neutral-900 text-white" : "text-neutral-600 bg-neutral-100"
                  }`}
                >
                  <span className="text-lg">{data.flag}</span>
                </button>
              ))}
            </div>
            <div className="px-3 py-2 flex flex-wrap gap-1">
              {EA_COUNTRIES[country]?.languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs rounded ${
                    language === lang ? "bg-neutral-900 text-white" : "text-neutral-600 bg-neutral-100"
                  }`}
                >
                  {EA_LANGUAGES[lang] || lang}
                </button>
              ))}
            </div>

            <Link
              href="/super-admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 mt-2 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md border-t border-neutral-100 pt-3"
            >
              <Shield className="w-3 h-3 inline mr-1" /> Admin Panel
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
