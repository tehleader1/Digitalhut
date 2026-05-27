export const metadata = {
  title: "DigitalHut Observatory",
  description: "AI-native observatory infrastructure"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0}}>
        {children}
      </body>
    </html>
  )
}
