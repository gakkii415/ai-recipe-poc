# AI Recipe PoC

AIが大量のテキストコンテンツを、GitHub経由で安全に投稿・検証・公開できるか確認するレシピサイトです。現在は91記事を収録しています。

- 公開サイト: https://gakkii415.github.io/ai-recipe-poc/?v=7
- 投稿仕様: https://gakkii415.github.io/ai-recipe-poc/POSTING_GUIDE/
- JSON API: https://gakkii415.github.io/ai-recipe-poc/api/recipes.json

## フロントエンド

v7でJekyllから次の構成へ移行しました。

- Astro 5（静的サイト生成）
- React 19
- Tailwind CSS 4
- shadcn CLI 4.21.0
- shadcn/ui（new-york・Radix・neutral）
- GitHub Actions / GitHub Pages

shadcn/uiのコンポーネントは依存パッケージではなく、`src/components/ui` にソースとして置いています。デザインの正本は、共通レイアウト、UIコンポーネント、デザイントークンです。

## 投稿方式

`_posts/YYYY-MM-DD-slug.md` を追加します。記事ファイルはAstroのContent Layerが読み込み、一覧、個別ページ、JSON APIを一括生成します。記事ごとにHTMLを編集する必要はありません。

完全な雛形は `templates/recipe.md.example`、詳細は投稿仕様を参照してください。

## 開発

```bash
npm install
npm run dev
npm run check
npm run build
npm run shadcn -- info
```

`npm run build` は型検査後、トップ、404、投稿仕様、JSON API、91件の記事詳細を含む94ページを生成します。

## 検証と公開

Pull Requestとmainへのpushで、記事構造検査とAstroビルドを実行します。mainの検査通過後、生成済みの `dist` をGitHub Pagesへ配信します。
