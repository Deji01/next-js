import { client } from "@/db";
import { QueryResultRow } from "@vercel/postgres";
import { redirect } from "next/navigation";

type QuizWithAnswers = {
  quiz_id: number;
  quiz_title: string;
  quiz_description: string;
  quiz_question: string;
  answer_id: number;
  answer_text: string;
  is_correct: boolean;
};

async function Quiz({ id, searchParams }: { id: string, searchParams: { show?: string } }) {
  const { rows }: QueryResultRow = await client.sql`
  SELECT 
  q.quiz_id,
  q.title AS quiz_title,
  q.description AS quiz_description,
  q.question_text AS quiz_question,
  a.answer_id,
  a.answer_text,
  a.is_correct 
  FROM public.quizzes AS q
  JOIN public.answers AS a ON q.quiz_id = a.quiz_id
  WHERE q.quiz_id = ${id}`;

  return (
    <div>
      <h1 className="text-2xl">{rows[0].quiz_title}</h1>
      <p className="text-2xl text-gray-700">{rows[0].quiz_description}</p>
      <p className="text-xl my-4">{rows[0].quiz_question}</p>
      <ul>
        {rows.map((row: QuizWithAnswers) => {
          <li key={row.answer_id}>
            <p>{row.answer_text}</p>
            {searchParams.show === "true" && row.is_correct && "✔"}
          </li>;
        })}
      </ul>
    </div>
  );
}

export default function QuizPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { show?: string };
}) {
  return (
    <section>
      <Quiz id={params.id} searchParams={searchParams}></Quiz>
      <form
        action={async () => {
          "use server";
          redirect(`/quiz/${params.id}?show=true`);
        }}
      >
        <button className="bg-gray-200 p-2 m-2 rounded hover:bg-gray-400 transtion-all">Show Answer</button>
      </form>
    </section>
  );
}
