import type { CollectionEntry } from "astro:content"

export type Recipe = CollectionEntry<"recipes">

export function recipeSlug(recipe: Recipe) {
  return recipe.id
    .replace(/\.md$/, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
}

export function recipeUrl(recipe: Recipe) {
  return `/ai-recipe-poc/recipes/${recipeSlug(recipe)}/`
}

export function sortRecipes(recipes: Recipe[]) {
  return recipes.sort((a, b) => {
    const byDate = b.data.date.getTime() - a.data.date.getTime()
    return byDate || a.data.title.localeCompare(b.data.title, "ja")
  })
}

