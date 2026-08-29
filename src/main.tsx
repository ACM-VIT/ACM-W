import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ── Global noise texture overlay ──
(function addNoise() {
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(size, size)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.floor(Math.random() * 255)
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
    data[i + 3] = 255
  }

  ctx.putImageData(imageData, 0, 0)

  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.12;
    background-image: url(${canvas.toDataURL()});
    background-repeat: repeat;
    background-size: 256px 256px;
    mix-blend-mode: multiply;
  `
  document.body.appendChild(overlay)
})()

// ── Render once the (preloaded) brand fonts are in ──
// Every heading is set in Kovanov. If React renders before it has arrived,
// the page is laid out with Georgia's metrics and then every heading grows
// or shrinks a beat later — a visible shift in the sections below the fold.
// The fonts are preloaded from index.html so this normally resolves before
// the JS bundle has even finished evaluating; the cap keeps a slow or failed
// font fetch from ever holding the page hostage.
const FONT_WAIT_CAP_MS = 1500
const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load('700 1rem "Kovanov"'),
    document.fonts.load('400 1rem "Kovanov"'),
    document.fonts.load('400 1rem "Quicksand"'),
  ]).catch(() => undefined),
  new Promise((resolve) => setTimeout(resolve, FONT_WAIT_CAP_MS)),
])

fontsReady.then(() => {
  createRoot(document.getElementById('root')!).render(<App />)
})
