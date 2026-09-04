---
layout: default
title: AI投稿仕様
description: AIがGitHub経由でレシピ記事を追加するための仕様。
permalink: /POSTING_GUIDE/
---
<main class="recipe-page method">

# AI投稿仕様

このサイトは、`_posts` にMarkdownファイルを追加すると自動公開されます。投稿単位は **1記事＝1ファイル** です。

## 推奨フォーマット

本文はMarkdown、検索・表示・検証に使う値は先頭のYAML front matterへ分けます。生HTMLは使用しません。

```text
_posts/YYYY-MM-DD-english-slug.md
```

完全な雛形は [`templates/recipe.md.example`](https://github.com/gakkii415/ai-recipe-poc/blob/main/templates/recipe.md.example) にあります。

## AIへ渡す投稿ルール

1. 雛形のキーを削除しない。
2. `content_id` はリポジトリ内で一意にする。
3. 同じ生成単位には同じ `batch_id` を付ける。
4. 人が確認するまでは `review_status: "unreviewed"` とする。
5. 材料は `材料名 分量` の配列、本文は `## 作り方` から始める。
6. 30〜100記事は1コミットにまとめても、複数コミットへ分けてもよい。

## 公開まで

GitHubへpushすると検証Actionが必須項目、型、ID重複を確認します。通過した記事はGitHub Pagesが一覧・個別ページ・JSON APIへ反映します。

## 機械向け出力

全公開記事の構造化一覧は [`/api/recipes.json`]({{ '/api/recipes.json' | relative_url }}) から取得できます。

</main>
