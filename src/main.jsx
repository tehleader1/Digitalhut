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
import LibraryPage from "./pages/LibraryPage"
import UpdatesPage from "./pages/UpdatesPage"
import UpgradePage from "./pages/UpgradePage"
import InsightsPage from "./pages/InsightsPage"

import ObservatoryScanner
from "./components/ObservatoryScanner"

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <WalletProvider>

    <BrowserRouter>

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

      </Routes>

    </BrowserRouter>

  </WalletProvider>

)
