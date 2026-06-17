import { GEMINI_CHAT_MODEL } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/suggest-recipes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { ingredients?: string[] };
        try {
          body = (await request.json()) as { ingredients?: string[] };
        } catch {
          return Response.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
        }
        const ingredients = body.ingredients;
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
          return Response.json({ error: "Mahsulotlar ro'yxati kerak" }, { status: 400 });
        }

        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          return Response.json({ error: "AI kaliti sozlanmagan" }, { status: 500 });
        }

        const system = `Sen — OSHPAZ AI, o'zbek tilida ishlovchi aqlli oshpaz.
Foydalanuvchining mavjud mahsulotlaridan 3-4 ta real, tayyorlash mumkin bo'lgan taom tavsiya qil.
O'zbek milliy taomlariga ustuvorlik ber.
JAVOBNI FAQAT QUYIDAGI JSON SHAKLIDA QAYTAR (boshqa matn yo'q):
{
  "recipes": [
    {
      "name": "taom nomi",
      "description": "1-2 jumla qisqa tavsif",
      "timeMinutes": 45,
      "difficulty": "Oson" | "O'rtacha" | "Qiyin",
      "calories": 450,
      "servings": 4,
      "usedIngredients": ["mavjud mahsulot 1", "mavjud mahsulot 2"],
      "missingIngredients": ["yetishmaydigan mahsulot"],
      "steps": ["1-bosqich", "2-bosqich", "3-bosqich"]
    }
  ]
}`;

        try {
          const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: GEMINI_CHAT_MODEL,
              messages: [
                { role: "system", content: system },
                {
                  role: "user",
                  content: `Uyimda quyidagi mahsulotlar bor: ${ingredients.join(", ")}.\n3-4 ta taom tavsiya qil. Har bir taom uchun 4-8 ta aniq bosqich yoz.`,
                },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (res.status === 429) {
            return Response.json(
              { error: "AI limiti tugadi. Biroz kutib qayta urinib ko'ring." },
              { status: 429 },
            );
          }
          if (res.status === 402) {
            return Response.json(
              { error: "AI kreditlari tugagan. Hisobni to'ldiring." },
              { status: 402 },
            );
          }
          if (!res.ok) {
            const txt = await res.text();
            console.error("AI gateway error", res.status, txt);
            return Response.json({ error: "AI bilan bog'lanishda xato" }, { status: 500 });
          }

          const data = await res.json();
          const content: string = data?.choices?.[0]?.message?.content ?? "";
          let parsed: unknown;
          try {
            parsed = JSON.parse(content);
          } catch {
            const m = content.match(/\{[\s\S]*\}/);
            if (!m) {
              return Response.json({ error: "AI noto'g'ri javob qaytardi" }, { status: 500 });
            }
            parsed = JSON.parse(m[0]);
          }
          return Response.json(parsed);
        } catch (err) {
          console.error("suggest-recipes error", err);
          return Response.json({ error: "Kutilmagan xato yuz berdi" }, { status: 500 });
        }
      },
    },
  },
});
