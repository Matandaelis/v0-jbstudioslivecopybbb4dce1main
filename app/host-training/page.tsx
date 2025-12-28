"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  TrendingUp,
  Lock,
  Star,
  ArrowRight,
  Sparkles,
  Wrench,
} from "lucide-react"

const COURSES = [
  {
    id: 1,
    title: "Live Streaming Fundamentals",
    description: "Learn the basics of engaging live commerce",
    duration: "45 min",
    lessons: 8,
    progress: 100,
    category: "basics",
    required: true,
  },
  {
    id: 2,
    title: "Product Showcase Techniques",
    description: "How to present products that sell",
    duration: "1 hr",
    lessons: 12,
    progress: 75,
    category: "sales",
    required: true,
  },
  {
    id: 3,
    title: "Audience Engagement Mastery",
    description: "Build loyal viewers who keep coming back",
    duration: "1.5 hr",
    lessons: 15,
    progress: 30,
    category: "engagement",
    required: false,
  },
  {
    id: 4,
    title: "Advanced Analytics",
    description: "Use data to optimize your streams",
    duration: "2 hr",
    lessons: 18,
    progress: 0,
    category: "analytics",
    required: false,
  },
  {
    id: 5,
    title: "Compliance & Best Practices",
    description: "Stay compliant and professional",
    duration: "30 min",
    lessons: 6,
    progress: 100,
    category: "compliance",
    required: true,
  },
  {
    id: 6,
    title: "Team Building & Affiliates",
    description: "Grow your network and earn more",
    duration: "1 hr",
    lessons: 10,
    progress: 0,
    category: "growth",
    required: false,
  },
]

const CERTIFICATIONS = [
  { name: "Certified Host", earned: true, date: "Dec 2024" },
  { name: "Sales Expert", earned: true, date: "Nov 2024" },
  { name: "Community Leader", earned: false, date: null },
  { name: "Analytics Pro", earned: false, date: null },
]

export default function HostTraining() {
  const [filter, setFilter] = useState<"all" | "required" | "in-progress" | "completed">("all")
  const [vertical, setVertical] = useState<"beauty" | "auto">("beauty")
  const isBeauty = vertical === "beauty"

  const filteredCourses = COURSES.filter((course) => {
    if (filter === "required") return course.required
    if (filter === "in-progress") return course.progress > 0 && course.progress < 100
    if (filter === "completed") return course.progress === 100
    return true
  })

  const totalProgress = Math.round(COURSES.reduce((acc, c) => acc + c.progress, 0) / COURSES.length)
  const completedCourses = COURSES.filter((c) => c.progress === 100).length

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div
        className={`${isBeauty ? "bg-gradient-to-r from-pink-600 to-purple-700" : "bg-gradient-to-r from-orange-600 to-red-700"} text-white`}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex gap-2 mb-4">
                <Button
                  size="sm"
                  onClick={() => setVertical("beauty")}
                  className={
                    vertical === "beauty" ? "bg-white text-pink-600" : "bg-white/20 text-white hover:bg-white/30"
                  }
                >
                  <Sparkles className="w-4 h-4 mr-1" /> Beauty
                </Button>
                <Button
                  size="sm"
                  onClick={() => setVertical("auto")}
                  className={
                    vertical === "auto" ? "bg-white text-orange-600" : "bg-white/20 text-white hover:bg-white/30"
                  }
                >
                  <Wrench className="w-4 h-4 mr-1" /> Auto
                </Button>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Training Center</h1>
              <p className="text-white/80">Level up your skills and unlock new opportunities</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-xl px-6 py-4 text-center">
                <p className="text-3xl font-bold">{totalProgress}%</p>
                <p className="text-sm text-white/70">Overall Progress</p>
              </div>
              <div className="bg-white/10 rounded-xl px-6 py-4 text-center">
                <p className="text-3xl font-bold">
                  {completedCourses}/{COURSES.length}
                </p>
                <p className="text-sm text-white/70">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Courses" },
            { key: "required", label: "Required" },
            { key: "in-progress", label: "In Progress" },
            { key: "completed", label: "Completed" },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key as typeof filter)}
              className={filter === f.key ? (isBeauty ? "bg-pink-500" : "bg-orange-500") : "bg-transparent"}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        course.progress === 100
                          ? "bg-green-100 text-green-600"
                          : course.progress > 0
                            ? (isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600")
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {course.progress === 100 ? (
                        <CheckCircle className="w-7 h-7" />
                      ) : course.progress > 0 ? (
                        <Play className="w-7 h-7" />
                      ) : (
                        <Lock className="w-7 h-7" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{course.title}</h3>
                        {course.required && (
                          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" /> {course.lessons} lessons
                        </span>
                      </div>
                      {course.progress > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                course.progress === 100 ? "bg-green-500" : isBeauty ? "bg-pink-500" : "bg-orange-500"
                              }`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-600">{course.progress}%</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className={
                        course.progress === 100
                          ? "bg-green-500 hover:bg-green-600"
                          : course.progress > 0
                            ? isBeauty
                              ? "bg-pink-500 hover:bg-pink-600"
                              : "bg-orange-500 hover:bg-orange-600"
                            : "bg-slate-900 hover:bg-slate-800"
                      }
                    >
                      {course.progress === 100 ? "Review" : course.progress > 0 ? "Continue" : "Start"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5" /> Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {CERTIFICATIONS.map((cert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      cert.earned ? "bg-green-50 border border-green-200" : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {cert.earned ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-400" />
                      )}
                      <span className={cert.earned ? "text-slate-900 font-medium" : "text-slate-500"}>{cert.name}</span>
                    </div>
                    {cert.earned && <Badge className="bg-green-500">{cert.date}</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Total Watch Time", value: "12.5 hrs" },
                  { label: "Courses Completed", value: completedCourses.toString() },
                  { label: "Quizzes Passed", value: "15" },
                  { label: "Streak", value: "7 days" },
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{stat.label}</span>
                    <span className="font-semibold text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Next Milestone */}
            <Card className={`${isBeauty ? "bg-pink-50 border-pink-200" : "bg-orange-50 border-orange-200"}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star className={`w-5 h-5 ${isBeauty ? "text-pink-600" : "text-orange-600"}`} />
                  <h3 className="font-semibold text-slate-900">Next Milestone</h3>
                </div>
                <p className="text-sm text-slate-600 mb-2">Complete 2 more courses to unlock:</p>
                <p className="font-medium text-slate-900">Community Leader Badge</p>
                <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                  <div className={`h-full ${isBeauty ? "bg-pink-500" : "bg-orange-500"}`} style={{ width: "60%" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
