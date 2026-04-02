import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./components/SignOutButton";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("*, humor_flavor_steps(*)")
    .order("id");

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">⛓️ Prompt Chain Tool</h1>
          <p className="text-gray-400 text-sm mt-1">Manage humor flavors and generate captions</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/flavors/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
            + New Flavor
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-4">
        {flavors?.map((flavor) => (
          <div key={flavor.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{flavor.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{flavor.description}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/flavors/${flavor.id}`} className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg">Edit</Link>
                <Link href={`/flavors/${flavor.id}/test`} className="text-sm bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg">Test</Link>
              </div>
            </div>
            <div className="space-y-2">
              {flavor.humor_flavor_steps
                ?.sort((a: any, b: any) => a.order_by - b.order_by)
                .map((step: any, idx: number) => (
                  <div key={step.id} className="flex items-start gap-3 bg-gray-800/50 rounded-lg px-4 py-2">
                    <span className="text-indigo-400 font-bold text-sm w-6">{idx + 1}</span>
                    <span className="text-xs text-gray-400 line-clamp-2">{step.llm_system_prompt?.slice(0, 100)}...</span>
                  </div>
                ))}
              {(!flavor.humor_flavor_steps || flavor.humor_flavor_steps.length === 0) && (
                <p className="text-gray-600 text-sm italic">No steps yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
