import {searchConsoleReceipt, sendJson} from "./_proof-artifact-data.js"

export default function handler(req, res){
  return sendJson(res, searchConsoleReceipt)
}
