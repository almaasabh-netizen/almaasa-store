import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // AI Description Generator Endpoint
  app.post("/api/generate-description", async (req, res) => {
    try {
      const { productName, categoryName, imageBase64 } = req.body;

      if (!productName) {
        return res.status(400).json({ error: "الرجاء تحديد اسم للمنتج أولاً." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "يرجى تهيئة مفتاح API الخاص بالذكاء الاصطناعي (GEMINI_API_KEY) في إعدادات المنصة أولاً."
        });
      }

      // Lazy load & initialize the GoogleGenAI client with required header
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const categoryPart = categoryName ? `من فئة ${categoryName}` : "";
      
      const systemInstruction = `أنت كاتب تسويقي محترف ومبدع لمتجر "بوتيك ألماسة" (Almaasa Boutique) المتخصص في بيع المخاوير والجلابيات التقليدية الإماراتية والخليجية الفاخرة وتوابعها.
اكتب وصفاً ترويجياً فخماً وجذاباً وراقياً جداً للمنتج، مستخدماً لغة عربية سليمة وعبارات أنيقة تشجع الزبائن على الشراء.
اجعل الوصف قصيراً (من سطرين إلى ثلاثة أسطر كحد أقصى) ليتناسب مع قيود العرض. ركّز على التطريز الفاخر، جودة القماش (مثل الحرير والقطن)، والتطريز بالخرز أو الزري اللامع، ومناسبة هذا الموديل للأعياد والمناسبات والجمعات السعيدة.
تجنب أي مقدمات أو هوامش، واكتب الوصف مباشرة بدون زخارف أو رموز تعبيرية كثيرة.`;

      const prompt = `اكتب وصفاً تسويقياً فاخراً لمنتج مخور أو جلابية بالاسم التالي: "${productName}" ${categoryPart}.`;

      let contents: any = prompt;

      if (imageBase64 && imageBase64.startsWith("data:")) {
        const mimeType = imageBase64.substring(5, imageBase64.indexOf(";base64,"));
        const base64Data = imageBase64.substring(imageBase64.indexOf(";base64,") + 8);
        
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: `${prompt}\nيرجى تحليل صورة هذا المخور أو الجلابية من حيث اللون، نوع القماش، نمط التطريز، والزينة ومواءمتها بدقة في الوصف التسويقي الممتاز المقترح.`,
            },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      const description = response.text?.trim() || "";

      return res.json({ description });
    } catch (error: any) {
      console.error("Gemini description generation error:", error);
      return res.status(500).json({
        error: "فشلت عملية توليد الوصف بالذكاء الاصطناعي. يرجى المحاولة لاحقاً مسبوقة بالتحقق من الاتصال ومفتاح الـ API."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
