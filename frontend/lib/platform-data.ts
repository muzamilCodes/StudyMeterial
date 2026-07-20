export type Stream =
  | "General"
  | "Medical"
  | "Non-Medical"
  | "Commerce"
  | "Arts";

export type Grade = "10th" | "11th" | "12th";

export type Subject = {
  name: string;
  notes: number;
  papers: number;
  videos: number;
  quizzes: number;
};

export type GradeConfig = {
  label: string;
  streams: Stream[];
};

export const gradeConfig: Record<Grade, GradeConfig> = {
  "10th": { label: "10th", streams: ["General"] },
  "11th": { label: "11th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] },
  "12th": { label: "12th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] }
};

export const classSubjects: Record<Grade, Record<Stream | "General", Subject[]>> = {
  "10th": {
    General: [
      { name: "Mathematics", notes: 8, papers: 5, videos: 6, quizzes: 4 },
      { name: "Science", notes: 8, papers: 5, videos: 5, quizzes: 4 },
      { name: "English", notes: 6, papers: 4, videos: 4, quizzes: 3 },
      { name: "Social Science", notes: 7, papers: 5, videos: 4, quizzes: 3 }
    ],
    Medical: [],
    "Non-Medical": [],
    Commerce: [],
    Arts: []
  },
  "11th": {
    Medical: [
      { name: "Biology", notes: 10, papers: 6, videos: 7, quizzes: 5 },
      { name: "Physics", notes: 9, papers: 6, videos: 7, quizzes: 5 },
      { name: "Chemistry", notes: 9, papers: 6, videos: 7, quizzes: 5 },
      { name: "English", notes: 6, papers: 4, videos: 4, quizzes: 3 }
    ],
    "Non-Medical": [
      { name: "Physics", notes: 9, papers: 6, videos: 7, quizzes: 5 },
      { name: "Chemistry", notes: 9, papers: 6, videos: 7, quizzes: 5 },
      { name: "Mathematics", notes: 11, papers: 7, videos: 8, quizzes: 6 },
      { name: "English", notes: 6, papers: 4, videos: 4, quizzes: 3 }
    ],
    Commerce: [
      { name: "Accountancy", notes: 9, papers: 6, videos: 6, quizzes: 5 },
      { name: "Business Studies", notes: 9, papers: 6, videos: 6, quizzes: 5 },
      { name: "Economics", notes: 8, papers: 5, videos: 6, quizzes: 4 },
      { name: "English", notes: 6, papers: 4, videos: 4, quizzes: 3 }
    ],
    Arts: [
      { name: "History", notes: 8, papers: 5, videos: 6, quizzes: 4 },
      { name: "Political Science", notes: 8, papers: 5, videos: 6, quizzes: 4 },
      { name: "Sociology", notes: 7, papers: 5, videos: 5, quizzes: 4 },
      { name: "English", notes: 6, papers: 4, videos: 4, quizzes: 3 }
    ],
    General: []
  },
  "12th": {
    Medical: [
      { name: "Biology", notes: 11, papers: 7, videos: 8, quizzes: 6 },
      { name: "Physics", notes: 10, papers: 7, videos: 8, quizzes: 6 },
      { name: "Chemistry", notes: 10, papers: 7, videos: 8, quizzes: 6 }
    ],
    "Non-Medical": [
      { name: "Mathematics", notes: 12, papers: 8, videos: 9, quizzes: 7 },
      { name: "Physics", notes: 10, papers: 7, videos: 8, quizzes: 6 },
      { name: "Chemistry", notes: 10, papers: 7, videos: 8, quizzes: 6 }
    ],
    Commerce: [
      { name: "Accountancy", notes: 10, papers: 7, videos: 7, quizzes: 6 },
      { name: "Economics", notes: 9, papers: 6, videos: 7, quizzes: 5 },
      { name: "Business Studies", notes: 10, papers: 7, videos: 7, quizzes: 6 }
    ],
    Arts: [
      { name: "History", notes: 9, papers: 6, videos: 7, quizzes: 5 },
      { name: "Geography", notes: 9, papers: 6, videos: 7, quizzes: 5 },
      { name: "Political Science", notes: 8, papers: 5, videos: 6, quizzes: 4 }
    ],
    General: []
  }
};

export const dashboardStats = [
  { label: "Notes", value: "24", accent: "blue" },
  { label: "Previous Papers", value: "15", accent: "orange" },
  { label: "Quizzes", value: "8", accent: "indigo" },
  { label: "Average Score", value: "85%", accent: "emerald" }
];

export const mainFeatures = [
  "Class-wise Study Material",
  "Subject-wise Notes",
  "Previous Year Papers",
  "Video Lectures",
  "MCQ Quizzes",
  "PDF Downloads",
  "Progress Tracking",
  "Bookmarks",
  "Results",
  "Notices",
  "Admin Panel",
  "Responsive Design"
];

export const techStack = [
  "React.js",
  "Next.js",
  "Node.js",
  "Express.js",
  "MongoDB Atlas",
  "Bootstrap",
  "HTML5",
  "CSS3",
  "JavaScript",
  "JWT Authentication",
  "Cloudinary",
  "GitHub",
  "Vercel"
];

export const databaseCollections = [
  "Users",
  "Classes",
  "Streams",
  "Subjects",
  "Notes",
  "Previous Papers",
  "Videos",
  "Quizzes",
  "Results",
  "Downloads",
  "Bookmarks",
  "Notices"
];

export const flowSteps = [
  "Student Registration",
  "Login",
  "Select Class",
  "Select Stream",
  "Open Dashboard",
  "Access Subjects",
  "Download Notes",
  "Previous Papers",
  "Quizzes",
  "Results",
  "Progress"
];

export const notices = [
  { title: "Latest Announcements", date: "Today", tag: "Live" },
  { title: "Exam Updates", date: "Tomorrow", tag: "Exam" },
  { title: "Holiday Notice", date: "This Week", tag: "Holiday" }
];

export const adminCards = [
  { label: "Total Users", value: "18,240" },
  { label: "Total Notes", value: "3,560" },
  { label: "Total Papers", value: "1,240" },
  { label: "Total Quizzes", value: "840" },
  { label: "Total Downloads", value: "28,910" }
];

export const recentActivities = [
  "Biology notes uploaded for 11th Medical",
  "15 new quiz attempts completed",
  "Holiday notice published by admin",
  "12th Commerce papers added"
];

export const studentMetrics = [
  { label: "Completed Quizzes", value: "6/8" },
  { label: "Downloaded Notes", value: "18" },
  { label: "Downloaded Papers", value: "9" }
];
