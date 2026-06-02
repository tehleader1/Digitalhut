import { buildFeatureSlug } from "./personaFeature"

export function buildArticleSchema(feature, url = "") {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: feature.seoTitle || feature.mainFeatureTitle,
    description: feature.seoDescription || feature.blogAngle,
    keywords: feature.seoKeywords,
    url,
    mainEntityOfPage: url || undefined,
    articleSection: feature.label,
    about: feature.mainFeatureTitle,
    isAccessibleForFree: true
  }
}

export function buildSoftwareApplicationSchema(feature, url = "") {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DigitalHut Household Dapp",
    applicationCategory: "WebApplication",
    description: feature.seoDescription || feature.blogAngle,
    url,
    featureList: [
      feature.primaryRenderRole,
      feature.contextRenderRole,
      feature.walletAction,
      `${feature.label} adaptive feature`
    ].filter(Boolean)
  }
}

export function buildThreeDModelSchema(feature, url = "") {
  return {
    "@context": "https://schema.org",
    "@type": "3DModel",
    name: feature.mainFeatureTitle,
    description: feature.blogAngle,
    encodingFormat: "model/gltf-binary",
    url,
    isBasedOn: feature.mainGLBSearch,
    keywords: feature.seoKeywords
  }
}

export function buildFeatureSchemaBundle(feature, origin = "") {
  const slug = buildFeatureSlug(feature.mainFeatureTitle)
  const url = origin ? `${origin}/blog/${slug}` : `/blog/${slug}`
  return [
    buildArticleSchema(feature, url),
    buildSoftwareApplicationSchema(feature, origin || "/"),
    buildThreeDModelSchema(feature, url)
  ]
}
