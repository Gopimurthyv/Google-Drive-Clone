import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const formData = await req.formData();
  const file = formData.get("file") as File;

   // Get user session to fetch auth.uid()
  const { data: { user }, error: authError } = await supabase.auth.getUser();

   if (authError || !user) {
    console.error("Auth Error:", authError?.message);
    return NextResponse.json({ error: "Unauthorized: No user found" }, { status: 401 });
  }

  if (!file) {
    return NextResponse.json({ error: "File missing" }, { status: 400 });
  }

  const userId = user?.id; // Authenticated user ID
console.log("Uploading file for user:", userId);

  const fileName = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Store file details in database
  const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

  const { error: dbError } = await supabase.from("files").insert([
    {
      name: file.name,
      url: fileUrl,
      type: file.type,
      owner: userId,
      extension: file.name.split(".").pop(),
      size: file.size,
    },
  ]);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, url: fileUrl });
}
