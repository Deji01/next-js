import { PGEssay, PGJSON } from "@/types";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@xenova/transformers";
import fs from "fs";

loadEnvConfig("");

const generateEmbeddings = async (essays: PGEssay[]) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];

    for (let j = 0; essay.chunks.length; j++) {
      const chunk = essay.chunks[j];

      const embeddingResponse = await pipeline(
        "feature-extraction",
        "supabase/gte-small"
      );

      // if (chunk) {
        const output = await embeddingResponse(chunk.content, {
          pooling: "mean",
          normalize: true,
        });

        const embedding = Array.from(output.data);
        const { data, error } = await supabase
          .from("paul_graham")
          .insert({
            essay_title: chunk.essay_title,
            essay_url: chunk.essay_url,
            essay_date: chunk.essay_date,
            content: chunk.content,
            content_tokens: chunk.content_tokens,
            embedding,
          })
          .select("*");

        if (error) {
          console.log({
            essay_title: chunk?.essay_title,
            essay_url: chunk?.essay_url,
            essay_date: chunk?.essay_date,
            content: chunk?.content,
            content_tokens: chunk?.content_tokens,
            embedding,
          })
          console.error(error);

        } else {
          console.log("saved", i, j);
        }
      // }
      // else {
      //   continue
      // }
    }
  }
};

(async () => {
  const json: PGJSON = JSON.parse(fs.readFileSync("scripts/pg.json", "utf8"));
  await generateEmbeddings(json.essays);
})();
