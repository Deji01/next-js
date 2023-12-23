const DocsLayout = ({ children }: {
  children: React.ReactNode
}) => {
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