# AI Recipe PoC

AIが大量のテキストコンテンツを、独立タスク・別AIレビュー・選択的修正を通してGitHubへ投稿できるか検証する、GitHub Pages製のレシピサイトです。現在は既存41記事と生産ラインv2の試験50記事、計91記事を収録しています。

- 公開サイト: https://gakkii415.github.io/ai-recipe-poc/?v=5
- 投稿仕様: https://gakkii415.github.io/ai-recipe-poc/POSTING_GUIDE/
- JSON API: https://gakkii415.github.io/ai-recipe-poc/api/recipes.json
- 生産ライン: [PIPELINE.md](PIPELINE.md)

## 生産方式

人が1回開始すると、親が題材を5件ずつの独立タスクへ分割します。各タスクは専用ブランチへだけ書き込み、親が統合します。その後、執筆者とは別のAIが10件ずつレビューし、不合格記事だけを修正タスクへ送ります。

```text
企画 → 5件×並列生成 → 親統合 → 機械検査 → 10件×別AIレビュー
                                      ↓
                              不合格だけ修正
                                      ↓
                                 再検査 → 公開
```

## 投稿方式

`_posts/YYYY-MM-DD-slug.md` を追加します。1記事1ファイルなので、記事ごとの差分、削除、復元、並列生成を扱えます。完全な例は `templates/recipe.md.example`、詳細は投稿仕様を参照してください。

## 検証

```bash
ruby scripts/validate_posts.rb
```

push / pull request時にもGitHub Actionsで同じ検証が実行されます。AIへ書き込み権限を渡す場合は、最小権限のGitHub Appまたはfine-grained tokenを使い、認証情報をリポジトリへ保存しないでください。
