import { useEffect, useMemo, useRef, useState } from "react"
import { ChefHat, ChevronLeft, ChevronRight, Clock3, Cookie, Heart, Search, Soup, Utensils, Wheat, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSavedRecipes } from "@/lib/saved-recipes"
import type { RecipeImage } from "@/lib/recipe-images"

export type RecipeSummary = {
  title: string
  description: string
  category: string
  cuisine: string
  tags: string[]
  ingredients: string[]
  totalMinutes: number
  url: string
  image: RecipeImage
}
const PAGE_SIZE = 24
const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase("ja").trim()
const categoryIcon = (name: string) => /汁|スープ/.test(name) ? Soup : /主食|麺|ごはん/.test(name) ? Wheat : /おやつ|菓子|デザート/.test(name) ? Cookie : name === "すべて" ? Utensils : ChefHat

export function RecipeExplorer({ recipes }: { recipes: RecipeSummary[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("すべて")
  const [minutes, setMinutes] = useState(0)
  const [sort, setSort] = useState("default")
  const [onlySaved, setOnlySaved] = useState(false)
  const [page, setPage] = useState(1)
  const [ready, setReady] = useState(false)
  const resultsRef = useRef<HTMLHeadingElement>(null)
  const { saved, toggle, storageError } = useSavedRecipes()
  const savedSet = useMemo(() => new Set(saved), [saved])
  const categories = useMemo(() => ["すべて", ...Array.from(new Set(recipes.map((r) => r.category))).sort((a, b) => a.localeCompare(b, "ja"))], [recipes])
  const indexed = useMemo(() => recipes.map((recipe) => ({ recipe, text: normalize([recipe.title, recipe.description, recipe.category, recipe.cuisine, ...recipe.tags, ...recipe.ingredients].join(" ")) })), [recipes])

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search)
      setQuery(params.get("q") || "")
      const requestedCategory = params.get("category") || "すべて"
      setCategory(categories.includes(requestedCategory) ? requestedCategory : "すべて")
      const time = Number(params.get("time"))
      setMinutes([10, 15, 20, 30, 60].includes(time) ? time : 0)
      setSort(params.get("sort") === "quick" ? "quick" : "default")
      setOnlySaved(params.get("saved") === "1")
      const requestedPage = Number(params.get("page"))
      setPage(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1)
      setReady(true)
    }
    restore()
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [categories])

  const filtered = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean)
    const matches = indexed.filter(({ recipe, text }) =>
      (category === "すべて" || recipe.category === category) &&
      (!minutes || recipe.totalMinutes <= minutes) &&
      (!onlySaved || savedSet.has(recipe.url)) &&
      words.every((word) => text.includes(word)),
    ).map(({ recipe }) => recipe)
    return sort === "quick" ? matches.sort((a, b) => a.totalMinutes - b.totalMinutes) : matches
  }, [indexed, category, query, minutes, onlySaved, savedSet, sort])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const shown = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    if (!ready) return
    const url = new URL(window.location.href)
    const values: Record<string, string> = { q: query, category: category === "すべて" ? "" : category, time: minutes ? String(minutes) : "", sort: sort === "default" ? "" : sort, saved: onlySaved ? "1" : "", page: currentPage > 1 ? String(currentPage) : "" }
    for (const [key, value] of Object.entries(values)) value ? url.searchParams.set(key, value) : url.searchParams.delete(key)
    window.history.replaceState(window.history.state, "", url)
  }, [query, category, minutes, sort, onlySaved, currentPage, ready])

  function reset() { setQuery(""); setCategory("すべて"); setMinutes(0); setOnlySaved(false); setPage(1) }
  function changePage(next: number) {
    setPage(next)
    resultsRef.current?.focus({ preventScroll: true })
    resultsRef.current?.scrollIntoView({ block: "start", behavior: "auto" })
  }
  const hasFilters = Boolean(query || category !== "すべて" || minutes || onlySaved)
  const title = onlySaved ? "保存したレシピ" : query ? `「${query}」のレシピ` : category === "すべて" ? "すべてのレシピ" : `${category}のレシピ`

  return <div className="recipe-explorer" data-ready={ready} data-recipe-total={recipes.length}>
    <form className="search-capsule" role="search" aria-label="レシピ検索" onSubmit={(event) => { event.preventDefault(); setPage(1); resultsRef.current?.focus({ preventScroll: true }); resultsRef.current?.scrollIntoView({ block: "start", behavior: "auto" }) }}>
      <div className="search-term">
        <label htmlFor="recipe-search">料理名・食材</label>
        <Input id="recipe-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="何をつくりますか？" autoComplete="off" />
      </div>
      <div className="search-time">
        <label htmlFor="recipe-time">調理時間</label>
        <select id="recipe-time" value={minutes} onChange={(event) => { setMinutes(Number(event.target.value)); setPage(1) }}>
          <option value={0}>指定なし</option>
          {[10, 15, 20, 30, 60].map((time) => <option key={time} value={time}>{time}分以内</option>)}
        </select>
      </div>
      <Button type="submit" size="icon" className="search-submit" aria-label="レシピを検索"><Search size={21} aria-hidden="true" /></Button>
    </form>

    <div className="category-strip" role="group" aria-label="カテゴリで絞り込み">
      {categories.map((item) => {
        const Icon = categoryIcon(item)
        return <button type="button" key={item} className="category-tab" aria-pressed={category === item} onClick={() => { setCategory(item); setPage(1) }}><Icon size={24} strokeWidth={1.6} aria-hidden="true" /><span>{item}</span></button>
      })}
    </div>

    <div className="result-toolbar">
      <div>
        <h2 ref={resultsRef} id="recipes-title" tabIndex={-1}>{title}</h2>
        <p className="result-count" role="status" aria-live="polite"><strong>{filtered.length}</strong>件{minutes > 0 ? ` · ${minutes}分以内` : ""}</p>
      </div>
      <div className="result-controls">
        <Button type="button" variant="outline" className="saved-filter" aria-pressed={onlySaved} onClick={() => { setOnlySaved(!onlySaved); setPage(1) }}><Heart size={16} aria-hidden="true" /><span>保存済み</span></Button>
        <label className="sort-control"><span className="sr-only">並び順</span><select aria-label="並び順" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }}><option value="default">掲載順</option><option value="quick">時間が短い順</option></select></label>
      </div>
    </div>
    {hasFilters && <div className="active-filters"><Button type="button" variant="ghost" size="sm" onClick={reset}><X size={14} aria-hidden="true" />条件をリセット</Button></div>}
    {storageError && <p className="storage-warning" role="status">端末への保存ができません。この画面を閉じると保存内容が失われます。</p>}

    {shown.length ? <ol className="recipe-grid" aria-label="レシピ一覧">
      {shown.map((recipe, index) => <li key={recipe.url} className="recipe-card" data-minutes={recipe.totalMinutes}>
        <div className="recipe-photo">
          <a href={recipe.url} tabIndex={-1} aria-hidden="true" className="photo-link">
            <img src={recipe.image.src} alt="" width={720} height={720} loading={index < 6 ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.closest(".recipe-photo")?.classList.add("photo-unavailable") }} />
            <span className="photo-fallback"><ChefHat size={32} strokeWidth={1.3} /><span>写真を表示できません</span></span>
          </a>
          {recipe.totalMinutes <= 15 && <span className="time-badge">{recipe.totalMinutes}分でつくれる</span>}
          <button type="button" className="save-button" aria-pressed={savedSet.has(recipe.url)} aria-label={`${recipe.title}を${savedSet.has(recipe.url) ? "保存から外す" : "保存する"}`} onClick={() => toggle(recipe.url)}><Heart size={21} fill={savedSet.has(recipe.url) ? "currentColor" : "none"} aria-hidden="true" /></button>
          {recipe.image.reference && <span className="reference-label">イメージ</span>}
        </div>
        <a href={recipe.url} className="recipe-card-title"><h3>{recipe.title}</h3></a>
        <p className="recipe-meta">{recipe.category} · {recipe.cuisine}</p>
        <p className="recipe-duration"><Clock3 size={13} aria-hidden="true" /><strong>{recipe.totalMinutes}</strong>分<span>で完成</span></p>
      </li>)}
    </ol> : <div className="empty-results"><Search size={32} strokeWidth={1.4} aria-hidden="true" /><h3>{onlySaved && !saved.length ? "気になるレシピを保存しましょう" : "レシピが見つかりません"}</h3><p>{onlySaved && !saved.length ? "写真のハートを押すと、ここからすぐに見返せます。" : "食材や調理時間の条件を変えてみてください。"}</p><Button type="button" variant="outline" onClick={reset}>すべてのレシピを見る</Button></div>}

    {pageCount > 1 && <nav className="recipe-pagination" aria-label="レシピ一覧のページ切り替え"><Button type="button" variant="outline" size="icon" aria-label="前のページ" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}><ChevronLeft size={18} /></Button><span><strong>{currentPage}</strong> / {pageCount}</span><Button type="button" variant="outline" size="icon" aria-label="次のページ" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}><ChevronRight size={18} /></Button></nav>}
    <p className="image-disclaimer">「イメージ」は参考写真です。掲載レシピの完成写真ではありません。</p>
    <noscript><p>検索・絞り込み・保存にはJavaScriptが必要です。全レシピは<a href="./POSTING_GUIDE/">投稿仕様</a>に記載のJSON APIからも確認できます。</p></noscript>
  </div>
}
