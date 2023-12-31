import Todo from "./Todo"

interface Todo {
    id: string;
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