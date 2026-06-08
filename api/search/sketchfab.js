import {sendObservatoryPayload} from "../_observatory-providers.js"

export default async function handler(req, res){
  return sendObservatoryPayload(req, res)
}
