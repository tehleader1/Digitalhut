"use client"

import { usePathname } from "next/navigation"
import FeaturedDailyPost from "./FeaturedDailyPost"

export default function HomepageNewsRail() {
  const pathname = usePathname()
  if (pathname !== "/") return null

  return <FeaturedDailyPost intent="public-observatory" />
}
