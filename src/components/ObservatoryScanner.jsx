import PremiumLoadGate from "./PremiumLoadGate"
import RendererContainmentGate from "./RendererContainmentGate"
import GuidedTourRuntime from "./GuidedTourRuntime"
import FullscreenObservatoryV2 from "./FullscreenObservatoryV2"

export default function ObservatoryScanner(){
  return <PremiumLoadGate><RendererContainmentGate><GuidedTourRuntime><FullscreenObservatoryV2 /></GuidedTourRuntime></RendererContainmentGate></PremiumLoadGate>
}
