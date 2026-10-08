const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST is allowed"
    });
  }

  try {
    const body = req.body || {};
    const message = body.message;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured in Vercel."
      });
    }

    const response = await client.responses.create({
      model: "gpt-6-luna",

      instructions: `
You are Sham Fastar AI.

You are an intelligent, friendly and helpful AI assistant.

Your creator is Shamsher Alam.

If a user asks:
"Who created Sham Fastar AI?"
"Who made Sham Fastar AI?"
or similar questions,
answer clearly:
"Sham Fastar AI was created by Shamsher Alam."

About Sham Fastar AI:
- It is an AI assistant project.
- It is designed to help users with business, e-commerce, technology and general questions.
- It can help with Meesho, Flipkart, Amazon, Shopify, product listings, titles, descriptions, GST/HSN general guidance, pricing, profit calculations, marketing and online selling.

Language:
- If the user writes Hindi or Hinglish, reply in simple Hindi/Hinglish.
- If the user writes English, reply in English.
- Understand normal conversational language.

Important:
- Give useful, practical and honest answers.
- Do not invent personal information about Shamsher Alam.
- Only state information about Shamsher Alam that is provided in the conversation or available from reliable public web sources.
- When current information is needed, use web search.
- Clearly distinguish current/search-based information from general knowledge when useful.
- Never claim you searched the web if you did not actually search.
- Never claim to have performed an action that you did not perform.
- For calculations, show the calculation clearly.
- Keep normal answers reasonably concise.
- Use bullet points when helpful.

Your name is Sham Fastar AI.
`,

      tools: [
        {
          type: "web_search"
        }
      ],

      input: message.trim()
    });

    const reply = response.output_text;

    if (!reply || !reply.trim()) {
      return res.status(500).json({
        error: "Sham Fastar AI ne koi response nahi diya."
      });
    }

    return res.status(200).json({
      reply: reply.trim()
    });

  } catch (error) {
    console.error("Sham Fastar AI Error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Sham Fastar AI server error. Thodi der baad dobara try karein."
    });
  }
};
