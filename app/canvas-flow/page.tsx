"use client"

import React from "react"
import { NodeCanvas } from "@/components/canvas/node-canvas"

export default function CanvasFlowPage() {
  return (
    <div className="h-screen w-screen">
      <NodeCanvas className="h-full w-full" />
    </div>
  )
}
