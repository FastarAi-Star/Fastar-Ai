
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const INSTRUCTIONS = `
You are Sham Fastar AI, created by Shamsher Alam.
Help with business, e-commerce, technology and general questions.
Reply in simple Hindi/Hinglish when the user does.
Be friendly, practical and honest.
`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST is allowed"
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY Vercel mein set nahi hai."
    });
  }

  try {
    const body = req.body || {};
    const message = typeof body.message === "string"
      ? body.message.trim()
      : "";
    const mode = body.mode || "chat";
    const image = typeof body.image === "string"
      ? body.image
      : "";

    if (!["chat", "ask", "edit", "generate"].includes(mode)) {
      return res.status(400).json({
        error: "Invalid mode."
      });
    }

    if (!message && mode !== "generate") {
      return res.status(400).json({
        error: "Pehle sawal ya instruction likhiye."
      });
    }

    if (
      image &&
      !/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(image)
    ) {
      return res.status(400).json({
        error: "Valid photo upload karein."
      });
    }

    if (image.length > 4400000) {
      return res.status(413).json({
        error: "Photo 3 MB se chhoti rakhein."
      });
    }

    if (mode === "edit" && !image) {
      return res.status(400).json({
        error: "Edit karne ke liye photo upload karein."
      });
    }

    if (mode === "ask" && image) {
      const response = await client.responses.create({
        model: "gpt-6-luna",
        instructions:
          INSTRUCTIONS +
          " Carefully inspect the image and answer based on visible details.",
        input: [{
          role: "user",
          content: [
            {
              type: "input_text",
              text: message || "Is photo mein kya hai?"
            },
            {
              type: "input_image",
              image_url: image,
              detail: "high"
            }
          ]
        }]
      });

      return res.status(200).json({
        reply: response.output_text || "Photo samajh nahi aayi."
      });
    }

    if (mode === "generate" || mode === "edit") {
      const content = [];

      content.push({
        type: "input_text",
        text: message || "Create a beautiful image."
      });

      if (mode === "edit") {
        content.push({
          type: "input_image",
          image_url: image,
          detail: "high"
        });
      }

      const response = await client.responses.create({
        model: "gpt-6-astra",
        instructions: INSTRUCTIONS +
          (mode === "edit"
            ? " Edit the uploaded image according to the user's instructions."
            : " Generate a new image from the user's description."),
        input: [{
          role: "user",
          content
        }],
        tools: [{
          type: "image_generation",
          model: "gpt-image-2.5-sunburst",
          action: mode === "edit" ? "edit" : "generate"
        }]
      });

      const generated = (response.output || []).find(
        item =>
          item.type === "image_generation_call" &&
          item.result
      );

      if (!generated) {
        return res.status(502).json({
          error: "Image nahi bani. API access aur billing check karein."
        });
      }

      return res.status(200).json({
        reply: "Image taiyar hai!",
        image: "data:image/png;base64," + generated.result
      });
    }

    const response = await client.responses.create({
      model: "gpt-6-luna",
      instructions: INSTRUCTIONS,
      tools: [{ type: "web_search" }],
      input: message
    });

    return res.status(200).json({
      reply: response.output_text || "Koi jawab nahi mila."
    });

  } catch (error) {
    console.error("Sham Fastar AI error:", error);

    return res.status(500).json({
      error: "Request fail hui. API access, billing aur logs check karein."
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
