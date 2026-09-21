import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const image = await db.generatedImage.findUnique({
      where: {
        id: id,
      },
    });

    if (!image) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (image.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.generatedImage.delete({
      where: {
        id: id,
      },
    });

    // Optionally delete from filesystem
    try {
      const filename = image.imageUrl.split("/").pop();
      if (filename) {
        const filePath = path.join(process.cwd(), "public", "uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      console.error("Failed to delete file", e);
    }

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
