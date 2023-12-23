import { PropsWithChildren } from "react"

const DocsLayout = ({ children }: PropsWithChildren) => {
    return (
      <div>
        <div>
          <h1>docs</h1>
          {children}
        </div>
      </div>
    )
  }
  
  export default DocsLayout