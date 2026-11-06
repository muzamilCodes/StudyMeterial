import "dotenv/config";
import { connectDB } from "./db.js";
import app from "./app.js";
import { UserModel } from "./models/index.js";
import { seedState } from "./data.js";

const port = Number(process.env.PORT || 4000);

await connectDB();

for (const seedUser of seedState.users) {
  const exists = await UserModel.findOne({ email: seedUser.email }).lean();
  if (!exists) {
    await UserModel.create({
      username:       seedUser.username,
      email:          seedUser.email,
      passwordHash:   seedUser.passwordHash,
      role:           seedUser.role,
      grade:          seedUser.grade,
      stream:         seedUser.stream,
      approvalStatus: "approved"
    });
    console.log(`👤 Seeded ${seedUser.role} account: ${seedUser.email}`);
  } else {
    // Always keep seed credentials in sync so a re-deploy never breaks login
    await UserModel.updateOne(
      { email: seedUser.email },
      { $set: { passwordHash: seedUser.passwordHash, approvalStatus: "approved" } }
    );
  }
}

app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});
