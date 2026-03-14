export function getSaludo(genero: "M" | "F" | null): string {
  if (genero === "M") return "Bienvenido"
  if (genero === "F") return "Bienvenida"
  return "Hola"
}
