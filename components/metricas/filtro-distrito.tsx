"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FiltroDistrito({ distritos, distritoActual }: { distritos: string[]; distritoActual?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "todos") {
      params.delete("distrito")
    } else {
      params.set("distrito", value)
    }
    router.push(`/metricas?${params.toString()}`)
  }

  return (
    <Select value={distritoActual || "todos"} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Todos los distritos" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos los distritos</SelectItem>
        {distritos.map((distrito) => (
          <SelectItem key={distrito} value={distrito}>
            {distrito}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
