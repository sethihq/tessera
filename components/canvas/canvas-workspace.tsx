"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { NodeCanvas } from "./node-canvas"
import { CanvasSidebar } from "./canvas-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Play,
  MessageSquare,
  Grid3X3,
  Layers,
  Zap,
  Download,
  Maximize2,
  Send,
  Sparkles,
  History,
  Settings,
  Pause,
  RotateCcw,
  Save,
} from "lucide-react"

interface CanvasWorkspaceProps {
  className?: string
}

export function CanvasWorkspace({ className = "" }: CanvasWorkspaceProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true)
  const [chatExpanded, setChatExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "assistant",
      message:
        "Welcome to Tessera Canvas! I can help you create nodes, connect workflows, and generate assets. What would you like to build?",
    },
  ])

  // Handle fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  const toolbarItems = [
    { id: "select", icon: Grid3X3, label: "Select", active: true },
    { id: "create", icon: Plus, label: "Create Node" },
    { id: "connect", icon: Zap, label: "Connect" },
    { id: "layers", icon: Layers, label: "Layers" },
  ]

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    const userMessage = { id: Date.now(), type: "user", message: chatMessage }
    setChatHistory((prev) => [...prev, userMessage])
    setChatMessage("")
    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: "assistant",
        message: "I'll help you create that! Let me add the nodes to your canvas.",
      }
      setChatHistory((prev) => [...prev, aiResponse])
      setIsProcessing(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickSuggestions = [
    "Create a sprite sheet workflow",
    "Add parallax background generator",
    "Connect style reference to generators",
    "Export all assets as Unity package",
    "Generate character walking animation",
  ]

  return (
    <div className={`h-screen w-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col overflow-hidden ${className}`}>
      {/* Top Header */}
      <header className="h-12 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Tessera Canvas</h1>
          <Badge variant="outline" className="text-xs">
            AI Game Assets
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 text-sm bg-transparent">
            <Play className="w-4 h-4 mr-2" />
            Run All
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-sm bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-sm bg-transparent"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button size="sm" className="h-8 text-sm bg-[#FF6600] hover:bg-[#E55A00]">
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <CanvasSidebar
          side="left"
          width={280}
          isCollapsed={leftSidebarCollapsed}
          onCollapse={setLeftSidebarCollapsed}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Canvas */}
          <div className="flex-1 relative">
            <NodeCanvas className="absolute inset-0" />

            {/* Canvas overlay info */}
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">4 Nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">3 Connections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-neutral-600 dark:text-neutral-400">1 Processing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl px-6 py-3">
              <div className="flex items-center gap-3">
                {/* Main Tools */}
                <div className="flex items-center gap-2">
                  {toolbarItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={item.active ? "default" : "ghost"}
                        size="sm"
                        className={`h-9 w-9 p-0 rounded-xl transition-all duration-200 ${
                          item.active
                            ? "bg-[#FF6600] hover:bg-[#E55A00] text-white shadow-md"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        }`}
                        title={item.label}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    )
                  })}
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

                {/* Workflow Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                    title="Run Workflow"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                    title="Pause"
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    title="Save Workflow"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    title="Export Assets"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 z-10">
            <div
              className={`bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl transition-all duration-300 ${
                chatExpanded ? "w-96 h-80" : "w-80 h-12"
              }`}
            >
              {/* Chat Header */}
              <div className="p-3 flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-700">
                <div className="p-2 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">AI Assistant</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isProcessing ? "Thinking..." : "Ready to help"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Chat History">
                    <History className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChatExpanded(!chatExpanded)}
                    className="h-6 w-6 p-0"
                  >
                    <MessageSquare className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {chatExpanded && (
                <>
                  {/* Chat Messages */}
                  <ScrollArea className="flex-1 h-48">
                    <div className="p-3 space-y-3">
                      {chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] p-2 rounded-lg text-sm ${
                              msg.type === "user"
                                ? "bg-[#FF6600] text-white"
                                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}
                      {isProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-neutral-100 dark:bg-neutral-700 p-2 rounded-lg">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Quick Suggestions */}
                  {!isProcessing && chatHistory.length <= 1 && (
                    <div className="px-3 pb-2">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Try asking:</div>
                      <div className="flex flex-wrap gap-1">
                        {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setChatMessage(suggestion)}
                            className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-md transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat Input */}
                  <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask AI to create nodes, modify connections..."
                        className="flex-1 h-8 text-sm border-neutral-200 dark:border-neutral-700"
                        disabled={isProcessing}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim() || isProcessing}
                        size="sm"
                        className="h-8 w-8 p-0 bg-[#FF6600] hover:bg-[#E55A00]"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hidden by default */}
        {!rightSidebarCollapsed && (
          <CanvasSidebar
            side="right"
            width={320}
            isCollapsed={rightSidebarCollapsed}
            onCollapse={setRightSidebarCollapsed}
          />
        )}
      </div>

      {/* Fullscreen Mode Overlay */}
      {isFullscreen && (
        <div className="absolute inset-0 bg-neutral-900 z-50">
          <div className="h-full w-full">
            <NodeCanvas />
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                Exit Fullscreen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
