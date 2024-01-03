import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { OpenAIStream, StreamingTextResponse } from "https://esm.sh/ai@2.2.13";
import { codeBlock } from "https://esm.sh/common-tags@1.8.2";
import OpenAI from "https://esm.sh/openai@4.10.0";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({
        error: "Missing environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const authorization = req.headers.get("Authorization");

  if (!authorization) {
    return new Response(
      JSON.stringify({ error: `No authorization header passed` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        authorization,
      },
    },
    auth: {
      persistSession: false,
    },
  });

  const { chatId, message, messages, embedding } = await req.json();

  const { data: documents, error: matchError } = await supabase
    .rpc("match_document_sections", {
      embedding,
      match_threshold: 0.8,
    })
    .select("content")
    .limit(5);

  if (matchError) {
    console.error(matchError);

    return new Response(
      JSON.stringify({
        error: "There was an error reading your documents, please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const injectedDocs =
    documents && documents.length > 0
      ? documents.map(({ content }) => content).join("\n\n")
      : "No documents found";

  const completionMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    [
      {
        role: "user",
        content: codeBlock`
          You're an AI assistant who answers questions about documents.

          You're a chat bot, so keep your replies succinct.

          You're only allowed to use the documents below to answer the question.

          If the question isn't related to these documents, say:
          "Sorry, I couldn't find any information on that."

          If the information isn't available in the below documents, say:
          "Sorry, I couldn't find any information on that."

          Do not go off topic.

          Documents:
          ${injectedDocs}
        `,
      },
      ...messages,
    ];

    const completionStream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0613',
      messages: completionMessages,
      max_tokens: 1024,
      temperature: 0,
      stream: true,
    });
    
    const stream = OpenAIStream(completionStream);
    return new StreamingTextResponse(stream, { headers: corsHeaders });
    
});
