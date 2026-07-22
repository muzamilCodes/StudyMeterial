import { MongoClient } from "mongodb";
let client = null;
let clientPromise = null;
export async function connectDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri)
        return null;
    if (!clientPromise) {
        client = new MongoClient(uri);
        clientPromise = client.connect();
    }
    const connectedClient = await clientPromise;
    return connectedClient.db();
}
