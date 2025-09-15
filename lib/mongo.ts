import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

if (!uri) throw new Error("Missing MONGODB_URI");
if (!dbName) throw new Error("Missing MONGODB_DB");

/** Reuse client across hot reloads in dev */
let _clientPromise: Promise<MongoClient> | undefined =
  (global as any)._mongoClientPromise;

if (!_clientPromise) {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  _clientPromise = client.connect();
  (global as any)._mongoClientPromise = _clientPromise;
}

export async function getDb() {
  const client = await _clientPromise!;
  return client.db(dbName);
}
