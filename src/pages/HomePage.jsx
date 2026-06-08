import PremiumLoadGate from "../components/PremiumLoadGate"
import RendererContainmentGate from "../components/RendererContainmentGate"
import FullscreenObservatoryV2 from "../components/FullscreenObservatoryV2"

export default function HomePage(){
  return <PremiumLoadGate><RendererContainmentGate><FullscreenObservatoryV2 /></RendererContainmentGate></PremiumLoadGate>
}
