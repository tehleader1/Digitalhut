import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DigitalHutAccount() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [wallet, setWallet] = useState("");

  async function signUp() {
    if (!supabase) {
      setStatus("Supabase not configured. Please add environment variables.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    setStatus(error ? error.message : "Check your email to sign in.");
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("MetaMask wallet not found.");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
    setStatus("Wallet connected.");
  }

  return (
    <section className="accountPanel" id="account">
      <h2>DigitalHut Account Vault</h2>
      <p>
        Save purchases, GLB downloads, custom order tickets, wallet access, project history,
        and release notifications.
      </p>

      <div className="accountGrid">
        <div className="accountCard">
          <h3>Sign Up / Login</h3>
          <input
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button onClick={signUp}>Send Login Link</button>
        </div>

        <div className="accountCard">
          <h3>Wallet Connect</h3>
          <p>{wallet || "No wallet connected yet."}</p>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>

        <div className="accountCard">
          <h3>Purchase Vault</h3>
          <p>Purchased GLB files, mini 3D previews, and Shopify order history will appear here.</p>
        </div>

        <div className="accountCard">
          <h3>Agreement Before Purchase</h3>
          <p>
            Customers agree not to use DigitalHut material for illegal use, malicious use,
            spam, fraud, false representation, or harmful activity.
          </p>
        </div>
      </div>

      <p className="accountStatus">{status}</p>
    </section>
  );
}
