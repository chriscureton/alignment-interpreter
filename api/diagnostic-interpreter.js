const { Configuration, OpenAIApi } = require("openai");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing OpenAI API key in environment." });
  }

  const { answers } = req.body;

  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ error: "Invalid request body." });
  }

  try {
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const formattedAnswers = Object.entries(answers)
      .map(([key, value]) => `${key}: ${["No", "Sometimes", "Yes"][value]}`)
      .join("\n");

    const prompt = `A CEO just completed a strategic alignment diagnostic. Based on the following answers, give them a concise, insight-driven summary (3–5 sentences) highlighting key misalignment risks and opportunities. Be clear, candid, and actionable:\n\n${formattedAnswers}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const interpretation = completion.data.choices[0].message.content.trim();
    res.status(200).json({ interpretation });

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Failed to generate interpretation." });
  }
};
