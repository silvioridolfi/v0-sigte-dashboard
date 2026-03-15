"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError("Email o contraseña incorrectos")
      setLoading(false)
      return
    }

    // Navegación hard — fuerza recarga completa para que el middleware
    // lea las cookies nuevas de Supabase
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-[#417099]">SIGTE</h1>
          <p className="text-sm text-muted-foreground">Sistema Integral de Gestión Territorial Educativa</p>
          <p className="text-xs text-muted-foreground">DTE | Dirección de Tecnología Educativa · Región 1</p>
        </div>

        <Card className="rounded-2xl shadow-lg border-t-4 border-t-[#00AEC3]">
          <CardHeader>
            <CardTitle className="text-[#417099]">Iniciar sesión</CardTitle>
            <CardDescription>Ingresá con tu email institucional</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="usuario@abc.gob.ar"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password" />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
              )}
              <Button type="submit" disabled={loading} className="w-full bg-[#00AEC3] hover:bg-[#0098ad]">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Ingresando...</> : <><LogIn className="h-4 w-4 mr-2" />Ingresar</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ¿Olvidaste tu contraseña? Contactá al administrador del sistema.
        </p>
      </div>
    </div>
  )
}
