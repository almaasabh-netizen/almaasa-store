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

  // Admin Login Endpoint - validates credentials against env vars
  app.post("/api/admin-login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "يرجى إدخال البريد الإلكتروني وكلمة المرور." });
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        return res.status(500).json({
          error: "لم يتم تهيئة بيانات اعتماد المشرف في الخادم. يرجى مراجعة الإعدادات."
        });
      }

      const emailMatch = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
      const passwordMatch = password === adminPassword;

      if (emailMatch && passwordMatch) {
        return res.json({ success: true });
      } else {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      return res.status(500).json({ error: "حدث خطأ في الخادم. يرجى المحاولة لاحقاً." });
    }
  });

  // Debug endpoint - raw Behold response
  app.get("/api/instagram-debug", async (req, res) => {
    try {
      const url = "https://feeds.behold.so/HbcZC4oN0hh4xfAHUvTm";
      const response = await fetch(url, {
        headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" }
      });
      const text = await response.text();
      res.json({
        status: response.status,
        contentType: response.headers.get("content-type"),
        body: text.slice(0, 1000),
      });
    } catch (err: any) {
      res.json({ fetchError: err.message });
    }
  });

  // Instagram Feed Proxy (Behold)
  app.get("/api/instagram-feed", async (req, res) => {
    try {
      const feedId = "HbcZC4oN0hh4xfAHUvTm";
      const url = `https://feeds.behold.so/${feedId}`;
      console.log("Fetching Behold feed:", url);
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; AlmaasaStore/1.0)",
          "Origin": "https://almaasa-store.onrender.com",
        }
      });
      const text = await response.text();
      console.log("Behold status:", response.status, "Content-Type:", response.headers.get("content-type"), "body[:300]:", text.slice(0, 300));
      if (!response.ok) throw new Error(`Behold ${response.status}: ${text.slice(0,200)}`);
      const data = JSON.parse(text);
      res.json(data);
    } catch (err: any) {
      console.error("Instagram feed error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

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
