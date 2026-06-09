# DIGITALHUT OBSERVATORY V5
# SOCIAL OBSERVATORY • PERFORMANCE • SECURITY • AI RUNNER • NODE DEFENSE

DigitalHut is a social AI observatory platform for rendering, searching, researching, sharing, collaborating, and archiving digital representations of real-world and virtual assets.

The platform is social, but it should not be vulnerable to reward-style abuse, duplicate asset abuse, speed hacks, wallet attacks, coordinated spam, or performance overload.

---

# 1. Core Identity

DigitalHut combines:

- Fullscreen renderer
- GLB and digital asset library
- AI guided tours
- Regular feeds
- Social discovery
- Research workspace
- Wallet/account recognition
- Node backend
- Supabase database
- FireCuda archive
- AI runners
- Security monitoring
- Adaptive performance

Main workflow:

Search  
↓  
Library  
↓  
Renderer  
↓  
AI Analysis  
↓  
Guided Tour / Regular Feed  
↓  
Community / Collaboration  
↓  
Archive  

---

# 2. Anti-Lag Performance Engine

DigitalHut should always protect the renderer first.

The system must prevent:

- renderer freezing
- GLB stuttering
- duplicate page rendering
- excessive CPU usage
- excessive GPU usage
- browser memory leaks
- Node queue overload
- upload queue overload
- AI voice delay
- camera path lag
- guided tour delay
- thumbnails blocking renderer
- feed loading blocking renderer

The renderer, camera, and main page should stay usable even if uploads, feeds, voice, or background runners are delayed.

---

# 3. Device Performance Separation

## Legacy Mode

For:

- Windows 7
- older MacBooks below 2020
- Android phones below 2020
- iPhones below 2020
- weak GPUs
- low-memory browsers

Use:

- compressed GLBs
- lower polygon versions
- reduced texture size
- reduced lighting
- reduced shadows
- static thumbnails
- fewer live panels
- no heavy bloom/effects
- no heavy ambient animation
- optional no-audio mode
- lightweight guided tour mode

## Standard Mode

For:

- modern phones
- modern laptops
- normal browsers
- normal GPUs

Use:

- standard GLB renderer
- standard AI voice
- normal camera rotation
- regular feeds
- ambient sound
- category thumbnails

## Professional Mode

For:

- strong laptops
- gaming PCs
- workstation hardware
- Premium / Pro / Enterprise accounts

Use:

- higher quality GLBs
- advanced lighting
- smoother camera paths
- larger scenes
- more thumbnails
- live measurements
- AI guided orbit
- richer feed overlays

## Cloud Renderer Mode

Future:

- Unreal Pixel Streaming or similar
- server-rendered heavy scenes
- enterprise visualization
- huge GLB/data scenes
- large scientific/project models

---

# 4. AI Performance Runner

The AI Performance Runner continuously watches:

- renderer FPS
- browser memory
- GPU memory
- CPU usage
- Node memory
- API latency
- Supabase latency
- upload queue
- GLB queue
- voice queue
- camera queue
- websocket/session count
- duplicate browser tabs
- duplicate renderer requests

If performance drops, the runner acts automatically:

1. lower renderer quality
2. reduce texture size
3. pause non-critical effects
4. delay background jobs
5. merge duplicate requests
6. serve cached assets
7. move uploads to background queue
8. keep renderer interactive
9. notify admin only if repeated

---

# 5. Multi-Session Abuse Defense

DigitalHut must detect users trying to run:

- 1 guided model
- 30+ uploads
- 20 duplicated pages
- multiple wallets
- multiple browser sessions
- multiple devices
- repeated search requests
- repeated AI voice requests
- repeated renderer camera requests

at the same time.

This can cause lag, cost spikes, database overload, and renderer instability.

## Detection Signals

Track:

- account id
- wallet id
- session id
- IP range
- device fingerprint
- browser fingerprint
- renderer fingerprint
- upload frequency
- tab count
- websocket count
- GLB request count
- voice request count
- camera event frequency
- repeated identical route loads

## Response Ladder

Do not instantly ban.

Use:

1. Normal Mode
2. Warning Mode
3. Slow Mode
4. Queue Mode
5. Isolation Mode
6. Admin Review
7. Account Restriction if confirmed abuse

---

# 6. Duplicate Page / Duplicate Request Control

If the same account opens 20 duplicated pages, DigitalHut should not create 20 full renderer workloads.

Instead:

```text
20 identical page requests
↓
detect duplicate session group
↓
create one renderer/cache source
↓
serve shared cached response
↓
throttle background duplicates
↓
keep primary tab active
