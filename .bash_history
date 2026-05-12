async function loadDefault(){
 let res=await fetch("/api/defaults"); let arr=await res.json();
 readers=arr.map(s=>({symbol:s,kind:s.includes("/")?"crypto":"stock"}));
 draw();
}

async function draw(){
 let html="<h2>10 Live + Search Readers</h2>";
 for(let r of readers){
  try{
   let res=await fetch(`/api/read?symbol=${encodeURIComponent(r.symbol)}&kind=${r.kind}`);
   let d=await res.json(); Object.assign(r,d);
   let st=stage(r.pressure);
   let key=r.symbol+"-"+st[0];

   if(r.pressure>=55 && !sealFired[key]){
    ping(r,st[0],r.pressure>=60);
    sealFired[key]=true;
   }

   html+=`<div class="reader">
    <div class="laser"></div>
    <div class="big">${r.symbol} — ${r.side} ${r.pressure}%</div>
    <p>Real move from open: ${r.raw_percent}% | Price: $${r.price}</p>
    <div class="meter"><div class="fill ${r.side==="BEAR"?"bear":""}" style="width:${r.pressure}%"></div></div>
    <h3 class="${st[1]}">${st[0]}</h3>
    <p>${r.pressure>=60?"FINAL SEAL PING FIRED: power down / exit watch.":"Balancing and reading live pressure."}</p>
   </div>`;
  }catch(e){
   html+=`<div class="reader">${r.symbol} loading/error</div>`;
  }
 }
 document.getElementById("readers").innerHTML=html;
}

