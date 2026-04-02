"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TestFlavorPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [flavor, setFlavor] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("humor_flavors").select("*").eq("id", id).single().then(({ data }) => setFlavor(data));
    supabase.from("images").select("id, url").not("url", "is", null).limit(20).then(({ data }) => setImages(data ?? []));
  }, [id]);

  const handleTest = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    setCaptions([]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/test-flavor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: selectedImage, humorFlavorId: Number(id), token }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setCaptions(data.captions ?? []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/flavors/${id}`} className="text-gray-400 hover:text-white">← Back</Link>
        <h1 className="text-2xl font-bold">Test: {flavor?.name}</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <label className="text-sm text-gray-400 mb-3 block">Select a test image</label>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img.id)}
              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition ${selectedImage === img.id ? "border-indigo-500" : "border-transparent"}`}
            >
              <img src={img.url} alt="" className="w-full h-20 object-cover bg-gray-800" />
            </div>
          ))}
        </div>
        <button
          onClick={handleTest}
          disabled={!selectedImage || loading}
          className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-medium"
        >
          {loading ? "Generating captions..." : "Generate Captions"}
        </button>
        {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
      </div>

      {captions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Generated Captions</h2>
          {captions.map((c: any, i: number) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-200">
              {c.content ?? c}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
