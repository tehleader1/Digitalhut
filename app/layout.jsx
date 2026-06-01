import HomepageNewsRail from "./components/HomepageNewsRail"

export const metadata = {
  title: "DigitalHut Observatory",
  description: "Adaptive 3D observatory, market intelligence, wallet feed, and public model newsdesk."
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body style={{ margin: 0, background: "#020617", color: "white", fontFamily: "Arial, sans-serif" }}>
        <HomepageNewsRail />
        {children}
      </body>
    </html>
  )
}
