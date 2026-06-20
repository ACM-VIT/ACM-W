import { useEffect, useRef, useState } from 'react'
import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light'

type LottieAnimationProps = {
  animationPath: string
  className?: string
  title?: string
}

type LoadAnimationConfig = Parameters<typeof lottie.loadAnimation>[0]

function LottieFallback() {
  return (
    <div className="lottie-fallback" role="presentation" aria-hidden="true">
      <span className="fallback-shadow" />
      <span className="fallback-panel panel-back" />
      <span className="fallback-panel panel-front" />
      <span className="fallback-fold fold-left" />
      <span className="fallback-fold fold-right" />
    </div>
  )
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function LottieAnimation({
  animationPath,
  className,
  title = 'Landing page animation',
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isMounted = true
    setHasError(false)
    setIsReady(false)

    const reduceMotion = prefersReducedMotion()

    const config: LoadAnimationConfig = {
      container,
      path: animationPath,
      renderer: 'svg',
      loop: !reduceMotion,
      autoplay: !reduceMotion,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: false,
        hideOnTransparent: true,
        title,
      },
    }

    const animation = lottie.loadAnimation(config)
    animationRef.current = animation
    animation.setSubframe(true)

    const handleReady = () => {
      if (!isMounted) return
      setIsReady(true)

      if (reduceMotion) {
        // Land on the final frame instead of animating, respecting the user's
        // OS-level motion preference while still showing the finished artwork.
        const lastFrame = Math.max(animation.totalFrames - 1, 0)
        animation.goToAndStop(lastFrame, true)
      }
    }

    const handleError = (error: unknown) => {
      if (!isMounted) return
      console.error('[LottieAnimation] Failed to render animation:', {
        animationPath,
        error,
      })
      setHasError(true)
    }

    animation.addEventListener('DOMLoaded', handleReady)
    animation.addEventListener('data_failed', handleError)
    animation.addEventListener('error', handleError)

    // Pause off-screen instances so a page with a few of these doesn't keep
    // burning CPU for animations nobody can see.
    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined' && !reduceMotion) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!animationRef.current) return
          if (entry.isIntersecting) {
            animationRef.current.play()
          } else {
            animationRef.current.pause()
          }
        },
        { threshold: 0.1 },
      )
      observer.observe(container)
    }

    return () => {
      isMounted = false
      observer?.disconnect()
      animation.removeEventListener('DOMLoaded', handleReady)
      animation.removeEventListener('data_failed', handleError)
      animation.removeEventListener('error', handleError)
      animation.destroy()
      animationRef.current = null
    }
  }, [animationPath, title])

  return (
    <div className={className}>
      <div ref={containerRef} className="lottie-stage" aria-hidden="true" />
      <span className="sr-only">{title}</span>
      {!isReady && !hasError ? <div className="lottie-skeleton" /> : null}
      {hasError ? <LottieFallback /> : null}
    </div>
  )
}