"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWeekend,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { EventoCalendario } from "@/lib/types/database"
import { EventoCard } from "./evento-card"
import { EventoDetailDialog } from "./evento-detail-dialog"
import { getEventosEquipo } from "@/lib/actions/calendario"
import { toArgentinaTime } from "@/lib/utils/timezone-helpers"
import { useToast } from "@/hooks/use-toast"
import { QuickCreateDialog } from "./quick-create-dialog"
import { getUsuariosDisponibles } from "@/lib/utils/usuarios-helpers"

export function CalendarViewEquipo() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventos, setEventos] = useState<EventoCalendario[]>([])
  const [selectedEvento, setSelectedEvento] = useState<EventoCalendario | null>(null)
  const [loading, setLoading] = useState(true)
  const [quickCreateDate, setQuickCreateDate] = useState<Date | null>(null)
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const { toast } = useToast()

  const [filterFED, setFilterFED] = useState<string>("all")
  const [filterDistrito, setFilterDistrito] = useState<string>("all")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterTipo, setFilterTipo] = useState<string>("all")
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [distritos, setDistritos] = useState<string[]>([])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: es })
  const calendarEnd = endOfWeek(monthEnd, { locale: es })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  useEffect(() => {
    loadUsuarios()
  }, [])

  useEffect(() => {
    loadEventos()
  }, [currentDate, filterFED, filterDistrito, filterEstado, filterTipo])

  async function loadUsuarios() {
    const users = await getUsuariosDisponibles()
    setUsuarios(users)

    // Extract unique districts
    const uniqueDistritos = Array.from(new Set(users.map((u) => u.distrito).filter(Boolean)))
    setDistritos(uniqueDistritos)
  }

  async function loadEventos() {
    setLoading(true)
    const startDate = format(calendarStart, "yyyy-MM-dd")
    const endDate = format(calendarEnd, "yyyy-MM-dd")

    const result = await getEventosEquipo(startDate, endDate, {
      fed: filterFED !== "all" ? filterFED : undefined,
      distrito: filterDistrito !== "all" ? filterDistrito : undefined,
      estado: filterEstado !== "all" ? filterEstado : undefined,
      tipo: filterTipo !== "all" ? filterTipo : undefined,
    })

    if (result.error) {
      toast({
        title: "Error al cargar eventos",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setEventos(result.eventos)
    }
    setLoading(false)
  }

  function getEventosForDay(day: Date) {
    return eventos.filter((evento) => {
      const eventoDate = toArgentinaTime(evento.fecha_inicio)
      return isSameDay(eventoDate, day)
    })
  }

  function handleDayClick(day: Date) {
    if (isWeekend(day)) {
      toast({
        title: "Fin de semana",
        description: "No se pueden crear eventos en sábados o domingos",
        variant: "destructive",
      })
      return
    }
    setQuickCreateDate(day)
  }

  return (
    <>
      <div className="space-y-4">
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-pba-blue" />
            <Label className="text-sm font-semibold text-pba-blue">Filtros</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">FED</Label>
              <Select value={filterFED} onValueChange={setFilterFED}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los FED" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los FED</SelectItem>
                  {usuarios
                    .filter((u) => u.rol === "FED")
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Distrito</Label>
              <Select value={filterDistrito} onValueChange={setFilterDistrito}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los distritos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los distritos</SelectItem>
                  {distritos.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="planeada">Planeada</SelectItem>
                  <SelectItem value="cerrada">Cerrada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Tipo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="VISITA">Visitas</SelectItem>
                  <SelectItem value="REUNION">Reuniones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-pba-blue">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-pba-blue py-2">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const dayEventos = getEventosForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())
            const isWeekendDay = isWeekend(day)
            const dayKey = format(day, "yyyy-MM-dd")
            const isHovered = hoveredDay === dayKey

            return (
              <Card
                key={index}
                onMouseEnter={() => !isWeekendDay && setHoveredDay(dayKey)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => !isWeekendDay && handleDayClick(day)}
                className={`min-h-[120px] p-2 relative ${
                  isCurrentMonth ? "bg-card" : "bg-muted/50"
                } ${isToday ? "ring-2 ring-pba-cyan" : ""} ${
                  isWeekendDay
                    ? "opacity-50 cursor-not-allowed bg-muted/70"
                    : "cursor-pointer hover:ring-2 hover:ring-pba-cyan/50"
                }`}
              >
                {isHovered && !isWeekendDay && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 bg-pba-cyan text-white hover:bg-pba-cyan/90"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDayClick(day)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}

                <div className="space-y-2">
                  <div
                    className={`text-sm font-medium ${
                      isToday
                        ? "bg-pba-cyan text-white w-6 h-6 rounded-full flex items-center justify-center"
                        : isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  {isWeekendDay && <div className="text-xs text-muted-foreground italic">No disponible</div>}
                  <div className="space-y-1">
                    {dayEventos.slice(0, 2).map((evento) => (
                      <EventoCard key={evento.id} evento={evento} onClick={() => setSelectedEvento(evento)} />
                    ))}
                    {dayEventos.length > 2 && (
                      <div className="text-xs text-center text-muted-foreground">+{dayEventos.length - 2} más</div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {loading && <div className="text-center text-muted-foreground py-8">Cargando eventos...</div>}
      </div>

      {selectedEvento && (
        <EventoDetailDialog
          evento={selectedEvento}
          open={!!selectedEvento}
          onOpenChange={(open) => !open && setSelectedEvento(null)}
          onEdit={() => {
            setSelectedEvento(null)
            loadEventos()
          }}
        />
      )}

      {quickCreateDate && (
        <QuickCreateDialog
          date={quickCreateDate}
          open={!!quickCreateDate}
          onOpenChange={(open) => {
            if (!open) setQuickCreateDate(null)
          }}
          onSuccess={() => {
            setQuickCreateDate(null)
            loadEventos()
          }}
        />
      )}
    </>
  )
}
