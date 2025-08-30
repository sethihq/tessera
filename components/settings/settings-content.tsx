"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  CreditCardIcon,
  PaletteIcon,
  DatabaseIcon,
  KeyIcon,
  TrashIcon,
} from "@/components/ui/icons"
import { useAuth } from "@/components/auth-guard"

export function SettingsContent() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  })
  const [theme, setTheme] = useState("system")
  const [apiUsage] = useState({
    current: 1250,
    limit: 5000,
    resetDate: "2024-02-01",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your account preferences and application settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellIcon className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldIcon className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm border-neutral-200/50 dark:border-neutral-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  <UserIcon className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and profile settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      className="bg-white/50 dark:bg-neutral-900/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      className="bg-white/50 dark:bg-neutral-900/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-neutral-100/50 dark:bg-neutral-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself" className="bg-white/50 dark:bg-neutral-900/50" />
                </div>
                <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm border-neutral-200/50 dark:border-neutral-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  <BellIcon className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified about updates and activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Marketing Communications</Label>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketing: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm border-neutral-200/50 dark:border-neutral-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  <ShieldIcon className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Change Password</Label>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Update your account password</p>
                    </div>
                    <Button variant="outline" className="border-neutral-300 dark:border-neutral-600 bg-transparent">
                      Change Password
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-800">
                      Not Enabled
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <KeyIcon className="w-4 h-4" />
                        API Keys
                      </Label>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Manage your API keys for integrations
                      </p>
                    </div>
                    <Button variant="outline" className="border-neutral-300 dark:border-neutral-600 bg-transparent">
                      Manage Keys
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm border-neutral-200/50 dark:border-neutral-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  <CreditCardIcon className="w-5 h-5" />
                  Billing & Usage
                </CardTitle>
                <CardDescription>Monitor your usage and manage billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Current Plan</Label>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Free Plan - 5,000 generations per month
                      </p>
                    </div>
                    <Button variant="outline" className="border-neutral-300 dark:border-neutral-600 bg-transparent">
                      Upgrade Plan
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <DatabaseIcon className="w-4 h-4" />
                        API Usage
                      </Label>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {apiUsage.current} / {apiUsage.limit}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-neutral-900 dark:bg-neutral-100 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(apiUsage.current / apiUsage.limit) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Resets on {apiUsage.resetDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm border-neutral-200/50 dark:border-neutral-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                  <PaletteIcon className="w-5 h-5" />
                  Application Preferences
                </CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="bg-white/50 dark:bg-neutral-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Default Generation Quality</Label>
                    <Select defaultValue="high">
                      <SelectTrigger className="bg-white/50 dark:bg-neutral-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="ultra">Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Auto-save Projects</Label>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Automatically save project changes
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50/70 dark:bg-red-950/20 backdrop-blur-sm border-red-200/50 dark:border-red-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                  <TrashIcon className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-red-700 dark:text-red-300">
                  Irreversible actions that will permanently affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
