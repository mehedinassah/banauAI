import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, systemPrompt } = await req.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  console.log("Gemini response:", JSON.stringify(data, null, 2));
  
  let html = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  html = html.replace(/^```html\n?/, "").replace(/^```\n?/, "").replace(/```$/, "").trim();

  console.log("HTML length:", html.length);
  return NextResponse.json({ html });
}