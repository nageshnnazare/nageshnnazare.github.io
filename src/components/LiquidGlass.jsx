import { useEffect } from 'react'

/*
 * Apple-style "liquid glass" — real SVG-displacement refraction.
 *
 * Ported from htmler.sh. Instead of a plain frosted backdrop, each glass
 * surface bends the page behind it at its rim (with a faint prism fringe) via
 * a per-element SVG displacement-map backdrop-filter, while the interior stays
 * legible. Refraction is Chromium-only; Safari/Firefox keep the CSS
 * frosted-blur fallback defined in index.css. The CSS "dressing" (tint, rim,
 * shadow) is untouched — it is what still reads as glass everywhere.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

// Exact dark-mode material from htmler.sh: a strong magnifying bulge, a visible
// prism fringe, and a punchy saturate so the tinted page reads clearly through
// the glass.
const PRESET = { scale: -84, chroma: 5, border: 0.11, mapBlur: 8, blur: 4, saturate: 1.7 }

// The navbar is a wide, short bar, so the refraction only lives in a thin band
// at the rim. Widen that band and push the bulge harder so the "liquid glass"
// bending is clearly visible along the borders (matches the small htmler pills,
// where the edge band naturally dominates).
const NAV_PRESET = { scale: -150, chroma: 8, border: 0.34, mapBlur: 12, blur: 4, saturate: 1.7 }

// Real SVG-displacement refraction (the exact script effect) is applied to the
// navbar pill and the social buttons. Everything else uses flat surfaces. The
// navbar is "gated": refraction only runs while it wears .glass-nav--scrolled,
// so it stays transparent and merged into the page at the top.
const GLASS_SELECTOR = '.glass-button, .glass-nav'

function detectSupport() {
  try {
    const ua = navigator.userAgent
    const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)
    const isFirefox = /Firefox/.test(ua)
    if (isSafari || isFirefox) return false
    if (!(window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#lg)'))) return false
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const c = document.createElement('canvas')
    c.width = c.height = 4
    c.getContext('2d').getImageData(0, 0, 1, 1)
    return true
  } catch {
    return false
  }
}

// Displacement map: a red left→right ramp encodes X displacement, a blue
// top→bottom ramp encodes Y. A blurred, inset 50%-gray rounded rect neutralizes
// the interior so refraction is confined to an edge band whose curvature is set
// by the blur radius.
function makeMap(w, h, radius, border, mapBlur) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const gx = ctx.createLinearGradient(0, 0, w, 0)
  gx.addColorStop(0, 'rgb(0,0,0)')
  gx.addColorStop(1, 'rgb(255,0,0)')
  ctx.fillStyle = gx
  ctx.fillRect(0, 0, w, h)
  const gy = ctx.createLinearGradient(0, 0, 0, h)
  gy.addColorStop(0, 'rgb(0,0,0)')
  gy.addColorStop(1, 'rgb(0,0,255)')
  ctx.globalCompositeOperation = 'difference'
  ctx.fillStyle = gy
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
  const inset = border * Math.min(w, h)
  ctx.filter = 'blur(' + mapBlur + 'px)'
  ctx.fillStyle = 'rgba(128,128,128,0.93)'
  const iw = Math.max(w - inset * 2, 0)
  const ih = Math.max(h - inset * 2, 0)
  if (ctx.roundRect) {
    ctx.beginPath()
    ctx.roundRect(inset, inset, iw, ih, Math.max(radius - inset, 2))
    ctx.fill()
  } else {
    ctx.fillRect(inset, inset, iw, ih)
  }
  ctx.filter = 'none'
  return canvas.toDataURL()
}

// Three displacement passes at staggered scales (one per RGB channel),
// recombined with screen blends → the faint chromatic-aberration fringe at the
// rim.
function buildFilter(defs, id, scales) {
  const filter = document.createElementNS(SVG_NS, 'filter')
  filter.setAttribute('id', id)
  filter.setAttribute('x', '0')
  filter.setAttribute('y', '0')
  filter.setAttribute('width', '100%')
  filter.setAttribute('height', '100%')
  // Filters default to linearRGB, which remaps the map's neutral gray and
  // injects a constant phantom displacement — sRGB is load-bearing.
  filter.setAttribute('color-interpolation-filters', 'sRGB')
  const feImage = document.createElementNS(SVG_NS, 'feImage')
  feImage.setAttribute('x', '0')
  feImage.setAttribute('y', '0')
  feImage.setAttribute('result', 'map')
  feImage.setAttribute('preserveAspectRatio', 'none')
  filter.appendChild(feImage)
  const keep = [
    '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0',
    '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0',
    '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0',
  ]
  const channels = []
  for (let i = 0; i < 3; i++) {
    const disp = document.createElementNS(SVG_NS, 'feDisplacementMap')
    disp.setAttribute('in', 'SourceGraphic')
    disp.setAttribute('in2', 'map')
    disp.setAttribute('scale', scales[i])
    disp.setAttribute('xChannelSelector', 'R')
    disp.setAttribute('yChannelSelector', 'B')
    disp.setAttribute('result', 'd' + i)
    filter.appendChild(disp)
    const cm = document.createElementNS(SVG_NS, 'feColorMatrix')
    cm.setAttribute('in', 'd' + i)
    cm.setAttribute('type', 'matrix')
    cm.setAttribute('values', keep[i])
    cm.setAttribute('result', 'c' + i)
    filter.appendChild(cm)
    channels.push('c' + i)
  }
  const b1 = document.createElementNS(SVG_NS, 'feBlend')
  b1.setAttribute('in', channels[0])
  b1.setAttribute('in2', channels[1])
  b1.setAttribute('mode', 'screen')
  b1.setAttribute('result', 'c01')
  filter.appendChild(b1)
  const b2 = document.createElementNS(SVG_NS, 'feBlend')
  b2.setAttribute('in', 'c01')
  b2.setAttribute('in2', channels[2])
  b2.setAttribute('mode', 'screen')
  filter.appendChild(b2)
  defs.appendChild(filter)
  return { filter, feImage }
}

function resolveRadius(el, w, h) {
  const raw = getComputedStyle(el).borderTopLeftRadius || '0px'
  const v = parseFloat(raw) || 0
  const px = raw.trim().endsWith('%') ? (v / 100) * Math.min(w, h) : v
  return Math.min(px, Math.min(w, h) / 2)
}

export default function LiquidGlass() {
  useEffect(() => {
    if (!detectSupport()) return

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.position = 'absolute'
    svg.style.overflow = 'hidden'
    const defs = document.createElementNS(SVG_NS, 'defs')
    svg.appendChild(defs)
    document.body.appendChild(svg)

    let uid = 0
    const observers = []
    const attached = []

    const attach = (el) => {
      if (el.__lg) return
      // Buttons are always glass; the navbar is gated on its scrolled state so
      // it can be fully transparent at the top of the page.
      const gated = el.classList.contains('glass-nav')
      const id = 'lg-' + ++uid
      const o = gated ? NAV_PRESET : PRESET
      const scales = [o.scale, o.scale + o.chroma, o.scale + 2 * o.chroma]
      const parts = buildFilter(defs, id, scales)
      const bf = 'url(#' + id + ') blur(' + o.blur + 'px) saturate(' + o.saturate + ')'

      const refresh = () => {
        const w = el.offsetWidth
        const h = el.offsetHeight
        if (!w || !h) return
        try {
          const map = makeMap(w, h, resolveRadius(el, w, h), o.border, o.mapBlur)
          parts.feImage.setAttribute('href', map)
          parts.feImage.setAttribute('width', w)
          parts.feImage.setAttribute('height', h)
        } catch {
          /* leave the CSS fallback in place */
        }
      }

      let active = false
      const setActive = (next) => {
        if (next === active) return
        active = next
        if (active) {
          refresh()
          el.style.backdropFilter = bf
          el.style.webkitBackdropFilter = bf
        } else {
          el.style.backdropFilter = ''
          el.style.webkitBackdropFilter = ''
        }
      }

      refresh()
      if (gated) {
        setActive(el.classList.contains('glass-nav--scrolled'))
        const cmo = new MutationObserver(() => setActive(el.classList.contains('glass-nav--scrolled')))
        cmo.observe(el, { attributes: true, attributeFilter: ['class'] })
        observers.push(cmo)
      } else {
        setActive(true)
      }

      let timer = null
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
          clearTimeout(timer)
          timer = setTimeout(refresh, 120)
        })
        ro.observe(el)
        observers.push(ro)
      }
      el.__lg = { refresh }
      attached.push(el)
    }

    const attachAll = (root) => {
      ;(root || document).querySelectorAll(GLASS_SELECTOR).forEach(attach)
    }

    // Elements mount and animate in via framer-motion, so watch the tree and
    // attach to any glass surfaces that appear.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          if (node.matches && node.matches(GLASS_SELECTOR)) attach(node)
          if (node.querySelectorAll) attachAll(node)
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    // Initial passes (a couple of retries cover late React/motion mounts).
    attachAll(document)
    const t1 = setTimeout(() => attachAll(document), 300)
    const t2 = setTimeout(() => attachAll(document), 1200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      mo.disconnect()
      observers.forEach((ro) => ro.disconnect())
      // Release every element we bound to: drop the guard and clear the inline
      // backdrop that points at this instance's (about-to-be-removed) SVG
      // filter. Without this, React StrictMode's dev double-mount leaves the
      // guard set, so the second run skips re-attaching and the surfaces stay
      // bound to a torn-down filter (no refraction).
      attached.forEach((el) => {
        delete el.__lg
        el.style.backdropFilter = ''
        el.style.webkitBackdropFilter = ''
      })
      svg.remove()
    }
  }, [])

  return null
}
