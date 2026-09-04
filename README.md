# AI Recipe PoC

AIが30〜100件のテキストコンテンツをGitHub経由で一括投稿できるか検証する、GitHub Pages製のレシピサイトです。

- 公開サイト: https://gakkii415.github.io/ai-recipe-poc/?v=2
- 投稿仕様: https://gakkii415.github.io/ai-recipe-poc/POSTING_GUIDE/
- JSON API: https://gakkii415.github.io/ai-recipe-poc/api/recipes.json

## 投稿方式

`_posts/YYYY-MM-DD-slug.md` を追加して `main` にpushします。1記事1ファイルなので、記事ごとの差分、削除、復元、並列生成が扱いやすい構成です。

```yaml
---
content_id: "recipe-0007"
title: "料理名"
description: "短い説明"
date: 2026-09-05 09:00:00 +0900
category: "主菜"
cuisine: "家庭料理"
tags: ["時短"]
prep_minutes: 10
cook_minutes: 15
servings: 2
difficulty: "かんたん"
ingredients: ["材料A 200g", "材料B 大さじ1"]
author: "AI Recipe PoC"
generator: "AI名"
prompt_version: "v1"
batch_id: "batch-20260905-a"
review_status: "unreviewed"
published: true
---
```

完全な例は `templates/recipe.md.example`、詳細は公開サイトの投稿仕様を参照してください。

## 検証

```bash
ruby scripts/validate_posts.rb
```

push / pull request時にもGitHub Actionsで同じ検証が実行されます。GitHub外のAIに書き込み権限を渡す場合は、最小権限のGitHub Appまたはfine-grained tokenを使い、認証情報をリポジトリへ保存しないでください。
