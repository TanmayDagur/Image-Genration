import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, model, conversationId } = body;

    // Convert UIMessage (has parts) to CoreMessage (has content)
    const coreMessages = messages.map((msg: any) => {
      let content = msg.content || "";
      if (msg.parts && Array.isArray(msg.parts)) {
        content = msg.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("");
      }
      return {
        role: msg.role,
        content,
      };
    });

    const aiModel = model === "gemini" 
      ? google("models/gemini-3.6-flash") 
      : model === "groq" 
        ? groq("qwen/qwen3.8-27b") 
        : openai("gpt-4o");

    const lastMessage = coreMessages[coreMessages.length - 1];

    if (conversationId && lastMessage) {
      await db.message.create({
        data: {
          content: lastMessage.content,
          role: "user",
          conversationId,
        }
      });
    }

    const result = streamText({
      model: aiModel,
      messages: coreMessages,
      async onFinish({ text }) {
        if (conversationId && text) {
          await db.message.create({
            data: {
              content: text,
              role: "assistant",
              conversationId,
            }
          });
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
