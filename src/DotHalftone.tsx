import { useEffect, useRef } from 'react'

type Dot = {
  x: number
  y: number
  r: number
  color: string
  /** Normalized distance from center (0 = center, 1 = corner) — drives the wave. */
  w: number
}

function hexRgb(hex: string): [number, number, number] {
  const n = hex.replace('#', '')
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ]
}

/** Three accent dots clustered at each corner of the frame. */
function CornerDots({ color }: { color: string }) {
  const cluster = (
    pos: { top?: number; bottom?: number; left?: number; right?: number },
    rotate: number,
  ) => (
    <div className="absolute" style={{ ...pos, rotate: `${rotate}deg` }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="2" cy="2" r="2" fill={color} />
        <circle cx="10" cy="2" r="2" fill={color} />
        <circle cx="10" cy="10" r="2" fill={color} />
      </svg>
    </div>
  )
  return (
    <div className="pointer-events-none absolute z-10" style={{ inset: -24 }}>
      {cluster({ top: 0, left: 0 }, 90)}
      {cluster({ top: 0, right: 0 }, 180)}
      {cluster({ bottom: 0, right: 0 }, 270)}
      {cluster({ bottom: 0, left: 0 }, 0)}
    </div>
  )
}

export type DotHalftoneProps = {
  /** Image to recreate as an animated dot halftone. */
  src: string
  /** Optional top→bottom [hex, hex] gradient that recolors the dots. */
  gradient?: [string, string]
  /** Corner-cluster accent color. */
  accent?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Samples a source image into a grid of dots and paints them on a single
 * <canvas>: dot size tracks the source's ink coverage and the color is taken
 * from the source (or an optional gradient). Switching `src` plays a dramatic
 * radial-wave morph — old dots implode from the center, new ones explode back.
 */
export function DotHalftone({
  src,
  gradient,
  accent = '#5b21ff',
  className,
  style,
}: DotHalftoneProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const prevDotsRef = useRef<Dot[]>([])
  const rafRef = useRef(0)
  const startRef = useRef(0)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Re-run when the image or gradient values change (string key avoids
  // re-running just because a new array reference was passed).
  const gradKey = gradient ? gradient.join('|') : ''

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    let cancelled = false

    const render = (animate = true) => {
      const img = imgRef.current
      const ctx = canvas.getContext('2d')
      if (!img || !ctx || cancelled) return
      const rect = wrap.getBoundingClientRect()
      const cssW = rect.width
      const cssH = rect.height
      if (cssW < 4 || cssH < 4) return

      const ss = Math.min(3, (window.devicePixelRatio || 1) * 1.5)
      canvas.width = Math.round(cssW * ss)
      canvas.height = Math.round(cssH * ss)
      ctx.setTransform(ss, 0, 0, ss, 0, 0)

      const CELL = 5
      const cols = Math.max(1, Math.round(cssW / CELL))
      const rows = Math.max(1, Math.round(cssH / CELL))
      const cw = cssW / cols
      const ch = cssH / rows
      const maxR = Math.min(cw, ch) / 2

      // Supersample each cell and measure ink coverage (fraction of non-white
      // pixels) plus the average ink color — recreates the source faithfully.
      const SUP = 4
      const bw = cols * SUP
      const bh = rows * SUP
      const sc = document.createElement('canvas')
      sc.width = bw
      sc.height = bh
      const sctx = sc.getContext('2d')
      if (!sctx) return
      sctx.clearRect(0, 0, bw, bh)
      const s = Math.min(bw / img.width, bh / img.height)
      const dw = img.width * s
      const dh = img.height * s
      sctx.drawImage(img, (bw - dw) / 2, (bh - dh) / 2, dw, dh)
      const { data } = sctx.getImageData(0, 0, bw, bh)

      const gTop = gradient ? hexRgb(gradient[0]) : null
      const gBot = gradient ? hexRgb(gradient[1]) : null
      const dots: Dot[] = []
      for (let yy = 0; yy < rows; yy++) {
        for (let xx = 0; xx < cols; xx++) {
          let cr = 0
          let cg = 0
          let cb = 0
          let ink = 0
          for (let sy = 0; sy < SUP; sy++) {
            for (let sx = 0; sx < SUP; sx++) {
              const i = ((yy * SUP + sy) * bw + (xx * SUP + sx)) * 4
              if (data[i + 3] < 24) continue
              const r0 = data[i]
              const g0 = data[i + 1]
              const b0 = data[i + 2]
              const lum = (0.299 * r0 + 0.587 * g0 + 0.114 * b0) / 255
              if (lum > 0.92) continue // background / white
              cr += r0
              cg += g0
              cb += b0
              ink++
            }
          }
          if (ink === 0) continue
          const coverage = ink / (SUP * SUP)
          const radius = maxR * Math.min(1, 0.42 + coverage * 0.7)
          let color: string
          if (gTop && gBot) {
            const ty = yy / (rows - 1 || 1)
            color = `rgb(${Math.round(gTop[0] + (gBot[0] - gTop[0]) * ty)}, ${Math.round(
              gTop[1] + (gBot[1] - gTop[1]) * ty,
            )}, ${Math.round(gTop[2] + (gBot[2] - gTop[2]) * ty)})`
          } else {
            color = `rgb(${Math.round(cr / ink)}, ${Math.round(cg / ink)}, ${Math.round(cb / ink)})`
          }
          dots.push({
            x: (xx + 0.5) * cw + (Math.random() - 0.5) * 1.2,
            y: (yy + 0.5) * ch + (Math.random() - 0.5) * 1.2,
            r: Math.min(maxR * 1.05, radius),
            color,
            w: 0,
          })
        }
      }

      // Radial wave value: 0 at the center, 1 at the corners.
      const cx = cssW / 2
      const cy = cssH / 2
      const maxD = Math.hypot(cx, cy) || 1
      for (let k = 0; k < dots.length; k++) {
        const d = dots[k]
        d.w = Math.hypot(d.x - cx, d.y - cy) / maxD
      }

      const prev = animate && !reduceMotion ? dotsRef.current : []
      prevDotsRef.current = prev
      dotsRef.current = dots
      startRef.current = performance.now()
      cancelAnimationFrame(rafRef.current)

      if (!animate || reduceMotion) {
        ctx.clearRect(0, 0, cssW, cssH)
        for (const d of dots) {
          ctx.fillStyle = d.color
          ctx.beginPath()
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
          ctx.fill()
        }
        return
      }

      // Old dots pop then implode from the center; new dots explode back in
      // with overshoot — a radial wave.
      const EXIT_DUR = 300
      const EXIT_STAGGER = 200
      const ENTER_DELAY = 150
      const ENTER_DUR = 380
      const ENTER_STAGGER = 220
      const easeOutBack = (t: number) => {
        const c1 = 1.9
        const c3 = c1 + 1
        const p = t - 1
        return 1 + c3 * p * p * p + c1 * p * p
      }
      const prevList = prev
      const tick = (now: number) => {
        const el = now - startRef.current
        ctx.clearRect(0, 0, cssW, cssH)
        let done = true

        for (let k = 0; k < prevList.length; k++) {
          const d = prevList[k]
          const u = (el - d.w * EXIT_STAGGER) / EXIT_DUR
          if (u >= 1) continue
          done = false
          let scale: number
          if (u <= 0) scale = 1
          else if (u < 0.35) scale = 1 + (u / 0.35) * 0.35
          else scale = 1.35 * (1 - (u - 0.35) / 0.65)
          const r = d.r * scale
          if (r <= 0.06) continue
          ctx.fillStyle = d.color
          ctx.beginPath()
          ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
          ctx.fill()
        }

        const list = dotsRef.current
        for (let k = 0; k < list.length; k++) {
          const d = list[k]
          const t = Math.min(
            1,
            Math.max(0, (el - ENTER_DELAY - d.w * ENTER_STAGGER) / ENTER_DUR),
          )
          if (t < 1) done = false
          if (t <= 0) continue
          const r = d.r * Math.max(0, easeOutBack(t))
          if (r <= 0.06) continue
          ctx.fillStyle = d.color
          ctx.beginPath()
          ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
          ctx.fill()
        }

        if (!done) rafRef.current = requestAnimationFrame(tick)
        else prevDotsRef.current = []
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      render(true)
    }
    img.src = src

    const ro = new ResizeObserver(() => render(false))
    ro.observe(wrap)
    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, gradKey])

  const bgMask =
    'radial-gradient(circle at 50% 50%, #000 0%, #000 30%, rgba(0,0,0,0.4) 55%, transparent 78%)'

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -40,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(20,16,40,0.18) 1px, rgba(0,0,0,0) 1px)',
          backgroundSize: '8px 8px',
          WebkitMaskImage: bgMask,
          maskImage: bgMask,
        }}
      />
      <div ref={wrapRef} style={{ position: 'absolute', inset: -24 }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <CornerDots color={accent} />
    </div>
  )
}
