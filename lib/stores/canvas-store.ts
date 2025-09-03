import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

interface CanvasState {
  // Canvas transformation
  scale: number
  offsetX: number
  offsetY: number
  
  // Viewport
  viewportWidth: number
  viewportHeight: number
  
  // Selection
  selectedElements: Set<string>
  hoveredElement: string | null
  
  // UI State
  isSpacePressed: boolean
  isDragging: boolean
  tool: 'select' | 'pan' | 'zoom'
  
  // Performance
  shouldRender: boolean
  lastFrameTime: number
}

interface CanvasActions {
  // Transform actions
  setScale: (scale: number) => void
  setOffset: (x: number, y: number) => void
  panCanvas: (deltaX: number, deltaY: number) => void
  zoomCanvas: (factor: number, centerX?: number, centerY?: number) => void
  resetTransform: () => void
  
  // Viewport actions
  setViewport: (width: number, height: number) => void
  
  // Selection actions
  selectElement: (id: string) => void
  selectMultiple: (ids: string[]) => void
  deselectElement: (id: string) => void
  clearSelection: () => void
  setHoveredElement: (id: string | null) => void
  
  // UI actions
  setSpacePressed: (pressed: boolean) => void
  setDragging: (dragging: boolean) => void
  setTool: (tool: CanvasState['tool']) => void
  
  // Performance
  requestRender: () => void
  updateFrameTime: (time: number) => void
  
  // Utility
  screenToCanvas: (screenX: number, screenY: number) => { x: number; y: number }
  canvasToScreen: (canvasX: number, canvasY: number) => { x: number; y: number }
  isElementInViewport: (x: number, y: number, width: number, height: number) => boolean
}

type CanvasStore = CanvasState & CanvasActions

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    viewportWidth: 1920,
    viewportHeight: 1080,
    selectedElements: new Set<string>(),
    hoveredElement: null,
    isSpacePressed: false,
    isDragging: false,
    tool: 'select',
    shouldRender: true,
    lastFrameTime: 0,

    // Transform actions
    setScale: (scale) => {
      set({ scale: Math.max(0.1, Math.min(5, scale)), shouldRender: true })
    },

    setOffset: (offsetX, offsetY) => {
      set({ offsetX, offsetY, shouldRender: true })
    },

    panCanvas: (deltaX, deltaY) => {
      const { offsetX, offsetY } = get()
      set({
        offsetX: offsetX + deltaX,
        offsetY: offsetY + deltaY,
        shouldRender: true,
      })
    },

    zoomCanvas: (factor, centerX = 0, centerY = 0) => {
      const { scale, offsetX, offsetY } = get()
      const newScale = Math.max(0.1, Math.min(5, scale * factor))
      
      // Zoom towards center point
      const scaleChange = newScale / scale
      const newOffsetX = centerX - (centerX - offsetX) * scaleChange
      const newOffsetY = centerY - (centerY - offsetY) * scaleChange
      
      set({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
        shouldRender: true,
      })
    },

    resetTransform: () => {
      set({ scale: 1, offsetX: 0, offsetY: 0, shouldRender: true })
    },

    // Viewport actions
    setViewport: (viewportWidth, viewportHeight) => {
      set({ viewportWidth, viewportHeight, shouldRender: true })
    },

    // Selection actions
    selectElement: (id) => {
      const { selectedElements } = get()
      const newSelection = new Set(selectedElements)
      newSelection.add(id)
      set({ selectedElements: newSelection, shouldRender: true })
    },

    selectMultiple: (ids) => {
      set({ selectedElements: new Set(ids), shouldRender: true })
    },

    deselectElement: (id) => {
      const { selectedElements } = get()
      const newSelection = new Set(selectedElements)
      newSelection.delete(id)
      set({ selectedElements: newSelection, shouldRender: true })
    },

    clearSelection: () => {
      set({ selectedElements: new Set<string>(), shouldRender: true })
    },

    setHoveredElement: (hoveredElement) => {
      set({ hoveredElement, shouldRender: true })
    },

    // UI actions
    setSpacePressed: (isSpacePressed) => {
      set({ isSpacePressed })
    },

    setDragging: (isDragging) => {
      set({ isDragging })
    },

    setTool: (tool) => {
      set({ tool })
    },

    // Performance
    requestRender: () => {
      set({ shouldRender: true })
    },

    updateFrameTime: (lastFrameTime) => {
      set({ lastFrameTime })
    },

    // Utility functions
    screenToCanvas: (screenX, screenY) => {
      const { scale, offsetX, offsetY } = get()
      return {
        x: (screenX - offsetX) / scale,
        y: (screenY - offsetY) / scale,
      }
    },

    canvasToScreen: (canvasX, canvasY) => {
      const { scale, offsetX, offsetY } = get()
      return {
        x: canvasX * scale + offsetX,
        y: canvasY * scale + offsetY,
      }
    },

    isElementInViewport: (x, y, width, height) => {
      const { scale, offsetX, offsetY, viewportWidth, viewportHeight } = get()
      
      const screenX = x * scale + offsetX
      const screenY = y * scale + offsetY
      const screenWidth = width * scale
      const screenHeight = height * scale
      
      return (
        screenX < viewportWidth &&
        screenY < viewportHeight &&
        screenX + screenWidth > 0 &&
        screenY + screenHeight > 0
      )
    },
  }))
)

// Keyboard event handlers
export const useCanvasKeyboard = () => {
  const { setSpacePressed, setTool } = useCanvasStore()

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'Space':
        e.preventDefault()
        setSpacePressed(true)
        setTool('pan')
        break
      case 'Escape':
        useCanvasStore.getState().clearSelection()
        break
      case 'KeyV':
        if (e.ctrlKey || e.metaKey) return // Let paste work
        setTool('select')
        break
      case 'KeyH':
        setTool('pan')
        break
      case 'KeyZ':
        setTool('zoom')
        break
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'Space':
        setSpacePressed(false)
        setTool('select')
        break
    }
  }

  return { handleKeyDown, handleKeyUp }
}
