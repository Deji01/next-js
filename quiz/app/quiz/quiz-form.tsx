export default function QuizForm() {
    return (
        <form>
            <label>title</label>
            <input type="text" name="title" />
            <label>quiz description</label>
            <input type="text" name="description" />
            <label>question</label>
            <input type="text" name="question" />
        </form>
    )
}