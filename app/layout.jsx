export const metadata = {
  title: "DigitalHut Observatory",
  description: "AI-native observatory runtime"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

        <script
          id="sa-dynamic-optimization-loader"
          data-uuid="fb51dd0f-e06f-457d-b7e5-952e02bdda6a"
          src="https://dashboard.searchatlas.com/scripts/dynamic_optimization.js"
          async
        />

      </head>

      <body>
        {children}
      </body>
    </html>
  )
}
