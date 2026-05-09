import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      username,
      amount,
      bankName,
      accountName,
      accountNumber,
    } = body;

    // validate
    if (
      !username ||
      !amount ||
      !bankName ||
      !accountName ||
      !accountNumber
    ) {
      return Response.json(
        {
          success: false,
          error: "Incomplete request",
        },
        { status: 400 }
      );
    }

    // get user
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        wallet: true,
      },
    });

    if (!user || !user.wallet) {
      return Response.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // blocked user
    if (user.isBlocked) {
      return Response.json(
        {
          success: false,
          error: "Account blocked",
        },
        { status: 403 }
      );
    }

    // minimum wd
    if (amount < 50000) {
      return Response.json(
        {
          success: false,
          error: "Minimum withdraw 50000",
        },
        { status: 400 }
      );
    }

    // balance check
    if (user.wallet.balance < amount) {
      return Response.json(
        {
          success: false,
          error: "Insufficient balance",
        },
        { status: 400 }
      );
    }

    // cooldown check
    const lastWd = await prisma.withdrawal.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (lastWd) {
      const diff =
        Date.now() - new Date(lastWd.createdAt).getTime();

      const cooldown = 60 * 1000;

      if (diff < cooldown) {
        return Response.json(
          {
            success: false,
            error: "Withdraw cooldown 1 minute",
          },
          { status: 400 }
        );
      }
    }

    // HOLD BALANCE
    const before = user.wallet.balance;
    const after = before - amount;

    await prisma.$transaction(async (tx) => {
      // update wallet
      await tx.wallet.update({
        where: {
          userId: user.id,
        },
        data: {
          balance: after,
        },
      });

      // create withdrawal
      await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount,

          beforeBalance: before,
          afterBalance: after,

          bankName,
          accountName,
          accountNumber,

          status: "pending",
        },
      });

      // transaction log
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "withdraw_request",
          amount,

          beforeBalance: before,
          afterBalance: after,

          description: "Withdraw request pending",
          status: "pending",
        },
      });
    });

    return Response.json({
      success: true,
      message: "Withdraw request submitted",
      data: {
        username,
        amount,
        beforeBalance: before,
        afterBalance: after,
      },
    });
  } catch (err: any) {
    console.error(err);

    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}