import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const key = formData.get("key") as string; 
    // key = "logo" atau "banner"

    if (!file || !key) {
      return Response.json(
        { success: false, error: "file & key required" },
        { status: 400 }
      );
    }

    // convert file ke buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // bikin nama file unik
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), "public/uploads", filename);

    // simpan file
    fs.writeFileSync(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    // update settings
    await prisma.webSetting.upsert({
      where: { key },
      update: { value: fileUrl },
      create: {
        key,
        value: fileUrl,
      },
    });

    return Response.json({
      success: true,
      message: "Upload success",
      data: {
        key,
        url: fileUrl,
      },
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