import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

const FAB_OFFSET = 24
const DEFAULT_WIDTH = 416
const DEFAULT_HEIGHT = 560
const MIN_W = 280
const MIN_H = 320
const MARGIN = 8

type StoredLayout = { x?: number; y?: number; width?: number; height?: number }

export type ResizeDirection = "right" | "bottom" | "cornerTopLeft" | "left" | "top"

const readStoredLayout = (key: string): StoredLayout | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as StoredLayout
  } catch {
    return null
  }
}

export function useFloatingChatLayout(layoutStorageKey: string) {
  const [open, setOpen] = useState(false)
  const hasInitializedLayoutRef = useRef(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
  const posRef = useRef(pos)
  const sizeRef = useRef(size)
  posRef.current = pos
  sizeRef.current = size

  const clampLayout = useCallback((x: number, y: number, w: number, h: number) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const cw = Math.min(Math.max(MIN_W, w), vw - 2 * MARGIN)
    const ch = Math.min(Math.max(MIN_H, h), vh - 2 * MARGIN)
    return {
      x: Math.min(Math.max(MARGIN, x), Math.max(MARGIN, vw - cw - MARGIN)),
      y: Math.min(Math.max(60 + 8, y), Math.max(MARGIN, vh - ch - MARGIN)),
      width: cw,
      height: ch,
    }
  }, [])

  const persistLayout = useCallback(
    (layout: { x: number; y: number; width: number; height: number }) => {
      const next = clampLayout(layout.x, layout.y, layout.width, layout.height)
      localStorage.setItem(
        layoutStorageKey,
        JSON.stringify({ x: next.x, y: next.y, width: next.width, height: next.height }),
      )
      return next
    },
    [clampLayout, layoutStorageKey],
  )

  const computeLayout = useCallback(() => {
    const stored = readStoredLayout(layoutStorageKey)
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = stored?.width ?? DEFAULT_WIDTH
    const h = stored?.height ?? DEFAULT_HEIGHT
    if (stored && typeof stored.x === "number" && typeof stored.y === "number") {
      return clampLayout(stored.x, stored.y, w, h)
    }
    return clampLayout(vw - w - FAB_OFFSET, vh - h - FAB_OFFSET, w, h)
  }, [clampLayout, layoutStorageKey])

  const openAssistant = useCallback(() => {
    const next = computeLayout()
    hasInitializedLayoutRef.current = true
    setPos({ x: next.x, y: next.y })
    setSize({ width: next.width, height: next.height })
    setOpen(true)
  }, [computeLayout])

  const closeAssistant = useCallback(() => {
    setOpen(false)
    hasInitializedLayoutRef.current = false
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    if (hasInitializedLayoutRef.current) return
    const next = computeLayout()
    hasInitializedLayoutRef.current = true
    setPos({ x: next.x, y: next.y })
    setSize({ width: next.width, height: next.height })
  }, [open, computeLayout])

  useEffect(() => {
    if (!open) return
    const onWinResize = () => {
      const p = posRef.current
      const s = sizeRef.current
      const next = clampLayout(p.x, p.y, s.width, s.height)
      setPos({ x: next.x, y: next.y })
      setSize({ width: next.width, height: next.height })
    }
    window.addEventListener("resize", onWinResize)
    return () => window.removeEventListener("resize", onWinResize)
  }, [open, clampLayout])

  const onHeaderPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if ((event.target as HTMLElement).closest("button")) return
      event.preventDefault()
      const dragHandle = event.currentTarget as HTMLElement
      const pointerId = event.pointerId
      dragHandle.setPointerCapture(pointerId)
      const startX = event.clientX
      const startY = event.clientY
      const origX = pos.x
      const origY = pos.y
      const width = size.width
      const height = size.height

      const onMove = (moveEvent: PointerEvent) => {
        const nextX = origX + (moveEvent.clientX - startX)
        const nextY = origY + (moveEvent.clientY - startY)
        const next = clampLayout(nextX, nextY, width, height)
        setPos({ x: next.x, y: next.y })
      }

      const onUp = (upEvent: PointerEvent) => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
        if (dragHandle.isConnected && dragHandle.hasPointerCapture(pointerId)) {
          dragHandle.releasePointerCapture(pointerId)
        }
        const nextX = origX + (upEvent.clientX - startX)
        const nextY = origY + (upEvent.clientY - startY)
        const next = persistLayout({ x: nextX, y: nextY, width, height })
        setPos({ x: next.x, y: next.y })
        setSize({ width: next.width, height: next.height })
      }

      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
    },
    [clampLayout, persistLayout, pos.x, pos.y, size.width, size.height],
  )

  const onResizePointerDown = useCallback(
    (event: React.PointerEvent, direction: ResizeDirection) => {
      event.preventDefault()
      event.stopPropagation()
      const resizeHandle = event.currentTarget as HTMLElement
      const pointerId = event.pointerId
      resizeHandle.setPointerCapture(pointerId)
      const startX = event.clientX
      const startY = event.clientY
      const origW = size.width
      const origH = size.height
      const origX = pos.x
      const origY = pos.y

      const onMove = (moveEvent: PointerEvent) => {
        const dw = moveEvent.clientX - startX
        const dh = moveEvent.clientY - startY
        const nextWidth =
          direction === "left" || direction === "cornerTopLeft"
            ? origW - dw
            : direction === "right"
              ? origW + dw
              : origW
        const nextHeight =
          direction === "top" || direction === "cornerTopLeft"
            ? origH - dh
            : direction === "bottom"
              ? origH + dh
              : origH
        const nextX =
          direction === "left" || direction === "cornerTopLeft"
            ? origX + dw
            : origX
        const nextY =
          direction === "top" || direction === "cornerTopLeft"
            ? origY + dh
            : origY
        const next = clampLayout(nextX, nextY, nextWidth, nextHeight)
        setPos({ x: next.x, y: next.y })
        setSize({ width: next.width, height: next.height })
      }

      const onUp = (upEvent: PointerEvent) => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
        if (resizeHandle.isConnected && resizeHandle.hasPointerCapture(pointerId)) {
          resizeHandle.releasePointerCapture(pointerId)
        }
        const dw = upEvent.clientX - startX
        const dh = upEvent.clientY - startY
        const nextWidth =
          direction === "left" || direction === "cornerTopLeft"
            ? origW - dw
            : direction === "right"
              ? origW + dw
              : origW
        const nextHeight =
          direction === "top" || direction === "cornerTopLeft"
            ? origH - dh
            : direction === "bottom"
              ? origH + dh
              : origH
        const nextX =
          direction === "left" || direction === "cornerTopLeft"
            ? origX + dw
            : origX
        const nextY =
          direction === "top" || direction === "cornerTopLeft"
            ? origY + dh
            : origY
        const next = persistLayout({
          x: nextX,
          y: nextY,
          width: nextWidth,
          height: nextHeight,
        })
        setPos({ x: next.x, y: next.y })
        setSize({ width: next.width, height: next.height })
      }

      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
    },
    [clampLayout, persistLayout, pos.x, pos.y, size.width, size.height],
  )

  return {
    open,
    pos,
    size,
    openAssistant,
    closeAssistant,
    onHeaderPointerDown,
    onResizePointerDown,
  }
}
