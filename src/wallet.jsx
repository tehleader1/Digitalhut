import React from "react"

import "@rainbow-me/rainbowkit/styles.css"

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  ConnectButton
} from "@rainbow-me/rainbowkit"

import {
  WagmiProvider,
  cookieStorage,
  createStorage
} from "wagmi"

import {
  base,
  polygon
} from "wagmi/chains"

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query"

const queryClient =
  new QueryClient()

export const config =
  getDefaultConfig({

    appName:
      "DigitalHut Observatory",

    projectId:
      "e3d34ce770bdb06243b15ae92a11cc17",

    chains:[
      base,
      polygon
    ],

    ssr:false,

    storage:createStorage({
      storage:cookieStorage
    })

  })

export function WalletProvider({
  children
}){

  return(

    <WagmiProvider config={config}>

      <QueryClientProvider
        client={queryClient}
      >

        <RainbowKitProvider
          theme={darkTheme({
            accentColor:"#7c3aed",
            borderRadius:"large"
          })}
        >

          {children}

        </RainbowKitProvider>

      </QueryClientProvider>

    </WagmiProvider>

  )

}

export {
  ConnectButton
}
