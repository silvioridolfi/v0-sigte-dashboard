import { getUsuarios } from "@/lib/actions/usuarios"
import { UsuarioSelector } from "./usuario-selector"
import { AlertCircle } from "lucide-react"

export async function UsuarioSelectorServer() {
  try {
    const usuarios = await getUsuarios()

    if (!usuarios || usuarios.length === 0) {
      console.warn("[v0] No usuarios available in UsuarioSelectorServer")
      // Renderizar selector vacío pero funcional
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Sin usuarios disponibles</span>
        </div>
      )
    }

    const filteredUsuarios =
      process.env.NEXT_PUBLIC_SHOW_ADMIN === "true" ? usuarios : usuarios.filter((u) => u.rol !== "ADMIN")

    return <UsuarioSelector usuarios={filteredUsuarios} />
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error in UsuarioSelectorServer:", errorMsg)
    return (
      <div className="flex items-center gap-2 text-sm text-pba-pink">
        <AlertCircle className="h-4 w-4" />
        <span>Error cargando usuarios</span>
      </div>
    )
  }
}
