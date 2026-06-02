import contentRegistry from "../../data/content-source-registry.json"
import observatoryRegistry from "../../data/observatory-source-registry.json"
import marketRegistry from "../../data/market-profile-source-registry.json"
import realEstateRegistry from "../../data/real-estate-source-registry.json"

export function getContentSources() {
  return contentRegistry.sources
}

export function getSourceById(id) {
  return contentRegistry.sources.find((source) => source.id === id)
}

export function getKeyStatus(envKey) {
  return {
    envKey,
    keyPresent: Boolean(process.env[envKey])
  }
}

export function buildSourceStatus(source) {
  return {
    ...source,
    ...getKeyStatus(source.envKey)
  }
}

export function getSourceRegistrySnapshot() {
  return {
    content: contentRegistry,
    observatory: observatoryRegistry,
    market: marketRegistry,
    realEstate: realEstateRegistry,
    sourceStatuses: contentRegistry.sources.map(buildSourceStatus)
  }
}
