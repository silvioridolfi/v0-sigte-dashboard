export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function getSchoolTypeSynonyms(type: string): string[] {
  const normalizedType = normalizeText(type)

  const synonymMap: Record<string, string[]> = {
    primaria: ["primaria", "eep", "escuela primaria", "primario"],
    secundaria: ["secundaria", "ees", "escuela secundaria", "secundario"],
    jardin: ["jardin", "ji", "jardin de infantes", "inicial"],
    tecnica: ["tecnica", "escuela tecnica", "et", "tecnico"],
    agraria: ["agraria", "escuela agraria", "ea"],
    especial: ["especial", "escuela especial", "ee"],
  }

  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (synonyms.some((syn) => normalizedType.includes(syn))) {
      return synonyms
    }
  }

  return [normalizedType]
}

export function buildNumberTokenRegex(num: string): string {
  // Build regex for exact number matching as a token
  // "8" should match "Primaria 8" or "Secundaria N° 8" but not "18" or "28"
  return `(^|[^0-9])${num}([^0-9]|$)`
}

export function detectSearchType(query: string): {
  type: "cue" | "predio" | "number" | "level" | "text"
  normalizedQuery: string
} {
  const trimmed = query.trim()

  // CUE: exactly 8 digits
  if (/^\d{8}$/.test(trimmed)) {
    return { type: "cue", normalizedQuery: trimmed }
  }

  // Predio: exactly 6 digits
  if (/^\d{6}$/.test(trimmed)) {
    return { type: "predio", normalizedQuery: trimmed }
  }

  // Short number (1-3 digits): treat as school number
  if (/^\d{1,3}$/.test(trimmed)) {
    return { type: "number", normalizedQuery: trimmed }
  }

  const normalized = normalizeText(trimmed)

  // Check for school level keywords
  const levels = ["primaria", "secundaria", "jardin", "tecnica", "agraria", "especial"]
  if (levels.some((level) => normalized.includes(level))) {
    return { type: "level", normalizedQuery: normalized }
  }

  return { type: "text", normalizedQuery: normalized }
}
