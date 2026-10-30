"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, Cloud, CloudRain, CloudSun, Droplets, LocateFixed, MapPin, RefreshCw, Search, Sun, Sunrise, Sunset, Wind } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

type Weather = { address: string; timezone: string; currentConditions: any; days: any[] }

const iconFor = (icon = "") => icon.includes("rain") ? CloudRain : icon.includes("cloud") ? Cloud : icon.includes("partly") ? CloudSun : Sun
const formatHour = (value: string) => new Date(value).toLocaleTimeString([], { hour: "numeric" })
const formatDay = (value: string, index: number) => index === 0 ? "Today" : new Date(`${value}T12:00:00`).toLocaleDateString([], { weekday: "short" })

export default function Page() {
  const [location, setLocation] = useState("")
  const [query, setQuery] = useState("")
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadWeather = useCallback(async (place: string) => {
    setLoading(true); setError("")
    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(place)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setWeather(data); setLocation(place); setQuery(place)
      window.localStorage.setItem("nextweather-location", place)
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load weather.") } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const savedLocation = window.localStorage.getItem("nextweather-location")
    if (savedLocation) {
      loadWeather(savedLocation)
      return
    }

    if (!navigator.geolocation) {
      loadWeather("Seattle, WA")
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadWeather(`${coords.latitude},${coords.longitude}`),
      () => loadWeather("Seattle, WA"),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [loadWeather])

  const current = weather?.currentConditions
  const today = weather?.days?.[0]
  const hourly = useMemo(() => {
    if (!weather?.days) return []
    const now = Date.now() / 1000
    return weather.days.flatMap(day => day.hours || []).filter((hour: any) => hour.datetimeEpoch >= now - 12 * 3600 && hour.datetimeEpoch <= now + 12 * 3600).slice(0, 25)
  }, [weather])
  const CurrentIcon = iconFor(current?.icon)

  return <main className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><CloudSun /></div><div><p className="text-xl font-semibold tracking-tight">NextWeather</p><p className="text-xs text-muted-foreground">Simple forecasts, beautifully clear</p></div></div>
        <Button variant="outline" size="sm" onClick={() => loadWeather(location || query || "Seattle, WA")} disabled={loading}><RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : ""} /> Refresh</Button>
      </header>

      <nav aria-label="Popular cities" className="mb-8 flex gap-2 overflow-x-auto pb-1">
        {(["Tokyo", "New York", "Rome", "Beijing", "Helsinki"] as const).map((city) => (
          <Button
            key={city}
            type="button"
            size="sm"
            variant={location.toLowerCase().includes(city.toLowerCase()) ? "default" : "outline"}
            className="shrink-0 rounded-full"
            onClick={() => loadWeather(city)}
            disabled={loading}
          >
            {city}
          </Button>
        ))}
      </nav>

      <section className="mb-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <div><Badge variant="secondary" className="mb-4 rounded-full px-3 py-1">Live local forecast</Badge><h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">A clearer view of <span className="text-primary">what&apos;s ahead.</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">Get the conditions you need, from the next hour to the next week.</p></div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (query.trim()) loadWeather(query.trim()) }}><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Location" value={query} onChange={(e) => setQuery(e.target.value)} className="h-12 rounded-xl pl-10" placeholder="City, state or country" /></div><Button className="h-12 rounded-xl px-5" type="submit">Search</Button></form>
      </section>

      {error && <div role="alert" className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle />{error}</div>}
      {loading && !weather ? <div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-64 rounded-2xl md:col-span-2" /><Skeleton className="h-64 rounded-2xl" /></div> : weather && <>
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden rounded-3xl border-0 bg-primary text-primary-foreground shadow-xl md:col-span-2"><CardContent className="relative p-7 sm:p-10"><div className="absolute -right-8 -top-10 size-48 rounded-full bg-primary-foreground/10" /><div className="relative flex flex-col justify-between gap-8 sm:flex-row"><div><div className="flex items-center gap-2 text-sm opacity-80"><MapPin /> {weather.address}</div><p className="mt-8 text-8xl font-semibold tracking-tighter">{Math.round(current.temp)}°F</p><p className="mt-2 text-lg font-medium">{current.conditions}</p><p className="mt-1 text-sm opacity-75">Feels like {Math.round(current.feelslike)}°F</p></div><CurrentIcon className="size-28 stroke-[1.2] opacity-90 sm:mt-8" /></div><div className="relative mt-10 grid grid-cols-3 gap-3 border-t border-primary-foreground/20 pt-5 text-sm"><div><p className="opacity-65">Humidity</p><p className="mt-1 font-medium">{Math.round(current.humidity)}%</p></div><div><p className="opacity-65">Wind</p><p className="mt-1 font-medium">{Math.round(current.windspeed)} mph</p></div><div><p className="opacity-65">Rain chance</p><p className="mt-1 font-medium">{Math.round(current.precipprob)}%</p></div></div></CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">Today&apos;s details</CardTitle></CardHeader><CardContent className="flex flex-col gap-5"><Detail icon={Wind} label="Wind speed" value={`${Math.round(current.windspeed)} mph`} /><Detail icon={Droplets} label="Rain likelihood" value={`${Math.round(current.precipprob)}%`} /><Detail icon={Sunrise} label="Sunrise" value={formatHour(`${today.datetime}T${today.sunrise}`)} /><Detail icon={Sunset} label="Sunset" value={formatHour(`${today.datetime}T${today.sunset}`)} /></CardContent></Card>
        </section>

        <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="text-sm font-medium text-primary">The next 24 hours</p><h2 className="text-2xl font-semibold tracking-tight">Around the clock</h2></div><p className="text-sm text-muted-foreground">Past &amp; upcoming</p></div><div className="flex gap-3 overflow-x-auto pb-3">{hourly.map((hour: any, index: number) => { const Icon = iconFor(hour.icon); return <Card key={`${hour.datetimeEpoch}-${index}`} className={`min-w-24 rounded-2xl ${index === 12 ? "border-primary bg-primary/5" : ""}`}><CardContent className="flex flex-col items-center gap-3 p-4"><span className="text-xs text-muted-foreground">{index === 12 ? "Now" : formatHour(`${new Date(hour.datetimeEpoch * 1000).toISOString()}`)}</span><Icon className="size-6 text-primary" /><span className="font-semibold">{Math.round(hour.temp)}°F</span><span className="text-[11px] text-muted-foreground">{Math.round(hour.precipprob)}% rain</span></CardContent></Card> })}</div></section>
        <section className="mt-8"><h2 className="mb-4 text-2xl font-semibold tracking-tight">7-day outlook</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">{weather.days.slice(0, 7).map((day: any, index: number) => { const Icon = iconFor(day.icon); return <Card key={day.datetime} className="rounded-2xl"><CardContent className="flex items-center justify-between p-4 lg:flex-col lg:items-start lg:gap-4"><span className="text-sm font-medium">{formatDay(day.datetime, index)}</span><Icon className="size-6 text-primary" /><div className="text-right lg:text-left"><span className="font-semibold">{Math.round(day.tempmax)}°F</span><span className="ml-2 text-sm text-muted-foreground">{Math.round(day.tempmin)}°F</span></div></CardContent></Card> })}</div></section>
      </>}
      <footer className="mt-12 flex items-center justify-between border-t pt-5 text-xs text-muted-foreground"><span>Data by Visual Crossing</span><span className="flex items-center gap-1"><LocateFixed /> Search a place to begin</span></footer>
    </div>
  </main>
}

function Detail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) { return <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div></div> }
