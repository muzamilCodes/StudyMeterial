import "dotenv/config";
import { connectDB } from "./db.js";
import app from "./app.js";

const port = Number(process.env.PORT || 4000);

await connectDB();

app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});
