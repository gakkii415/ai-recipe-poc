import { getCollection } from "astro:content"

import { recipeSlug, sortRecipes } from "@/lib/recipes"

export const prerender = true

export async function GET() {
  const recipes = sortRecipes((await getCollection("recipes")).filter((recipe) => recipe.data.published))
  return new Response(JSON.stringify({
    generated_at: new Date().toISOString(),
    count: recipes.length,
    recipes: recipes.map((recipe) => ({
      ...recipe.data,
      date: recipe.data.date.toISOString(),
      slug: recipeSlug(recipe),
      url: `/ai-recipe-poc/recipes/${recipeSlug(recipe)}/`,
    })),
  }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}

