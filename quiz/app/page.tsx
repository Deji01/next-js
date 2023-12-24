import { client } from "@/db";
import { QueryResultRow } from "@vercel/postgres";
import Link from "next/link";
import { Suspense } from "react";

type Quiz = {
  quiz_id: number;
  title: string;
  description: string;
  question_text: string;
  created_at: Date;
};

async function Quizzes() {
  const { rows }: QueryResultRow =
    await client.sql`SELECT * FROM public.quizzes`;

  return (
    <ul>
      {rows.map((row: Quiz) => (
        <li key={row.quiz_id} className="underline">
          <Link href={`/quiz/${row.quiz_id}`}>{row.title}</Link>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <section>
      <Suspense fallback={<p>...Loading</p>}>
        <Quizzes />
      </Suspense>
    </section>
  );
}
