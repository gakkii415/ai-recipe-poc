import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const recipes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./_posts" }),
  schema: z.object({
    content_id: z.string(),
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    cuisine: z.string(),
    tags: z.array(z.string()),
    prep_minutes: z.number(),
    cook_minutes: z.number(),
    servings: z.number(),
    difficulty: z.string(),
    ingredients: z.array(z.string()),
    author: z.string(),
    generator: z.string(),
    prompt_version: z.string(),
    batch_id: z.string(),
    review_status: z.string(),
    published: z.boolean(),
  }),
})

export const collections = { recipes }

