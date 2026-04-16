import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "avatar field is required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "jpg・png・webp のみ対応しています" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "2MB 以下のファイルを選択してください" }, { status: 400 });
  }

  // Get current avatar_url to delete old file later
  const { data: profile } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  // Path format: {user_id}/{timestamp}.{ext}
  // The user_id becomes the folder name, satisfying the RLS policy:
  //   (storage.foldername(name))[1] = auth.uid()
  const filePath = `${user.id}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    // rollback upload
    await supabase.storage.from("avatars").remove([filePath]);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Delete old avatar file from storage (best-effort)
  if (profile?.avatar_url) {
    try {
      const url = new URL(profile.avatar_url);
      // Extract path after /storage/v1/object/public/avatars/
      // e.g. "https://xxx.supabase.co/storage/v1/object/public/avatars/{user_id}/{timestamp}.jpg"
      // → "{user_id}/{timestamp}.jpg"
      const marker = "/object/public/avatars/";
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const oldPath = url.pathname.slice(idx + marker.length);
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    } catch {
      // ignore — old file cleanup is non-critical
    }
  }

  return NextResponse.json({ avatarUrl: publicUrl });
}
