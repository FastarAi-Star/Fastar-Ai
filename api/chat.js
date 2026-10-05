export default async function handler(req, res) {
      if (req.method !== "POST") {
          return res.status(405).json({
                error: "Only POST is allowed"
                    });
                      }

                        try {
                            const { message } = req.body || {};

                                if (!message) {
                                      return res.status(400).json({
                                              error: "Message is required"
                                                    });
                                                        }

                                                            const response = await fetch("https://api.openai.com/v1/responses", {
                                                                  method: "POST",
                                                                        headers: {
                                                                                "Content-Type": "application/json",
                                                                                        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                                                                                              },
                                                                                                    body: JSON.stringify({
                                                                                                            model: "gpt-6-luna",
                                                                                                                    input: message
                                                                                                                          })
                                                                                                                              });

                                                                                                                                  const data = await response.json();

                                                                                                                                      if (!response.ok) {
                                                                                                                                            return res.status(response.status).json({
                                                                                                                                                    error: data.error?.message || "OpenAI API error"
                                                                                                                                                          });
                                                                                                                                                              }

                                                                                                                                                                  const reply =
                                                                                                                                                                        data.output
                                                                                                                                                                                ?.flatMap(item => item.content || [])
                                                                                                                                                                                        ?.filter(item => item.type === "output_text")
                                                                                                                                                                                                ?.map(item => item.text)
                                                                                                                                                                                                        ?.join("\n")
                                                                                                                                                                                                                ?.trim() || "No response received.";

                                                                                                                                                                                                                    return res.status(200).json({
                                                                                                                                                                                                                          reply
                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                } catch (error) {
                                                                                                                                                                                                                                    return res.status(500).json({
                                                                                                                                                                                                                                          error: "Server error"
                                                                                                                                                                                                                                              });
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                }
}