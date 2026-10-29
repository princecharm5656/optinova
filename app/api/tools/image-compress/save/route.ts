import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { originalName, originalSize, compressedSize, savedPercent, quality, imageData } = body;

    if (!imageData) {
      return NextResponse.json({ error: "Image data required" }, { status: 400 });
    }

    // Convert base64 to blob and upload to Supabase Storage
    const base64Data = imageData.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `compressed-${user.id}-${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("compressed-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, fall back to saving metadata only
      console.warn("Storage upload failed:", uploadError);
    }

    const imageUrl = uploadData 
      ? supabase.storage.from("compressed-images").getPublicUrl(fileName).data.publicUrl
      : imageData;

    // Save metadata
    const { data, error } = await supabase
      .from("image_compressions")
      .insert({
        user_id: user.id,
        original_name: originalName,
        original_size: originalSize,
        compressed_size: compressedSize,
        saved_percent: savedPercent,
        quality,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Save compressed image error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
