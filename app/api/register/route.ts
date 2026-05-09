import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { username, email, password, phone, bankName, accountName, accountNumber } = body;

    // 1. VALIDASI INPUT DASAR
    if (!username || !email || !password || !accountNumber) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // 2. CEK USER DUPLICATE (username/email)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: "User already exist",
        },
        { status: 400 }
      );
    }

    // 3. CEK BANK DUPLICATE
    const existingBank = await prisma.bankAccount.findUnique({
      where: {
        accountNumber,
      },
    });

    if (existingBank) {
      return Response.json(
        {
          success: false,
          error: "Bank account already exist",
        },
        { status: 400 }
      );
    }

    // 4. HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. CREATE USER
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        role: "player",
      },
    });

    // 6. CREATE BANK
    await prisma.bankAccount.create({
      data: {
        userId: user.id,
        bankName,
        accountName,
        accountNumber,
      },
    });

    return Response.json({
      success: true,
      message: "Register success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err: any) {
    console.error("REGISTER ERROR:", err);

    return Response.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}