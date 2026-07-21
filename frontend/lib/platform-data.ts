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
  icon?: string;
  description?: string;
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
      { name: "Mathematics", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Algebra, Geometry, Trigonometry & Statistics" },
      { name: "Science", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Physics, Chemistry & Life Processes" },
      { name: "English", notes: 0, papers: 0, videos: 0, quizzes: 4, description: "First Flight, Grammar & Composition" },
      { name: "Social Science", notes: 0, papers: 0, videos: 0, quizzes: 5, description: "History, Civics, Geography & Economics" },
      { name: "Hindi", notes: 0, papers: 0, videos: 0, quizzes: 4, description: "Sparsh, Sanchayan & Vyakaran" }
    ],
    Medical: [],
    "Non-Medical": [],
    Commerce: [],
    Arts: []
  },
  "11th": {
    Medical: [
      { name: "Biology", notes: 0, papers: 0, videos: 0, quizzes: 8, description: "Cell Biology, Plant Physiology & Human Anatomy" },
      { name: "Physics", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Kinematics, Laws of Motion & Thermodynamics" },
      { name: "Chemistry", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Structure of Atom, Bonding & Organic Principles" },
      { name: "English", notes: 0, papers: 0, videos: 0, quizzes: 4, description: "Hornbill, Snapshots & Creative Writing" }
    ],
    "Non-Medical": [
      { name: "Physics", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Mechanics, Gravitation & Wave Motion" },
      { name: "Chemistry", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Atomic Structure, Equilibrium & Periodicity" },
      { name: "Mathematics", notes: 0, papers: 0, videos: 0, quizzes: 8, description: "Sets, Trigonometry, Calculus & Probability" },
      { name: "English", notes: 0, papers: 0, videos: 0, quizzes: 4, description: "Hornbill, Snapshots & Composition" }
    ],
    Commerce: [
      { name: "Accountancy", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Financial Accounting, Ledger & Trial Balance" },
      { name: "Business Studies", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Forms of Business & Management Principles" },
      { name: "Economics", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Microeconomics & Statistics for Economics" },
      { name: "English", notes: 0, papers: 0, videos: 0, quizzes: 4, description: "Hornbill & Business Communication" }
    ],
    Arts: [
      { name: "History", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Themes in World History & Ancient Empires" },
      { name: "Political Science", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Indian Constitution & Political Theory" },
      { name: "Sociology", notes: 0, papers: 0, videos: 0, quizzes: 5, description: "Introducing Sociology & Social Structure" },
      { name: "English", notes: 0, papers: 0, videos: 0, quizzes: 4, description: "Hornbill & Literary Analysis" }
    ],
    General: []
  },
  "12th": {
    Medical: [
      { name: "Biology", notes: 0, papers: 0, videos: 0, quizzes: 8, description: "Genetics, Reproduction, Biotechnology & Ecology" },
      { name: "Physics", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Electrostatics, Optics & Semiconductors" },
      { name: "Chemistry", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Solutions, Electrochemistry & Biomolecules" }
    ],
    "Non-Medical": [
      { name: "Mathematics", notes: 0, papers: 0, videos: 0, quizzes: 8, description: "Integrals, Matrices, 3D Geometry & Vectors" },
      { name: "Physics", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Electromagnetism, Wave Optics & Modern Physics" },
      { name: "Chemistry", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Chemical Kinetics, Organic Synthesis & Coordination" }
    ],
    Commerce: [
      { name: "Accountancy", notes: 0, papers: 0, videos: 0, quizzes: 7, description: "Partnership, Company Accounts & Cash Flow" },
      { name: "Economics", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Macroeconomics & Indian Economic Development" },
      { name: "Business Studies", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Marketing Management, Financial Management & Directing" }
    ],
    Arts: [
      { name: "History", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Themes in Indian History Parts I, II & III" },
      { name: "Geography", notes: 0, papers: 0, videos: 0, quizzes: 6, description: "Human Geography, Maps & India Economy" },
      { name: "Political Science", notes: 0, papers: 0, quizzes: 6, videos: 0, description: "Contemporary World Politics & Politics in India" }
    ],
    General: []
  }
};

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
  { id: "n-1", title: "Mid-Term Examination Schedule Released for Class 11th & 12th", date: "July 21, 2026", tag: "Exam Updates", content: "The date sheet for upcoming mid-term examinations is published. Students can view dates in the portal." },
  { id: "n-2", title: "New 2025 Model PDF Notes Uploaded by Faculty", date: "July 20, 2026", tag: "Latest Announcements", content: "Fresh notes for Biology, Physics, and Chemistry are now live for all Medical & Non-Medical students." },
  { id: "n-3", title: "Independence Day Holiday & Special Quiz Tournament", date: "July 18, 2026", tag: "Holiday Notices", content: "Institute will remain closed on August 15th. Special online rewards quiz will be hosted." }
];

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type QuizItem = {
  id: string;
  subject: string;
  topic: string;
  title: string;
  grade: Grade;
  stream: Stream;
  durationMinutes: number;
  totalQuestions: number;
  questions: QuizQuestion[];
};

export function generateAutoQuizBank(): QuizItem[] {
  const bank: QuizItem[] = [];

  const quizTemplates: Array<{
    grade: Grade;
    stream: Stream;
    subject: string;
    topics: string[];
  }> = [
    // 10th Class
    { grade: "10th", stream: "General", subject: "Mathematics", topics: ["Real Numbers & Euclid Division", "Polynomials & Zeroes", "Pair of Linear Equations", "Quadratic Equations", "Arithmetic Progressions", "Triangles & Similarity"] },
    { grade: "10th", stream: "General", subject: "Science", topics: ["Chemical Reactions & Equations", "Acids Bases and Salts", "Metals and Non-metals", "Life Processes & Nutrition", "Control and Coordination", "Light Reflection & Refraction"] },
    { grade: "10th", stream: "General", subject: "Social Science", topics: ["Rise of Nationalism in Europe", "Nationalism in India", "Resources and Development", "Power Sharing in Democracy", "Federalism", "Money and Credit"] },
    { grade: "10th", stream: "General", subject: "English", topics: ["Tenses & Sentence Structure", "Subject-Verb Agreement", "Modals & Auxiliaries", "First Flight Summary Test"] },
    { grade: "10th", stream: "General", subject: "Hindi", topics: ["Samas & Types", "Sandhi Vichhed", "Vyakaran & Muhavare", "Kavya Khand MCQ"] },

    // 11th Medical
    { grade: "11th", stream: "Medical", subject: "Biology", topics: ["Cell - The Unit of Life", "Cell Cycle and Cell Division", "Biomolecules & Enzymes", "Plant Kingdom Classification", "Human Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Locomotion and Movement"] },
    { grade: "11th", stream: "Medical", subject: "Physics", topics: ["Units and Measurements", "Kinematics & Motion in 1D", "Vector Algebra & 2D Motion", "Newton's Laws of Motion", "Work Energy and Power", "System of Particles & Rotation", "Thermodynamics & Heat"] },
    { grade: "11th", stream: "Medical", subject: "Chemistry", topics: ["Mole Concept & Stoichiometry", "Structure of Atom & Bohr Model", "Periodic Table & Chemical Bonding", "Thermodynamics & Enthalpy", "Equilibrium & pH Calculation", "Organic Reaction Mechanisms"] },
    { grade: "11th", stream: "Medical", subject: "English", topics: ["Hornbill Chapter Analysis", "Snapshots Characters", "Active & Passive Voice", "Reported Speech"] },

    // 11th Non-Medical
    { grade: "11th", stream: "Non-Medical", subject: "Physics", topics: ["Kinematics & Projectile Motion", "Laws of Motion & Friction", "Work Power & Energy", "Gravitation & Kepler's Laws", "Wave Motion & Oscillations", "Fluid Mechanics & Viscosity"] },
    { grade: "11th", stream: "Non-Medical", subject: "Chemistry", topics: ["Atomic Structure & Quantum Numbers", "Chemical Bonding & VSEPR", "Gaseous State & Ideal Gas Law", "Chemical Thermodynamics", "Hydrocarbons & Alkanes", "Redox Reactions"] },
    { grade: "11th", stream: "Non-Medical", subject: "Mathematics", topics: ["Sets and Venn Diagrams", "Relations and Functions", "Trigonometric Formulas", "Complex Numbers & Quadratic", "Permutations and Combinations", "Limits and Derivatives", "Probability Theory"] },
    { grade: "11th", stream: "Non-Medical", subject: "English", topics: ["Grammar Transformation", "Formal Letter Writing", "Comprehension & Vocabulary"] },

    // 11th Commerce
    { grade: "11th", stream: "Commerce", subject: "Accountancy", topics: ["Accounting Principles & Concepts", "Journal Entry & Ledger Posting", "Trial Balance & Error Rectification", "Bank Reconciliation Statement", "Depreciation Accounting", "Financial Statements of Sole Proprietorship"] },
    { grade: "11th", stream: "Commerce", subject: "Business Studies", topics: ["Nature and Purpose of Business", "Forms of Business Organisations", "Private Public & Global Enterprises", "Business Services & Insurance", "Sources of Business Finance", "Small Business & Entrepreneurship"] },
    { grade: "11th", stream: "Commerce", subject: "Economics", topics: ["Introduction to Microeconomics", "Consumer's Equilibrium & Demand", "Elasticity of Demand", "Production Function & Cost", "Measures of Central Tendency", "Correlation and Index Numbers"] },
    { grade: "11th", stream: "Commerce", subject: "English", topics: ["Business Communication", "Hornbill Summary Test", "Grammar & Editing"] },

    // 11th Arts
    { grade: "11th", stream: "Arts", subject: "History", topics: ["From the Beginning of Time", "Writing and City Life", "An Empire Across Three Continents", "Nomadic Empires", "The Three Orders of Society", "Changing Cultural Traditions"] },
    { grade: "11th", stream: "Arts", subject: "Political Science", topics: ["Constitution Why and How", "Rights in the Indian Constitution", "Election and Representation", "Executive & Judiciary", "Federalism & Local Government", "Political Theory Introduction"] },
    { grade: "11th", stream: "Arts", subject: "Sociology", topics: ["Sociology and Society", "Terms Concepts and Usage", "Understanding Social Institutions", "Culture and Socialisation", "Social Change and Order"] },
    { grade: "11th", stream: "Arts", subject: "English", topics: ["Literary Analysis", "Reading Comprehension", "Composition Skills"] },

    // 12th Medical
    { grade: "12th", stream: "Medical", subject: "Biology", topics: ["Sexual Reproduction in Flowering Plants", "Human Reproduction & Embryology", "Reproductive Health & Contraception", "Principles of Inheritance & Mendelian Genetics", "Molecular Basis of Inheritance (DNA/RNA)", "Evolution & Natural Selection", "Human Health and Disease", "Biotechnology Principles and Processes"] },
    { grade: "12th", stream: "Medical", subject: "Physics", topics: ["Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity & Ohm's Law", "Moving Charges & Magnetism", "Ray Optics & Optical Instruments", "Wave Optics & Interference", "Semiconductor Devices & Diodes"] },
    { grade: "12th", stream: "Medical", subject: "Chemistry", topics: ["Solutions & Colligative Properties", "Electrochemistry & Nernst Equation", "Chemical Kinetics & Rate Law", "Haloalkanes and Haloarenes", "Alcohols Phenols and Ethers", "Aldehydes Ketones & Carboxylic Acids", "Biomolecules & Proteins"] },

    // 12th Non-Medical
    { grade: "12th", stream: "Non-Medical", subject: "Mathematics", topics: ["Matrices & Matrix Algebra", "Determinants & Inverse Matrix", "Continuity and Differentiability", "Application of Derivatives & Maxima Minima", "Indefinite & Definite Integrals", "Differential Equations", "Vector Algebra & 3D Geometry", "Probability & Bayes' Theorem"] },
    { grade: "12th", stream: "Non-Medical", subject: "Physics", topics: ["Electromagnetic Induction & Faraday's Law", "Alternating Current & LCR Circuits", "Electromagnetic Waves & Spectrum", "Dual Nature of Matter & Photoelectric Effect", "Atoms & Bohr Model", "Nuclei & Nuclear Fission", "Semiconductors & Logic Gates"] },
    { grade: "12th", stream: "Non-Medical", subject: "Chemistry", topics: ["Surface Chemistry & Colloids", "d and f Block Elements", "Coordination Compounds & IUPAC", "Amines and Diazonium Salts", "Polymers & Synthetic Fibers", "Chemistry in Everyday Life"] },

    // 12th Commerce
    { grade: "12th", stream: "Commerce", subject: "Accountancy", topics: ["Accounting for Partnership - Fundamentals", "Goodwill Valuation & Reconstitution", "Admission & Retirement of Partner", "Dissolution of Partnership Firm", "Issue and Forfeiture of Shares", "Issue & Redemption of Debentures", "Cash Flow Statement Analysis"] },
    { grade: "12th", stream: "Commerce", subject: "Economics", topics: ["National Income & Related Aggregates", "Money and Banking System", "Determination of Income and Employment", "Government Budget & Economy", "Foreign Exchange Rate & BOP", "Indian Economy on the Eve of Independence"] },
    { grade: "12th", stream: "Commerce", subject: "Business Studies", topics: ["Nature & Significance of Management", "Principles of Management by Fayol", "Business Environment", "Planning & Organising Processes", "Staffing & Directing Functions", "Financial Management & Capital Structure", "Marketing Management Mix"] },

    // 12th Arts
    { grade: "12th", stream: "Arts", subject: "History", topics: ["Bricks Beads and Bones (Harappan)", "Kings Farmers and Towns", "Kinship Class and Caste", "Thinkers Beliefs and Buildings", "Through the Eyes of Travellers", "Bhakti-Sufi Traditions", "Mahatma Gandhi and National Movement"] },
    { grade: "12th", stream: "Arts", subject: "Geography", topics: ["Human Geography Nature and Scope", "World Population Distribution & Density", "Human Development Index", "Primary Secondary & Tertiary Activities", "Transport Communication & International Trade", "India Location & Physiography"] },
    { grade: "12th", stream: "Arts", subject: "Political Science", topics: ["Cold War Era & Non-Alignment", "End of Bipolarity & USSR Collapse", "US Hegemony in World Politics", "Alternative Centres of Power (EU, ASEAN)", "Contemporary South Asia", "International Organisations (UN)", "Era of One-Party Dominance in India"] }
  ];

  let idCounter = 1;

  quizTemplates.forEach((t) => {
    t.topics.forEach((tp) => {
      const qItem: QuizItem = {
        id: `quiz-gen-${idCounter++}`,
        grade: t.grade,
        stream: t.stream,
        subject: t.subject,
        topic: tp,
        title: `${t.subject}: ${tp} Test`,
        durationMinutes: 15,
        totalQuestions: 5,
        questions: [
          {
            id: 1,
            question: `What is the core fundamental principle behind ${tp}?`,
            options: [
              `Standard Law of ${tp}`,
              `Secondary Hypothesis`,
              `Derived Formula Variable`,
              `Random Equilibrium State`
            ],
            correctIndex: 0,
            explanation: `${tp} follows fundamental laws established in CBSE Class ${t.grade} ${t.subject} curriculum.`
          },
          {
            id: 2,
            question: `Which formula or relation correctly represents ${tp}?`,
            options: [
              `Primary Equation (A = B × C)`,
              `Inverse Exponential Factor`,
              `Logarithmic Constant Zero`,
              `Linear Quadratic Integral`
            ],
            correctIndex: 0,
            explanation: `Equation A = B × C is the standard formulation for ${tp}.`
          },
          {
            id: 3,
            question: `Which unit or metric is associated with ${tp}?`,
            options: [
              `Standard SI / Metric Unit`,
              `Joule per Metre`,
              `Pascal Second`,
              `Dimensionless Constant`
            ],
            correctIndex: 0,
            explanation: `SI units provide standardized values for ${tp} calculations.`
          },
          {
            id: 4,
            question: `What is the primary application of ${tp} in real-world problems?`,
            options: [
              `Solving analytical and practical problems in ${t.subject}`,
              `Only theoretical definitions`,
              `Non-measurable assumptions`,
              `Historical notation only`
            ],
            correctIndex: 0,
            explanation: `${tp} is essential for solving core exam and entrance questions in ${t.subject}.`
          },
          {
            id: 5,
            question: `Which of the following statement is TRUE regarding ${tp}?`,
            options: [
              `It strictly adheres to verified board syllabus rules`,
              `It changes depending on external temperature only`,
              `It cannot be measured accurately`,
              `It applies only to 10th grade subjects`
            ],
            correctIndex: 0,
            explanation: `Class ${t.grade} ${t.subject} syllabus confirms this true property of ${tp}.`
          }
        ]
      };
      bank.push(qItem);
    });
  });

  return bank;
}
