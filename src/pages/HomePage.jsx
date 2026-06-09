import PremiumLoadGate from "../components/PremiumLoadGate"
import RendererContainmentGate from "../components/RendererContainmentGate"
import GuidedTourRuntime from "../components/GuidedTourRuntime"
import FullscreenObservatoryV2 from "../components/FullscreenObservatoryV2"

export default function HomePage(){
  return <PremiumLoadGate><RendererContainmentGate><GuidedTourRuntime><FullscreenObservatoryV2 /></GuidedTourRuntime></RendererContainmentGate></PremiumLoadGate>
}
