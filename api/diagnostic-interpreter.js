// api/diagnostic-interpreter.js

import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { score, interpretation, answers, firstName, lastName, email } = await req.json();

    const prompt = `
You are a diagnostic interpreter helping executives understand their organization's internal alignment.
Based on a diagnostic score and question-level responses, write a short interpretation in plain, executive-friendly language.

Here are the inputs:
- Name: ${firstName} ${lastName}
- Email: ${email}
- Total Score: ${score}
- Score Interpretation: ${interpretation}
- Answers: ${Object.entries(answers).map(([key, val]) => `${key}: ${val}`).join("\n")}

Instructions:
- Write a 3-5 sentence paragraph that summarizes the results.
- Use an encouraging but honest tone.
- Offer 1 suggestion for what the user should explore or fix next.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a strategic business advisor specializing in marketing, product, and sales alignment." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0].message) {
      throw new Error("No response from OpenAI.");
    }

    const output = data.choices[0].message.content;
    return NextResponse.json({ interpretation: output });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
