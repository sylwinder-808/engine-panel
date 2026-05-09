import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.withdrawal.findMany({
      where: {
        status: "pending",
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = data.map((w) => ({
      id: w.id,
      username: w.user.username,
      amount: w.amount,
      bankName: w.bankName,
      accountName: w.accountName,
      accountNumber: w.accountNumber,
      status: w.status,
      createdAt: w.createdAt.toISOString().split("T")[0],
    }));

    return Response.json({
      success: true,
      data: result,
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