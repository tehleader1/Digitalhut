import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({

  build:{

    cssMinify:false

  },

  plugins:[

    react(),

    VitePWA({

      registerType:"autoUpdate",

      manifest:{

        name:
          "DigitalHut Observatory",

        short_name:
          "DigitalHut",

        description:
          "Planetary Observatory Intelligence Platform",

        theme_color:"#050816",

        background_color:"#050816",

        display:"standalone",

        orientation:"portrait",

        start_url:"/",

        icons:[

          {
            src:"/icon-192.png",
            sizes:"192x192",
            type:"image/png"
          },

          {
            src:"/icon-512.png",
            sizes:"512x512",
            type:"image/png"
          }

        ]

      }

    })

  ]

})
