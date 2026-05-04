import { useEffect, useRef, useState } from 'react'
import './Whiteboard.css'

interface Props {
  open: boolean
  onClose: () => void
}

type Tool = 'pen' | 'eraser'

const COLORS = ['#1a2e2b', '#1f4e4a', '#a33b2a', '#c89f3c', '#2563eb'] as const
const SIZES = [2, 4, 8, 14] as const

export function Whiteboard({ open, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const drawingRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const snapshotsRef = useRef<ImageData[]>([])
  const redoStackRef = useRef<ImageData[]>([])

  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState<string>(COLORS[0])
  const [size, setSize] = useState<number>(SIZES[1])
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        onClose()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const prev = canvas.width && canvas.height
        ? ctx.getImageData(0, 0, canvas.width, canvas.height)
        : null
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (prev) {
        // Best-effort restore: place at top-left in unscaled space
        ctx.putImageData(prev, 0, 0)
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [open])

  const pushSnapshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
    snapshotsRef.current.push(snap)
    if (snapshotsRef.current.length > 30) snapshotsRef.current.shift()
    redoStackRef.current = []
    forceUpdate((n) => n + 1)
  }

  const restoreSnapshot = (snap: ImageData) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.putImageData(snap, 0, 0)
    ctx.restore()
  }

  const undo = () => {
    const snaps = snapshotsRef.current
    if (snaps.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    redoStackRef.current.push(current)
    const prev = snaps.pop()!
    restoreSnapshot(prev)
    forceUpdate((n) => n + 1)
  }

  const redo = () => {
    const stack = redoStackRef.current
    if (stack.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    snapshotsRef.current.push(current)
    const next = stack.pop()!
    restoreSnapshot(next)
    forceUpdate((n) => n + 1)
  }

  const clearAll = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    pushSnapshot()
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    pushSnapshot()
    drawingRef.current = true
    lastRef.current = pointerPos(e)
    drawSegment(lastRef.current, lastRef.current)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastRef.current) return
    const p = pointerPos(e)
    drawSegment(lastRef.current, p)
    lastRef.current = p
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId)
    }
    drawingRef.current = false
    lastRef.current = null
  }

  const drawSegment = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = tool === 'eraser' ? Math.max(size * 3, 18) : size
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
    }
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  if (!open) return null

  return (
    <div className="wb" role="dialog" aria-modal="true" aria-label="Pizarra">
      <div className="wb__toolbar" role="toolbar" aria-label="Herramientas de pizarra">
        <div className="wb__group">
          <button
            type="button"
            className="wb__tool"
            data-active={tool === 'pen'}
            onClick={() => setTool('pen')}
            aria-label="Lápiz"
            title="Lápiz"
          >
            ✎
          </button>
          <button
            type="button"
            className="wb__tool"
            data-active={tool === 'eraser'}
            onClick={() => setTool('eraser')}
            aria-label="Goma"
            title="Goma"
          >
            ⌫
          </button>
        </div>

        <div className="wb__group" aria-label="Color">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="wb__color"
              data-active={tool === 'pen' && color === c}
              style={{ background: c }}
              onClick={() => {
                setColor(c)
                setTool('pen')
              }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>

        <div className="wb__group" aria-label="Grosor">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className="wb__size"
              data-active={size === s}
              onClick={() => setSize(s)}
              aria-label={`Grosor ${s}`}
              title={`Grosor ${s}`}
            >
              <span className="wb__size-dot" style={{ width: s + 4, height: s + 4 }} />
            </button>
          ))}
        </div>

        <div className="wb__group">
          <button
            type="button"
            className="wb__btn"
            onClick={undo}
            disabled={snapshotsRef.current.length === 0}
            title="Deshacer (⌘Z)"
          >
            ↶
          </button>
          <button
            type="button"
            className="wb__btn"
            onClick={redo}
            disabled={redoStackRef.current.length === 0}
            title="Rehacer (⌘⇧Z)"
          >
            ↷
          </button>
          <button
            type="button"
            className="wb__btn wb__btn--danger"
            onClick={clearAll}
            title="Borrar todo"
          >
            Limpiar
          </button>
        </div>

        <div className="wb__spacer" />

        <button
          type="button"
          className="wb__close"
          onClick={onClose}
          aria-label="Cerrar pizarra"
          title="Cerrar (Esc)"
        >
          ✕ Cerrar
        </button>
      </div>

      <div className="wb__canvas-wrap" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="wb__canvas"
          data-tool={tool}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
    </div>
  )
}
