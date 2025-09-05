"use client"

import type React from "react"
import { useState } from "react"
import { NodeCanvas } from "./node-canvas"
import { CanvasSidebar } from "./canvas-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Play, MessageSquare, Grid3X3, Send, Sparkles, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CanvasWorkspaceProps {
  file?: any
  className?: string
}

export function CanvasWorkspace({ file, className = "" }: CanvasWorkspaceProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [chatExpanded, setChatExpanded] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "assistant",
      message: "Ready to help you build your workflow. Try: 'Create a character sprite generator'",
    },
  ])

  const toolbarItems = [
    { id: "select", icon: Grid3X3, label: "Select Tool", active: true },
    { id: "create", icon: Plus, label: "Add Node" },
  ]

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    const userMessage = { id: Date.now(), type: "user", message: chatMessage }
    setChatHistory((prev) => [...prev, userMessage])
    setChatMessage("")
    setIsProcessing(true)

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

  return (
    <div className={`h-screen w-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col overflow-hidden ${className}`}>
      <header className="h-12 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{file?.name || "Untitled"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-neutral-600 dark:text-neutral-400">
            <Save className="w-3 h-3 mr-1.5" />
            Save
          </Button>
          <Button size="sm" className="h-7 text-xs px-3 bg-[#FF6600] hover:bg-[#E55A00] text-white">
            <Play className="w-3 h-3 mr-1.5" />
            Queue
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        <CanvasSidebar
          side="left"
          width={260}
          isCollapsed={leftSidebarCollapsed}
          onCollapse={setLeftSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            <NodeCanvas className="absolute inset-0" />

            <div className="absolute top-3 left-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-neutral-600 dark:text-neutral-400 font-mono">Ready</span>
              </div>
            </div>

            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm px-2 py-1">
                <div className="flex items-center gap-1">
                  {toolbarItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={item.active ? "default" : "ghost"}
                        size="sm"
                        className={`h-6 w-6 p-0 rounded ${
                          item.active
                            ? "bg-[#FF6600] hover:bg-[#E55A00] text-white"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                        title={item.label}
                      >
                        <Icon className="w-3 h-3" />
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <div
              className={`bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all duration-200 ${
                chatExpanded ? "w-72 h-48" : "w-48 h-8"
              }`}
            >
              <div className="p-2 flex items-center gap-2">
                <div className="p-1 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Assistant</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatExpanded(!chatExpanded)}
                  className="h-4 w-4 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <MessageSquare className="w-2.5 h-2.5" />
                </Button>
              </div>

              {chatExpanded && (
                <>
                  <ScrollArea className="h-32 px-2">
                    <div className="space-y-1.5">
                      {chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[90%] p-1.5 rounded text-xs ${
                              msg.type === "user"
                                ? "bg-[#FF6600] text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-2 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe your workflow..."
                        className="flex-1 h-6 text-xs border-neutral-200 dark:border-neutral-800"
                        disabled={isProcessing}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim() || isProcessing}
                        size="sm"
                        className="h-6 w-6 p-0 bg-[#FF6600] hover:bg-[#E55A00]"
                      >
                        <Send className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
