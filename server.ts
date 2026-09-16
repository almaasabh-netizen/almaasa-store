import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { timingSafeEqual } from "crypto";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

// ── JWT helper ──────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET env var must be set in production");
    process.exit(1);
  }
  // Dev-only fallback — never used in production
  return "dev-secret-change-me-in-production";
})();

const TOKEN_COOKIE = "ama_admin_token";
const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000; // 8 hours in ms

function signToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
}

function verifyToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload?.role === "admin";
  } catch {
    return false;
  }
}

// Middleware: require valid JWT cookie on protected routes
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: "غير مصرح. يرجى تسجيل الدخول." });
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  // ── Security headers ─────────────────────────────────────────
  const allowedOrigins = [
    "https://almaasa-store.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));

  // ── Rate limiters ────────────────────────────────────────────
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "تجاوزت عدد محاولات تسجيل الدخول. حاول مجدداً بعد 15 دقيقة." },
  });

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "طلبات كثيرة. حاول لاحقاً." },
  });

  // ── Auth: Login ──────────────────────────────────────────────
  app.post("/api/admin-login", loginLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "يرجى إدخال البريد الإلكتروني وكلمة المرور." });
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        console.error("ADMIN_EMAIL or ADMIN_PASSWORD env vars not set");
        return res.status(500).json({ error: "خطأ في إعدادات الخادم." });
      }

      // Timing-safe comparison — prevents timing attacks
      const emailNorm = email.trim().toLowerCase();
      const adminEmailNorm = adminEmail.trim().toLowerCase();
      const emailBuf = Buffer.from(emailNorm.padEnd(256));
      const adminEmailBuf = Buffer.from(adminEmailNorm.padEnd(256));
      const passBuf = Buffer.from(password.padEnd(256));
      const adminPassBuf = Buffer.from(adminPassword.padEnd(256));

      const emailMatch = timingSafeEqual(emailBuf, adminEmailBuf);
      const passwordMatch = timingSafeEqual(passBuf, adminPassBuf);

      if (emailMatch && passwordMatch) {
        const token = signToken();
        res.cookie(TOKEN_COOKIE, token, {
          httpOnly: true,          // JS cannot read this cookie
          secure: isProd,          // HTTPS only in production
          sameSite: "strict",      // CSRF protection
          maxAge: COOKIE_MAX_AGE,
          path: "/",
        });
        return res.json({ success: true });
      } else {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      return res.status(500).json({ error: "حدث خطأ في الخادم. يرجى المحاولة لاحقاً." });
    }
  });

  // ── Auth: Verify (called on page load to restore session) ────
  app.get("/api/admin-verify", (req, res) => {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (token && verifyToken(token)) {
      return res.json({ authenticated: true });
    }
    return res.status(401).json({ authenticated: false });
  });

  // ── Auth: Logout ─────────────────────────────────────────────
  app.post("/api/admin-logout", (req, res) => {
    res.clearCookie(TOKEN_COOKIE, { path: "/" });
    return res.json({ success: true });
  });

  // ── Protected: AI Description Generator ─────────────────────
  app.post("/api/generate-description", requireAuth, apiLimiter, async (req, res) => {
    try {
      const { productName, categoryName, imageBase64 } = req.body;

      if (!productName || typeof productName !== "string" || productName.length > 200) {
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
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const categoryPart = categoryName ? `من فئة ${categoryName}` : "";
      const systemInstruction = `أنت كاتب تسويقي محترف ومبدع لمتجر "بوتيك ألماسة" (Almaasa Boutique) المتخصص في بيع المخاوير والجلابيات التقليدية الإماراتية والخليجية الفاخرة وتوابعها.
اكتب وصفاً ترويجياً فخماً وجذاباً وراقياً جداً للمنتج، مستخدماً لغة عربية سليمة وعبارات أنيقة تشجع الزبائن على الشراء.
اجعل الوصف قصيراً (من سطرين إلى ثلاثة أسطر كحد أقصى) ليتناسب مع قيود العرض. ركّز على التطريز الفاخر، جودة القماش (مثل الحرير والقطن)، والتطريز بالخرز أو الزري اللامع، ومناسبة هذا الموديل للأعياد والمناسبات والجمعات السعيدة.
تجنب أي مقدمات أو هوامش، واكتب الوصف مباشرة بدون زخارف أو رموز تعبيرية كثيرة.`;

      const prompt = `اكتب وصفاً تسويقياً فاخراً لمنتج مخور أو جلابية بالاسم التالي: "${productName}" ${categoryPart}.`;

      let contents: any = prompt;

      if (imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:")) {
        const mimeType = imageBase64.substring(5, imageBase64.indexOf(";base64,"));
        const base64Data = imageBase64.substring(imageBase64.indexOf(";base64,") + 8);
        contents = {
          parts: [
            { inlineData: { mimeType: mimeType || "image/jpeg", data: base64Data } },
            { text: `${prompt}\nيرجى تحليل صورة هذا المخور أو الجلابية من حيث اللون، نوع القماش، نمط التطريز، والزينة ومواءمتها بدقة في الوصف التسويقي الممتاز المقترح.` },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: { systemInstruction, temperature: 0.8 },
      });

      return res.json({ description: response.text?.trim() || "" });
    } catch (error: any) {
      console.error("Gemini error:", error);
      return res.status(500).json({ error: "فشلت عملية توليد الوصف. يرجى المحاولة لاحقاً." });
    }
  });

  // ── Instagram Feed Proxy ─────────────────────────────────────
  app.get("/api/instagram-feed", apiLimiter, async (req, res) => {
    const feedId = process.env.BEHOLD_FEED_ID || "HbcZC4oN0hh4xfAHUvTm";
    if (!feedId) {
      return res.status(500).json({ error: "BEHOLD_FEED_ID غير مضبوط في متغيرات البيئة." });
    }
    try {
      const url = `https://feeds.behold.so/${feedId}`;
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; AlmaasaStore/1.0)",
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      const text = await response.text();

      if (!response.ok) {
        console.error("Behold error:", response.status, text.slice(0, 300));
        return res.status(502).json({
          error: `فشل الاتصال بـ Behold (${response.status}). تحقق من صحة الـ Feed ID.`,
        });
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Behold returned non-JSON:", text.slice(0, 200));
        return res.status(502).json({ error: "استجابة غير صالحة من Behold." });
      }

      // Normalise: return a flat posts array regardless of Behold response shape
      const posts: any[] = Array.isArray(data) ? data : (data.posts ?? data.items ?? []);
      res.json(posts);
    } catch (err: any) {
      const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
      console.error("Instagram feed error:", err.message);
      res.status(502).json({
        error: isTimeout
          ? "انتهت مهلة الاتصال بـ Behold. حاول لاحقاً."
          : "فشل تحميل بيانات Instagram. حاول لاحقاً.",
      });
    }
  });

  // ── Static / Vite ────────────────────────────────────────────
  if (!isProd) {
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
