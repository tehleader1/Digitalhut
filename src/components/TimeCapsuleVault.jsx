import { useEffect, useRef, useState } from "react";

const SUBJECTS = [
  "Agriculture",
  "Construction",
  "Gaming",
  "Decentralized",
  "History",
  "International Party Previews"
];

export default function TimeCapsuleVault() {
  const arenaRef = useRef(null);

  const [wallet, setWallet] = useState("");
  const [phase, setPhase] = useState("gate");
  const [gender, setGender] = useState("");
  const [mode, setMode] = useState("normal");
  const [subject, setSubject] = useState("Construction");
  const [fileName, setFileName] = useState("");

  const [fire, setFire] = useState(0);
  const [wind, setWind] = useState(100);

  const [playerX, setPlayerX] = useState(45);
  const [objects, setObjects] = useState([]);
  const [time, setTime] = useState(10);
  const [hits, setHits] = useState(0);
  const [damage, setDamage] = useState(0);

  const [rarity, setRarity] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [credits, setCredits] = useState(false);

  useEffect(() => {
    window.ethereum?.request?.({ method: "eth_accounts" }).then((accounts) => {
      if (accounts?.[0]) {
        setWallet(accounts[0]);
        setPhase("setup");
      }
    });
  }, []);

  function tone(kind = "click") {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = kind === "win" ? "triangle" : kind === "fail" ? "sawtooth" : "square";
      o.frequency.value = kind === "win" ? 880 : kind === "fail" ? 120 : kind === "boot" ? 220 : 440;
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.start();
      o.stop(ctx.currentTime + 0.36);
    } catch {}
  }

  async function connectWallet() {
    if (!window.ethereum) {
      window.location.href = "https://metamask.app.link/dapp/digitalhut.app";
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts?.[0]) {
      setWallet(accounts[0]);
      setPhase("setup");
      tone("boot");
    }
  }

  function resetGame() {
    setPhase(wallet ? "setup" : "gate");
    setFileName("");
    setFire(0);
    setWind(100);
    setPlayerX(45);
    setObjects([]);
    setTime(10);
    setHits(0);
    setDamage(0);
    setRarity("");
    setSearching(false);
    setResults([]);
    setCredits(false);
  }

  function uploadFile(e) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function clickFire() {
    if (!wallet || !fileName || !gender) return;

    tone("click");

    const gain = mode === "hard" ? 7 : mode === "intermediate" ? 10 : 14;
    setFire((old) => {
      const next = Math.min(100, old + gain);
      if (next >= 100) {
        setTimeout(() => {
          tone("boot");
          setPhase("boot");
        }, 250);
      }
      return next;
    });
  }

  useEffect(() => {
    if (phase !== "setup") return;

    const windLoop = setInterval(() => {
      setFire((f) => Math.max(0, f - (mode === "hard" ? 5 : mode === "intermediate" ? 3 : 2)));
      setWind((w) => Math.max(0, w - 1));
    }, 450);

    return () => clearInterval(windLoop);
  }, [phase, mode]);

  useEffect(() => {
    if (phase !== "boot") return;

    let count = 0;
    const bootLoop = setInterval(() => {
      count += 1;
      tone(count % 2 ? "boot" : "click");
      if (count >= 8) {
        clearInterval(bootLoop);
        setPhase("dodge");
      }
    }, 180);

    return () => clearInterval(bootLoop);
  }, [phase]);

  useEffect(() => {
    if (phase !== "dodge") return;

    const speed = mode === "hard" ? 19 : mode === "intermediate" ? 15 : 11;
    const rate = mode === "hard" ? 260 : mode === "intermediate" ? 360 : 470;

    const spawn = setInterval(() => {
      setObjects((old) => [
        ...old
          .map((o) => ({ ...o, y: o.y + speed }))
          .filter((o) => o.y < 340),
        {
          id: crypto.randomUUID(),
          x: Math.random() * 88,
          y: 0
        }
      ]);
    }, rate);

    const clock = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(spawn);
          clearInterval(clock);
          setPhase("reward");
          tone("win");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawn);
      clearInterval(clock);
    };
  }, [phase, mode]);

  function movePlayer(e) {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const percent = ((x - rect.left) / rect.width) * 100;
    setPlayerX(Math.max(4, Math.min(92, percent)));
  }

  function shootObject(id) {
    tone("click");
    setObjects((old) => old.filter((o) => o.id !== id));
    setHits((h) => h + 1);
  }

  function missDamage() {
    setDamage((d) => {
      const next = d + 1;
      if (next >= 5) {
        tone("fail");
        setCredits(true);
        setPhase("credits");
      }
      return next;
    });
  }

  async function generateReward(choice) {
    const roll = Math.random() * 100;
    let r = "NORMAL";

    if (choice === "normal") {
      r = roll <= 30 ? "NORMAL" : roll <= 88 ? "EPIC" : "LIMITED";
    }

    if (choice === "intermediate") {
      r = roll <= 25 ? "NORMAL" : roll <= 85 ? "EPIC" : "LIMITED";
    }

    if (choice === "hard") {
      r = roll <= 20 ? "NORMAL" : roll <= 80 ? "EPIC" : "LIMITED";
    }

    if (choice === "limited") {
      r = roll <= 50 ? "LIMITED" : "LEGENDARY";
    }

    setRarity(r);
    setSearching(true);
    setResults([]);
    tone("win");

    try {
      const res = await fetch(`/api/capsuleSearch?rarity=${encodeURIComponent(r)}&subject=${encodeURIComponent(subject)}&mode=${encodeURIComponent(mode)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([
        {
          title: `${subject} preview route loaded locally`,
          url: "https://digitalhut.app",
          source: "DigitalHut Local Capsule"
        }
      ]);
    } finally {
      setSearching(false);
    }
  }

  function saveResults() {
    localStorage.setItem("digitalhut_saved_capsule", JSON.stringify({
      wallet,
      fileName,
      subject,
      mode,
      rarity,
      results,
      savedAt: new Date().toISOString()
    }));
    alert("Saved to backend preview. Supabase save hook comes next.");
  }

  const avatar =
    gender === "female" ? "🧝‍♀️🔥" :
    gender === "male" ? "🧍‍♂️🔥" :
    gender === "prefer" ? "🌀⚡" :
    "🧍";

  return (
    <section style={wrap}>
      <h1 style={title}>DigitalHut Arcade Time Capsule</h1>

      {phase === "gate" && (
        <div style={panel}>
          <h2>Wallet Required</h2>
          <p>Connect 1 wallet to activate this arcade machine.</p>
          <button style={btn} onClick={connectWallet}>Connect Wallet</button>
          <p style={coin}>Buy more GLB files to reveal new capsule information.</p>
        </div>
      )}

      {phase === "setup" && (
        <div style={panel}>
          <h2>Phase 1: Build Fire Before Wind Puts It Out</h2>

          <select style={input} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Choose character</option>
            <option value="male">Male Shelter Man</option>
            <option value="female">Female Shelter Runner</option>
            <option value="prefer">Prefer not to say — Protoss/Zerg Signal</option>
          </select>

          <select style={input} value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="normal">Normal Mode</option>
            <option value="intermediate">Intermediate Mode</option>
            <option value="hard">Hard Mode</option>
          </select>

          <select style={input} value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>

          <input style={{ marginTop: 14 }} type="file" accept=".glb,.gltf" onChange={uploadFile} />

          <p>{fileName || "Upload NFT GLB to start."}</p>

          <div style={avatarBox}>{avatar}</div>

          <button style={btn} onClick={clickFire}>
            CLICK FAST — BUILD FIRE {fire}%
          </button>

          <p>Wind pressure: {wind}%</p>

          <div style={barWrap}><div style={{ ...fireBar, width: `${fire}%` }} /></div>
        </div>
      )}

      {phase === "boot" && (
        <div style={boot}>
          <h1>DIGITALHUT</h1>
          <h2>RARE RETRO CAPSULE START</h2>
          <p>GLB seed loaded: {fileName}</p>
          <p>Decade Zelda/Sega style sequence active.</p>
          <div style={scan}>▓ ▓ ▓ TIME CAPSULE ONLINE ▓ ▓ ▓</div>
        </div>
      )}

      {phase === "dodge" && (
        <div style={panel}>
          <h2>Phase 2: Dodge + Shoot Falling Objects</h2>
          <p>Drag your character. Tap objects to throw rocks. Survive 10 seconds.</p>
          <p>Time: {time}s | Hits: {hits} | Damage: {damage}/5</p>

          <div ref={arenaRef} onMouseMove={movePlayer} onTouchMove={movePlayer} style={arena}>
            <div style={{ ...player, left: `${playerX}%` }}>{avatar}</div>

            {objects.map((o) => (
              <button
                key={o.id}
                onClick={() => shootObject(o.id)}
                onAnimationEnd={missDamage}
                style={{ ...fallObj, left: `${o.x}%`, top: o.y }}
              >
                🟣
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "reward" && (
        <div style={panel}>
          <h1 style={win}>YOU WIN!!!!!!!</h1>
          <p>Choose a capsule route. Winners get internet previews based on rarity and subject.</p>

          <button style={btn} onClick={() => generateReward("normal")}>Normal Search Route</button>
          <button style={btn} onClick={() => generateReward("intermediate")}>Intermediate Search Route</button>
          <button style={btn} onClick={() => generateReward("hard")}>Hard Search Route</button>
          <button style={btn} onClick={() => generateReward("limited")}>Limited Edition 50/50 Route</button>

          {searching && <h2>Searching live internet capsule feeds...</h2>}
          {rarity && <h2 style={rarityStyle}>{rarity} CAPSULE</h2>}

          <div style={resultsGrid}>
            {results.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" style={resultCard}>
                <strong>{r.title}</strong>
                <br />
                <small>{r.source}</small>
              </a>
            ))}
          </div>

          {results.length > 0 && (
            <>
              <button style={btn} onClick={saveResults}>Save Results To Backend Preview</button>
              <button style={danger} onClick={resetGame}>Reload New Game</button>
            </>
          )}
        </div>
      )}

      {phase === "credits" && (
        <div style={panel}>
          <h1>GAME OVER</h1>
          <p>SupportRD.com | DigitalHut.app | LasersMarket.com | DigitalHut.app</p>
          <p style={coin}>Buy more GLB tokens to unlock new arcade capsule previews.</p>
          <button style={btn} onClick={resetGame}>Reload New Game</button>
        </div>
      )}
    </section>
  );
}

const wrap = {
  marginTop: 30,
  padding: 22,
  borderRadius: 24,
  color: "white",
  background: "linear-gradient(180deg,#02020c,#101030)",
  border: "1px solid #7b2cff",
  boxShadow: "0 0 26px rgba(123,44,255,.45)"
};

const title = { color: "#00ff99", fontSize: 38, lineHeight: 1.05 };
const panel = { marginTop: 18, padding: 18, borderRadius: 20, background: "rgba(255,255,255,.04)", border: "1px solid rgba(0,255,153,.25)" };
const input = { width: "100%", marginTop: 12, padding: 14, borderRadius: 14, background: "#050510", color: "white", border: "1px solid #7b2cff" };
const btn = { width: "100%", marginTop: 14, padding: 16, borderRadius: 16, border: 0, background: "#00ff99", color: "black", fontWeight: 900 };
const danger = { ...btn, background: "#ff3b6b", color: "white" };
const coin = { color: "#ffd700", fontWeight: 800 };
const avatarBox = { fontSize: 58, textAlign: "center", padding: 18, filter: "drop-shadow(0 0 18px #00ff99)" };
const barWrap = { height: 22, borderRadius: 20, overflow: "hidden", background: "#030311", border: "1px solid #00ff99" };
const fireBar = { height: "100%", background: "linear-gradient(90deg,#ff4d00,#ffd700,#00ff99)" };
const boot = { ...panel, textAlign: "center", color: "#00ff99", textShadow: "0 0 12px #00ff99" };
const scan = { marginTop: 20, color: "#b266ff", fontWeight: 900 };
const arena = { position: "relative", height: 340, borderRadius: 22, overflow: "hidden", background: "radial-gradient(circle,#27005c,#02020c 75%)", border: "1px solid #9b5cff", touchAction: "none" };
const player = { position: "absolute", bottom: 12, fontSize: 42, transform: "translateX(-50%)", filter: "drop-shadow(0 0 14px #00ff99)" };
const fallObj = { position: "absolute", borderRadius: "50%", border: "1px solid #e6ccff", padding: 8, background: "#7b2cff", boxShadow: "0 0 18px #b266ff" };
const win = { color: "#ffd700", textShadow: "0 0 18px #ffd700" };
const rarityStyle = { color: "#ffd700", textShadow: "0 0 14px #ffd700" };
const resultsGrid = { marginTop: 16, display: "grid", gap: 12 };
const resultCard = { display: "block", padding: 14, borderRadius: 16, background: "rgba(0,255,153,.08)", border: "1px solid #00ff99", color: "white", textDecoration: "none" };
