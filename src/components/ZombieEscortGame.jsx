import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "../game/zombieEscortConfig";

export default function ZombieEscortGame() {
  const arenaRef = useRef(null);

  const [walletConnected, setWalletConnected] = useState(false);

  const [identity, setIdentity] = useState("");
  const [ability, setAbility] = useState("");

  const [wave, setWave] = useState(1);

  const [playerX, setPlayerX] = useState(45);

  const [hp, setHp] = useState(100);

  const [time, setTime] = useState(90);

  const [enemies, setEnemies] = useState([]);

  const [started, setStarted] = useState(false);

  useEffect(() => {
    window.ethereum?.request?.({
      method: "eth_accounts"
    }).then((accounts) => {
      if (accounts?.length) {
        setWalletConnected(true);
      }
    });
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      window.location.href =
        "https://metamask.app.link/dapp/digitalhut.app";
      return;
    }

    const accounts =
      await window.ethereum.request({
        method: "eth_requestAccounts"
      });

    if (accounts?.length) {
      setWalletConnected(true);
    }
  }

  function startGame() {
    if (!identity || !ability) return;

    setStarted(true);
  }

  useEffect(() => {
    if (!started) return;

    const spawnLoop = setInterval(() => {
      setEnemies((old) => [
        ...old
          .map((e) => ({
            ...e,
            y: e.y + 12
          }))
          .filter((e) => e.y < 320),

        {
          id: crypto.randomUUID(),
          x: Math.random() * 88,
          y: 0
        }
      ]);
    }, 500);

    const timerLoop = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(spawnLoop);
          clearInterval(timerLoop);

          setWave((w) => w + 1);

          return 0;
        }

        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnLoop);
      clearInterval(timerLoop);
    };
  }, [started]);

  function movePlayer(e) {
    const rect =
      arenaRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x =
      e.touches
        ? e.touches[0].clientX
        : e.clientX;

    const percent =
      ((x - rect.left) / rect.width) * 100;

    setPlayerX(
      Math.max(4, Math.min(92, percent))
    );
  }

  function hitEnemy(id) {
    setEnemies((old) =>
      old.filter((e) => e.id !== id)
    );
  }

  const avatar =
    identity === "female"
      ? "🧝‍♀️"
      : identity === "male"
      ? "🧍‍♂️"
      : "🌀";

  return (
    <section style={wrap}>
      <h1 style={title}>
        DigitalHut Zombie Escort
      </h1>

      {!walletConnected && (
        <div style={panel}>
          <h2>Connect Wallet</h2>

          <button
            style={btn}
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        </div>
      )}

      {walletConnected && !started && (
        <div style={panel}>
          <h2>Create Survivor</h2>

          <select
            style={input}
            value={identity}
            onChange={(e) =>
              setIdentity(e.target.value)
            }
          >
            <option value="">
              Choose Identity
            </option>

            {GAME_CONFIG.identityOptions.map(
              (i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              )
            )}
          </select>

          <select
            style={input}
            value={ability}
            onChange={(e) =>
              setAbility(e.target.value)
            }
          >
            <option value="">
              Choose Ability
            </option>

            {GAME_CONFIG.abilities.map(
              (a) => (
                <option
                  key={a.id}
                  value={a.id}
                >
                  {a.name}
                </option>
              )
            )}
          </select>

          <button
            style={btn}
            onClick={startGame}
          >
            Start Escort
          </button>
        </div>
      )}

      {started && (
        <div style={panel}>
          <h2>
            Wave {wave}: {
              GAME_CONFIG.waves[
                wave - 1
              ]?.title
            }
          </h2>

          <p>
            HP: {hp} | Time: {time}s
          </p>

          <div
            ref={arenaRef}
            onMouseMove={movePlayer}
            onTouchMove={movePlayer}
            style={arena}
          >
            <div
              style={{
                ...player,
                left: `${playerX}%`
              }}
            >
              {avatar}
            </div>

            {enemies.map((enemy) => (
              <button
                key={enemy.id}
                onClick={() =>
                  hitEnemy(enemy.id)
                }
                style={{
                  ...enemyStyle,
                  left: `${enemy.x}%`,
                  top: enemy.y
                }}
              >
                🧟
              </button>
            ))}
          </div>

          <h3>
            Ability: {ability}
          </h3>

          <p>
            {
              GAME_CONFIG.abilities.find(
                (a) =>
                  a.id === ability
              )?.description
            }
          </p>

          {wave === 3 && (
            <div style={johnBox}>
              <h3>John Joined</h3>

              <p>
                "Northern and eastern
                barriers just broke."
              </p>

              <p>
                "I survived. My wife
                didn’t."
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const wrap = {
  marginTop: 30,
  padding: 24,
  borderRadius: 24,
  background:
    "linear-gradient(180deg,#02020c,#111133)",
  color: "white",
  border: "1px solid #7b2cff"
};

const title = {
  color: "#00ff99",
  fontSize: 40
};

const panel = {
  marginTop: 18,
  padding: 18,
  borderRadius: 20,
  background:
    "rgba(255,255,255,.04)"
};

const btn = {
  width: "100%",
  marginTop: 14,
  padding: 16,
  borderRadius: 16,
  border: 0,
  background: "#00ff99",
  color: "#000",
  fontWeight: 900
};

const input = {
  width: "100%",
  marginTop: 12,
  padding: 14,
  borderRadius: 14,
  background: "#050510",
  color: "white"
};

const arena = {
  position: "relative",
  marginTop: 20,
  height: 340,
  borderRadius: 24,
  overflow: "hidden",
  background:
    "radial-gradient(circle,#1d0045,#02020c 75%)",
  border: "1px solid #9b5cff",
  touchAction: "none"
};

const player = {
  position: "absolute",
  bottom: 12,
  fontSize: 42,
  transform: "translateX(-50%)"
};

const enemyStyle = {
  position: "absolute",
  borderRadius: "50%",
  border: "1px solid #e6ccff",
  padding: 8,
  background: "#7b2cff",
  boxShadow:
    "0 0 18px rgba(180,90,255,.8)"
};

const johnBox = {
  marginTop: 18,
  padding: 16,
  borderRadius: 16,
  border: "1px solid #00ff99",
  background:
    "rgba(0,255,153,.08)"
};
