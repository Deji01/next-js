import content from "@/utils/content.json"
import { Content } from "next/font/google";

interface Content {
    [path: string]: string;
  }
  
  interface Params {
    slug: string[];
  }

export const generateStaticParams = (): Params[] => {
    return Object.keys((content as Content)).map((slug) => ({
        slug: slug.split("/")
    }))
}

const getData = (slug: string[]): string => {
    const path = slug.join("/")
    return (content as Content)[path] || "coming soon"
}

interface DocsPageProps {
    params: Params;
}

const DocsPage: React.FC<DocsPageProps> = ({ params }) => {
    const data = getData(params.slug || [])
    return (
        <div>
            <h1 className="text-3xl">Docs Page</h1>
            <div>
                <p className="text-xl">{data}</p>
            </div>
        </div>
    )
}

export default DocsPage