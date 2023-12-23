import TodoList from "@/components/TodoList"
import db from "@/utils/db"

const getData = async () => {
    const todos = await db.todo.findMany({
        where: {},
        orderBy: {
            createdAt: "desc"
        }
    })

    return todos
}

const TodoPage = async () => {
    const todos = await getData()
    return (
        <div>
            <TodoList todos={todos} />
        </div>
    )
}

export default TodoPage