"use client"

import { useEffect } from "react"

interface SigteMapProps {
  lat: number
  lon: number
  nombre: string
  altura?: string | number
}

export function SigteMap({ lat, lon, nombre, altura = "h-64" }: SigteMapProps) {
  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    async function initMap() {
      if (typeof window === "undefined") return

      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      // Fix default icon issue with Leaflet + Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const mapId = `map-${lat}-${lon}`
      const mapElement = document.getElementById(mapId)

      if (!mapElement) return

      // Remove existing map if any
      const existingMap = (mapElement as any)._leaflet_map
      if (existingMap) {
        existingMap.remove()
      }

      // Create map
      const map = L.map(mapId).setView([lat, lon], 15)

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add marker
      L.marker([lat, lon]).addTo(map).bindPopup(nombre).openPopup()
    }

    initMap()
  }, [lat, lon, nombre])

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
      <div id={`map-${lat}-${lon}`} className={altura} />
    </div>
  )
}
