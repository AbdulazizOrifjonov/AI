import { GEMINI_CHAT_MODEL, createGeminiProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `Sen — OSHPAZ AI, foydalanuvchining shaxsiy aqlli oshpazisan.

Vazifang:
- Foydalanuvchi uyida bor mahsulotlar haqida aytsa, ulardan tayyorlanadigan taomlarni tavsiya qil.
- Har bir tavsiya uchun: taom nomi, qisqacha tavsif, kerakli ingredientlar (yetishmayotganlari belgilangan), taxminiy tayyorlash vaqti va qiyinlik darajasi.
- Foydalanuvchi so'rasa, bosqichma-bosqich retsept ber.
- O'zbek milliy taomlariga (palov, lag'mon, manti, somsa, shashlik, sho'rva, dimlama va h.k.) ustuvorlik ber, lekin zamonaviy va xalqaro retseptlarni ham tavsiya qil.
- Doim o'zbek tilida, do'stona va aniq javob ber.
- Markdown ishlat: sarlavhalar, ro'yxatlar, **muhim** so'zlarni ajrat.
- Agar foydalanuvchining so'rovi noaniq bo'lsa, aniqlashtiruvchi savol ber.

MUHIM CHEKLOV: Sen faqat oshxona, taomlar, masalliqlar va pishirish mavzusida yordam berasan. Agar foydalanuvchi shu mavzuga umuman aloqasi yo'q narsa so'rasa (masalan: dasturlash, siyosat, matematika, shaxsiy maslahat, boshqa umumiy savollar) yoki shunga oid (ovqatga aloqasi yo'q) rasm yuborsa, hech qachon u haqida javob berishga urinma. Buning o'rniga qisqa, samimiy va xushmuomala tarzda bu sening vazifang emasligini ayt va suhbatni qaytadan oshxona mavzusiga burib yubor. Masalan: "Voy, bu mening ishim emas — men faqat oshxona va pishirish bo'yicha yordam beraman 🍳 Sizga qanday taom tavsiya qilsam? Yoki uyingizdagi mahsulotlarni aytsangiz, ulardan nima pishirish mumkinligini aytib beraman!" Foydalanuvchi qayta-qayta so'rasa yoki turib olsa ham, bu qoidadan chetga chiqma.

Sen oddiy chatbot emas — sen oshxonadagi haqiqiy yordamchisan.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          return new Response("Missing GEMINI_API_KEY", { status: 500 });
        }

        try {
          const gemini = createGeminiProvider(key);
          const model = gemini(GEMINI_CHAT_MODEL);
          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (err) {
          console.error("chat error", err);
          return new Response("AI error", { status: 500 });
        }
      },
    },
  },
});
