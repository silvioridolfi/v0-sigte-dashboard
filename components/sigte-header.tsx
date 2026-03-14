import { UserMenu } from "./user-menu"

export function SigteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-pba-blue">SIGTE</h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            Sistema Integral de Gestión Territorial Educativa
          </p>
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
