
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const INSTRUCTIONS = `
You are Sham Fastar AI, created by Shamsher Alam.

Your job:
- Answer general questions clearly and helpfully.
- Understand uploaded photos and describe what is visible.
- Answer questions about the uploaded photo.
- Reply in Hindi or Hinglish when the user uses Hindi or Hinglish.
- Give useful details about visible objects, colors, shapes,
  materials when reasonably identifiable, and possible uses.
- Never claim certainty about details that cannot be seen.
- Never edit, generate, or return a newly created image.
- Be friendly, practical, and honest.
`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Sirf POST request allowed hai."
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      reply: "OPENAI_API_KEY Vercel mein set nahi hai."
    });
  }

  try {
    const body = req.body || {};

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image
        : "";

    if (!message && !image) {
      return res.status(400).json({
        reply: "Apna sawal likhein ya photo upload karein."
      });
    }

    if (
      image &&
      !/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(image)
    ) {
      return res.status(400).json({
        reply: "JPG, PNG ya WebP format ki photo upload karein."
      });
    }

    if (image.length > 4400000) {
      return res.status(413).json({
        reply: "Photo 3 MB se chhoti rakhein."
      });
    }

    let response;

    if (image) {
      response = await client.responses.create({
        model: "gpt-6-luna",
        instructions: INSTRUCTIONS,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: message ||
                  "Is photo mein kya hai? Hindi mein detail se batao."
              },
              {
                type: "input_image",
                image_url: image,
                detail: "high"
              }
            ]
          }
        ]
      });
    } else {
      response = await client.responses.create({
        model: "gpt-6-luna",
        instructions: INSTRUCTIONS,
        input: message
      });
    }

    const reply =
      response.output_text ||
      "Maaf kijiye, is baar jawab nahi mil saka.";

    return res.status(200).json({
      reply,
      image: null
    });

  } catch (error) {
    console.error("Sham Fastar AI error:", error);

    if (
      error.status === 429 ||
      error.code === "insufficient_quota" ||
      error.code === "billing_hard_limit_reached"
    ) {
      return res.status(503).json({
        reply: "OpenAI API credits khatam hain. Billing badle bina abhi AI jawab nahi de sakta."
      });
    }

    if (error.status === 401) {
      return res.status(500).json({
        reply: "API key check karni hogi. Vercel mein OPENAI_API_KEY dekhein."
      });
    }

    return res.status(500).json({
      reply: "Server mein dikkat aayi. Vercel Logs mein error check karein."
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
