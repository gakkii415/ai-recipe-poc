# Front-end direction — v9

This scoped direction supersedes the earlier text-only/serif Project Direction in the root DESIGN.md for the reader-facing front end. The root's managed design principles still apply.

## Accepted brief

A growing recipe archive, not a landing page or a company homepage. Preserve all existing Markdown posts, slugs, publication metadata, JSON API and automated publishing. Apply shared templates once; never rewrite every recipe to change its appearance.

## Reference

Refero Styles / Airbnb listing interface: https://styles.refero.design/style/c2325884-4391-4688-85cd-e143f5107517

Observed the reference screenshot and design description: white canvas; centered segmented pill search; compact underlined navigation; rounded square photographs; unboxed metadata; restrained dark text; coral only for key actions. The recipe adaptation uses those visual relationships, not Airbnb logos, proprietary fonts, text, rating claims, accommodation filters or booking flows.

Compared editorial horizontal shelves against a searchable full-catalogue grid. The latter fits bulk publishing: search, categories, 24-item pages and short recipe metadata are available immediately without a marketing hero. New categories are derived from the content rather than hardcoded in the interface.

## Shared visual rules

- White #ffffff, text #222222, secondary text #6a6a6a, dividers #ebebeb, supporting surfaces #f7f7f7. Coral #ff385c is limited to the brand mark, search action and saved states.
- System Japanese-capable sans serif, ordinary readable headings, no giant editorial heading above the actual content.
- Main width up to 1480px. Responsive 2–6 column photo grid. No card border/shadow; radius 12–14px belongs to photography. Search alone uses a soft shadow and pill shape.
- Search by recipe/ingredient, category, total preparation + cooking time; sort by catalogue order or shorter time. URL query parameters retain filters when returning from a recipe. No invented popularity/review/star indicators.
- Desktop detail: recipe summary and reference photo, then materials beside preparation steps. Mobile: compact summary, readable ingredients/steps and fixed material/method shortcuts. Materials have genuine checkboxes, not decorative checkbox shapes.
- Favourites are stored on the current browser only, under kitchen-index:saved-recipes:v1. Storage failure must be shown rather than claiming persistence. No login or server-side personal data.

## Photography and posting

Existing posts have no verified completed-dish photographs. All fallback Unsplash category/dish reference photographs must visibly say イメージ and must never be represented as photographs of the specific recipe. Detail caption and list footnote repeat this distinction. Reference photographs are excluded from Recipe structured data.

Real recipe photographs can be attached without changing the UI by optional front matter:

```yaml
image: /images/recipes/example.jpg
image_alt: 実際に調理した料理の写真の説明
```

An HTTPS URL is also supported. Root-relative paths are resolved under the configured Astro BASE_URL. The real photograph must match the recipe and the uploader must have permission to use it. Existing articles do not need these optional fields.

## Verification

The existing content validator and Astro type-check/static build remain required. tests/recipe-browser.mjs verifies search, time/category filters, pagination, saved states, detail checkboxes, existing recipe routes, no-JavaScript links and mobile overflow. CI screenshots in the recipe-browser-evidence artifact are for review, not a claim that automated functional tests establish design quality.
