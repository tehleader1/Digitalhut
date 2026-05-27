export const metadata = {
  title: "DigitalHut",
  description: "AI Observatory"
}

export default function RootLayout({
  children,
}:{
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
