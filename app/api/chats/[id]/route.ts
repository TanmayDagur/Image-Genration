import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify ownership
    const conversation = await db.conversation.findUnique({
      where: {
        id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (conversation.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("GET /api/chats/[id] error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversation = await db.conversation.findUnique({
      where: {
        id,
      },
    });

    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (conversation.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.conversation.delete({
      where: {
        id,
      },
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("DELETE /api/chats/[id] error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
