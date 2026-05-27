export const metadata = {
  title: "DigitalHut Observatory",
  description: "AI-native observatory runtime"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              var script = document.createElement("script");
              script.setAttribute("nowprocket", "");
              script.setAttribute("nitro-exclude", "");
              script.src = "https://dashboard.searchatlas.com/scripts/dynamic_optimization.js";
              script.dataset.uuid = "fb51dd0f-e06f-457d-b7e5-952e02bdda6a";
              script.id = "sa-dynamic-optimization-loader";
              document.head.appendChild(script);
            `
          }}
        />

      </head>

      <body>
        {children}
      </body>
    </html>
  )
}
