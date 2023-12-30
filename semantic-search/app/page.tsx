"use client";

import { Button } from "@/components/ui/Button";
import { PieChartIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [query, setQuery] = useState("");

  async function createIndexAndEmbeddings() {
    try {
      const response = await fetch("/api/setup", {
        method: "POST"
      })
      const result = await response.json()
      console.log("result: ", result);
    } 
    catch (err) {
      console.log("error: ", err)
    };
  };

  async function sendQuery() {
    if(!query) return;

    setResult("");
    setLoading(true);

    try {
      const response = await fetch("/api/read", {
        method: "POST",
        body: JSON.stringify(query)
      });
      const result = await response.json()
      setResult(result.data)
      setLoading(false)
    } catch (err) {
      console.log("error: ", err)
      setLoading(false)
    };
  };

  return (
    <main className="flex flex-1 flex-col justify-center items-center p-24">
      <p className="text-xl font-medium">Semantic Search App</p>
      <input
        className="mt-3 rounded border w-[400px]
       text-black px-2 py-1"
       onChange={(e) => setQuery(e.target.value)}
      />
      <Button className="w-[400px] mt-3" onClick={sendQuery}>Ask AI</Button>

      {loading && <PieChartIcon className="my-5 w-8 h-8  animate-spin" />}

      {result && <p className="my-8 border p-4 rounded">{result}</p>}

      {/* consider removing this button from the UI once the embeddings are created ... */}

      <Button className="w-[400px] mt-2" variant="outline" onClick={createIndexAndEmbeddings}>
        Create index and embeddings
      </Button>
    </main>
  );
}