setInterval(draw,15000);
loadDefault();
</script>
</body>
</html>
"""

@app.route("/")
def home():
    return render_template_string(HTML)

@app.route("/healthz")
def healthz():
    return "OK", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
EOF

git add .
git commit -m "connect market api live seal reader"
git push --force origin main
pip install google-auth google-auth-oauthlib google-api-python-client requests
pip install --upgrade pip setuptools wheel
pkg install rust clang python-dev openssl-dev libffi-dev -y
pip install requests
pip install google-auth
pip install google-auth-oauthlib
pip install google-api-python-client
pip uninstall google-api-python-client google-auth google-auth-oauthlib cryptography -y
pip install requests flask
cat > merchant_feed.py <<'EOF'
import json
from datetime import datetime

products = [
    {
        "id": "laser-reader-1",
        "title": "Laser Signal Reader",
        "description": "Live stock and crypto pressure reader",
        "price": "49.99 USD",
        "availability": "in stock",
        "condition": "new",
        "brand": "Market",
        "return_policy": "30-day refund if product or delivery fails"
    },
    {
        "id": "nft-signal-pack",
        "title": "NFT Signal Pack",
        "description": "Digital NFT signal access",
        "price": "99.99 USD",
        "availability": "in stock",
        "condition": "new",
        "brand": "Market",
        "return_policy": "Refund only if delivery or wallet transfer fails"
    }
]

feed = {
    "generated": str(datetime.utcnow()),
    "products": products
}

with open("merchant_feed.json","w") as f:
    json.dump(feed,f,indent=2)

print("merchant_feed.json generated")
EOF

python merchant_feed.py
cd ~/digitalhut
cd ~/Digitalhut
cd ~
ls
cat >> index.html << 'EOF'

<style>

body::before {

  content: "";

  position: fixed;

  top: -20%;
  left: -20%;

  width: 140%;
  height: 140%;

  background:
    radial-gradient(circle at 20% 20%, rgba(56,189,248,0.12), transparent 30%),
    radial-gradient(circle at 80% 30%, rgba(168,85,247,0.10), transparent 30%),
    radial-gradient(circle at 50% 80%, rgba(59,130,246,0.10), transparent 30%);

  z-index: -1;

  animation: drift 18s linear infinite;

}

@keyframes drift {

  0% {
    transform: translate(0px, 0px);
  }

  50% {
    transform: translate(-30px, -20px);
  }

  100% {
    transform: translate(0px, 0px);
  }

}

.card {

  backdrop-filter: blur(12px);

  box-shadow:
    0 0 25px rgba(56,189,248,0.08);

  transition: all 0.3s ease;

}

.card:hover {

  transform: translateY(-6px);

  box-shadow:
    0 0 35px rgba(56,189,248,0.18);

}

</style>

EOF

git add index.html
git commit -m "Added animated AI marketplace visuals"
git push origin main
cat >> index.html << 'EOF'

<section class="section">

  <h2>3D Simulator Access</h2>

  <div class="card">

    <div class="tag">SIMULATOR PREVIEW</div>

    <h3>DigitalHut Living Ecosystem</h3>

    <p>

      Enter interactive simulated environments featuring:
      homes, offices, rooftop collaboration spaces,
      creator studios, patios, meeting rooms,
      AI systems, lifestyle interactions, and
      future commerce environments.

    </p>

    <div style="margin-top:20px;">

      <button class="button">
        Enter Simulator
      </button>

    </div>

    <div style="margin-top:30px; opacity:0.8;">

      🌴 California Ranch House<br>
      🏝 Thailand Bungalow<br>
      🌊 Fiji Villa<br>
      🏢 Executive Business Office<br>
      🏔 Canada Mountain Cabin<br>
      🏖 Florida Beach Pad<br>
      🏯 Japan 2-Story Home<br>
      🇮🇳 India 2-Story Home<br>
      🇪🇺 Europe 2-Story Home<br>
      🏡 North Carolina Home<br>

    </div>

  </div>

</section>

EOF

git add index.html
git commit -m "Added simulator entry section"
git push origin main
cat > simulator.html << 'EOF'

<!DOCTYPE html>
<html>

<head>

  <title>DigitalHut Simulator</title>

  <meta name="viewport" content="width=device-width, initial-scale=1">

  <style>

    body {

      margin: 0;

      background:
        linear-gradient(
          180deg,
          #020617,
          #0f172a
        );

      color: white;

      font-family: Arial, sans-serif;

      overflow-x: hidden;

    }

    .topbar {

      padding: 20px;

      background: rgba(0,0,0,0.5);

      backdrop-filter: blur(10px);

      display: flex;

      justify-content: space-between;

      align-items: center;

      position: sticky;

      top: 0;

    }

    .hero {

      padding: 40px 24px;

    }

    .hero h1 {

      font-size: 48px;

      margin-bottom: 10px;

    }

    .hero p {

      color: #cbd5e1;

      font-size: 18px;

    }

    .scene {

      height: 300px;

      margin: 24px;

      border-radius: 20px;

      background:
        radial-gradient(circle at center,
        rgba(56,189,248,0.15),
        rgba(15,23,42,0.95));

      border: 1px solid rgba(255,255,255,0.08);

      box-shadow:
        0 0 60px rgba(56,189,248,0.15);

      display: flex;

      justify-content: center;

      align-items: center;

      font-size: 28px;

      color: rgba(255,255,255,0.8);

    }

    .grid {

      display: grid;

      gap: 18px;

      padding: 24px;

    }

    .card {

      background: rgba(30,41,59,0.85);

      padding: 20px;

      border-radius: 18px;

      border:
        1px solid rgba(255,255,255,0.08);

      backdrop-filter: blur(10px);

      transition: 0.3s ease;

    }

    .card:hover {

      transform: translateY(-6px);

      box-shadow:
        0 0 30px rgba(56,189,248,0.18);

    }

    .tag {

      color: #38bdf8;

      font-weight: bold;

      margin-bottom: 10px;

    }

    .button {

      display: inline-block;

      margin-top: 12px;

      padding: 10px 16px;

      background: #38bdf8;

      color: black;

      border-radius: 10px;

      text-decoration: none;

      font-weight: bold;

    }

  </style>

</head>

<body>

<div class="topbar">

  <div>🚀 DigitalHut Simulator</div>

  <div>Dojj AI Active</div>

</div>

<section class="hero">

  <h1>Interactive Living Ecosystem</h1>

  <p>

    Explore homes, offices, creator spaces,
    rooftop collaboration environments,
    AI lifestyle simulations, and future
    digital commerce environments.

  </p>

</section>

<div class="scene">

  3D Environment Loading...

</div>

<div class="grid">

  <div class="card">

    <div class="tag">RESIDENTIAL</div>

    <h2>California Ranch House</h2>

    <p>

      Simulated family lifestyle environment
      with smart-home integrations,
      productivity tools, and AI systems.

    </p>

  </div>

  <div class="card">

    <div class="tag">CREATOR</div>

    <h2>Creator Studio Office</h2>

    <p>

      Creator economy simulation with
      livestreaming, editing,
      AI content workflows, and media systems.

    </p>

  </div>

  <div class="card">

    <div class="tag">BUSINESS</div>

    <h2>Executive Meeting Environment</h2>

    <p>

      Simulated business collaboration,
      startup infrastructure,
      AI dashboards, and SaaS tools.

    </p>

  </div>

</div>

</body>

</html>

EOF

sed -i 's/<button class="button">Enter Simulator<\/button>/<a class="button" href="simulator.html">Enter Simulator<\/a>/' index.html
git add .
git commit -m "Added simulator shell experience"
git push origin main
