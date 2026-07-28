import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { hashPassword } from "./auth.js";

dotenv.config();

export async function seedDatabase() {
  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/studymeterial";
  console.log(`📡 Connecting to MongoDB Target: ${uri}`);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("studymeterial");
    console.log(`✅ Successfully connected to MongoDB Database: "${db.databaseName}"`);

    // 12 Required Collections
    const collectionsToCreate = [
      "users",
      "classes",
      "streams",
      "subjects",
      "notes",
      "previous_papers",
      "videos",
      "quizzes",
      "results",
      "downloads",
      "bookmarks",
      "notices",
      "live_classes"
    ];

    const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);

    for (const colName of collectionsToCreate) {
      if (!existingCollections.includes(colName)) {
        await db.createCollection(colName);
        console.log(`📁 Created MongoDB Collection: "${colName}"`);
      }
    }

    // Seed 1: Admin & Student Users
    const usersCol = db.collection("users");
    const userCount = await usersCol.countDocuments();
    if (userCount === 0) {
      const adminPassHash = await hashPassword("Admin@12345");
      const teacherPassHash = await hashPassword("Teacher@12345");
      const studentPassHash = await hashPassword("Student@12345");

      await usersCol.insertMany([
        {
          username: "System Admin",
          email: "admin@studymaterial.com",
          passwordHash: adminPassHash,
          role: "admin",
          isAdmin: true,
          grade: "11th",
          stream: "Medical",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: "Dr. Ramesh Sharma",
          email: "teacher@studymaterial.com",
          passwordHash: teacherPassHash,
          role: "teacher",
          isAdmin: false,
          grade: "11th",
          stream: "Medical",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: "Muzamil Ahmad",
          email: "student@studymaterial.com",
          passwordHash: studentPassHash,
          role: "student",
          isAdmin: false,
          grade: "11th",
          stream: "Medical",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log(`👤 Seeded Admin, Teacher, and Student users into "users" collection`);
    }

    // Seed 2: Classes
    const classesCol = db.collection("classes");
    if ((await classesCol.countDocuments()) === 0) {
      await classesCol.insertMany([
        { name: "10th Class", code: "10th", streams: ["General"] },
        { name: "11th Class", code: "11th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] },
        { name: "12th Class", code: "12th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] }
      ]);
      console.log(`🏫 Seeded Classes into "classes" collection`);
    }

    // Seed 3: Streams
    const streamsCol = db.collection("streams");
    if ((await streamsCol.countDocuments()) === 0) {
      await streamsCol.insertMany([
        { name: "General", description: "All 10th Class Subjects" },
        { name: "Medical", description: "Biology, Physics, Chemistry, English" },
        { name: "Non-Medical", description: "Physics, Chemistry, Mathematics, English" },
        { name: "Commerce", description: "Accountancy, Business Studies, Economics, English" },
        { name: "Arts", description: "History, Political Science, Sociology, English" }
      ]);
      console.log(`📚 Seeded Streams into "streams" collection`);
    }

    // Seed 4: Subjects
    const subjectsCol = db.collection("subjects");
    if ((await subjectsCol.countDocuments()) === 0) {
      await subjectsCol.insertMany([
        { grade: "10th", stream: "General", name: "Mathematics", notesCount: 8, papersCount: 5, videosCount: 6, quizzesCount: 4 },
        { grade: "10th", stream: "General", name: "Science", notesCount: 8, papersCount: 5, videosCount: 5, quizzesCount: 4 },
        { grade: "10th", stream: "General", name: "Social Science", notesCount: 7, papersCount: 5, videosCount: 4, quizzesCount: 3 },
        { grade: "10th", stream: "General", name: "English", notesCount: 6, papersCount: 4, videosCount: 4, quizzesCount: 3 },
        { grade: "11th", stream: "Medical", name: "Biology", notesCount: 10, papersCount: 6, videosCount: 7, quizzesCount: 5 },
        { grade: "11th", stream: "Medical", name: "Physics", notesCount: 9, papersCount: 6, videosCount: 7, quizzesCount: 5 },
        { grade: "11th", stream: "Medical", name: "Chemistry", notesCount: 9, papersCount: 6, videosCount: 7, quizzesCount: 5 },
        { grade: "11th", stream: "Medical", name: "English", notesCount: 6, papersCount: 4, quizzesCount: 3 }
      ]);
      console.log(`📖 Seeded Subjects into "subjects" collection`);
    }

    // Seed 5: Live Classes in MongoDB
    const liveClassesCol = db.collection("live_classes");
    if ((await liveClassesCol.countDocuments()) === 0) {
      await liveClassesCol.insertMany([
        {
          title: "Cellular Genetics & DNA Replication Masterclass",
          subject: "Biology",
          category: "NEET Special Preparation",
          description: "Deep dive into Mendelian genetics, molecular replication, DNA polymerases, and high-yield board/entrance numericals.",
          teacherName: "Dr. Ramesh Sharma",
          teacherPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          teacherBio: "14+ Years Senior Biology Educator for Class 11th & 12th Board & NEET Aspirants.",
          date: "Today, July 28, 2026",
          startTime: "09:00 PM",
          endTime: "10:15 PM",
          duration: "75 Mins",
          timeZone: "IST (UTC+5:30)",
          meetingPlatform: "Google Meet",
          meetingLink: "https://meet.google.com/abc-defg-hij",
          meetingId: "982-124-4412",
          meetingPassword: "STUDBIO2026",
          maxStudents: 500,
          enrolledStudentsCount: 342,
          language: "English & Hindi",
          difficultyLevel: "Intermediate",
          bannerUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
          tags: ["Genetics", "NEET", "Class 11th"],
          status: "Published",
          allowRecording: true,
          allowChat: true,
          allowScreenShare: true,
          allowStudentQuestions: true,
          grade: "11th",
          stream: "Medical",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log(`🎥 Seeded Real Live Classes into "live_classes" collection`);
    }

    // Seed 6: Notices
    const noticesCol = db.collection("notices");
    if ((await noticesCol.countDocuments()) === 0) {
      await noticesCol.insertMany([
        { title: "Latest Announcements: Mid-Term Exam Datesheet Out", tag: "Latest Announcements", date: "July 21, 2026", content: "The date sheet for mid-term exams is published for 10th, 11th, and 12th classes.", createdAt: new Date() },
        { title: "Exam Updates: 2025 Model Papers Uploaded", tag: "Exam Updates", date: "July 20, 2026", content: "Faculty has uploaded model papers for Physics and Biology.", createdAt: new Date() },
        { title: "Holiday Notice: Independence Day Special Online Quiz", tag: "Holiday Notices", date: "July 18, 2026", content: "Institute will remain closed on August 15th.", createdAt: new Date() }
      ]);
      console.log(`📢 Seeded Notices into "notices" collection`);
    }

    console.log(`🎉 MongoDB Database "studymeterial" successfully populated with all collections!`);
  } catch (error) {
    console.error(`❌ MongoDB Seeding Error:`, error);
  } finally {
    await client.close();
  }
}

// Always run seeding when script is invoked
void seedDatabase();
