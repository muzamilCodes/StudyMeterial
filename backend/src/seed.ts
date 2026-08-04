import "dotenv/config";
import { connectDB, disconnectDB } from "./db.js";
import { contentServices } from "./services.js";

console.log("🌱 Seeding database...");

await connectDB();
const result = await contentServices.reset();
console.log(`✅ ${result.message}`);
await disconnectDB();
