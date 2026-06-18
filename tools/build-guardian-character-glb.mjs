import fs from "node:fs"
import * as THREE from "three"
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js"

globalThis.FileReader ??= class {
  readAsArrayBuffer(blob){
    blob.arrayBuffer().then((value) => {
      this.result = value
      this.onloadend?.()
    })
  }

  readAsDataURL(blob){
    blob.arrayBuffer().then((value) => {
      const type = blob.type || "application/octet-stream"
      this.result = `data:${type};base64,${Buffer.from(value).toString("base64")}`
      this.onloadend?.()
    })
  }
}

const presets = {
  desktop: {
    shoulder: 1.12,
    torsoTop: .62,
    torsoBottom: .46,
    torsoHeight: 1.38,
    hipWidth: .74,
    headScale: [1, 1.08, .96],
    skin: 0x8f5d45,
    hair: 0x17120f,
    accent: 0x22d3ee,
    stance: .16
  },
  mobile: {
    shoulder: .94,
    torsoTop: .49,
    torsoBottom: .41,
    torsoHeight: 1.3,
    hipWidth: .72,
    headScale: [.96, 1.08, .94],
    skin: 0xa86f55,
    hair: 0x241711,
    accent: 0x38bdf8,
    stance: .11
  }
}

function material(color, options = {}){
  return new THREE.MeshStandardMaterial({
    color,
    metalness: options.metalness ?? .08,
    roughness: options.roughness ?? .68,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.doubleSide ? THREE.DoubleSide : THREE.FrontSide
  })
}

