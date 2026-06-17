export type Ingredient = {
  name: string;
  amount: number;
  unit: string;
};

export type Dish = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  imagePrompt: string;
  // Optional: Google Images yoki boshqa manbadan olingan rasm URL'i
  // Agar imageUrl mavjud bo'lsa, bu ishlatiladi. Yo'q bo'lsa, Unsplash dan oladi
  imageUrl?: string;
  category: "Palov" | "Sho'rva" | "Xamir taomi" | "Go'sht taomi" | "Boshqa";
  timeMinutes: number;
  difficulty: "Oson" | "O'rtacha" | "Qiyin";
  caloriesPerServing: number;
  baseServings: number;
  ingredients: Ingredient[];
  steps: string[];
};

export function dishImageUrl(dish: Dish, width = 600, height = 400) {
  // Agar dish uchun custom imageUrl mavjud bo'lsa (Google Images yoki boshqa manbadan), uni ishlatamiz
  // Bu rasm URL'ini code'da qo'ysangiz, Unsplash o'rniga bu ishlatilib yuborilar
  if (dish.imageUrl) {
    return dish.imageUrl;
  }

  // Agar imageUrl bo'lmasa, avtomatik ravishda Unsplash API dan qidiramiz
  // imagePrompt'dan smart so'zlar olamiz (masalan: "plov,rice,lamb,uzbek")
  const searchQuery = extractSearchTerms(dish.name, dish.imagePrompt);
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchQuery)}&orientation=landscape`;
}

function extractSearchTerms(name: string, imagePrompt: string): string {
  // Extract meaningful food terms from the imagePrompt
  const foodTerms = imagePrompt
    .toLowerCase()
    .split(/[,.\s]+/)
    .filter(word => word.length > 2 && !['with', 'and', 'the', 'large', 'small'].includes(word))
    .slice(0, 4)
    .join(',');

  return `${name},uzbek,${foodTerms}`.substring(0, 100);
}

function simpleHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * RASMLARNI QO'SHISH BO'YICHA KO'RSATMA:
 *
 * Har bir taom uchun quyidagi variantlar mavjud:
 *
 * VARIANT 1: Google Images'dan rasm olib, URL'ini qo'yish (TAVSIYA!)
 * 1. Google'da "O'zbek plov" yoki "Uzbek plov" nomi bilan izlab rasm toping
 * 2. Rasm ustiga o'ng click → "Rasm URL'ini kopiyalash"
 * 3. Quyiga imageUrl: "PASTED_URL" qo'ying
 *
 * MISOL:
 * imageUrl: "https://images.unsplash.com/photo-1575521521762-0...jpg",
 *
 * VARIANT 2: Avtomatik Unsplash (default)
 * Agar imageUrl bo'lmasa, avtomatik ravishda Unsplash'dan topadi
 *
 * VARIANT 3: CDN yoki boshqa URL
 * Har qanday ishonchli manbadan rasm URL'ini qo'llanishingiz mumkin
 */

export const DISHES: Dish[] = [
  {
    slug: "uzbek-oshi",
    name: "O'zbek Oshi",
    description: "Klassik o'zbek palovi — guruch, go'sht, sabzi va ziravorlar bilan.",
    emoji: "🍚",
    imagePrompt: "Traditional Uzbek plov rice pilaf with lamb chunks carrots and garlic in a large kazan",
    imageUrl: "https://i.ytimg.com/vi/Pibw57XcwW8/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGH8gWigsMA8=&rs=AOn4CLCmwFCovQ5iPKnQfptbjyC5oGdGUg",
    category: "Palov",
    timeMinutes: 90,
    difficulty: "O'rtacha",
    caloriesPerServing: 620,
    baseServings: 4,
    ingredients: [
      { name: "Guruch (devzira)", amount: 500, unit: "g" },
      { name: "Qo'y go'shti", amount: 500, unit: "g" },
      { name: "Sabzi", amount: 500, unit: "g" },
      { name: "Piyoz", amount: 2, unit: "dona" },
      { name: "Paxta moyi", amount: 150, unit: "ml" },
      { name: "Sarimsoq", amount: 2, unit: "bosh" },
      { name: "Zira", amount: 1, unit: "ch.q" },
      { name: "Tuz", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Guruchni iliq suvda 1 soat ivitib qo'ying.",
      "Qozonda moyni qizdiring, piyozni tilib qovuring.",
      "Go'shtni bo'laklarga bo'lib qo'shing va qizartiring.",
      "Sabzini cho'p shaklida to'g'rab qo'shing, 10 daqiqa qovuring.",
      "Tuz, zira qo'shib, qaynoq suv quying va 20 daqiqa zirvak pishiring.",
      "Guruchni ustiga teng yoying, suvini sozlab qo'ying.",
      "Suv qaynagach olovni pasaytirib, qopqoq yopib 25 daqiqa damlang.",
      "Sarimsoq boshlarini ustiga qo'yib, yana 10 daqiqa damlang. Aralashtirib torting.",
    ],
  },
  {
    slug: "toy-oshi",
    name: "To'y Oshi",
    description: "Katta to'y va marosimlarga atalgan dabdabali palov.",
    emoji: "🎉",
    imagePrompt: "Festive Uzbek wedding plov with raisins chickpeas and beef on a large platter",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7WMKeOSFKvc4-wLpW7GQeubuM5ThGQ-F2oQ&s",
    category: "Palov",
    timeMinutes: 120,
    difficulty: "Qiyin",
    caloriesPerServing: 700,
    baseServings: 6,
    ingredients: [
      { name: "Devzira guruch", amount: 1000, unit: "g" },
      { name: "Mol go'shti", amount: 800, unit: "g" },
      { name: "Sabzi", amount: 1000, unit: "g" },
      { name: "Piyoz", amount: 3, unit: "dona" },
      { name: "Paxta moyi", amount: 300, unit: "ml" },
      { name: "Nahot", amount: 100, unit: "g" },
      { name: "Mayiz", amount: 50, unit: "g" },
      { name: "Zira, tuz", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Nahotni bir kechada ivitib qo'ying.",
      "Guruchni yuvib, iliq suvda ivitib qo'ying.",
      "Qozonda moyni qattiq qizdiring.",
      "Piyozni tilib qovuring, so'ng go'shtni qo'shing.",
      "Sabzini qo'shib aralashtiring, ziravorlar bilan tuzlang.",
      "Suv quyib, nahot va mayizni qo'shing, zirvakni damlang.",
      "Guruchni yoyib, suvini sozlang va damlang.",
      "Tayyor palovni laganga chiroyli torting.",
    ],
  },
  {
    slug: "mastava",
    name: "Mastava",
    description: "Guruchli, qovurilgan go'shtli quyuq sho'rva.",
    emoji: "🥣",
    imagePrompt: "Uzbek mastava rice and beef soup in a ceramic bowl with herbs",
    imageUrl: "https://png.klev.club/uploads/posts/2024-05/png-klev-club-tb61-p-mastava-png-1.png",
    category: "Sho'rva",
    timeMinutes: 60,
    difficulty: "Oson",
    caloriesPerServing: 380,
    baseServings: 4,
    ingredients: [
      { name: "Mol go'shti", amount: 300, unit: "g" },
      { name: "Guruch", amount: 150, unit: "g" },
      { name: "Sabzi", amount: 1, unit: "dona" },
      { name: "Piyoz", amount: 1, unit: "dona" },
      { name: "Kartoshka", amount: 2, unit: "dona" },
      { name: "Pomidor", amount: 2, unit: "dona" },
      { name: "Tuz, ziravor", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Go'shtni mayda to'g'rab, piyoz, sabzi bilan qovuring.",
      "Pomidor qo'shib aralashtiring.",
      "Kartoshkani kubchalab qo'shing.",
      "Suv quyib qaynating, guruchni qo'shing.",
      "Tuz, ziravor solib 20 daqiqa pishiring.",
      "Ko'katlar bilan tortiltadi.",
    ],
  },
  {
    slug: "shorva",
    name: "Sho'rva",
    description: "Yog'li go'shtli, kartoshkali milliy sho'rva.",
    emoji: "🍲",
    imagePrompt: "Uzbek shurpa lamb soup with potatoes carrots and tomatoes in a clay bowl",
    imageUrl: "https://i.ytimg.com/vi/Fiy14_X7KTw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDS4GM1JPL8cGwY2xVJLhsn7tNa9g",
    category: "Sho'rva",
    timeMinutes: 90,
    difficulty: "Oson",
    caloriesPerServing: 420,
    baseServings: 4,
    ingredients: [
      { name: "Qo'y go'shti (suyak bilan)", amount: 600, unit: "g" },
      { name: "Kartoshka", amount: 4, unit: "dona" },
      { name: "Sabzi", amount: 2, unit: "dona" },
      { name: "Piyoz", amount: 1, unit: "dona" },
      { name: "Pomidor", amount: 2, unit: "dona" },
      { name: "Tuz, qalampir", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Go'shtni suvga solib qaynating, ko'pikni oling.",
      "Piyoz, sabzini qo'shing.",
      "1 soat past olovda pishiring.",
      "Kartoshka va pomidorni qo'shib yana 20 daqiqa pishiring.",
      "Tuz, ziravor solib, ko'kat bilan torting.",
    ],
  },
  {
    slug: "chuchvara",
    name: "Chuchvara",
    description: "Mayda go'shtli xamir tugunchalari — sho'rvada qaynatib iste'mol qilinadi.",
    emoji: "🥟",
    imagePrompt: "Uzbek chuchvara tiny meat dumplings in clear broth with herbs",
    imageUrl: "https://i.ytimg.com/vi/3w2PtsLvaN0/sddefault.jpg",
    category: "Xamir taomi",
    timeMinutes: 90,
    difficulty: "Qiyin",
    caloriesPerServing: 350,
    baseServings: 4,
    ingredients: [
      { name: "Un", amount: 500, unit: "g" },
      { name: "Tuxum", amount: 1, unit: "dona" },
      { name: "Mol go'shti (qiyma)", amount: 300, unit: "g" },
      { name: "Piyoz", amount: 2, unit: "dona" },
      { name: "Tuz, qalampir", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Un, tuxum, tuz va suvdan qattiq xamir qoring, 30 daqiqa damlang.",
      "Qiymaga maydalangan piyoz, tuz, qalampir aralashtiring.",
      "Xamirni yoyib, kichik kvadratlarga bo'ling.",
      "Har biriga qiyma qo'yib, uchburchak shaklida yopishtiring.",
      "Qaynayotgan tuzlangan suvga tashlab 7-10 daqiqa qaynating.",
      "Qatiq yoki sho'rva bilan iste'mol qiling.",
    ],
  },
  {
    slug: "manti",
    name: "Manti",
    description: "Bug'da pishiriladigan yirik go'shtli xamir taomi.",
    emoji: "🥟",
    imagePrompt: "Uzbek manti large steamed meat dumplings on a wooden platter with sour cream",
    imageUrl: "https://i.ytimg.com/vi/LWKj9vbZBgM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBZZcUg1FG3UzhRknnmYigYrnpnCw",
    category: "Xamir taomi",
    timeMinutes: 90,
    difficulty: "O'rtacha",
    caloriesPerServing: 480,
    baseServings: 4,
    ingredients: [
      { name: "Un", amount: 500, unit: "g" },
      { name: "Suv", amount: 250, unit: "ml" },
      { name: "Mol go'shti", amount: 500, unit: "g" },
      { name: "Piyoz", amount: 3, unit: "dona" },
      { name: "Quyruq yog'i", amount: 100, unit: "g" },
      { name: "Tuz, qalampir", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Undan zich xamir qoring, 30 daqiqa damlang.",
      "Go'shtni mayda chopib, piyoz va yog' bilan aralashtiring, tuzlang.",
      "Xamirni yoyib, kvadratlarga bo'lib qiyma qo'ying.",
      "Mantini moyli mantishnikga terib qo'ying.",
      "40-45 daqiqa bug'da pishiring.",
      "Qatiq yoki qaymoq bilan torting.",
    ],
  },
  {
    slug: "norin",
    name: "Norin",
    description: "Mayda to'g'ralgan xamir va go'shtdan tayyorlanadigan an'anaviy taom.",
    emoji: "🍜",
    imagePrompt: "Uzbek norin thinly sliced dough noodles with horse meat and onions on a flat plate",
    imageUrl: "https://arbuz.com/wp-content/uploads/2010/01/20091228-Cooking-1682-Edit.jpg",
    category: "Xamir taomi",
    timeMinutes: 120,
    difficulty: "Qiyin",
    caloriesPerServing: 520,
    baseServings: 4,
    ingredients: [
      { name: "Qazi yoki dudlangan go'sht", amount: 500, unit: "g" },
      { name: "Un", amount: 400, unit: "g" },
      { name: "Tuxum", amount: 1, unit: "dona" },
      { name: "Piyoz", amount: 2, unit: "dona" },
      { name: "Tuz, qalampir", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Go'shtni qaynatib oling, sovutib mayda to'g'rang.",
      "Undan qattiq xamir qoring, yupqa yoying.",
      "Xamirni qaynoq suvda pishirib, sovutib mayda to'g'rang.",
      "Go'sht va xamirni aralashtiring, piyoz, qalampir qo'shing.",
      "Issiq sho'rva bilan torting.",
    ],
  },
  {
    slug: "lagmon",
    name: "Lag'mon",
    description: "Cho'zilgan ugradan tayyorlanadigan go'shtli, sabzavotli taom.",
    emoji: "🍜",
    imagePrompt: "Uzbek lagman hand-pulled noodles with beef bell peppers tomatoes in a deep bowl",
    imageUrl: "https://avatars.mds.yandex.net/get-altay/6950449/2a0000018499c1e8b9cff1bd6f070248fa41/L_height",
    category: "Xamir taomi",
    timeMinutes: 90,
    difficulty: "O'rtacha",
    caloriesPerServing: 550,
    baseServings: 4,
    ingredients: [
      { name: "Lag'mon ugrasi", amount: 500, unit: "g" },
      { name: "Mol go'shti", amount: 400, unit: "g" },
      { name: "Bolgar qalampir", amount: 2, unit: "dona" },
      { name: "Pomidor", amount: 3, unit: "dona" },
      { name: "Piyoz", amount: 1, unit: "dona" },
      { name: "Sarimsoq", amount: 3, unit: "tish" },
      { name: "Sabzi", amount: 1, unit: "dona" },
      { name: "Tuz, ziravor", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Go'shtni mayda bo'laklab moyda qovuring.",
      "Piyoz, sabzi, qalampirni qo'shib aralashtiring.",
      "Pomidor va sarimsoq qo'shing.",
      "Suv quyib qaynating, tuz va ziravor solib 30 daqiqa pishiring.",
      "Ugrani alohida qaynatib, sovuq suvda chayqang.",
      "Kosaga ugra solib, ustiga vajini quyib torting.",
    ],
  },
  {
    slug: "dimlama",
    name: "Dimlama",
    description: "Go'sht va sabzavotlarni qatlab dimlangan to'yimli taom.",
    emoji: "🥘",
    imagePrompt: "Uzbek dimlama slow-cooked layered lamb stew with cabbage potatoes carrots in a kazan",
    imageUrl: "https://i.ytimg.com/vi/wltrOi1WbTY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB1zHWRGUm89qgRRu8WsBjbekWPOA",
    category: "Go'sht taomi",
    timeMinutes: 120,
    difficulty: "Oson",
    caloriesPerServing: 480,
    baseServings: 4,
    ingredients: [
      { name: "Qo'y go'shti", amount: 600, unit: "g" },
      { name: "Kartoshka", amount: 4, unit: "dona" },
      { name: "Sabzi", amount: 2, unit: "dona" },
      { name: "Piyoz", amount: 2, unit: "dona" },
      { name: "Karam", amount: 0.5, unit: "bosh" },
      { name: "Pomidor", amount: 2, unit: "dona" },
      { name: "Tuz, ziravor", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Qozon tubiga yog' yoki dum yog'ini soling.",
      "Go'shtni qatlab teringizda joylang.",
      "Ustidan piyoz, sabzi, kartoshka, pomidorni qatlab joylang.",
      "Tepasiga karam barglarini yoping.",
      "Tuz, ziravor sepib, qopqoqni mahkam yoping.",
      "1.5 soat past olovda dimlang.",
    ],
  },
  {
    slug: "qozon-kabob",
    name: "Qozon Kabob",
    description: "Qozonda qovurilgan yumshoq go'sht va kartoshka.",
    emoji: "🥩",
    imagePrompt: "Uzbek kazan kebab tender lamb chunks with whole potatoes and onion rings",
    imageUrl: "https://i.ytimg.com/vi/YA6qB27WZD0/maxresdefault.jpg",
    category: "Go'sht taomi",
    timeMinutes: 60,
    difficulty: "Oson",
    caloriesPerServing: 600,
    baseServings: 4,
    ingredients: [
      { name: "Qo'y go'shti", amount: 800, unit: "g" },
      { name: "Kartoshka", amount: 6, unit: "dona" },
      { name: "Piyoz", amount: 2, unit: "dona" },
      { name: "Paxta moyi", amount: 100, unit: "ml" },
      { name: "Tuz, ziravor", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Qozonda moyni qizdiring.",
      "Go'shtni bo'laklab qovuring, qizarguncha kuting.",
      "Tuz, ziravor sepib aralashtiring.",
      "Kartoshkani po'st bilan butun qo'shing.",
      "Qopqoq yopib past olovda 40 daqiqa pishiring.",
      "Piyoz halqalari bilan torting.",
    ],
  },
  {
    slug: "somsa",
    name: "Somsa",
    description: "Tandirda yoki pechkada pishirilgan go'shtli xamir mahsuloti.",
    emoji: "🥟",
    imagePrompt: "Uzbek samsa baked triangular meat pastry with sesame seeds on top",
    imageUrl: "https://i.ytimg.com/vi/cUNSCE4Na7c/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLClHSOL3y5pfNXHeYjcIzou-ZFaAA",
    category: "Xamir taomi",
    timeMinutes: 120,
    difficulty: "O'rtacha",
    caloriesPerServing: 410,
    baseServings: 6,
    ingredients: [
      { name: "Un", amount: 600, unit: "g" },
      { name: "Suv", amount: 300, unit: "ml" },
      { name: "Mol go'shti", amount: 500, unit: "g" },
      { name: "Piyoz", amount: 3, unit: "dona" },
      { name: "Quyruq yog'i", amount: 100, unit: "g" },
      { name: "Tuxum (sirti uchun)", amount: 1, unit: "dona" },
    ],
    steps: [
      "Undan qattiq xamir qoring, damlang.",
      "Go'shtni mayda chopib, piyoz va yog' bilan aralashtiring.",
      "Xamirni yoyib, kvadratlarga bo'ling.",
      "Qiyma qo'yib, uchburchak shaklida yopishtiring.",
      "Sirtiga tuxum sariqligini surting, kunjut seping.",
      "200°C da 25-30 daqiqa pishiring.",
    ],
  },
  {
    slug: "shashlik",
    name: "Shashlik",
    description: "Ko'mirda pishirilgan yumshoq go'sht — milliy kabob.",
    emoji: "🍢",
    imagePrompt: "Uzbek shashlik grilled lamb skewers with onions over charcoal, smoky",
    imageUrl: "https://recipeworld.blog/recipes/shashlik.webp",
    category: "Go'sht taomi",
    timeMinutes: 60,
    difficulty: "O'rtacha",
    caloriesPerServing: 520,
    baseServings: 4,
    ingredients: [
      { name: "Qo'y go'shti", amount: 800, unit: "g" },
      { name: "Piyoz", amount: 3, unit: "dona" },
      { name: "Sirka", amount: 50, unit: "ml" },
      { name: "Tuz, qalampir, zira", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Go'shtni 3-4 sm bo'laklab to'g'rang.",
      "Piyoz halqalari, sirka va ziravorlarda 2-3 soat marinad qiling.",
      "Sixlarga go'sht va yog' bo'laklarini almashlab terib chiqing.",
      "Cho'g'da har tomonini 4-5 daqiqadan pishiring.",
      "Piyoz va non bilan torting.",
    ],
  },
  {
    slug: "moshxorda",
    name: "Moshxo'rda",
    description: "Mosh va guruchdan tayyorlanadigan to'yimli sho'rva.",
    emoji: "🍵",
    imagePrompt: "Uzbek mash khurda mung bean and rice soup with beef in a bowl",
    imageUrl: "https://www.chakchak.uz/uploads/images/reciepts/72e038485cae55fa.jpg",
    category: "Sho'rva",
    timeMinutes: 90,
    difficulty: "Oson",
    caloriesPerServing: 360,
    baseServings: 4,
    ingredients: [
      { name: "Mosh", amount: 200, unit: "g" },
      { name: "Guruch", amount: 100, unit: "g" },
      { name: "Mol go'shti", amount: 300, unit: "g" },
      { name: "Piyoz", amount: 1, unit: "dona" },
      { name: "Sabzi", amount: 1, unit: "dona" },
      { name: "Tuz, ziravor", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Moshni 2 soat ivitib qo'ying.",
      "Go'sht, piyoz, sabzini qovuring.",
      "Suv quyib qaynating, moshni qo'shing.",
      "Mosh deyarli pishganda guruchni qo'shing.",
      "Tuz, ziravor solib 20 daqiqa pishiring.",
    ],
  },
  {
    slug: "mampar",
    name: "Mampar",
    description: "Maydalangan xamir va sabzavotli quyuq sho'rva.",
    emoji: "🍲",
    imagePrompt: "Uzbek mampar thick soup with small dough pieces beef and vegetables",
    imageUrl: "https://static.1000.menu/img/content-v2/1c/b1/17217/sup-mampar-po-uzbekski_1680589808_19_max.jpg",
    category: "Xamir taomi",
    timeMinutes: 60,
    difficulty: "O'rtacha",
    caloriesPerServing: 410,
    baseServings: 4,
    ingredients: [
      { name: "Un", amount: 300, unit: "g" },
      { name: "Mol go'shti", amount: 400, unit: "g" },
      { name: "Kartoshka", amount: 2, unit: "dona" },
      { name: "Bolgar qalampir", amount: 1, unit: "dona" },
      { name: "Pomidor", amount: 2, unit: "dona" },
      { name: "Piyoz", amount: 1, unit: "dona" },
      { name: "Tuz, ziravor", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Undan qattiq xamir qorib damlang.",
      "Go'sht va sabzavotlarni qovurib, suv quying.",
      "Xamirdan mayda bo'laklar uzib, qaynayotgan vajga tashlang.",
      "15 daqiqa pishiring, tuz, ziravor soling.",
    ],
  },
  {
    slug: "tuxumbarak",
    name: "Tuxumbarak",
    description: "Tuxumli xamir tugunchalari — Xorazm taomi.",
    emoji: "🥚",
    imagePrompt: "Uzbek Khorezm tuxum barak boiled egg-filled dumplings with melted butter",
    imageUrl: "https://i.ytimg.com/vi/eA1-8TJxC9A/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBpVb7OVhXLBoZvd5ltwLwtQzTtSw",
    category: "Xamir taomi",
    timeMinutes: 60,
    difficulty: "O'rtacha",
    caloriesPerServing: 380,
    baseServings: 4,
    ingredients: [
      { name: "Un", amount: 400, unit: "g" },
      { name: "Tuxum", amount: 6, unit: "dona" },
      { name: "Sut", amount: 100, unit: "ml" },
      { name: "Yog'", amount: 50, unit: "g" },
      { name: "Tuz", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Undan zich xamir qoring.",
      "Tuxum, sut, tuzni aralashtirib qiyma tayyorlang.",
      "Xamirni yoyib, kvadratlarga kesing.",
      "Har biriga tuxum aralashmasini quyib chetlarini yopishtiring.",
      "Qaynayotgan tuzli suvda 7-8 daqiqa qaynating.",
      "Erigan yog' bilan torting.",
    ],
  },
  {
    slug: "shivit-oshi",
    name: "Shivit Oshi",
    description: "Yashil shivitli ugra — Xorazmning mashhur taomi.",
    emoji: "🌿",
    imagePrompt: "Uzbek Khorezm shivit oshi vibrant green dill noodles with beef tomato sauce",
    imageUrl: "https://www.tasteatlas.com/images/dishes/dd5a93f12c904d7c9ecae1ee32a6d8c4.jpg",
    category: "Xamir taomi",
    timeMinutes: 90,
    difficulty: "Qiyin",
    caloriesPerServing: 470,
    baseServings: 4,
    ingredients: [
      { name: "Un", amount: 500, unit: "g" },
      { name: "Shivit", amount: 100, unit: "g" },
      { name: "Mol go'shti", amount: 400, unit: "g" },
      { name: "Piyoz", amount: 2, unit: "dona" },
      { name: "Pomidor", amount: 2, unit: "dona" },
      { name: "Tuz, ziravor", amount: 1, unit: "ch.q" },
    ],
    steps: [
      "Shivitni maydalab, suv qo'shib blenderda aralashtiring.",
      "Un bilan yashil xamir qoring.",
      "Yupqa yoyib, ingichka ugra qiling.",
      "Bug'da yoki suvda pishiring.",
      "Alohida go'shtli vaj tayyorlang.",
      "Yashil ugra ustiga vaj quyib torting.",
    ],
  },
];
export function getDishBySlug(slug: string): Dish | undefined {
  return DISHES.find((d) => d.slug === slug);
}
