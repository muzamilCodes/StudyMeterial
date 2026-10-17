import bcrypt from "bcryptjs";
import type { AppState, Grade, Stream } from "./types.js";

const now = () => new Date().toISOString();

const adminHash = await bcrypt.hash("Admin@12345", 10);
const studentHash = await bcrypt.hash("Student@12345", 10);

export const seedState: AppState = {
  users: [
    {
      id: "user-admin-1",
      username: "System Admin",
      email: "admin@studymaterial.com",
      passwordHash: adminHash,
      role: "admin",
      grade: "11th",
      stream: "Medical",
      createdAt: now()
    },
    {
      id: "user-student-1",
      username: "Muzamil Ahmad",
      email: "student@studymaterial.com",
      passwordHash: studentHash,
      role: "student",
      grade: "11th",
      stream: "Medical",
      createdAt: now()
    }
  ],
  notes: [
    {
      id: "note-1",
      subject: "Biology",
      title: "Cell Biology & Organelles Notes",
      grade: "11th",
      stream: "Medical",
      createdAt: now(),
      uploadDate: "2026-07-20",
      fileSize: "3.4 MB",
      pages: 18,
      fileUrl: "http://localhost:4000/uploads/dummy.pdf"
    }
  ],
  papers: [
    {
      id: "paper-1",
      subject: "Physics",
      title: "2025 Board Solved Paper",
      grade: "11th",
      stream: "Medical",
      createdAt: now(),
      year: "2025",
      term: "Board Exam",
      fileSize: "4.8 MB",
      fileUrl: "http://localhost:4000/uploads/dummy.pdf"
    }
  ],
  videos: [
    {
      id: "video-1",
      subject: "Chemistry",
      title: "Organic Chemistry Masterclass",
      grade: "11th",
      stream: "Medical",
      createdAt: now(),
      instructor: "Dr. Vikram Seth",
      duration: "45:00",
      thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
  ],
  quizzes: [],
  notices: [
    {
      id: "notice-1",
      title: "Mid-Term Examination Schedule Released",
      body: "The date sheet for upcoming mid-term examinations has been published.",
      category: "Exam Updates",
      date: "July 21, 2026",
      createdAt: now()
    }
  ],
  liveClasses: [
    {
      id: "class-1",
      title: "Cellular Genetics Masterclass",
      subject: "Biology",
      category: "NEET Special Preparation",
      description: "Deep dive into genetics, replication, and high-yield questions.",
      teacherName: "Dr. Ramesh Sharma",
      teacherPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      teacherBio: "Senior Biology Faculty",
      date: "2026-08-04",
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
      tags: ["Genetics", "NEET", "Biology"],
      status: "Published",
      allowRecording: true,
      allowChat: true,
      allowScreenShare: true,
      allowStudentQuestions: true,
      prerequisites: ["Read NCERT Chapter 5"],
      learningOutcomes: ["Master DNA replication", "Solve genetics numericals"],
      recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      grade: "11th",
      stream: "Medical",
      createdAt: now()
    }
  ],
  attendance: []
};

export const gradeStreams: Record<Grade, Stream[]> = {
  "10th": ["General"],
  "11th": ["Medical", "Non-Medical", "Commerce", "Arts"],
  "12th": ["Medical", "Non-Medical", "Commerce", "Arts"]
};

export const subjectDirectory: Record<Grade, Record<Stream, string[]>> = {
  "10th": {
    General: ["Mathematics", "Science", "English", "Social Science", "Hindi"],
    Medical: [],
    "Non-Medical": [],
    Commerce: [],
    Arts: []
  },
  "11th": {
    General: [],
    Medical: ["Biology", "Physics", "Chemistry", "English"],
    "Non-Medical": ["Physics", "Chemistry", "Mathematics", "English"],
    Commerce: ["Accountancy", "Business Studies", "Economics", "English"],
    Arts: ["History", "Political Science", "Sociology", "English"]
  },
  "12th": {
    General: [],
    Medical: ["Biology", "Physics", "Chemistry"],
    "Non-Medical": ["Mathematics", "Physics", "Chemistry"],
    Commerce: ["Accountancy", "Economics", "Business Studies"],
    Arts: ["History", "Geography", "Political Science"]
  }
};