function addMesh(group, geometry, mat, position, rotation = [0, 0, 0], scale = [1, 1, 1], name = ""){
  const mesh = new THREE.Mesh(geometry, mat)
  mesh.name = name
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.scale.set(...scale)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

function addLimb(group, from, to, radius, mat, name){
  const start = new THREE.Vector3(...from)
  const end = new THREE.Vector3(...to)
  const direction = end.clone().sub(start)
  const length = direction.length()
  const geometry = new THREE.CylinderGeometry(radius * .88, radius, length, 10, 1, false)
  const mesh = new THREE.Mesh(geometry, mat)
  mesh.name = name
  mesh.position.copy(start.clone().add(end).multiplyScalar(.5))
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  mesh.castShadow = true
  group.add(mesh)
  return mesh
}

function createGuardian(kind){
  const preset = presets[kind]
  const group = new THREE.Group()
  group.name = kind === "desktop" ? "DigitalHut Desktop Guardian" : "DigitalHut Mobile Guardian"

  const uniform = material(0x111827, {metalness: .18, roughness: .55})
  const uniformDark = material(0x060b12, {metalness: .12, roughness: .62})
  const accent = material(preset.accent, {metalness: .42, roughness: .32})
  const skin = material(preset.skin, {roughness: .82})
  const hair = material(preset.hair, {roughness: .88})
  const glass = material(0x22d3ee, {metalness: .18, roughness: .12, transparent: true, opacity: .18, doubleSide: true})
  const eye = material(0x111827, {roughness: .5})

  const torsoGeometry = new THREE.CylinderGeometry(preset.torsoTop, preset.torsoBottom, preset.torsoHeight, 10, 1, false)
  addMesh(group, torsoGeometry, uniform, [0, 2.72, 0], [0, 0, 0], [1, 1, .72], "Torso")
  addMesh(group, new THREE.BoxGeometry(preset.shoulder, .22, .42), uniform, [0, 3.27, 0], [0, 0, 0], [1, 1, 1], "Shoulders")
  addMesh(group, new THREE.BoxGeometry(preset.hipWidth, .38, .52), uniformDark, [0, 1.93, 0], [0, 0, 0], [1, 1, 1], "Hips")

  addMesh(group, new THREE.CylinderGeometry(.16, .18, .25, 10), skin, [0, 3.51, 0], [0, 0, 0], [1, 1, 1], "Neck")
  addMesh(group, new THREE.SphereGeometry(.39, 18, 12), skin, [0, 3.92, 0], [0, 0, 0], preset.headScale, "Head")
  addMesh(group, new THREE.SphereGeometry(.405, 18, 10, 0, Math.PI * 2, 0, Math.PI * .52), hair, [0, 4.06, -.015], [0, 0, 0], preset.headScale, "Hair")
  addMesh(group, new THREE.SphereGeometry(.035, 8, 6), eye, [-.14, 3.98, .36], [0, 0, 0], [1, .72, .52], "Left eye")
  addMesh(group, new THREE.SphereGeometry(.035, 8, 6), eye, [.14, 3.98, .36], [0, 0, 0], [1, .72, .52], "Right eye")

  const leftShoulder = [-preset.shoulder / 2, 3.22, 0]
  const rightShoulder = [preset.shoulder / 2, 3.22, 0]
  const leftElbow = [-.78, 2.63, .08]
  const rightElbow = [.78, 2.63, .08]
  const leftHand = [-.7, 2.07, .25]
  const rightHand = [.7, 2.07, .25]
  addLimb(group, leftShoulder, leftElbow, .15, uniform, "Left upper arm")
  addLimb(group, rightShoulder, rightElbow, .15, uniform, "Right upper arm")
  addLimb(group, leftElbow, leftHand, .13, uniform, "Left forearm")
  addLimb(group, rightElbow, rightHand, .13, uniform, "Right forearm")
  addMesh(group, new THREE.SphereGeometry(.14, 10, 8), skin, leftHand, [0, 0, 0], [1, 1.18, .82], "Left hand")
  addMesh(group, new THREE.SphereGeometry(.14, 10, 8), skin, rightHand, [0, 0, 0], [1, 1.18, .82], "Right hand")

  const legY = 1.02
  addLimb(group, [-preset.stance, 1.82, 0], [-preset.stance * 1.16, .33, 0], .19, uniformDark, "Left leg")
  addLimb(group, [preset.stance, 1.82, 0], [preset.stance * 1.16, .33, 0], .19, uniformDark, "Right leg")
  addMesh(group, new THREE.BoxGeometry(.34, .24, .62), uniformDark, [-preset.stance * 1.16, legY - .91, .14], [0, 0, 0], [1, 1, 1], "Left boot")
  addMesh(group, new THREE.BoxGeometry(.34, .24, .62), uniformDark, [preset.stance * 1.16, legY - .91, .14], [0, 0, 0], [1, 1, 1], "Right boot")

  addMesh(group, new THREE.BoxGeometry(.12, .84, .035), accent, [-preset.torsoTop * .62, 2.75, .4], [0, 0, -.16], [1, 1, 1], "Left uniform accent")
  addMesh(group, new THREE.BoxGeometry(.12, .84, .035), accent, [preset.torsoTop * .62, 2.75, .4], [0, 0, .16], [1, 1, 1], "Right uniform accent")
  addMesh(group, new THREE.BoxGeometry(.38, .16, .045), accent, [0, 3.08, .43], [0, 0, 0], [1, 1, 1], "Guardian identity badge")

  addMesh(group, new THREE.BoxGeometry(2.15, 3.25, .06), glass, [0, 2.42, -.52], [0, 0, 0], [1, 1, 1], "Defensive glass shield")
  addMesh(group, new THREE.TorusGeometry(1.2, .025, 8, 48), accent, [0, 2.42, -.46], [0, 0, 0], [1, 1.42, 1], "Integrity scan ring")

  group.position.y = -2.1
  group.rotation.y = kind === "desktop" ? -.12 : .12
  return group
}

async function writeGuardian(kind, outputPath){
  const scene = new THREE.Scene()
  scene.name = "DigitalHut Defensive AI Guardian"
  scene.add(createGuardian(kind))
  const exporter = new GLTFExporter()
  const result = await exporter.parseAsync(scene, {
    binary: true,
    onlyVisible: true,
    trs: false,
    maxTextureSize: 1024
  })
  fs.writeFileSync(outputPath, Buffer.from(result))
  console.log(`Created full character mesh: ${outputPath}`)
}

const [kind, outputPath] = process.argv.slice(2)
if(!presets[kind] || !outputPath){
  console.error("Usage: node tools/build-guardian-character-glb.mjs <desktop|mobile> <output.glb>")
  process.exit(1)
}

await writeGuardian(kind, outputPath)
