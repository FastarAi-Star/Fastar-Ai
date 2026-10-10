
const INSTRUCTIONS = `
You are Sham Fastar AI, created by Shamsher Alam.

Answer general questions clearly and helpfully.
Understand uploaded photos and describe visible things in useful detail.
Answer questions about uploaded photos.
Reply in Hindi or Hinglish when the user uses Hindi or Hinglish.
Describe visible objects, colors, shapes, materials and possible uses.
Never claim certainty about details that cannot be seen.
Never edit, generate, or return a newly created image.
Be friendly, practical, and honest.
`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Sirf POST request allowed hai."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      reply: "Gemini API Key Vercel mein nahi mili. Environment Variables check karein."
    });
  }

  try {
    const body = req.body || {};
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const image =
      typeof body.image === "string" ? body.image : "";

    if (!message && !image) {
      return res.status(400).json({
        reply: "Apna sawal likhein ya photo upload karein."
      });
    }

    const parts = [];

    if (message) {
      parts.push({ text: message });
    } else {
      parts.push({
        text: "Is photo ko dhyan se dekho aur Hindi mein detail se batao ki ismein kya dikh raha hai."
      });
    }

    if (image) {
      const match = image.match(
        /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i
      );

      if (!match) {
        return res.status(400).json({
          reply: "JPG, PNG ya WebP format ki photo upload karein."
        });
      }

      const base64 = match[2].replace(/\s/g, "");

      if (base64.length > 4400000) {
        return res.status(413).json({
          reply: "Photo 3 MB se chhoti rakhein."
        });
      }

      parts.push({
        inline_data: {
          mime_type: match[1].toLowerCase().replace("image/jpg", "image/jpeg"),
          data: base64
        }
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: INSTRUCTIONS }]
          },
          contents: [
            {
              role: "user",
              parts
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, data);

      if (response.status === 429) {
        return res.status(429).json({
          reply: "Gemini ki free limit abhi poori ho sakti hai. Thodi der baad dobara try karein."
        });
      }

      if (response.status === 401 || response.status === 403) {
        return res.status(502).json({
          reply: "Gemini API Key ya uski permission check karni hogi."
        });
      }

      return res.status(502).json({
        reply: "Gemini se jawab nahi mila. Thodi der baad dobara try karein."
      });
    }

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(502).json({
        reply: "AI abhi jawab nahi de paya. Dobara try karein."
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Sham Fastar AI error:", error);

    return res.status(500).json({
      reply: "Server mein dikkat aayi. Thodi der baad dobara try karein."
    });
  }
};

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb"
    }
  }
};
