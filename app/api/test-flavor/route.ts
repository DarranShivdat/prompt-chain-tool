import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { imageId, humorFlavorId } = await request.json();
  const token = session.access_token;

  try {
    const res = await fetch("https://api.almostcrackd.ai/pipeline/generate-captions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, humorFlavorId }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
    
    // Handle different response formats
    let captions = [];
    if (Array.isArray(data)) {
      captions = data;
    } else if (data.captions && Array.isArray(data.captions)) {
      captions = data.captions;
    } else if (data.content) {
      captions = [data];
    } else {
      captions = [data];
    }
    
    return NextResponse.json({ captions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
