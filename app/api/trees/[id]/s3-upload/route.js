import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export async function POST(req, { params }) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${fileName}`,
    Body: buffer,
    ContentType: file.type,
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));

    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/uploads/${fileName}`;

    return NextResponse.json({ url: publicUrl }); // 👈 this is the full URL you're looking for
  } catch (err) {
    console.error("S3 upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
