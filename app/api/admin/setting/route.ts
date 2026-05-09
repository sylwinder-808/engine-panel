import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.webSetting.findMany();

  const data = Object.fromEntries(
    settings.map((s) => [s.key, s.value])
  );

  return Response.json({
    success: true,
    data,
  });
}