import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_PROMPT_LENGTH = 20000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  // Origin 検証（ALLOWED_ORIGIN またはホスト一致）
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  if (allowedOrigin && origin !== allowedOrigin) {
    return res.status(403).json({ message: 'Forbidden origin' });
  }
  if (!allowedOrigin && origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return res.status(403).json({ message: 'Cross-origin requests are not allowed' });
      }
    } catch {
      return res.status(403).json({ message: 'Invalid origin header' });
    }
  }

  // 認証設定がない場合は生成を停止する。Origin検証は認証の代わりにはならない。
  const requiredToken = process.env.API_ACCESS_TOKEN;
  if (!requiredToken) {
    return res.status(503).json({ message: 'API authentication is not configured' });
  }
  const providedToken = req.headers?.['x-api-token'];
  if (typeof providedToken !== 'string' || providedToken !== requiredToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { prompt } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(413).json({ message: `Prompt exceeds maximum length (${MAX_PROMPT_LENGTH} characters)` });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // ユーザー指定のモデル ID を使用
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ message: 'Failed to generate content' });
  }
}
