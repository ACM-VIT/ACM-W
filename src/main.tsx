import { StrictMode } from 'react'
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

createRoot(document.getElementById('root')!).render(
    <App />,
)
