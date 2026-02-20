import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Updated 2026 Router URL
    // The path structure is now: https://router.huggingface.co/hf-inference/models/...
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    // 2. Error Handling for the Router
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Router Error:", errorData);
      
      return NextResponse.json({ 
        error: errorData.error || "The AI router is busy. Try again." 
      }, { status: response.status });
    }

    // 3. Process the Image
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({ base64 });

  } catch (error: any) {
    console.error("Backend Crash:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}