export function parseUserDistricts(distrito: string | null): string[] {
  if (!distrito) return []

  // "Todos" means CED/Regional - no filter
  if (distrito.toLowerCase() === "todos") return []

  // Multiple districts separated by comma
  if (distrito.includes(",")) {
    return distrito
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean)
  }

  // Single district
  return [distrito.trim()]
}

export function isCEDOrRegional(distrito: string | null): boolean {
  return !distrito || distrito.toLowerCase() === "todos"
}
