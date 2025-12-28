"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Heart, Share2, Trophy, Camera, Video, Calendar, Clock, Flame, Bookmark } from "lucide-react"

const COMMUNITY_STATS = {
  members: 45000,
  activeToday: 2340,
  postsToday: 456,
  eventsThisWeek: 12,
}

const POSTS = [
  {
    id: 1,
    author: "Sarah K.",
    avatar: "S",
    content: "Just finished my best stream ever! 2000+ viewers and 45 sales. Thank you all for the support!",
    likes: 234,
    comments: 45,
    time: "2 hours ago",
    type: "achievement",
  },
  {
    id: 2,
    author: "Grace W.",
    avatar: "G",
    content: "New tutorial: How I increased my conversion rate by 40% using product bundles. Link in bio!",
    likes: 189,
    comments: 32,
    time: "4 hours ago",
    type: "tip",
  },
  {
    id: 3,
    author: "Mike O.",
    avatar: "M",
    content: "Looking for collaboration partners for a car care product launch next week. DM if interested!",
    likes: 78,
    comments: 23,
    time: "6 hours ago",
    type: "collab",
  },
]

const LEADERBOARD = [
  { rank: 1, name: "Sarah Kimani", points: 12500, badge: "Diamond" },
  { rank: 2, name: "Grace Wanjiku", points: 11200, badge: "Platinum" },
  { rank: 3, name: "Faith Nyambura", points: 9800, badge: "Gold" },
  { rank: 4, name: "James Mutua", points: 8900, badge: "Gold" },
  { rank: 5, name: "Peter Kamau", points: 7600, badge: "Silver" },
]

const UPCOMING_EVENTS = [
  { title: "Host Masterclass", date: "Dec 15", time: "3:00 PM", attendees: 156 },
  { title: "Product Photography Workshop", date: "Dec 18", time: "2:00 PM", attendees: 89 },
  { title: "Year-End Community Party", date: "Dec 20", time: "7:00 PM", attendees: 234 },
]

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState<"feed" | "leaderboard" | "events" | "challenges">("feed")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Community Hub</h1>
              <p className="text-white/80 mt-1">Connect, learn, and grow with fellow creators</p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-xl font-bold">{(COMMUNITY_STATS.members / 1000).toFixed(0)}K</p>
                <p className="text-xs text-white/70">Members</p>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-xl font-bold">{COMMUNITY_STATS.activeToday.toLocaleString()}</p>
                <p className="text-xs text-white/70">Online Now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {[
              { key: "feed", label: "Feed", icon: <MessageSquare className="w-4 h-4" /> },
              { key: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
              { key: "events", label: "Events", icon: <Calendar className="w-4 h-4" /> },
              { key: "challenges", label: "Challenges", icon: <Flame className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "feed" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Create Post */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-semibold text-emerald-600">
                      U
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder="Share something with the community..."
                        className="w-full p-3 bg-slate-50 rounded-lg border-0 resize-none focus:ring-2 focus:ring-emerald-500"
                        rows={3}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Camera className="w-4 h-4 mr-1" /> Photo
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Video className="w-4 h-4 mr-1" /> Video
                          </Button>
                        </div>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              {POSTS.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-600">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{post.author}</span>
                          <Badge
                            variant="outline"
                            className={
                              post.type === "achievement"
                                ? "text-yellow-600 border-yellow-200"
                                : post.type === "tip"
                                  ? "text-blue-600 border-blue-200"
                                  : "text-purple-600 border-purple-200"
                            }
                          >
                            {post.type}
                          </Badge>
                          <span className="text-sm text-slate-500">{post.time}</span>
                        </div>
                        <p className="text-slate-700 mb-4">{post.content}</p>
                        <div className="flex items-center gap-6">
                          <button className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" /> {post.likes}
                          </button>
                          <button className="flex items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors">
                            <MessageSquare className="w-4 h-4" /> {post.comments}
                          </button>
                          <button className="flex items-center gap-1 text-slate-500 hover:text-emerald-500 transition-colors">
                            <Share2 className="w-4 h-4" /> Share
                          </button>
                          <button className="flex items-center gap-1 text-slate-500 hover:text-yellow-500 transition-colors ml-auto">
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Members */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" /> Top Members
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {LEADERBOARD.slice(0, 3).map((member) => (
                    <div key={member.rank} className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          member.rank === 1
                            ? "bg-yellow-100 text-yellow-600"
                            : member.rank === 2
                              ? "bg-gray-100 text-gray-600"
                              : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {member.rank}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.points.toLocaleString()} pts</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.badge}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {UPCOMING_EVENTS.map((event, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-slate-900 text-sm">{event.title}</p>
                      <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                        <span>
                          {event.date} at {event.time}
                        </span>
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Community Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {LEADERBOARD.map((member) => (
                  <div
                    key={member.rank}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      member.rank <= 3
                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                        : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          member.rank === 1
                            ? "bg-yellow-400 text-white"
                            : member.rank === 2
                              ? "bg-gray-300 text-white"
                              : member.rank === 3
                                ? "bg-amber-500 text-white"
                                : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {member.rank}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{member.name}</p>
                        <Badge variant="outline">{member.badge}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">{member.points.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "events" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {UPCOMING_EVENTS.map((event, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg mb-4 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {event.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{event.attendees} attending</span>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "challenges" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Stream 5 Days Streak", reward: "500 pts", progress: 60, deadline: "3 days left" },
              { title: "Reach 1000 Viewers", reward: "1000 pts", progress: 45, deadline: "1 week left" },
              { title: "Sell 50 Products", reward: "750 pts", progress: 80, deadline: "2 days left" },
            ].map((challenge, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {challenge.reward}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{challenge.title}</h3>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium">{challenge.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${challenge.progress}%` }} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">{challenge.deadline}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
