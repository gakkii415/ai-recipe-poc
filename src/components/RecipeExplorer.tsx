import { useMemo, useState } from "react"
import { ArrowRight, Clock3, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export type RecipeSummary = {
  title: string
  description: string
  category: string
  cuisine: string
  tags: string[]
  ingredients: string[]
  totalMinutes: number
  url: string
}

export function RecipeExplorer({ recipes }: { recipes: RecipeSummary[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("すべて")

  const categories = useMemo(
    () => ["すべて", ...Array.from(new Set(recipes.map((recipe) => recipe.category))).sort((a, b) => a.localeCompare(b, "ja"))],
    [recipes],
  )

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase("ja").normalize("NFKC").trim()
    return recipes.filter((recipe) => {
      const categoryMatch = category === "すべて" || recipe.category === category
      const searchable = [
        recipe.title,
        recipe.description,
        recipe.category,
        recipe.cuisine,
        ...recipe.tags,
        ...recipe.ingredients,
      ].join(" ").toLocaleLowerCase("ja").normalize("NFKC")
      return categoryMatch && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [category, query, recipes])

  return (
    <>
      <Card className="mt-7 gap-4 p-4 shadow-xs">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="料理名、材料、タグで検索"
            aria-label="レシピを検索"
            className="h-11 bg-muted/40 pl-9 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              aria-label="検索語を消去"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="カテゴリで絞り込み">
          {categories.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={category === item ? "default" : "outline"}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className="shrink-0 rounded-full"
            >
              {item}
            </Button>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <strong className="font-semibold text-foreground">{filteredRecipes.length}</strong> 件のレシピ
        </p>
        {(query || category !== "すべて") && (
          <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setCategory("すべて") }}>
            条件をリセット
          </Button>
        )}
      </div>

      {filteredRecipes.length ? (
        <ol className="mt-3 list-none divide-y border-y p-0">
          {filteredRecipes.map((recipe, index) => (
            <li key={recipe.url} className="min-w-0">
              <a
                href={recipe.url}
                className="group grid min-h-28 grid-cols-[2rem_minmax(0,1fr)_auto_1.25rem] items-center gap-3 py-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 sm:grid-cols-[2.5rem_minmax(0,1fr)_5.5rem_4rem_1.5rem] sm:gap-4 sm:py-5"
              >
                <span className="font-mono text-[11px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <strong className="truncate font-serif-jp text-lg font-semibold leading-snug tracking-tight sm:text-xl">{recipe.title}</strong>
                    <Badge variant="secondary" className="hidden sm:inline-flex">{recipe.category}</Badge>
                  </span>
                  <span className="mt-1.5 block truncate text-xs text-muted-foreground sm:text-sm">{recipe.description}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />{recipe.totalMinutes}分
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">{recipe.cuisine}</span>
                <ArrowRight className="size-4 text-foreground transition-transform group-hover:translate-x-1" />
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <Card className="mt-4 items-center border-dashed py-16 text-center shadow-none">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold">レシピが見つかりません</h3>
            <p className="mt-1 text-sm text-muted-foreground">検索語を変えるか、別のカテゴリを選んでください。</p>
          </div>
        </Card>
      )}
    </>
  )
}

