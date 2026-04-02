"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function FlavorEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [flavor, setFlavor] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newSystemPrompt, setNewSystemPrompt] = useState("");
  const [newUserPrompt, setNewUserPrompt] = useState("");
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editSystemPrompt, setEditSystemPrompt] = useState("");
  const [editUserPrompt, setEditUserPrompt] = useState("");

  useEffect(() => {
    supabase.from("humor_flavors").select("*").eq("id", id).single().then(({ data }) => {
      if (data) { setFlavor(data); setName(data.name); setDescription(data.description ?? ""); }
    });
    loadSteps();
  }, [id]);

  const loadSteps = async () => {
    const { data } = await supabase.from("humor_flavor_steps").select("*").eq("humor_flavor_id", id).order("order_by");
    setSteps(data ?? []);
  };

  const handleUpdateFlavor = async () => {
    await supabase.from("humor_flavors").update({ name, description }).eq("id", id);
    alert("Saved!");
  };

  const handleDeleteFlavor = async () => {
    if (!confirm("Delete this flavor and all its steps?")) return;
    await supabase.from("humor_flavor_steps").delete().eq("humor_flavor_id", id);
    await supabase.from("humor_flavors").delete().eq("id", id);
    router.push("/");
  };

  const handleAddStep = async () => {
    if (!newSystemPrompt.trim()) return;
    const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.order_by ?? 0)) : 0;
    await supabase.from("humor_flavor_steps").insert({
      humor_flavor_id: Number(id),
      llm_system_prompt: newSystemPrompt,
      llm_user_prompt: newUserPrompt,
      order_by: maxOrder + 1
    });
    setNewSystemPrompt("");
    setNewUserPrompt("");
    loadSteps();
  };

  const handleUpdateStep = async (stepId: number) => {
    await supabase.from("humor_flavor_steps").update({
      llm_system_prompt: editSystemPrompt,
      llm_user_prompt: editUserPrompt
    }).eq("id", stepId);
    setEditingStepId(null);
    loadSteps();
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!confirm("Delete this step?")) return;
    await supabase.from("humor_flavor_steps").delete().eq("id", stepId);
    loadSteps();
  };

  const handleMoveStep = async (stepId: number, direction: "up" | "down") => {
    const idx = steps.findIndex(s => s.id === stepId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= steps.length) return;
    const a = steps[idx];
    const b = steps[swapIdx];
    await supabase.from("humor_flavor_steps").update({ order_by: b.order_by }).eq("id", a.id);
    await supabase.from("humor_flavor_steps").update({ order_by: a.order_by }).eq("id", b.id);
    loadSteps();
  };

  if (!flavor) return <div className="p-10 text-gray-400">Loading...</div>;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-400 hover:text-white">← Back</Link>
        <h1 className="text-2xl font-bold">Edit Flavor</h1>
        <Link href={`/flavors/${id}/test`} className="ml-auto bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm">
          Test Flavor
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 mb-6">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Name</label>
          <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Description</label>
          <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button onClick={handleUpdateFlavor} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm">Save</button>
          <button onClick={handleDeleteFlavor} className="bg-red-900/50 hover:bg-red-900 text-red-300 px-4 py-2 rounded-xl text-sm">Delete Flavor</button>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Steps</h2>
      <div className="space-y-3 mb-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold text-sm w-6 mt-1">{idx + 1}</span>
              <div className="flex-1">
                {editingStepId === step.id ? (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">System Prompt</label>
                    <textarea className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" rows={4} value={editSystemPrompt} onChange={(e) => setEditSystemPrompt(e.target.value)} />
                    <label className="text-xs text-gray-500">User Prompt</label>
                    <textarea className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" rows={4} value={editUserPrompt} onChange={(e) => setEditUserPrompt(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStep(step.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Save</button>
                      <button onClick={() => setEditingStepId(null)} className="text-gray-400 text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">System: <span className="text-gray-300">{step.llm_system_prompt?.slice(0, 120)}...</span></p>
                    <p className="text-xs text-gray-500">User: <span className="text-gray-300">{step.llm_user_prompt?.slice(0, 120)}...</span></p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleMoveStep(step.id, "up")} disabled={idx === 0} className="text-xs text-gray-400 hover:text-white disabled:opacity-20">↑</button>
                <button onClick={() => handleMoveStep(step.id, "down")} disabled={idx === steps.length - 1} className="text-xs text-gray-400 hover:text-white disabled:opacity-20">↓</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingStepId(step.id); setEditSystemPrompt(step.llm_system_prompt ?? ""); setEditUserPrompt(step.llm_user_prompt ?? ""); }} className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDeleteStep(step.id)} className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
        <label className="text-sm text-gray-400">Add New Step</label>
        <textarea className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" rows={3} placeholder="System prompt..." value={newSystemPrompt} onChange={(e) => setNewSystemPrompt(e.target.value)} />
        <textarea className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white" rows={3} placeholder="User prompt..." value={newUserPrompt} onChange={(e) => setNewUserPrompt(e.target.value)} />
        <button onClick={handleAddStep} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm">Add Step</button>
      </div>
    </main>
  );
}
