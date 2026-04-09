"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewFlavorPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("humor_flavors")
      .insert({ name, description })
      .select()
      .single();
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data) router.push(`/flavors/${data.id}`);
    setLoading(false);
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-400 hover:text-white">← Back</Link>
        <h1 className="text-2xl font-bold">New Humor Flavor</h1>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Name</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="e.g. Sad Genz"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Description</label>
          <textarea
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Describe this humor flavor..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-medium"
        >
          {loading ? "Creating..." : "Create Flavor"}
        </button>
      </div>
    </main>
  );
}
