const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Expected POST body:
 * {
 *   "answers": {
 *     "Products / Services: Clarity": 2,
 *     "Sales: Efficiency": 0,
 *     ...
 *   }
 * }
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { answers } = req.body;

  if (!answers) {
    return res.status(400).json({ error: "Missing answers" });
  }

  const prompt = `Here are a set of scores (0–2) across 10 business alignment dimensions. Interpret them as a strategic advisor might. Give 1) a short overall insight 2) 2-3 specific observations and 3) one high-value next step.\n\nScores:\n${Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join("\n")}`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a strategic consultant helping a CEO understand where misalignment exists across product, marketing, and sales.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const interpretation = completion.data.choices[0].message.content;
    res.status(200).json({ interpretation });
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({ error: "OpenAI request failed" });
  }
};
