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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { EventoCalendario } from "@/lib/types/database"
import { EventoCard } from "./evento-card"
import { EventoDetailDialog } from "./evento-detail-dialog"
import { getEventosCalendario } from "@/lib/actions/calendario"
import { toArgentinaTime } from "@/lib/utils/timezone-helpers"
import { useToast } from "@/hooks/use-toast"
import { QuickCreateDialog } from "./quick-create-dialog"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventos, setEventos] = useState<EventoCalendario[]>([])
  const [selectedEvento, setSelectedEvento] = useState<EventoCalendario | null>(null)
  const [loading, setLoading] = useState(true)
  const [quickCreateDate, setQuickCreateDate] = useState<Date | null>(null)
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const [dayWithManyEvents, setDayWithManyEvents] = useState<{ date: Date; eventos: EventoCalendario[] } | null>(null)
  const { toast } = useToast()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: es })
  const calendarEnd = endOfWeek(monthEnd, { locale: es })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  useEffect(() => {
    loadEventos()
  }, [currentDate])

  async function loadEventos() {
    setLoading(true)
    const startDate = format(calendarStart, "yyyy-MM-dd")
    const endDate = format(calendarEnd, "yyyy-MM-dd")
    const result = await getEventosCalendario(startDate, endDate)

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
    // Don't allow creation on weekends
    if (isWeekend(day)) {
      toast({
        title: "Fin de semana",
        description: "No se pueden crear eventos en sábados o domingos",
        variant: "destructive",
      })
      return
    }

    const dayEventos = getEventosForDay(day)
    if (dayEventos.length > 2) {
      setDayWithManyEvents({ date: day, eventos: dayEventos })
    } else {
      setQuickCreateDate(day)
    }
  }

  function handlePreviousMonth() {
    setCurrentDate(subMonths(currentDate, 1))
  }

  function handleNextMonth() {
    setCurrentDate(addMonths(currentDate, 1))
  }

  function handleToday() {
    setCurrentDate(new Date())
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-pba-blue">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span>Planeada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Cerrada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Vencida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Reunión</span>
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
                onClick={() => handleDayClick(day)}
                className={`min-h-[120px] max-h-[120px] overflow-hidden p-2 relative ${
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
                    className="absolute top-1 right-1 h-6 w-6 bg-pba-cyan text-white hover:bg-pba-cyan/90 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setQuickCreateDate(day)
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDayWithManyEvents({ date: day, eventos: dayEventos })
                        }}
                        className="text-xs text-pba-cyan hover:underline font-medium w-full text-center py-1"
                      >
                        +{dayEventos.length - 2} más
                      </button>
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

      {dayWithManyEvents && (
        <Dialog open={!!dayWithManyEvents} onOpenChange={(open) => !open && setDayWithManyEvents(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Eventos del {format(dayWithManyEvents.date, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {dayWithManyEvents.eventos.map((evento) => (
                <div
                  key={evento.id}
                  onClick={() => {
                    setDayWithManyEvents(null)
                    setSelectedEvento(evento)
                  }}
                  className="cursor-pointer"
                >
                  <EventoCard evento={evento} onClick={() => setSelectedEvento(evento)} />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
