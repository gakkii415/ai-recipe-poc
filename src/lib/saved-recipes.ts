import { useEffect, useState } from "react"

const KEY = "kitchen-index:saved-recipes:v1"
const EVENT = "kitchen-index:saved-change"

function readSaved(): string[] {
  const data: unknown = JSON.parse(localStorage.getItem(KEY) || "[]")
  return Array.isArray(data) ? data.filter((item): item is string => typeof item === "string").slice(0, 10000) : []
}

// One store per explorer (not one localStorage read/effect per recipe card).
export function useSavedRecipes() {
  const [saved, setSaved] = useState<string[]>([])
  const [storageError, setStorageError] = useState(false)
  useEffect(() => {
    const refresh = () => {
      try { setSaved(readSaved()) } catch { setStorageError(true) }
    }
    const sync = (event: StorageEvent) => { if (event.key === KEY || event.key === null) refresh() }
    refresh()
    window.addEventListener("storage", sync)
    window.addEventListener(EVENT, refresh)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(EVENT, refresh)
    }
  }, [])

  function toggle(url: string) {
    const next = saved.includes(url) ? saved.filter((item) => item !== url) : [...saved, url]
    setSaved(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      setStorageError(false)
      window.dispatchEvent(new Event(EVENT))
    } catch { setStorageError(true) }
  }
  return { saved, toggle, storageError }
}
