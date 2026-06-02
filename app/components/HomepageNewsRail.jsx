"use client"

import { usePathname } from "next/navigation"
import FeaturedDailyPost from "./FeaturedDailyPost"
import LiveObservatoryPulse from "./LiveObservatoryPulse"

export default function HomepageNewsRail() {
  const pathname = usePathname()
  if (pathname !== "/") return null

  return (
    <>
      <FeaturedDailyPost intent="public-observatory" />
      <LiveObservatoryPulse intent="anonymous-new-user" tier="free" />
    </>
  )
}
