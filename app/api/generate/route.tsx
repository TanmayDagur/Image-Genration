import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Pollinations.ai — free, no API key needed, works everywhere.
    // Uses FLUX under the hood. Returns image as binary directly via GET request.
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const apiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

    let response: Response;
    try {
      response = await fetch(apiImageUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Error Handling
    if (!response.ok) {
      console.error("Pollinations API Error:", response.status, response.statusText);
      return NextResponse.json(
        { error: `Image generation failed (${response.status}). Please try again.` },
        { status: response.status }
      );
    }

    // Process the Image (returned as binary blob)
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save locally
    const filename = `${crypto.randomBytes(16).toString("hex")}.jpg`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;

    // Save to Database
    await db.generatedImage.create({
      data: {
        prompt,
        imageUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ imageUrl, base64: buffer.toString("base64"), mimeType: blob.type || "image/jpeg" });

  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("Request timed out after 90 seconds");
      return NextResponse.json(
        { error: "Request timed out. Please try again with a simpler prompt." },
        { status: 504 }
      );
    }
    console.error("Backend Crash:", error.name, error.message, error.cause);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}