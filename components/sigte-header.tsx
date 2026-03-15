import { UsuarioSelectorClient } from "./usuario-selector-client"

export function SigteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full shadow-lg border-b border-blue-200 bg-gradient-to-r from-[#417099] to-[#00AEC3]">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-md">
            <span className="text-[#417099] font-bold text-sm">DTE</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-white">SIGTE</h1>
            <p className="text-xs text-white/80 hidden md:block">
              Sistema Integral de Gestión Territorial Educativa
            </p>
          </div>
        </div>
        <UsuarioSelectorClient />
      </div>
    </header>
  )
}
