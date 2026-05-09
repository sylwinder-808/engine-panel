import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.key || body.value === undefined) {
      return Response.json(
        { success: false, error: "key & value required" },
        { status: 400 }
      );
    }

    const updated = await prisma.webSetting.upsert({
      where: { key: body.key },
      update: { value: body.value },
      create: {
        key: body.key,
        value: body.value,
      },
    });

    return Response.json({
      success: true,
      data: updated,
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