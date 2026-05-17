import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.post("/api/airport-info", async (req, res) => {
  const { airportCode } = req.body;
  
  if (!airportCode) {
    return res.status(400).json({ error: "Airport code is required" });
  }

  try {
    const prompt = `你是一位资深的民航飞行员和运行风险分析专家。请根据以下机场代码：“${airportCode}”，整理出该机场的运行风险专项提示。
请严格按照以下格式输出：
1. [题目]
2. [具体的风险点，如：机位坡度、重着陆风险、自动落地限制、过渡高度、地形防撞、速度管理、性能计算、侧风限制等]
3. [如果是高原或特殊机场，请特别注明]

输出要求：
- 使用中文
- 专业、简洁、实用
- 包含具体的数字（如标高、坡度、限制速度等，如果没有实时数据请按该机场通用的运行经验提供）
- 按照 1. 2. 3. 的列表格式`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ content: result.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to fetch airport info" });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
