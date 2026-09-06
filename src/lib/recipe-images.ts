// Reference photographs are not photographs of the specific recipe.
// Optional image/image_alt front matter takes priority over these fallbacks.
export type RecipeImage = { src: string; alt: string; reference: boolean }
type ImageInput = { title: string; category: string; image?: string; image_alt?: string }
const photos = {
  salad: "photo-1512621776951-a57141f2eefd",
  pasta: "photo-1473093295043-cdd812d0e601",
  fish: "photo-1467003909585-2f8a72700288",
  soup: "photo-1547592166-23ac45744acd",
  // Tadahiro Higuchi: https://unsplash.com/photos/yKOHJmQP8-A
  rice: "photo-1754292148609-0d0a33282ff9",
  // Ella Olsson: https://unsplash.com/photos/4dQiaWKiL-Y
  sweetPotato: "photo-1543352634-99a5d50ae78e",
  meat: "photo-1544025162-d76694265947",
  chicken: "photo-1532550907401-a500c9a57435",
  pancakes: "photo-1506084868230-bb9d95c24759",
  toast: "photo-1484723091739-30a097e8f929",
  dessert: "photo-1488477181946-6428a0291777",
  curry: "photo-1603894584373-5ac82b2ae398",
  noodles: "photo-1569718212165-3a8278d5f624",
} as const

export function recipeImage(data: ImageInput): RecipeImage {
  if (data.image && (/^https:\/\//.test(data.image) || /^\/(?!\/)/.test(data.image))) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "")
    const src = data.image.startsWith("/") && !data.image.startsWith(`${base}/`)
      ? `${base}${data.image}` : data.image
    return { src, alt: data.image_alt || data.title, reference: false }
  }
  const title = data.title
  let key: keyof typeof photos = "salad"
  if (/さつまいも|さつま芋|サツマイモ/.test(title)) key = "sweetPotato"
  else if (/パンケーキ|ホットケーキ/.test(title)) key = "pancakes"
  else if (/トースト|サンド|パン/.test(title)) key = "toast"
  else if (/プリン|ヨーグルト|ゼリー|ケーキ|クランブル|オーツ|甘味|おやつ|デザート/.test(title + data.category)) key = "dessert"
  else if (/パスタ|スパゲ|ペンネ|マカロニ/.test(title)) key = "pasta"
  else if (/うどん|そば|そうめん|にゅうめん|麺|ヌードル/.test(title)) key = "noodles"
  else if (/カレー/.test(title)) key = "curry"
  else if (/スープ|汁|ポタージュ/.test(title + data.category)) key = "soup"
  else if (/ご飯|ごはん|丼|おにぎり|リゾット|ピラフ|炒飯|チャーハン|炊き込み|粥|かゆ/.test(title)) key = "rice"
  else if (/鮭|さけ|サーモン|さば|サバ|鯖|たら|タラ|魚|えび|エビ|ぶり|ブリ/.test(title)) key = "fish"
  else if (/鶏|チキン|ささみ|手羽/.test(title)) key = "chicken"
  else if (/牛|豚|肉|ハンバーグ/.test(title)) key = "meat"
  return {
    src: `https://images.unsplash.com/${photos[key]}?auto=format&fit=crop&w=720&q=80`,
    alt: "料理の参考写真（このレシピの完成写真ではありません）",
    reference: true,
  }
}
