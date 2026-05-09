import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "admin",
      },

      include: {
        wallet: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const data = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      balance: u.wallet?.balance ?? 0,
      createdAt: u.createdAt.toISOString().split("T")[0],
    }));

    return Response.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}