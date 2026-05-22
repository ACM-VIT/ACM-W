import loaderAnimationPath from './assets/loader.json?url'
import { LottieAnimation } from './components/LottieAnimation'
import './App.css'

function App() {
  return (
    <main className="fullscreen-lottie">
      <LottieAnimation
        animationPath={loaderAnimationPath}
        className="fullscreen-animation"
      />
    </main>
  )
}

export default App
