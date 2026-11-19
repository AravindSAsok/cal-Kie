import { MongoClient, type Db } from "mongodb";

declare global {
  // Reuse the connection across serverless invocations in the same runtime.
  var __calKieMongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MongoDB is not configured. Add MONGODB_URI to the server environment.");
  if (!globalThis.__calKieMongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
      minPoolSize: 0
    });
    globalThis.__calKieMongoClientPromise = client.connect();
  }
  const client = await globalThis.__calKieMongoClientPromise;
  return client.db(process.env.MONGODB_DB_NAME?.trim() || "hulksar");
}
