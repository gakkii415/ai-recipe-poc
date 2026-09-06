import { Heart, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSavedRecipes } from "@/lib/saved-recipes"

export function RecipeActions({ url, title }: { url: string; title: string }) {
  const { saved, toggle, storageError } = useSavedRecipes()
  const active = saved.includes(url)
  return <div className="recipe-actions">
    <Button type="button" variant="outline" onClick={() => toggle(url)} aria-pressed={active} aria-label={`${title}を${active ? "保存から外す" : "保存する"}`}>
      <Heart size={18} fill={active ? "currentColor" : "none"} className={active ? "saved-heart" : ""} aria-hidden="true" />
      {active ? "保存済み" : "保存する"}
    </Button>
    <Button type="button" variant="ghost" onClick={() => window.print()}><Printer size={18} aria-hidden="true" />印刷</Button>
    {storageError && <p className="storage-warning" role="status">端末への保存ができません。この画面を閉じると保存内容が失われます。</p>}
  </div>
}
