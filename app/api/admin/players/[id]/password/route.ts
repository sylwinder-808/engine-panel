import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    // validate id
    if (isNaN(userId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid user id",
        },
        { status: 400 }
      );
    }

    // parse body
    let body;

    try {
      body = await req.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const { password } = body;

    // validate password
    if (!password) {
      return Response.json(
        {
          success: false,
          error: "Password is required",
        },
        { status: 400 }
      );
    }

    // check user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // update password
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashed,
      },
    });

    return Response.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err: any) {
    console.error(err);

    return Response.json(
      {
        success: false,
        error: err.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}