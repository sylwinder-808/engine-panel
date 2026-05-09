import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: {
      isBlocked: true,
    },
  });

  return Response.json({
    success: true,
    message: "Player blocked",
    data: {
      id: user.id,
      username: user.username,
      isBlocked: user.isBlocked,
    },
  });
}