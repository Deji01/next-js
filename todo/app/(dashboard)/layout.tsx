import NewTodoForm from "@/components/NewTodoForm"
import { PropsWithChildren } from "react"

const DashboardLayout = ({ children }: PropsWithChildren) => {
    return (
        <div>
            <div>
                <h1>Todos</h1>
            </div>
            <div>
                <NewTodoForm />
            </div>
            <div>{ children }</div>
        </div>
    )
}

export default DashboardLayout