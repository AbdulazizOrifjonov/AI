# OSHPAZ AI 🍳

OSHPAZ AI — bu O'zbek tilida ishlovchi sun'iy intellekt asosidagi oshpazlik yordamchisi. Foydalanuvchilar uyidagi mahsulotlardan qanday taom tayyorlashni bilmaganda, AI ularga aniq retseptlar, bosqichlar va kaloriya hisobini taqdim etadi.

## ✨ Asosiy imkoniyatlar

- 🥘 **Mahsulotlardan ovqat** — uyda bor mahsulotlarni tanlang, AI 3-4 ta taom tavsiya qiladi
- 📚 **Milliy taomlar kutubxonasi** — 16+ klassik o'zbek taomi, ulushni avtomatik hisoblash
- 🤖 **AI Oshpaz suhbati** — savol bering, rasm yuklang, real vaqtda streaming javob oling
- 💾 **Brauzerda saqlash** — suhbatlar localStorage'da, hisob shart emas

## 🛠 Texnologiyalar

- **React 19** + **TanStack Start v1** (SSR + file-based routing)
- **Vite 7** — bundler
- **Tailwind CSS v4** — dizayn tizimi
- **AI SDK (Vercel)** + **Google Gemini API** (Gemini 2.5 Flash)
- **shadcn/ui** + **AI Elements** — komponentlar
- **TypeScript** (strict mode)

## 🚀 Ishga tushirish

### 1. Bog'lamlarni o'rnatish

```bash
# bun bilan (tavsiya etiladi - tezroq)
bun install

# yoki npm bilan
npm install

# yoki pnpm
pnpm install
```

### 2. AI kalitini sozlash

Loyiha root papkasida `.env` fayl yarating:

```bash
GEMINI_API_KEY=sizning_kalitingiz_bu_yerda
```

> **Kalitni qayerdan olish:** [Google AI Studio](https://aistudio.google.com/) saytida API key yarating va shu qiymatni `.env` ichiga qo'ying.

### 3. Dasturni ishga tushirish

```bash
bun run dev
# yoki
npm run dev
```

Brauzerda oching: **http://localhost:3000**

### 4. Production build

```bash
bun run build
bun run start
```

## 📁 Loyiha tuzilishi

```
oshpaz-ai/
├── src/
│   ├── routes/                  # TanStack Start sahifalari
│   │   ├── __root.tsx          # Root layout (HTML shell, SEO)
│   │   ├── index.tsx           # Bosh sahifa
│   │   ├── pantry.tsx          # Mahsulotlardan ovqat
│   │   ├── dishes.index.tsx    # Milliy taomlar ro'yxati
│   │   ├── dishes.$slug.tsx    # Taom tafsilotlari
│   │   ├── chat.index.tsx      # AI chat (asosiy)
│   │   ├── chat.$threadId.tsx  # Suhbat oynasi
│   │   └── api/
│   │       ├── chat.ts             # Streaming chat endpoint
│   │       └── suggest-recipes.ts  # Mahsulotlardan retsept
│   ├── components/
│   │   ├── ai-elements/        # Chat UI primitive'lari
│   │   ├── ui/                 # shadcn komponentlar
│   │   ├── chat-window.tsx     # Multimodal chat oynasi
│   │   ├── thread-sidebar.tsx  # Suhbatlar navigatsiyasi
│   │   └── site-header.tsx     # Yuqori menyu
│   ├── lib/
│   │   ├── ai-gateway.server.ts # Gemini API provider
│   │   ├── dishes-data.ts       # 16 ta o'zbek retsepti
│   │   └── threads-store.ts     # localStorage CRUD
│   ├── hooks/
│   │   └── use-threads.ts       # Suhbatlar holati
│   ├── assets/
│   │   └── oshpaz-logo.png      # Brend logosi
│   ├── styles.css               # Tailwind v4 + tokenlar (OKLCH)
│   └── router.tsx               # Router konfiguratsiyasi
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Dizayn

- **Uslub:** Zamonaviy minimal (toza oq fon, yashil aksent)
- **Ranglar:** Semantic tokenlar (`src/styles.css`), OKLCH formatida
- **Mobil-friendly:** To'liq responsive

## 🧪 Mavjud skriptlar

| Buyruq | Tavsif |
|--------|--------|
| `bun run dev` | Dev server (HMR) |
| `bun run build` | Production build |
| `bun run start` | Production serverni ishga tushirish |
| `bun run lint` | ESLint tekshiruvi |

## 📝 Eslatmalar

- **AI cheklov:** Bepul `GEMINI_API_KEY` da limitlar bor. Limit tugasa, biroz kuting yoki hisobni billing bilan ulang.
- **Brauzer mosligi:** Chrome, Firefox, Safari, Edge — barchasi ishlaydi.
- **Suhbatlar:** localStorage'da saqlanadi — boshqa qurilmadan kirsangiz, ko'rinmaydi.

## 👨‍💻 Muallif

Bu loyiha AI Trening kursi uchun yaratilgan. Bepul foydalanish va o'zgartirish mumkin.

---

**Savol/taklif bo'lsa, GitHub Issues orqali bog'laning.** 🚀
