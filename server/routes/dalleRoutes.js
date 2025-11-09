import express from "express";
import * as dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ✅ Updated Hugging Face router endpoint
const HF_MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-2";

router.get("/", (_, res) =>
  res.json({ message: "Hello from Hugging Face Router API!" })
);

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Generating image via Hugging Face…");

    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 30, // optional: speed vs. quality
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Hugging Face error:", errText);
      return res.status(response.status).json({ error: errText });
    }

    // The router returns raw PNG bytes
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");

    res.status(200).json({
      success: true,
      source: "huggingface",
      photo: `data:image/png;base64,${base64}`,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
