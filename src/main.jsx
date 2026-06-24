import React from "react"
import ReactDOM from "react-dom/client"

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import {
  WalletProvider
} from "./wallet"

import HomePage from "./pages/HomePage"
import DefensiveGuardian from "./components/DefensiveGuardian"

const AssetLabPage = React.lazy(() => import("./pages/AssetLabPage"))
const AssetPublicPage = React.lazy(() => import("./pages/AssetPublicPage"))
const DailySituationQueuePage = React.lazy(() => import("./pages/DailySituationQueuePage"))
const LibraryPage = React.lazy(() => import("./pages/LibraryPage"))
const UpdatesPage = React.lazy(() => import("./pages/UpdatesPage"))
const UpgradePage = React.lazy(() => import("./pages/UpgradePage"))
const InsightsPage = React.lazy(() => import("./pages/InsightsPage"))
const FaqPage = React.lazy(() => import("./pages/FaqPage"))
const TrustPage = React.lazy(() => import("./pages/TrustPage"))
const BlogPage = React.lazy(() => import("./pages/BlogPage"))
const ObservatoryScanner = React.lazy(() => import("./components/ObservatoryScanner"))

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <WalletProvider>

    <BrowserRouter>

      <DefensiveGuardian>
      <React.Suspense fallback={<div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#020617",color:"#e0f2fe",fontFamily:"Arial,sans-serif"}}>Loading DigitalHut view</div>}>
      <Routes>

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/scanner"
          element={<ObservatoryScanner />}
        />

        <Route
          path="/library"
          element={<LibraryPage />}
        />

        <Route
          path="/asset-lab"
          element={<AssetLabPage />}
        />

        <Route
          path="/daily-situations"
          element={<DailySituationQueuePage />}
        />

        <Route
          path="/asset/:slug"
          element={<AssetPublicPage />}
        />

        <Route
          path="/asset_:slug"
          element={<AssetPublicPage />}
        />

        <Route
          path="/updates"
          element={<UpdatesPage />}
        />

        <Route
          path="/upgrade"
          element={<UpgradePage />}
        />

        <Route
          path="/insights"
          element={<InsightsPage />}
        />

        <Route
          path="/faq"
          element={<FaqPage />}
        />

        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPage />} />
        <Route path="/about" element={<TrustPage type="about" />} />
        <Route path="/contact" element={<TrustPage type="contact" />} />
        <Route path="/privacy" element={<TrustPage type="privacy" />} />
        <Route path="/guardian" element={<TrustPage type="guardian" />} />

      </Routes>
      </React.Suspense>
      </DefensiveGuardian>

    </BrowserRouter>

  </WalletProvider>

)
