import { completeTodo } from "@/utils/action";
import { useTransition } from "react";
import { UUID } from "crypto"; // Adjust the import based on your library

interface TodoProps {
  todo: {
    id: UUID;
    createdAt: Date;
    content: string;
    completed: boolean;
  };
}

const Todo: React.FC<TodoProps> = ({ todo }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`px-8 py-2 border border-black/25 cursor-pointer ${
        todo.completed ? "line-through text-black/30" : ""
      }`}
      onClick={() => startTransition(() => completeTodo(todo.id))}
    >
      {todo.content}
    </div>
  );
};

export default Todo;
