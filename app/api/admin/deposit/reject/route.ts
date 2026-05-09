import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  let body;

  try {
    body = await req.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid or empty request body" },
      { status: 400 }
    );
  }

  const { depositId } = body;

  if (!depositId) {
    return Response.json(
      { success: false, error: "depositId is required" },
      { status: 400 }
    );
  }

  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
  });

  if (!deposit || deposit.status !== "pending") {
    return Response.json(
      { success: false, error: "Invalid deposit" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // 1. update status deposit
    await tx.deposit.update({
      where: { id: deposit.id },
      data: { status: "rejected" },
    });

    // 2. transaction log (audit trail)
    await tx.transaction.create({
      data: {
        userId: deposit.userId,
        type: "deposit_rejected",
        amount: deposit.amount,
        status: "failed",
        description: "Deposit rejected by admin",
      },
    });

    // 3. admin log (kalau kamu pakai AdminLogService bisa juga)
    await tx.adminLog.create({
      data: {
        adminId: 1, // nanti ganti dari JWT admin
        action: "deposit_reject",
        targetId: deposit.id,
        meta: {
          amount: deposit.amount,
        },
      },
    });
  });

  return Response.json({
    success: true,
    message: "Deposit rejected",
  });
}