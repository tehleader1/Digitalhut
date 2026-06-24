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
  createStorage,
  http
} from "wagmi"

import {
  base,
  mainnet,
  polygon
} from "wagmi/chains"

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query"

const queryClient =
  new QueryClient()

const walletConnectProjectId =
  import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID ||
  import.meta.env?.VITE_REOWN_PROJECT_ID ||
  "e3d34ce770bdb06243b15ae92a11cc17"

const alchemyKey =
  import.meta.env?.VITE_ALCHEMY_API_KEY ||
  import.meta.env?.VITE_ALCHEMY_KEY ||
  ""

const alchemyBaseUrl =
  import.meta.env?.VITE_ALCHEMY_BASE_RPC_URL ||
  (alchemyKey ? `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}` : undefined)

const alchemyPolygonUrl =
  import.meta.env?.VITE_ALCHEMY_POLYGON_RPC_URL ||
  (alchemyKey ? `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}` : undefined)

const alchemyEthereumUrl =
  import.meta.env?.VITE_ALCHEMY_ETHEREUM_RPC_URL ||
  (alchemyKey ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}` : undefined)

export const config =
  getDefaultConfig({

    appName:
      "DigitalHut Observatory",

    projectId:
      walletConnectProjectId,

    chains:[
      base,
      polygon,
      mainnet
    ],

    transports:{
      [base.id]: http(alchemyBaseUrl),
      [polygon.id]: http(alchemyPolygonUrl),
      [mainnet.id]: http(alchemyEthereumUrl)
    },

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
