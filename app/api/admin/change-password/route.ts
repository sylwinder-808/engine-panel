import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/admin";

export async function PUT(req: Request) {
  try {
    const admin = verifyAdmin(req);

    if (!admin) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return Response.json(
        { success: false, error: "oldPassword & newPassword required" },
        { status: 400 }
      );
    }

    // ambil admin dari DB
    const user = await prisma.user.findUnique({
      where: { id: admin.id },
    });

    if (!user) {
      return Response.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    // cek password lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return Response.json(
        { success: false, error: "Old password incorrect" },
        { status: 400 }
      );
    }

    // hash password baru
    const hashed = await bcrypt.hash(newPassword, 10);

    // update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
      },
    });

    return Response.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}