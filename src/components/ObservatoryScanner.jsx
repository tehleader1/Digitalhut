import PremiumLoadGate from "./PremiumLoadGate"
import RendererContainmentGate from "./RendererContainmentGate"
import FullscreenObservatoryV2 from "./FullscreenObservatoryV2"

export default function ObservatoryScanner(){
  return <PremiumLoadGate><RendererContainmentGate><FullscreenObservatoryV2 /></RendererContainmentGate></PremiumLoadGate>
}
