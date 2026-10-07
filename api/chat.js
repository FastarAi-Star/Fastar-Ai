module.exports = async function handler(req, res) {
      // Only POST requests are allowed
        if (req.method !== "POST") {
            return res.status(405).json({
                  error: "Only POST is allowed"
                      });
                        }

                          try {
                              // Get user's message
                                  const { message } = req.body || {};

                                      if (!message || !message.trim()) {
                                            return res.status(400).json({
                                                    error: "Message is required"
                                                          });
                                                              }

                                                                  // Check API key
                                                                      if (!process.env.OPENAI_API_KEY) {
                                                                            return res.status(500).json({
                                                                                    error: "OPENAI_API_KEY is not configured in Vercel."
                                                                                          });
                                                                                              }

                                                                                                  // Send request to OpenAI
                                                                                                      const response = await fetch(
                                                                                                            "https://api.openai.com/v1/responses",
                                                                                                                  {
                                                                                                                          method: "POST",

                                                                                                                                  headers: {
                                                                                                                                            "Content-Type": "application/json",
                                                                                                                                                      "Authorization": "Bearer " + process.env.OPENAI_API_KEY
                                                                                                                                                              },

                                                                                                                                                                      body: JSON.stringify({
                                                                                                                                                                                model: "gpt-6-luna",

                                                                                                                                                                                          instructions: `
                                                                                                                                                                                          You are Sham Fastar AI.

                                                                                                                                                                                          You are a fast, friendly and intelligent AI assistant.

                                                                                                                                                                                          Your main job is to help users with:
                                                                                                                                                                                          - Business
                                                                                                                                                                                          - Meesho
                                                                                                                                                                                          - Flipkart
                                                                                                                                                                                          - Amazon
                                                                                                                                                                                          - Shopify
                                                                                                                                                                                          - E-commerce
                                                                                                                                                                                          - Product listing
                                                                                                                                                                                          - Product titles
                                                                                                                                                                                          - Product descriptions
                                                                                                                                                                                          - GST and HSN general guidance
                                                                                                                                                                                          - Pricing
                                                                                                                                                                                          - Profit calculations
                                                                                                                                                                                          - Marketing
                                                                                                                                                                                          - Customer messages
                                                                                                                                                                                          - Online selling
                                                                                                                                                                                          - Technology
                                                                                                                                                                                          - General questions

                                                                                                                                                                                          The user's name is Shamsher Alam when they provide or use that name.

                                                                                                                                                                                          Always reply naturally and helpfully.

                                                                                                                                                                                          If the user writes in Hindi or Hinglish,
                                                                                                                                                                                          reply in simple Hindi/Hinglish.

                                                                                                                                                                                          If the user writes in English,
                                                                                                                                                                                          reply in English.

                                                                                                                                                                                          Keep answers clear, practical and easy to understand.

                                                                                                                                                                                          Do not give unnecessarily long answers.

                                                                                                                                                                                          Use bullet points when useful.

                                                                                                                                                                                          For calculations, show the calculation clearly.

                                                                                                                                                                                          Never claim that you performed an action if you did not actually perform it.

                                                                                                                                                                                          Your name is Sham Fastar AI.
                                                                                                                                                                                          `,

                                                                                                                                                                                                    input: message.trim(),

                                                                                                                                                                                                              max_output_tokens: 800
                                                                                                                                                                                                                      })
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                );

                                                                                                                                                                                                                                    // Read OpenAI response
                                                                                                                                                                                                                                        const data = await response.json();

                                                                                                                                                                                                                                            // Handle OpenAI errors
                                                                                                                                                                                                                                                if (!response.ok) {
                                                                                                                                                                                                                                                      console.error("OpenAI API Error:", data);

                                                                                                                                                                                                                                                            return res.status(response.status).json({
                                                                                                                                                                                                                                                                    error:
                                                                                                                                                                                                                                                                              data?.error?.message ||
                                                                                                                                                                                                                                                                                        "OpenAI API error"
                                                                                                                                                                                                                                                                                              });
                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                      // Extract text from Responses API
                                                                                                                                                                                                                                                                                                          const reply =
                                                                                                                                                                                                                                                                                                                data.output
                                                                                                                                                                                                                                                                                                                        ?.flatMap(function (item) {
                                                                                                                                                                                                                                                                                                                                  return item.content || [];
                                                                                                                                                                                                                                                                                                                                          })
                                                                                                                                                                                                                                                                                                                                                  ?.filter(function (item) {
                                                                                                                                                                                                                                                                                                                                                            return item.type === "output_text";
                                                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                                                            ?.map(function (item) {
                                                                                                                                                                                                                                                                                                                                                                                      return item.text;
                                                                                                                                                                                                                                                                                                                                                                                              })
                                                                                                                                                                                                                                                                                                                                                                                                      ?.join("\n")
                                                                                                                                                                                                                                                                                                                                                                                                              ?.trim();

                                                                                                                                                                                                                                                                                                                                                                                                                  // No response received
                                                                                                                                                                                                                                                                                                                                                                                                                      if (!reply) {
                                                                                                                                                                                                                                                                                                                                                                                                                            console.error("No AI response:", data);

                                                                                                                                                                                                                                                                                                                                                                                                                                  return res.status(500).json({
                                                                                                                                                                                                                                                                                                                                                                                                                                          error: "Sham Fastar AI ne koi response nahi diya."
                                                                                                                                                                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                                                                                                                                                                        // Send answer to website
                                                                                                                                                                                                                                                                                                                                                                                                                                                            return res.status(200).json({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  reply: reply
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      });

                                                                                                                                                                                                                                                                                                                                                                                                                                                                        } catch (error) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            console.error("Sham Fastar AI Server Error:", error);

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                return res.status(500).json({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      error:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              "Sham Fastar AI server error. Thodi der baad dobara try karein."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    };
}