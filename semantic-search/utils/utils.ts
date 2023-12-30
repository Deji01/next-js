import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { timeout } from "./config";
import { loadQAStuffChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeRecordSchema } from "@pinecone-database/pinecone/dist/data/types";

// import { Logger } from "tslog";

// const logger = new Logger({ name: "Pinecone App Log" })

export const queryPineconeVectorStoreAndQueryLLM = async (
  client: Pinecone,
  indexName: string,
  question: string
) => {
  // 1. Start query process
  console.log("Querying Pinecone Vector Store...");

  // 2. Retrieve the Pinecone index
  const index = client.Index(indexName);

  // 3. Create query embedding
  console.log("Creating Query Embedding...");
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

  // 4. Query Pinecone index and return top 10 matches
  let queryResponse = await index.query({
    topK: 10,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  });
  // 5. Log the number of matches
  console.log(`Found ${queryResponse.matches.length} matches...`);

  // 6. Log the question being asked
  console.log(`Asking question: ${question}...`);

  if (queryResponse.matches.length) {
    // 7. Create an OPENAI instance and load the QAStuffChain
    const llm = new OpenAI({});
    const chain = loadQAStuffChain(llm);

    // 8. Extract and concatenate page content from matched documents
    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata?.pageContent)
      .join("");

    // 9. Execute the chain with input documents and question
    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question,
    });

    // 10. Log the answer
    console.log(`Answer: ${result.text}`);

    return result.text;
  } else {
    // 11. Log that there are no matches, so LLM will not be queried
    console.log("Since there are no matches, so LLM will not be queried");
  }
};

export const createPineconeIndex = async (
  client: Pinecone,
  indexName: string,
  vectorDimensions: number
) => {
  // 1. Initiate index existance check
  console.log(`Checking "${indexName}"...`);

  // 2. Get list of existing indexes
  const existingIndexes = await client.listIndexes();
  // 3. If index doesn't exist, create it
  if (!existingIndexes.includes(indexName)) {
    // 4. Log index creation initiation
    console.log(`Creating "${indexName}"...`);

    // 5. Create index
    await client.createIndex({
      name: indexName,
      dimension: vectorDimensions,
      metric: "cosine",
    });

    // 6. Log successful creation
    console.log(
      `Creating index... please wait for it to  finish initializing.`
    );

    // 7. Wait for index initializing
    await new Promise((resolve) => setTimeout(resolve, timeout));
  } else {
    // 8. Log if index already exists
    console.log(`"${indexName}" already exists.`);
  }
};

interface VectorType {
  id: string;
  values: number[]; // Adjust the type based on your actual vector type
  metadata: {
    [key: string]: any; // Adjust the type based on your actual metadata structure
  };
}

export const updatePinecone = async (
  client: Pinecone,
  indexName: string,
  docs: Document[]
) => {
  console.log("Retrieving Pinecone index...");
  // 1. Retrieve Pinecone index
  const index = client.Index(indexName);

  // 2. Log the retrieved index name
  console.log(`Pinecone index retrieved: ${indexName}`);

  // 3. Process each document in the docs array
  for (const doc of docs) {
    console.log(`Processing document: ${doc.metadata.source}`);

    const txtPath = doc.metadata.source;
    const text = doc.pageContent;

    // 4. Create RecursiveCharacterTextSplitter instance
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    console.log("Splitting text into chunks...");

    // 5. Split text into chunks (documents)
    const chunks = await textSplitter.createDocuments([text]);

    console.log(`Text split into ${chunks.length} chunks`);
    console.log(
      `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
    );

    // 6. Create OpenAI embeddings for documents
    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );

    console.log("Finished embedding documents");
    console.log(
      `Creating ${chunks.length} vector array with id, values, and metadata...`
    );

    // 7. Create and upsert vectors in batches of 100
    const batchSize = 100;
    let batch: VectorType[] = [];
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const vector: VectorType = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArrays[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };
      batch = [...batch, vector];
      // When batch is full or it's the last item, upsert the vectors
      if (batch.length === batchSize || idx === chunks.length - 1) {
        await index.upsert(batch);
        // Empty the batch
        batch = [];
      }
    }
    // 8. Log the number of vectors updated
    console.log(`Pinecone index updated with ${chunks.length} vectors`);
  }
};





