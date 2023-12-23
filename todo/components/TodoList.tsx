import { UUID } from "crypto";
import Todo from "./Todo"

interface Todo {
    id: UUID;
    createdAt: Date;
    content: string;
    completed: boolean;
  }
  
interface TodoListProps {
    todos: Todo[];
}

const TodoList: React.FC<TodoListProps> = ({ todos }) => {
    return (
        <div>
            {todos.map((todo) => (
                <Todo key={todo.id} todo={todo} />
            ))}
        </div>
    )
}

export default TodoList