"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Shield, Search, Edit, Save, X } from "lucide-react"
import type { User, UserRole } from "@/lib/types"

interface RoleManagementProps {
  users: User[]
  onUserUpdated?: () => void
}

// Include ALL available roles from UserRole type
const AVAILABLE_ROLES: UserRole[] = ["admin", "host", "brand_partner", "vendor", "affiliate", "moderator", "seller", "buyer", "viewer"]

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800",
  host: "bg-blue-100 text-blue-800",
  brand_partner: "bg-purple-100 text-purple-800",
  vendor: "bg-green-100 text-green-800",
  affiliate: "bg-yellow-100 text-yellow-800",
  viewer: "bg-gray-100 text-gray-800",
  moderator: "bg-orange-100 text-orange-800",
  seller: "bg-teal-100 text-teal-800",
  buyer: "bg-indigo-100 text-indigo-800",
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full platform access and user management",
  host: "Can create and manage live streams",
  brand_partner: "Can create campaigns and manage products",
  vendor: "Can manage product inventory and sales",
  affiliate: "Can manage affiliate network and commissions",
  viewer: "Basic viewing and chat access",
  moderator: "Can moderate chat and manage viewers",
  seller: "Can manage products and view sales",
  buyer: "Can watch streams, chat, and purchase products",
}

export default function RoleManagement({ users, onUserUpdated }: RoleManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredUsers = users.filter(
    (user) =>
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setSaving(true)
    setError(null)
    try {
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      onUserUpdated?.()
      setEditingUserId(null)
      setSelectedRole(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error updating role"
      console.error("Error updating role:", err)
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Available Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {AVAILABLE_ROLES.map((role) => (
              <div key={role} className="space-y-2">
                <Badge className={ROLE_COLORS[role]}>{role}</Badge>
                <p className="text-xs text-gray-600">{ROLE_DESCRIPTIONS[role]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Roles ({filteredUsers.length})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {user.avatar_url && (
                    <img
                      src={user.avatar_url || "/placeholder.svg"}
                      alt={user.display_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.display_name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {editingUserId === user.id ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedRole || user.role}
                        onValueChange={(value) => setSelectedRole(value as UserRole)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleRoleChange(user.id, selectedRole || user.role)}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUserId(null)
                          setSelectedRole(null)
                          setError(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge className={ROLE_COLORS[user.role]}>{user.role}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUserId(user.id)
                          setSelectedRole(user.role)
                          setError(null)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
