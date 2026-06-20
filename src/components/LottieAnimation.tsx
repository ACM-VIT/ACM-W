import { useEffect, useRef, useState } from 'react'
import lottie, {
  type AnimationItem,
} from 'lottie-web/build/player/lottie_light'

type LottieAnimationProps = {
  animationPath: string
  className?: string
  title?: string
}

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
    if (!containerRef.current) {
      return
    }

    setHasError(false)
    setIsReady(false)

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      path: animationPath,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: false,
        hideOnTransparent: true,
        title,
      },
    })

    animationRef.current = animation
    animation.setSubframe(true)

    const handleReady = () => setIsReady(true)
    const handleError = (error: unknown) => {
      console.error('[LottieAnimation] Failed to render animation:', {
        animationPath,
        error,
      })
      setHasError(true)
    }

    animation.addEventListener('DOMLoaded', handleReady)
    animation.addEventListener('data_failed', handleError)
    animation.addEventListener('error', handleError)

    return () => {
      animation.removeEventListener('DOMLoaded', handleReady)
      animation.removeEventListener('data_failed', handleError)
      animation.removeEventListener('error', handleError)
      animation.destroy()
      animationRef.current = null
    }
  }, [animationPath, title])

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="lottie-stage"
        aria-hidden={hasError}
      />
      {!isReady && !hasError ? <div className="lottie-skeleton" /> : null}
      {hasError ? <LottieFallback /> : null}
    </div>
  )
}
