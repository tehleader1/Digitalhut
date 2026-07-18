import assert from "node:assert/strict"
import {readdirSync, readFileSync} from "node:fs"
import {basename, join, relative} from "node:path"

function generatorFiles(directory){
  return readdirSync(directory, {withFileTypes:true}).flatMap((entry) => {
    const path = join(directory, entry.name)
    if(entry.isDirectory()) return generatorFiles(path)
    return entry.isFile() && entry.name.endsWith(".mjs") ? [path] : []
  })
}

const files = generatorFiles("tools")
const violations = files.flatMap((file) => {
  if(basename(file).startsWith("verify-")) return []
  const text = readFileSync(file, "utf8")
  return /unique visitors/i.test(text) ? [relative(process.cwd(), file).replaceAll("\\", "/")] : []
})

assert.deepEqual(violations, [], `generator language must label pseudonymous counts as participating browser IDs: ${violations.join(", ")}`)

console.log(JSON.stringify({
  ok:true,
  checkedGeneratorFiles:files.length,
  forbiddenLabel:"unique visitors",
  requiredPublicMeaning:"pseudonymous-browser-ids",
  compatibilityKeyPreserved:"uniqueVisitors"
}, null, 2))
